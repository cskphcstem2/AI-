import { describe, expect, it } from "vitest";
import { appendSpeech, readSession, undoubleTranscript } from "@/engine/speechCapture";

describe("speech capture", () => {
  it("keeps earlier sentences when the recognizer starts a new pass", () => {
    const session = readSession([
      { isFinal: true, transcript: "肯尼亞代表團認為教育援助應以贈款為主，" },
      { isFinal: false, transcript: "因為償債已經很高。" },
    ]);
    const heard = appendSpeech("主席。", session.finalText) + session.interim;
    expect(heard).toBe("主席。肯尼亞代表團認為教育援助應以贈款為主，因為償債已經很高。");
  });

  it("does not print a phrase again when the recognizer resends it", () => {
    const pieces = [{ isFinal: true, transcript: "主席，肯尼亞認為教育援助應以贈款為主。" }];
    const first = readSession(pieces);
    const again = readSession([...pieces, { isFinal: true, transcript: "主席，肯尼亞認為教育援助應以贈款為主。" }]);
    expect(again.finalText).toBe(first.finalText);
    expect(appendSpeech(first.finalText, again.finalText)).toBe(first.finalText);
    expect(undoubleTranscript(`${first.finalText}${first.finalText}`)).toBe(first.finalText);
  });

  it("does not show the interim copy of a phrase that is already final", () => {
    const session = readSession([
      { isFinal: true, transcript: "因為償債已經很高。" },
      { isFinal: false, transcript: "因為償債已經很高。" },
    ]);
    expect(session.finalText).toBe("因為償債已經很高。");
    expect(session.interim).toBe("");
  });
});
