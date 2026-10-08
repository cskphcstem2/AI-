import { describe, expect, it } from "vitest";
import { createInitialState, reducer } from "@/engine/reducer";
import { measureDelivery, scorePresentation, speechMark } from "@/engine/presentation";

const steady = {
  durationMs: 60_000,
  pauseCount: 3,
  meanVolume: 0.05,
  volumeSpread: 0.2,
};

const spoken =
  "主席。肯尼亞代表團認為教育援助應以贈款為主，因為脆弱國家每年的償債已經高於公共教育預算。根據會議卷宗，若農村學校用不上輟學預警，這筆錢就還沒有離開首都，女童與社區仍然要獨自承擔學習中斷。本代表團希望草案寫明社區可以申請的贈款窗口。謝謝。";

describe("presentation rubric", () => {
  it("scores a prepared Kenya speech above a slogan on seven axes", () => {
    const prepared = scorePresentation({ id: "a", occasion: "opening", text: spoken, delivery: steady });
    const slogan = scorePresentation({
      id: "b",
      occasion: "opening",
      text: "我覺得這很重要我希望大家努力我認為我們必須行動",
      delivery: { durationMs: 4_000, pauseCount: 0, meanVolume: 0.01, volumeSpread: 0.01 },
    });
    expect(Object.keys(prepared.axes)).toHaveLength(7);
    expect(prepared.content).toBeGreaterThanOrEqual(4);
    expect(prepared.protocol).toBeGreaterThanOrEqual(4);
    expect(prepared.oratory).toBeGreaterThanOrEqual(4);
    expect(speechMark(prepared)).toBeGreaterThan(speechMark(slogan));
    expect(speechMark(prepared)).toBeGreaterThanOrEqual(70);
    expect(speechMark(prepared)).toBeLessThanOrEqual(100);
    expect(prepared.axes.position).toBeGreaterThanOrEqual(4);
    expect(prepared.axes.reasoning).toBeGreaterThanOrEqual(4);
    expect(prepared.axes.solution).toBeGreaterThanOrEqual(4);
    expect(prepared.oratoryNote).toContain("眼神");
    expect(slogan.content).toBeLessThanOrEqual(2);
    expect(slogan.protocol).toBeLessThanOrEqual(2);
    expect(slogan.suggestions.length).toBeGreaterThan(0);
  });

  it("scores typed opening text with a writing delivery axis", () => {
    const review = scorePresentation({
      id: "typed",
      occasion: "opening",
      text: spoken,
      mode: "typed",
    });
    expect(review.mode).toBe("typed");
    expect(review.axes.delivery).toBeGreaterThanOrEqual(4);
    expect(review.notes.delivery).toMatch(/寫作|句子|結構/);
    expect(review.oratoryNote).not.toContain("眼神");
  });

  it("treats a personal attack as the lowest protocol score", () => {
    const review = scorePresentation({
      id: "c",
      occasion: "moderated",
      text: "主席。肯尼亞認為這個說法很愚蠢。謝謝。",
      delivery: steady,
      questionTags: ["grant"],
    });
    expect(review.protocol).toBe(1);
    expect(review.axes.protocol).toBe(1);
    expect(review.suggestions.some((item) => item.includes("人身"))).toBe(true);
  });

  it("scores an English floor speech on the English lexicon", () => {
    const english =
      "Chair. The Kenyan delegation holds that adaptation finance should be mainly grants, because debt service already exceeds adaptation budgets. According to the dossier, if communities cannot use early warning, the money has not left the capital. This delegation asks for a community grant window. Thank you.";
    const review = scorePresentation({
      id: "en",
      occasion: "opening",
      text: english,
      delivery: steady,
      speechLang: "en",
    });
    expect(review.content).toBeGreaterThanOrEqual(4);
    expect(review.protocol).toBeGreaterThanOrEqual(4);
    expect(review.axes.focus).toBeGreaterThanOrEqual(3);
  });

  it("counts a silence run as a pause", () => {
    const samples = [0.05, 0.05, 0.001, 0.001, 0.001, 0.001, 0.05];
    const delivery = measureDelivery(samples, 100, 700);
    expect(delivery.pauseCount).toBe(1);
    expect(delivery.meanVolume).toBeGreaterThan(0.02);
  });

  it("keeps the spoken text and the rubric when the opening is submitted", () => {
    let state = createInitialState();
    state = reducer(state, { type: "BEGIN" });
    state = reducer(state, { type: "TO_DOSSIER" });
    for (const sentenceId of ["f-debt", "f-kenya", "st-de"]) {
      state = reducer(state, { type: "TOGGLE_HIGHLIGHT", sentenceId });
    }
    state = reducer(state, { type: "TO_QUIZ" });
    state = { ...state, phase: "opening", openingStep: "write" };
    state = reducer(state, { type: "SUBMIT_SPEECH", text: spoken, delivery: steady });
    expect(state.openingStep).toBe("floor");
    expect(state.playerSpeech).toContain("肯尼亞代表團");
    expect(state.presentations).toHaveLength(1);
    expect(state.presentations[0]?.occasion).toBe("opening");
    expect(state.presentations[0]?.mode).toBe("voice");
    expect(state.presentations[0]?.axes.solution).toBeGreaterThanOrEqual(4);
  });

  it("lets recognised words enter the next step", () => {
    let state = createInitialState();
    state = { ...state, phase: "opening", openingStep: "write" };
    state = reducer(state, {
      type: "SUBMIT_SPEECH",
      text: "贈款為主。",
      delivery: { durationMs: 12_000, pauseCount: 1, meanVolume: 0.05, volumeSpread: 0.1 },
    });
    expect(state.openingStep).toBe("floor");
    expect(state.playerSpeech).toContain("贈款為主");
    state = { ...createInitialState(), phase: "opening", openingStep: "write" };
    state = reducer(state, { type: "SUBMIT_SPEECH", text: "贈款為主。" });
    expect(state.openingStep).toBe("write");
  });

  it("scores a typed opening into presentations with seven axes", () => {
    let state = createInitialState();
    state = { ...state, phase: "opening", openingStep: "write" };
    state = reducer(state, { type: "SUBMIT_SPEECH", text: spoken });
    expect(state.openingStep).toBe("floor");
    expect(state.presentations).toHaveLength(1);
    expect(state.presentations[0]?.mode).toBe("typed");
    expect(Object.keys(state.presentations[0]?.axes ?? {})).toHaveLength(7);
  });
});
