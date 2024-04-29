import fs from "fs";

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
const isObject = (item: any) =>
  item && typeof item === "object" && !Array.isArray(item);

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target: any, ...sources: any) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export const configureEnv = () => {
  let env = "";
  if (fs.existsSync(".env")) env = fs.readFileSync(".env").toString();
  if (process.env.NODE_ENV === "production" && fs.existsSync(".env.production"))
    env = fs.readFileSync(".env.production").toString();
  if (
    process.env.NODE_ENV !== "production" &&
    fs.existsSync(".env.development")
  )
    env = fs.readFileSync(".env.development").toString();
  if (fs.existsSync(".env.local"))
    env = fs.readFileSync(".env.local").toString();
  if (!env) return {};
  return Object.assign(process.env, parseEnv(env));
};

export const parseEnv = (env: string): Record<string, string> => {
  const obj: Record<string, string> = {};
  env.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    obj[key] = value;
  });
  return obj;
};

export const htmlDecode = (txt: string) =>
  [
    ['"', "&quot;"],
    ["'", "&apos;"],
    ["&", "&amp;"],
    ["<", "&lt;"],
    [">", "&gt;"],
    [" ", "&nbsp;"],
    ["¡", "&iexcl;"],
    ["¢", "&cent;"],
    ["£", "&pound;"],
    ["¤", "&curren;"],
    ["¥", "&yen;"],
    ["¦", "&brvbar;"],
    ["§", "&sect;"],
    ["¨", "&uml;"],
    ["©", "&copy;"],
    ["ª", "&ordf;"],
    ["«", "&laquo;"],
    ["¬", "&not;"],
    ["­", "&shy;"],
    ["®", "&reg;"],
    ["¯", "&macr;"],
    ["°", "&deg;"],
    ["±", "&plusmn;"],
    ["²", "&sup2;"],
    ["³", "&sup3;"],
    ["´", "&acute;"],
    ["µ", "&micro;"],
    ["¶", "&para;"],
    ["·", "&middot;"],
    ["¸", "&cedil;"],
    ["¹", "&sup1;"],
    ["º", "&ordm;"],
    ["»", "&raquo;"],
    ["¼", "&frac14;"],
    ["½", "&frac12;"],
    ["¾", "&frac34;"],
    ["¿", "&iquest;"],
    ["×", "&times;"],
    ["÷", "&divide;"],
    ["À", "&Agrave;"],
    ["Á", "&Aacute;"],
    ["Â", "&Acirc;"],
    ["Ã", "&Atilde;"],
    ["Ä", "&Auml;"],
    ["Å", "&Aring;"],
    ["Æ", "&AElig;"],
    ["Ç", "&Ccedil;"],
    ["È", "&Egrave;"],
    ["É", "&Eacute;"],
    ["Ê", "&Ecirc;"],
    ["Ë", "&Euml;"],
    ["Ì", "&Igrave;"],
    ["Í", "&Iacute;"],
    ["Î", "&Icirc;"],
    ["Ï", "&Iuml;"],
    ["Ð", "&ETH;"],
    ["Ñ", "&Ntilde;"],
    ["Ò", "&Ograve;"],
    ["Ó", "&Oacute;"],
    ["Ô", "&Ocirc;"],
    ["Õ", "&Otilde;"],
    ["Ö", "&Ouml;"],
    ["Ø", "&Oslash;"],
    ["Ù", "&Ugrave;"],
    ["Ú", "&Uacute;"],
    ["Û", "&Ucirc;"],
    ["Ü", "&Uuml;"],
    ["Ý", "&Yacute;"],
    ["Þ", "&THORN;"],
    ["ß", "&szlig;"],
    ["à", "&agrave;"],
    ["á", "&aacute;"],
    ["â", "&acirc;"],
    ["ã", "&atilde;"],
    ["ä", "&auml;"],
    ["å", "&aring;"],
    ["æ", "&aelig;"],
    ["ç", "&ccedil;"],
    ["è", "&egrave;"],
    ["é", "&eacute;"],
    ["ê", "&ecirc;"],
    ["ë", "&euml;"],
    ["ì", "&igrave;"],
    ["í", "&iacute;"],
    ["î", "&icirc;"],
    ["ï", "&iuml;"],
    ["ð", "&eth;"],
    ["ñ", "&ntilde;"],
    ["ò", "&ograve;"],
    ["ó", "&oacute;"],
    ["ô", "&ocirc;"],
    ["õ", "&otilde;"],
    ["ö", "&ouml;"],
    ["ø", "&oslash;"],
    ["ù", "&ugrave;"],
    ["ú", "&uacute;"],
    ["û", "&ucirc;"],
    ["ü", "&uuml;"],
    ["ý", "&yacute;"],
    ["þ", "&thorn;"],
    ["ÿ", "&yuml;"],
  ].reduce((a, b) => a.replaceAll(b[1], b[0]), txt);
