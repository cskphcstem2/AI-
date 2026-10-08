import { OFFICIAL_LANGS, languageMeta, type ChineseVoice, type OfficialLang } from "@/i18n/languages";

/** BCP 47 tags the voice-input recognizer can use, one per meeting language. */
export const SPEECH_TAGS: readonly string[] = OFFICIAL_LANGS.map((item) => item.speech);

/** Cantonese tags used when the chosen meeting language is Chinese. */
export const CANTONESE_TAGS = ["zh-HK", "yue-Hant-HK"] as const;

const MANDARIN_TAGS = ["zh-TW", "zh-CN"] as const;

/** Meeting languages plus Cantonese, so a Chinese choice can install both. */
export const RECOGNITION_TAGS: readonly string[] = [...SPEECH_TAGS, ...CANTONESE_TAGS];

const HAN = /[\u3400-\u9fff]/g;
const ARABIC = /[\u0600-\u06ff]/g;
const CYRILLIC = /[\u0400-\u04ff]/g;
const LATIN = /[A-Za-zÀ-ÖØ-öø-ÿ]/g;

const LATIN_MARKS: Record<"en" | "fr" | "es", { letters: RegExp; words: RegExp }> = {
  en: {
    letters: /[a-z]/gi,
    words: /\b(the|and|of|to|should|that|we|this|chair|because|delegation)\b/gi,
  },
  fr: {
    letters: /[éèêëàâùûôîçœæ]/gi,
    words: /\b(le|la|les|des|une|est|pour|dans|nous|président|monsieur|madame|délégation)\b/gi,
  },
  es: {
    letters: /[ñáíóúü¿¡]/gi,
    words: /\b(el|los|las|para|con|una|señor|señora|presidente|delegación|debe)\b/gi,
  },
};

function tally(text: string, pattern: RegExp): number {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return text.match(new RegExp(pattern.source, flags))?.length ?? 0;
}

/**
 * Identifies which of the six meeting languages a transcript is in.
 * Returns null when the sample is too short to choose.
 */
export function detectSpokenLang(text: string): OfficialLang | null {
  const sample = text.trim();
  if (sample.length < 2) return null;
  const han = tally(sample, HAN);
  const arabic = tally(sample, ARABIC);
  const cyrillic = tally(sample, CYRILLIC);
  const latin = tally(sample, LATIN);
  const letters = han + arabic + cyrillic + latin;
  if (letters < 2) return null;
  if (han >= 2 && han / letters >= 0.4) return "zh";
  if (arabic >= 2 && arabic / letters >= 0.4) return "ar";
  if (cyrillic >= 2 && cyrillic / letters >= 0.4) return "ru";
  if (latin / letters < 0.5) return null;

  const scores = (["en", "fr", "es"] as const).map((id) => {
    const marks = LATIN_MARKS[id];
    const letterHits = tally(sample, marks.letters);
    const wordHits = tally(sample.toLowerCase(), marks.words);
    const letterWeight = id === "en" ? 0 : 3;
    return { id, score: letterHits * letterWeight + wordHits * 2 };
  });
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const next = scores[1];
  if (!best || best.score < 2) return null;
  if (next && best.score < next.score + 2) return null;
  return best.id;
}

const CANTONESE_MARK = /[唔喺咗嘅哋冇啲咁嗰嚟乜嘢諗畀噉喎]|唔係|唔好|點解|而家|咁樣|係咪|佢哋/g;

export type ChineseVariety = "yue" | "cmn";

/** Cantonese particles are absent from Mandarin. One of them is enough. */
export function detectChineseVariety(text: string): ChineseVariety | null {
  const han = tally(text, HAN);
  if (han < 2) return null;
  if (tally(text, CANTONESE_MARK) >= 1) return "yue";
  if (han >= 6) return "cmn";
  return null;
}

/**
 * Moves the microphone from a Mandarin model to Cantonese.
 * Formal Cantonese often uses the same characters as Mandarin, so a Cantonese model is not switched back.
 */
export function chineseRecognitionTag(text: string, currentTag: string): string | null {
  const variety = detectChineseVariety(text);
  const cantonese = (CANTONESE_TAGS as readonly string[]).includes(currentTag);
  if (variety === "yue" && !cantonese) return "zh-HK";
  return null;
}

/**
 * Mandarin heard nothing while the microphone was clearly in use.
 * Try Cantonese once before giving up on that stretch of speech.
 */
export function shouldTryCantonese(input: { tag: string; voicedMs: number; addedChars: number; tried: boolean }): boolean {
  if (input.tried) return false;
  if (!(MANDARIN_TAGS as readonly string[]).includes(input.tag)) return false;
  return input.voicedMs >= 2500 && input.addedChars < 2;
}

/** Cantonese stays on a Cantonese tag. Mandarin can move from Traditional to Simplified. */
export function fallbackSpeechTag(tag: string): string | null {
  if (tag === "yue-Hant-HK") return "zh-HK";
  if (tag === "zh-TW") return "zh-CN";
  return null;
}

/** Tag passed to the microphone. Chinese follows the 國語 or 廣東話 button. */
export function speechTagFor(lang: OfficialLang, voice: ChineseVoice = "cmn"): string {
  if (lang === "zh") return voice === "yue" ? "yue-Hant-HK" : "zh-TW";
  return languageMeta(lang).speech;
}

/** Cantonese has no on-device pack. Chrome must use cloud recognition for these tags. */
export function usesCloudRecognition(tag: string): boolean {
  return (CANTONESE_TAGS as readonly string[]).includes(tag);
}

/**
 * yue-Hant-HK is the cloud Cantonese tag. If speech is heard and no text arrives,
 * try the older zh-HK tag once.
 */
export function nextCantoneseTag(input: { tag: string; voicedMs: number; addedChars: number; tried: boolean }): string | null {
  if (input.tried || input.tag !== "yue-Hant-HK") return null;
  if (input.voicedMs >= 2000 && input.addedChars < 2) return "zh-HK";
  return null;
}

type SpeechPackApi = {
  available?: (options: { langs: string[]; processLocally?: boolean }) => Promise<string>;
  install?: (options: { langs: string[] }) => Promise<boolean>;
};

/** Asks the browser to download on-device packs. Cantonese stays on the cloud recognizer. */
export async function prepareSpeechLanguages(api: SpeechPackApi | null): Promise<void> {
  if (!api?.available) return;
  try {
    const status = await api.available({ langs: [...SPEECH_TAGS], processLocally: true });
    if ((status === "downloadable" || status === "downloading") && api.install) {
      await api.install({ langs: [...SPEECH_TAGS] });
    }
  } catch {
    /* Cloud recognition can still use the language tags. */
  }
}
