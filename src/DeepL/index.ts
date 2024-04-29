import { htmlDecode } from "../utils";
import type { TranslateRsp, UsageRsp } from "./Types";

export default class DeepL {
  private readonly baseURL;
  constructor(private apiKey: string) {
    this.baseURL = `https://api${
      apiKey.endsWith(":fx") ? "-free" : ""
    }.deepl.com/v2`;
  }

  private req = <T extends any>(
    url: `/${string}`,
    method: "POST" | "GET",
    body?: Record<string, any>
  ) =>
    fetch(`${this.baseURL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    }).then((x) => x.json() as Promise<T>);

  usage = () => this.req<UsageRsp>("/usage", "GET");

  translate = (text: string, lang: string, sourceLang?: string) => {
    const vars: string[] = [];
    return this.req<TranslateRsp>("/translate", "POST", {
      text: [
        text.replace(
          new RegExp(`{(.+?(?=}))`, "gm"),
          (_: any, word: string) => `{${vars.push(word) - 1}`
        ),
      ],
      target_lang: lang,
      source_lang: sourceLang,
      tag_handling: "html",
    }).then((rsp) => {
      if (!rsp.translations) {
        console.clear();
        console.error(
          `Didn't find translation for lang "${lang}" and txt "${text}"\nResponse:`,
          JSON.stringify(rsp, null, 2)
        );
        process.exit(1);
      }
      return htmlDecode(
        rsp.translations[0].text.replace(
          new RegExp(`{(.+?(?=}))`, "gm"),
          (wB, i) => {
            const _i = parseInt(i);
            if (isNaN(_i)) return wB;
            return "{" + vars[_i];
          }
        )
      );
    });
  };
}
