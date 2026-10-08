import { describe, expect, it } from "vitest";
import { createInitialState } from "@/engine/reducer";
import { scorePresentation } from "@/engine/presentation";
import { examineRoundLocal, examineSpeechLocal, parseRoundCoach, parseSpeechCoach, recommendExamples } from "@/llm/coach";
import type { SessionScore } from "@/types/game";

function score(): SessionScore {
  return {
    sessionId: "s",
    playedAt: "2026-01-01T00:00:00.000Z",
    difficultyLevel: 2,
    consistency: 20,
    argumentation: 20,
    alliance: 20,
    influence: 20,
    overall: 20,
    tier: "developing",
    tierLabel: "仍需磨練",
    comprehensionCorrect: 0,
    comprehensionTotal: 4,
    validInterventions: 0,
    interventionAttempts: 0,
    cosponsors: [],
    workingPaper: true,
    passed: false,
    coreSurvived: false,
    yesCount: 1,
    noCount: 4,
    narrative: {
      consistency: "",
      argumentation: "",
      alliance: "",
      influence: "",
      closing: "",
    },
  };
}

describe("examiner", () => {
  it("names the weak parts and gives a mark out of 100", () => {
    const mark = examineRoundLocal(createInitialState(), score());
    expect(mark.overall).toBeGreaterThanOrEqual(0);
    expect(mark.overall).toBeLessThanOrEqual(100);
    expect(mark.levels).toHaveLength(7);
    expect(mark.improvements.length).toBeGreaterThan(0);
    expect(mark.improvements.some((item) => item.includes("需要加強"))).toBe(true);
  });

  it("recommends other examples for the round's level", () => {
    const state = { ...createInitialState(), caseId: "sdg4-reach" };
    const low = recommendExamples(state.caseId, 40);
    const high = recommendExamples(state.caseId, 90);
    expect(low).toHaveLength(3);
    expect(low.every((item) => item.id !== "sdg4-reach" && item.level === 1)).toBe(true);
    expect(high.every((item) => item.level === 3)).toBe(true);
    expect(high.map((item) => item.id).join()).not.toBe(low.map((item) => item.id).join());
    const mark = examineRoundLocal(state, score());
    expect(mark.examples).toHaveLength(3);
  });

  it("reads a model reply into the seven marks", () => {
    const parsed = parseRoundCoach(`\`\`\`json
{"overall":74,"levels":{"representation":4,"knowledge":3,"speaking":4,"argument":3,"diplomacy":2,"drafting":4,"procedure":3},"improvements":["外交協商需要多談一席。"]}
\`\`\``);
    expect(parsed?.overall).toBe(74);
    expect(parsed?.levels.find((item) => item.id === "diplomacy")?.level).toBe(2);
    expect(parsed?.improvements[0]).toContain("外交協商");
  });

  it("gives a speech mark and names a weak axis", () => {
    const review = scorePresentation({
      id: "a",
      occasion: "moderated",
      text: "我覺得這很重要",
      mode: "typed",
    });
    const mark = examineSpeechLocal(review);
    expect(mark.mark).toBeLessThan(60);
    expect(mark.improvements.length).toBeGreaterThan(0);
  });

  it("reads a speech mark from the model", () => {
    const parsed = parseSpeechCoach('{"mark":81,"improvements":["開頭先稱呼主席。"]}');
    expect(parsed?.mark).toBe(81);
    expect(parsed?.improvements).toEqual(["開頭先稱呼主席。"]);
  });
});
