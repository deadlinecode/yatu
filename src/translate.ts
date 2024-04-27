import { Type, type Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import ora, { type Ora } from "ora";
import DeepL from "./DeepL";
import fs from "fs/promises";
import { mergeDeep } from "./utils";

type LangSchema = Static<typeof LangSchema>;
const LangSchema = Type.Recursive((Self) =>
  Type.Record(Type.String(), Type.Union([Type.String(), Self]))
);

let dl: DeepL;
let texts: Set<string> = new Set();
let langObjs: Map<string, LangSchema> = new Map();

export const resolveTranslate = (
  kv: LangSchema,
  cb: (txt: string) => string
): LangSchema =>
  Object.fromEntries(
    Object.entries(kv).map(([k, v]) =>
      typeof v === "string"
        ? [k, cb(v)]
        : typeof v === "object"
        ? [k, resolveTranslate(v, cb)]
        : [k, undefined]
    )
  );

const mapKV = (kv: LangSchema): void =>
  Object.entries(kv).forEach(([_, v]) =>
    typeof v === "string"
      ? texts.add(v)
      : typeof v === "object"
      ? mapKV(v)
      : null
  );

const translateMap = async (
  spinner: Ora,
  langObj: LangSchema,
  lang: string
) => {
  // Limit to 5 translations per second
  const txtArr = Array.from(texts);
  let promiseArr = [];
  const translations: Record<string, string> = {};
  for (let index = 0; index < txtArr.length; index++) {
    const txt = txtArr[index];
    promiseArr.push(
      dl
        .translate(txt, lang)
        .then((r) => r.translations[0].text)
        .then((t) => (translations[txt] = t))
    );
    if (index % 5 === 0) {
      await Promise.all(promiseArr);
      spinner.text = `Translating to ${lang} (${index}/${txtArr.length})`;
      promiseArr = [];
    }
  }
  await Promise.all(promiseArr);
  return resolveTranslate(langObj, (txt) => translations[txt]);
};

const removeDupKeys = (a: LangSchema, b: LangSchema): LangSchema =>
  Object.fromEntries(
    Object.entries(a).map(([k, v]) =>
      typeof v === "string"
        ? b[k]
          ? [k, undefined]
          : [k, v]
        : [k, removeDupKeys(v, b[k] as any)]
    )
  );

export const translate = async (
  fileName: string,
  apiKey: string,
  langs: string[],
  minify?: boolean
) => {
  const spinner = ora("Reading file").start();
  const file = await Bun.file(fileName).json();
  spinner.text = "Validating file";
  const langObj = TypeCompiler.Compile(LangSchema).Decode(file);
  spinner.text = "Translating";
  dl = new DeepL(apiKey);
  spinner.stop();
  const usage = await dl.usage();
  for (const lang of langs) {
    if (await fs.exists(`${lang}.json`)) {
      const existingLangObj = await Bun.file(`${lang}.json`).json();
      let filteredLangObj = removeDupKeys(langObj, existingLangObj);
      langObjs.set(lang, filteredLangObj);
      mapKV(filteredLangObj);
    } else mapKV(langObj);
  }
  const charsToTranslate =
    Array.from(texts).reduce((acc, curr) => acc + curr.length, 0) *
    langs.length;
  console.log(
    `Total chars\t\t\t${usage.character_limit}\nChars used\t\t\t${
      usage.character_count
    }\nChars left\t\t\t${
      usage.character_limit - usage.character_count
    }\nChars to translate\t\t${charsToTranslate}\nChars left after translation\t${
      usage.character_limit - usage.character_count - charsToTranslate
    }`
  );
  for (const lang of langs) {
    const langSpinner = ora(`Translating ${lang}`).start();
    langSpinner.text = `Searching for ${lang}`;
    let filteredLangObj = langObjs.get(lang);
    const done = await translateMap(
      langSpinner,
      filteredLangObj ?? langObj,
      lang
    );
    langSpinner.text = `Writing to ${lang}.json`;
    await Bun.write(
      `${lang}.json`,
      JSON.stringify(
        !filteredLangObj
          ? done
          : mergeDeep(done, await Bun.file(`${lang}.json`).json()),
        null,
        minify ? 0 : 2
      )
    );
    langSpinner.succeed(`Translation to ${lang} successful`);
  }
  spinner.succeed("Translation successful");
};
