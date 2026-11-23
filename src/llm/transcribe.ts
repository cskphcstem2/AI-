import type { ChineseVoice, OfficialLang } from "@/i18n/languages";

const FORMATTED = new Set(["zh", "en", "fr", "es", "ru", "ar"]);

/** Language code for Grok speech-to-text. Chinese follows the 國語 or 廣東話 choice. */
export function sttLanguage(lang: OfficialLang, voice: ChineseVoice = "cmn"): string {
  if (lang === "zh") return voice === "yue" ? "yue" : "zh";
  return lang;
}

export function isMp3File(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".mp3") || file.type === "audio/mpeg" || file.type === "audio/mp3";
}

export async function transcribeAudio(input: {
  baseUrl?: string;
  apiKey?: string;
  file: File;
  language: string;
}): Promise<{ text: string; durationSec: number }> {
  const apiKey = input.apiKey?.trim();
  if (!apiKey) throw new Error("missing-key");
  const base = (input.baseUrl?.trim() || "https://api.x.ai/v1").replace(/\/$/, "");
  const body = new FormData();
  body.append("model", "grok-voice-transcribe-2.0");
  body.append("language", input.language);
  if (FORMATTED.has(input.language)) body.append("format", "true");
  body.append("file", input.file, input.file.name || "speech.mp3");
  const response = await fetch(`${base}/stt`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });
  if (!response.ok) throw new Error(`stt-${response.status}`);
  const payload = (await response.json()) as { text?: string; duration?: number };
  const text = payload.text?.trim() ?? "";
  if (!text) throw new Error("stt-empty");
  return { text, durationSec: typeof payload.duration === "number" ? payload.duration : 0 };
}
