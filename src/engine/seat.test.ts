import { describe, expect, it } from "vitest";
import { INITIAL_AFFINITY } from "@/content/caucus";
import { speechOrder } from "@/content/seats";
import { collectTags, contactsRemaining, evaluateCosponsors } from "@/engine/diplomacy";
import { DIFFICULTY_LEVELS } from "@/engine/levels";
import { createInitialState, reducer } from "@/engine/reducer";
import { assessOpeningSpeech } from "@/engine/speech";
import { ensureDebate } from "@/state/storage";
import type { BlankValue, GameState } from "@/types/game";

function modelBlanks(): Record<string, BlankValue> {
  return {
    form: { kind: "option", optionId: "opt-grant" },
    access: { kind: "option", optionId: "opt-community" },
    account: { kind: "option", optionId: "opt-sync" },
    scope: { kind: "option", optionId: "opt-nature" },
  };
}

describe("choosing a seat", () => {
  it("keeps Kenya as the default and carries a lobby choice into the next session", () => {
    const start = createInitialState();
    expect(start.playerId).toBe("kenya");
    let state = reducer(start, { type: "SET_PLAYER", playerId: "usa" });
    expect(state.playerId).toBe("usa");
    state = reducer(state, { type: "BEGIN" });
    expect(state.phase).toBe("chair");
    expect(state.playerId).toBe("usa");
    state = reducer(state, { type: "NEW_SESSION", sessionId: "next", difficulty: state.difficulty });
    expect(state.phase).toBe("lobby");
    expect(state.playerId).toBe("usa");
  });

  it("does not change the seat after the meeting has started", () => {
    const state = reducer(reducer(createInitialState(), { type: "BEGIN" }), { type: "SET_PLAYER", playerId: "brazil" });
    expect(state.playerId).toBe("kenya");
  });

  it("puts Kenya among the five other speakers when the player sits as the United States", () => {
    const order = speechOrder("usa");
    expect(order).toHaveLength(5);
    expect(order).toContain("kenya");
    expect(order).not.toContain("usa");
    expect(speechOrder("kenya")).toEqual(["bangladesh", "germany", "usa", "china", "brazil"]);
  });

  it("omits every human seat from the AI opening order", () => {
    expect(speechOrder("kenya", ["kenya", "usa", "china"])).toEqual(["bangladesh", "germany", "brazil"]);
  });

  it("still gives only Bangladesh an automatic cosponsor on the Kenya path", () => {
    const tags = collectTags(modelBlanks(), []);
    expect(evaluateCosponsors(tags, { ...INITIAL_AFFINITY }, 2).cosponsors).toEqual(["bangladesh"]);
    expect(contactsRemaining([])).toBe(15);
  });

  it("does not list the player as a cosponsor", () => {
    const tags = collectTags(modelBlanks(), []);
    const result = evaluateCosponsors(tags, { ...INITIAL_AFFINITY, usa: 90 }, 2, "usa");
    expect(result.cosponsors).not.toContain("usa");
    expect(result.cosponsors).toContain("bangladesh");
    expect(contactsRemaining([], "usa")).toBe(15);
  });

  it("accepts an opening that names the chosen country's stake", () => {
    const speech =
      "美國支持自願貢獻和教育科技，因為學習機會缺口不能只靠口號。若草案保留自願窗口，並說明項目如何提高學習成果，我們可以討論一個有限度的公共窗口。";
    const result = assessOpeningSpeech(speech, [], DIFFICULTY_LEVELS[2], "zh", "usa");
    expect(result.aligned).toBe(true);
    const kenya = assessOpeningSpeech(speech, [], DIFFICULTY_LEVELS[2], "zh", "kenya");
    expect(kenya.aligned).toBe(false);
    expect(kenya.notes).toContain("讀者還看不出肯尼亞在乎什麼。試著點出社區、債務、輟學預警，或贈款。");
  });

  it("repairs an old save without a seat back to Kenya", () => {
    const stripped = { ...createInitialState() } as GameState;
    delete (stripped as { playerId?: string }).playerId;
    const restored = ensureDebate(stripped);
    expect(restored.playerId).toBe("kenya");
    expect(restored.affinities.kenya).toBe(52);
    expect(restored.actionsLeft).toBe(15);
  });
});
