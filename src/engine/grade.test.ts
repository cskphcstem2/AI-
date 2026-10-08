import { describe, expect, it } from "vitest";
import { createInitialState } from "@/engine/reducer";
import { gradeRound, MUN_CRITERIA, type MunCriterion } from "@/engine/scoring";
import type { RubricLevel, SessionScore } from "@/types/game";

function score(patch: Partial<SessionScore>): SessionScore {
  return {
    sessionId: "gv-test",
    playedAt: "2026-10-07T00:00:00.000Z",
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
      consistency: "短。",
      argumentation: "短。",
      alliance: "短。",
      influence: "短。",
      closing: "短。",
    },
    ...patch,
  };
}

function mean(criteria: MunCriterion[]): number {
  return criteria.reduce((sum, item) => sum + item.level, 0) / criteria.length;
}

describe("round grade", () => {
  it("marks the round on the seven Model UN criteria", () => {
    const criteria = gradeRound(createInitialState(), score({}));
    expect(criteria.map((item) => item.id)).toEqual(MUN_CRITERIA.map((item) => item.id));
    expect(criteria).toHaveLength(7);
    for (const item of criteria) {
      expect(item.level).toBeGreaterThanOrEqual(1);
      expect(item.level).toBeLessThanOrEqual(5);
    }
  });

  it("raises the web when the round's record is stronger", () => {
    const weak = gradeRound(createInitialState(), score({}));
    const strongState = {
      ...createInitialState(),
      blanks: {
        form: { kind: "option" as const, optionId: "opt-grant" },
        access: { kind: "option" as const, optionId: "opt-open" },
        report: { kind: "option" as const, optionId: "opt-summary" },
        scope: { kind: "option" as const, optionId: "opt-nature" },
      },
      amendmentChoices: { "de-audit": "reject" as const, "us-private": "counter" as const },
      presentations: [
        {
          id: "talk-1",
          occasion: "opening" as const,
          mode: "voice" as const,
          axes: {
            position: 5 as RubricLevel,
            reasoning: 5 as RubricLevel,
            evidence: 5 as RubricLevel,
            solution: 5 as RubricLevel,
            focus: 5 as RubricLevel,
            delivery: 5 as RubricLevel,
            protocol: 5 as RubricLevel,
          },
          notes: {} as never,
          content: 5 as RubricLevel,
          oratory: 5 as RubricLevel,
          protocol: 5 as RubricLevel,
          contentNote: "",
          oratoryNote: "",
          protocolNote: "",
          suggestions: [],
        },
      ],
    };
    const strong = gradeRound(
      strongState,
      score({
        consistency: 95,
        argumentation: 92,
        alliance: 88,
        comprehensionCorrect: 4,
        validInterventions: 3,
        interventionAttempts: 3,
        coreSurvived: true,
      }),
    );
    expect(mean(strong)).toBeGreaterThan(mean(weak));
    expect(strong.find((item) => item.id === "knowledge")?.level).toBeGreaterThan(
      weak.find((item) => item.id === "knowledge")?.level ?? 5,
    );
  });
});
