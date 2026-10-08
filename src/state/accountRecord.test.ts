import { describe, expect, it } from "vitest";
import { mergeHistory } from "@/state/accountRecord";
import type { SessionScore } from "@/types/game";

function score(sessionId: string, playedAt: string, overall: number): SessionScore {
  return {
    sessionId,
    playedAt,
    overall,
    difficultyLevel: 2,
    consistency: overall,
    argumentation: overall,
    alliance: overall,
    influence: overall,
    tier: "steady",
    tierLabel: "穩健推進",
    comprehensionCorrect: 1,
    comprehensionTotal: 4,
    validInterventions: 1,
    interventionAttempts: 1,
    cosponsors: [],
    workingPaper: false,
    passed: true,
    coreSurvived: true,
    yesCount: 4,
    noCount: 1,
    narrative: { headline: "", body: "" },
  } as SessionScore;
}

describe("account practice record", () => {
  it("keeps one row per session and prefers the later mark", () => {
    const merged = mergeHistory(
      [score("a", "2026-01-01T00:00:00.000Z", 40), score("b", "2026-02-01T00:00:00.000Z", 70)],
      [score("a", "2026-03-01T00:00:00.000Z", 90), score("c", "2026-01-15T00:00:00.000Z", 55)],
    );
    expect(merged.map((item) => item.sessionId)).toEqual(["c", "b", "a"]);
    expect(merged.find((item) => item.sessionId === "a")?.overall).toBe(90);
  });
});
