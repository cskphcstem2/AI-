import { describe, expect, it } from "vitest";
import { createInitialState, reducer } from "@/engine/reducer";
import { blanksComplete, collectTags, tagsAfterAmendments } from "@/engine/diplomacy";
import { tagsFromText } from "@/engine/tags";
import type { GameState, TruthBullet } from "@/types/game";

const debtBullet: TruthBullet = {
  id: "b-debt",
  text: "脆弱國家每年的償債已經高於公共教育預算。",
  source: "highlight",
  origin: "事實摘要",
  speakerId: "fact",
  tags: ["debt", "grant"],
  note: "債務比教育預算更高。",
};

function moderated(): GameState {
  return {
    ...createInitialState(),
    phase: "moderated",
    bullets: [debtBullet],
  };
}

describe("moderated trial", () => {
  it("answers a rebuttal, then keeps two more rounds before the caucus", () => {
    let state = moderated();
    state = reducer(state, { type: "FLOOR_TURN" });
    expect(state.floor.lines[0]?.speaker).toBe("usa");
    state = reducer(state, {
      type: "FLOOR_SPEAK",
      mode: "rebut",
      bulletId: debtBullet.id,
      text: "然而這則論據說明贈款必須留在前面，因為新的債務會讓社區錯過學年，私人資本不能變成主體。",
    });
    expect(state.floor.beat).toBe("answer");
    expect(state.floor.lines.at(-1)?.role).toBe("react");
    expect(state.floor.lines.at(-1)?.speaker).toBe("usa");
    expect(state.interventions[0]?.valid).toBe(true);
    state = reducer(state, { type: "FLOOR_PASS" });
    expect(state.floor.round).toBe(2);
    expect(state.floor.beat).toBe("listen");

    state = reducer(state, { type: "FLOOR_TURN" });
    state = reducer(state, {
      type: "FLOOR_SPEAK",
      mode: "speech",
      text: "社區需要九十日內的回覆，成果摘要可以保留，但不能讓學年空等。",
    });
    expect(state.floor.beat).toBe("answer");
    expect(state.floor.lines.at(-1)?.speaker).toBe("bangladesh");
    state = reducer(state, { type: "FLOOR_ANSWER", text: "報告可以有，但不得凍結撥款，社區仍要進得了門。" });
    expect(state.floor.round).toBe(3);

    state = reducer(state, { type: "FLOOR_TURN" });
    state = reducer(state, {
      type: "FLOOR_SPEAK",
      mode: "speech",
      text: "輟學預警和全納教育、母語教學都應該具有資格，校舍不能是唯一用途。",
    });
    state = reducer(state, { type: "FLOOR_PASS" });
    expect(state.floor.beat).toBe("done");
    expect(state.bullets.filter((bullet) => bullet.source === "discussion").length).toBeGreaterThanOrEqual(4);
    expect(state.bullets.find((bullet) => bullet.id === "disc-floor-1-you")?.note).toBe("你在這一輪提出的進一步想法");

    state = reducer(state, { type: "TO_CAUCUS" });
    expect(state.phase).toBe("unmoderated");
    state = reducer(state, { type: "TO_DRAFT" });
    expect(state.phase).toBe("unmoderated");
    expect(state.lastNotice?.text).toContain("三個國家");
  });

  it("lets a spoken turn move the moderated debate to the next round", () => {
    let state = moderated();
    state = reducer(state, { type: "FLOOR_TURN" });
    state = reducer(state, {
      type: "FLOOR_SPEAK",
      mode: "speech",
      text: "因為社區要在這一季進得了門，所以贈款必須寫在窗口的第一句，而不是留到下一份計劃。",
      delivery: { durationMs: 30_000, pauseCount: 1, meanVolume: 0.08, volumeSpread: 0.02 },
    });
    expect(state.floor.beat).toBe("answer");
    expect(state.presentations?.at(-1)?.mode).toBe("voice");
    const ideaMark = state.presentations?.at(-1);
    state = reducer(state, {
      type: "FLOOR_ANSWER",
      text: "報告可以有，但不得凍結撥款，社區仍要進得了門。",
      delivery: { durationMs: 28_000, pauseCount: 1, meanVolume: 0.07, volumeSpread: 0.04 },
    });
    expect(state.presentations?.at(-1)?.id).not.toBe(ideaMark?.id);
    expect(state.presentations?.at(-1)?.mode).toBe("voice");
    expect(state.floor.round).toBe(2);
    expect(state.floor.beat).toBe("listen");
  });

  it("keeps the other countries open after one seat is talked out", () => {
    let state: GameState = { ...createInitialState(), phase: "unmoderated" };
    state = reducer(state, { type: "CAUCUS", delegateId: "usa", action: "redline" });
    state = reducer(state, { type: "CAUCUS", delegateId: "usa", action: "condition" });
    state = reducer(state, { type: "CAUCUS", delegateId: "usa", action: "redline" });
    state = reducer(state, { type: "CAUCUS", delegateId: "usa", action: "condition" });
    expect(state.caucusLog.filter((item) => item.delegateId === "usa")).toHaveLength(3);
    expect(state.lastNotice?.text).toContain("另一國");
    state = reducer(state, { type: "CAUCUS", delegateId: "china", action: "redline" });
    expect(state.caucusLog.some((item) => item.delegateId === "china")).toBe(true);
    expect(state.selectedDelegateId).toBe("china");
  });
});

