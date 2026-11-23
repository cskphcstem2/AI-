import { describe, expect, it } from "vitest";
import { isMp3File, sttLanguage } from "@/llm/transcribe";

describe("speech file transcription", () => {
  it("keeps the chosen Chinese variety and the other meeting languages", () => {
    expect(sttLanguage("zh", "cmn")).toBe("zh");
    expect(sttLanguage("zh", "yue")).toBe("yue");
    expect(sttLanguage("en", "yue")).toBe("en");
    expect(sttLanguage("ar")).toBe("ar");
  });

  it("accepts an mp3 by name or mime type", () => {
    expect(isMp3File(new File(["a"], "speech.mp3", { type: "" }))).toBe(true);
    expect(isMp3File(new File(["a"], "speech.wav", { type: "audio/mpeg" }))).toBe(true);
    expect(isMp3File(new File(["a"], "notes.txt", { type: "text/plain" }))).toBe(false);
  });
});
