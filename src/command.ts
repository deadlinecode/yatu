import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { translate } from "./translate";
import { TargetLanguageCodes } from "./DeepL/Types";

yargs(hideBin(process.argv))
  .scriptName("yatu")
  .alias("-h", "--help")
  .command(
    ["translate", "t"],
    "Translates the JSON file to a different language",
    (yargs) =>
      yargs
        .version(false)
        .option("file", {
          alias: "f",
          description: "The file to translate",
          type: "string",
          demandOption: true,
        })
        .option("apiKey", {
          alias: "k",
          description:
            "The API key for the translation service\nCan be found at \nhttps://deepl.com/de/your-account/keys\nDon't worry there is a free tier",
          type: "string",
          demandOption: true,
          default: process.env.YATU_API_KEY,
        })
        .option("lang", {
          alias: "l",
          description: "The language(s) to translate to",
          type: "array",
          demandOption: true,
          choices: TargetLanguageCodes,
        })
        .option("minify", {
          alias: "m",
          description: "Minify the JSON output",
          type: "boolean",
        }),
    (argv) => translate(argv.file, argv.apiKey, argv.lang, argv.minify)
  )
  .demandCommand()
  .parse();