describe("player-written solutions", () => {
  it("judges whether a typed proposal is close, and blocks the draft before three countries", () => {
    let state: GameState = { ...createInitialState(), phase: "unmoderated" };
    state = reducer(state, {
      type: "CAUCUS",
      delegateId: "bangladesh",
      action: "propose",
      playerLine: "以贈款為主，讓社區在九十日內申請輟學預警，避免新的債務。",
      bulletId: debtBullet.id,
    });
    expect(state.affinities.bangladesh).toBeGreaterThan(66);
    expect(state.caucusLog[0]?.reply).toContain("靠近");
    state = reducer(state, { type: "TO_DRAFT" });
    expect(state.phase).toBe("unmoderated");
  });

  it("reads English clauses and keeps an evidence point from being the only answer", () => {
    expect(tagsFromText("Education aid should be grant-based so communities can use dropout early warning.")).toEqual(
      expect.arrayContaining(["grant", "community", "warning"]),
    );
    const custom = "每年公開成果摘要，並接受抽樣覆核，不得凍結撥款。";
    expect(
      blanksComplete({
        form: { kind: "bullet", bulletId: debtBullet.id },
        access: { kind: "custom", custom: "地方機構可在九十日內提交簡化申請並包含輟學預警。" },
        account: { kind: "custom", custom },
        scope: { kind: "custom", custom: "輟學預警與全納教育均具資格，另設自願窗口。" },
      }),
    ).toBe(false);
    const tags = collectTags(
      {
        form: { kind: "custom", custom: "以贈款為主，避免增加主權債務。", bulletId: debtBullet.id },
      },
      [debtBullet],
    );
    expect(tags.has("grant")).toBe(true);
    expect(tags.has("debt")).toBe(true);
  });

  it("requires a counter-proposal in the player's own words", () => {
    let state: GameState = { ...createInitialState(), phase: "drafting", amendmentCursor: 0, solicited: true };
    state = reducer(state, { type: "RESOLVE_AMENDMENT", amendmentId: "de-audit", choice: "counter", text: "太短" });
    expect(state.amendmentCursor).toBe(0);
    state = reducer(state, {
      type: "RESOLVE_AMENDMENT",
      amendmentId: "de-audit",
      choice: "counter",
      text: "每年公開成果摘要，審計不得作為凍結撥款的前置條件。",
    });
    expect(state.amendmentCursor).toBe(1);
    const tags = tagsAfterAmendments(new Set(["grant"]), state.amendmentChoices, state.amendmentTexts);
    expect(tags.has("freeze")).toBe(false);
    expect(tags.has("report")).toBe(true);
  });
});
