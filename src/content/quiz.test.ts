import { describe, expect, it } from "vitest";
import { orderQuizChoices, QUIZ, quizPassed } from "@/content/quiz";

describe("quiz choice order", () => {
  it("keeps every choice and moves the correct one off a fixed slot", () => {
    const positions = new Set<number>();
    for (let session = 0; session < 24; session += 1) {
      for (const question of QUIZ) {
        const ordered = orderQuizChoices(question.choices, `gv-${session}:${question.id}`);
        expect(ordered.map((choice) => choice.id).sort()).toEqual(question.choices.map((choice) => choice.id).sort());
        positions.add(ordered.findIndex((choice) => choice.id === question.correctChoiceId));
      }
    }
    expect(positions).toEqual(new Set([0, 1, 2, 3]));
  });

  it("passes only when more than half the answers are correct", () => {
    const answers = Object.fromEntries(QUIZ.map((question) => [question.id, question.correctChoiceId]));
    expect(quizPassed(answers)).toBe(true);
    const half = { ...answers, q1: "b", q2: "a" };
    expect(quizPassed(half)).toBe(false);
    expect(quizPassed({ ...half, q2: QUIZ[1]!.correctChoiceId })).toBe(true);
  });

  it("uses the same order again for the same session", () => {
    const question = QUIZ[0]!;
    const first = orderQuizChoices(question.choices, "gv-same:q1").map((choice) => choice.id);
    const second = orderQuizChoices(question.choices, "gv-same:q1").map((choice) => choice.id);
    expect(second).toEqual(first);
  });
});
