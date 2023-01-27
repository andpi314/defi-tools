export const isInt = (value: string | undefined) =>
  value?.match(/^\d+$/) ?? false;

export const capitalizeFirst = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const toCapitalizedCase = (string: string) => {
  return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
};

export const toTitleCase = (string: string) => {
  const str = string.toLowerCase().split(" ");
  for (let i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }

  return str.join(" ");
};

export const firstValue = (
  values: (string | undefined)[],
  defaultValue = ""
) => {
  for (const value of values) {
    if (value) {
      return value;
    }
  }
  return defaultValue;
};

export const isAllUppercase = (value: string) => value === value?.toUpperCase();

export const capitalizeSentence = (value: string) => {
  const trimmed = value.trimStart();
  return " ".repeat(value.length - trimmed.length) + toTitleCase(trimmed);
};

export const capitalizeSentences = (value: string) =>
  value
    ?.split(".")
    .map((x) => capitalizeSentence(x))
    .join(".");

export const ensureTailingSlash = (value: string) =>
  value?.endsWith("/") ? value : value + "/";

export const ensureStartSlash = (value: string) =>
  value?.startsWith("/") ? value : "/" + value;

export const trimStartSlash = (value: string) =>
  value?.startsWith("/") ? value.substring(1) : value;

export const trimStart = (str: string, value: string) =>
  str?.startsWith(value) ? str.substring(value.length) : str;

export const trimEnd = (str: string, value: string) =>
  str?.endsWith(value) ? str.substring(0, str.length - value.length) : str;

export const trim = (str: string, value: string) =>
  trimStart(trimEnd(str, value), value);

export const containsNumber = (str: string) =>
  (str.match(/\d+/g)?.length ?? 0) > 0;

export const hideEmail = (email: string): string => {
  const [first, last] = email.split("@");
  if (first.length <= 4) return `******@${last}`;
  return email.replace(/(.{4})(.*)(?=@)/, function (_, gp2, gp3) {
    for (let i = 0; i < gp3.length; i++) {
      gp2 += "*";
    }
    return gp2;
  });
};

export const shorten = (str: string, maxLength?: number) => {
  const defaultMaxLength = maxLength || 4;
  if (str.length <= defaultMaxLength * 2)
    throw new Error("String is too short to shorten. Decrease maxLength");

  const start = str.substring(0, defaultMaxLength);
  const end = str.substring(str.length - defaultMaxLength, str.length);
  return `${start}...${end}`;
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

export const replaceAll = (str: string, find: string, replace: string) => {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
};
