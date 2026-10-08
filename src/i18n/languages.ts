export const OFFICIAL_LANGS = [
  { id: "ar", label: "العربية", speech: "ar-SA", dir: "rtl", html: "ar" },
  { id: "zh", label: "中文", speech: "zh-TW", dir: "ltr", html: "zh-Hant" },
  { id: "en", label: "English", speech: "en-US", dir: "ltr", html: "en" },
  { id: "fr", label: "Français", speech: "fr-FR", dir: "ltr", html: "fr" },
  { id: "ru", label: "Русский", speech: "ru-RU", dir: "ltr", html: "ru" },
  { id: "es", label: "Español", speech: "es-ES", dir: "ltr", html: "es" },
] as const;

export type OfficialLang = (typeof OFFICIAL_LANGS)[number]["id"];

/** Spoken Chinese the microphone should listen for. Scoring stays Chinese either way. */
export type ChineseVoice = "cmn" | "yue";

export function isChineseVoice(value: unknown): value is ChineseVoice {
  return value === "cmn" || value === "yue";
}

export function languageMeta(id: OfficialLang) {
  return OFFICIAL_LANGS.find((item) => item.id === id) ?? OFFICIAL_LANGS[1];
}

export function isOfficialLang(value: unknown): value is OfficialLang {
  return OFFICIAL_LANGS.some((item) => item.id === value);
}
