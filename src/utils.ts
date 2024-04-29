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
