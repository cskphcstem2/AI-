import { describe, expect, it } from "vitest";
import { OFFICIAL_LANGS } from "@/i18n/languages";
import {
  chineseRecognitionTag,
  detectChineseVariety,
  detectSpokenLang,
  fallbackSpeechTag,
  prepareSpeechLanguages,
  RECOGNITION_TAGS,
  shouldTryCantonese,
  nextCantoneseTag,
  speechTagFor,
  SPEECH_TAGS,
  usesCloudRecognition,
} from "@/engine/speechLang";

describe("spoken language detection", () => {
  it("covers every meeting language the recognizer can use", () => {
    expect(SPEECH_TAGS).toEqual(OFFICIAL_LANGS.map((item) => item.speech));
    expect(new Set(SPEECH_TAGS).size).toBe(6);
  });

  it("detects each of the six languages from a transcript", () => {
    expect(detectSpokenLang("主席，肯尼亞認為教育援助應以贈款為主。")).toBe("zh");
    expect(detectSpokenLang("Chair, the delegation of Kenya believes that education aid should be grants.")).toBe("en");
    expect(detectSpokenLang("Monsieur le Président, la délégation du Kenya estime que l'aide doit être une subvention.")).toBe("fr");
    expect(detectSpokenLang("Señor Presidente, la delegación de Kenia considera que la ayuda debe ser una subvención.")).toBe("es");
    expect(detectSpokenLang("Господин Председатель, делегация Кении считает, что помощь должна быть грантом.")).toBe("ru");
    expect(detectSpokenLang("السيد الرئيس، يرى وفد كينيا أن المساعدة يجب أن تكون منحة.")).toBe("ar");
  });

  it("does not guess from a fragment", () => {
    expect(detectSpokenLang("")).toBeNull();
    expect(detectSpokenLang("a")).toBeNull();
  });

  it("uses the Mandarin or Cantonese button for the microphone", () => {
    expect(speechTagFor("zh", "cmn")).toBe("zh-TW");
    expect(speechTagFor("zh", "yue")).toBe("yue-Hant-HK");
    expect(speechTagFor("en", "yue")).toBe("en-US");
    expect(usesCloudRecognition("yue-Hant-HK")).toBe(true);
    expect(usesCloudRecognition("zh-HK")).toBe(true);
    expect(usesCloudRecognition("zh-TW")).toBe(false);
    expect(nextCantoneseTag({ tag: "yue-Hant-HK", voicedMs: 2000, addedChars: 0, tried: false })).toBe("zh-HK");
    expect(nextCantoneseTag({ tag: "yue-Hant-HK", voicedMs: 2000, addedChars: 4, tried: false })).toBeNull();
    expect(nextCantoneseTag({ tag: "zh-HK", voicedMs: 4000, addedChars: 0, tried: false })).toBeNull();
    expect(fallbackSpeechTag("yue-Hant-HK")).toBe("zh-HK");
    expect(fallbackSpeechTag("zh-HK")).toBeNull();
    expect(fallbackSpeechTag("zh-TW")).toBe("zh-CN");
    expect(fallbackSpeechTag("zh-CN")).toBeNull();
    expect(fallbackSpeechTag("fr-FR")).toBeNull();
  });

  it("recognises Cantonese as Chinese and switches the recognition tag", () => {
    expect(detectChineseVariety("主席，我哋唔係咁睇。")).toBe("yue");
    expect(detectChineseVariety("主席，肯尼亞認為教育援助應以贈款為主。")).toBe("cmn");
    expect(detectChineseVariety("關係")).toBeNull();
    expect(chineseRecognitionTag("我哋而家要講贈款。", "zh-TW")).toBe("zh-HK");
    expect(chineseRecognitionTag("主席，肯尼亞認為教育援助應以贈款為主。", "zh-HK")).toBeNull();
    expect(chineseRecognitionTag("主席，肯尼亞認為教育援助應以贈款為主。", "zh-TW")).toBeNull();
    expect(shouldTryCantonese({ tag: "zh-TW", voicedMs: 2500, addedChars: 0, tried: false })).toBe(true);
    expect(shouldTryCantonese({ tag: "zh-TW", voicedMs: 2500, addedChars: 8, tried: false })).toBe(false);
    expect(shouldTryCantonese({ tag: "zh-HK", voicedMs: 4000, addedChars: 0, tried: false })).toBe(false);
    expect(RECOGNITION_TAGS).toContain("zh-HK");
    expect(RECOGNITION_TAGS).toContain("yue-Hant-HK");
  });

  it("installs a pack for every meeting language when the browser can download them", async () => {
    let requested: string[] = [];
    await prepareSpeechLanguages({
      available: async (options) => {
        requested = options.langs;
        return "downloadable";
      },
      install: async (options) => {
        expect(options.langs).toEqual([...SPEECH_TAGS]);
        return true;
      },
    });
    expect(requested).toEqual([...SPEECH_TAGS]);
  });
});
