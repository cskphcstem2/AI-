import { describe, expect, it } from "vitest";
import { INITIAL_AFFINITY } from "@/content/caucus";
import { HIGHLIGHT_LIMIT } from "@/content/dossier";
import { QUIZ } from "@/content/quiz";
import {
  buildBallots,
  collectTags,
  coreSurvived,
  evaluateCosponsors,
  resolveCaucus,
} from "@/engine/diplomacy";
import { deriveDifficulty } from "@/engine/difficulty";
import { judgeIntervention } from "@/engine/judge";
import { createInitialState, reducer } from "@/engine/reducer";
import { DIFFICULTY_LEVELS } from "@/engine/levels";
import { parseSave, resumeClock, serializeSave } from "@/state/storage";
import { DELEGATE_ORDER, moodLabel, VOICES } from "@/content/voices";
import type { BlankValue, GameState, TruthBullet } from "@/types/game";

const debtBullet: TruthBullet = {
  id: "f-debt",
  text: "多個低收入國家每年的償債支出，高於它們能動用的公共教育預算。",
  source: "highlight",
  origin: "測試",
  speakerId: "fact",
  tags: ["debt", "grant"],
};

function modelBlanks(): Record<string, BlankValue> {
  return {
    form: { kind: "option", optionId: "opt-grant" },
    access: { kind: "option", optionId: "opt-community" },
    account: { kind: "option", optionId: "opt-sync" },
    scope: { kind: "option", optionId: "opt-nature" },
  };
}

describe("evidence points", () => {
  it("caps highlights at the limit and removes on toggle", () => {
    let state = reducer(createInitialState(), { type: "BEGIN" });
    state = reducer(state, { type: "TO_DOSSIER" });
    const ids = [
      "st-bd",
      "st-br",
      "st-de",
      "st-cn",
      "st-us",
      "f-gap",
      "f-debt",
      "f-kenya",
      "f-bd-warn",
      "f-gcf",
      "f-cbdr",
      "f-ld",
      "ref-ke-moe",
    ];
    for (const sentenceId of ids) {
      state = reducer(state, { type: "TOGGLE_HIGHLIGHT", sentenceId });
    }
    expect(state.bullets.filter((bullet) => bullet.source === "highlight")).toHaveLength(HIGHLIGHT_LIMIT);
    expect(state.bullets.some((bullet) => bullet.id === "ref-ke-moe")).toBe(false);
    expect(state.lastNotice?.tone).toBe("warn");
    state = reducer(state, { type: "TOGGLE_HIGHLIGHT", sentenceId: "f-gap" });
    expect(state.bullets.some((bullet) => bullet.id === "f-gap")).toBe(false);
  });

  it("keeps a source hyperlink when a reference sentence is highlighted", () => {
    let state = reducer(createInitialState(), { type: "BEGIN" });
    state = reducer(state, { type: "TO_DOSSIER" });
    state = reducer(state, { type: "TOGGLE_HIGHLIGHT", sentenceId: "ref-de-gem" });
    const bullet = state.bullets.find((item) => item.id === "ref-de-gem");
    expect(bullet?.href).toContain("unesco.org");
    expect(bullet?.sourceLabel).toContain("全球教育監測報告");
  });

  it("adds an evidence point only when the comprehension answer is correct", () => {
    let state = reducer(createInitialState(), { type: "BEGIN" });
    state = reducer(state, { type: "TO_DOSSIER" });
    for (const sentenceId of ["f-debt", "f-kenya", "f-gap"]) {
      state = reducer(state, { type: "TOGGLE_HIGHLIGHT", sentenceId });
    }
    state = reducer(state, { type: "TO_QUIZ" });
    state = reducer(state, { type: "ANSWER", questionId: "q1", choiceId: "b" });
    expect(state.bullets.some((bullet) => bullet.id === "quiz-q1")).toBe(false);
    state = reducer({ ...state, quizAnswers: {}, quizIndex: 0, bullets: state.bullets.filter((b) => b.source === "highlight") }, {
      type: "ANSWER",
      questionId: "q1",
      choiceId: "a",
    });
    expect(state.bullets.some((bullet) => bullet.source === "comprehension" && bullet.tags.includes("grant"))).toBe(true);
  });

  it("returns to the example page unless more than half the quiz is correct", () => {
    const answer = (correctCount: number) => {
      let state: GameState = { ...createInitialState(), caseId: "sdg4-reach", phase: "quiz" };
      QUIZ.forEach((question, index) => {
        const wrong = question.choices.find((choice) => choice.id !== question.correctChoiceId);
        const choiceId = index < correctCount ? question.correctChoiceId : (wrong?.id ?? "b");
        state = reducer(state, { type: "ANSWER", questionId: question.id, choiceId });
        state = reducer(state, { type: "NEXT_QUIZ" });
      });
      return reducer(state, { type: "ATTEND", now: 1_000 });
    };
    const failed = answer(2);
    expect(failed.phase).toBe("lobby");
    expect(failed.caseId).toBeNull();
    expect(failed.quizAnswers).toEqual({});
    const passed = answer(3);
    expect(passed.phase).toBe("opening");
  });
});

describe("judge", () => {
  it("rejects a rebuttal that has no contrast", () => {
    const result = judgeIntervention({
      mode: "rebut",
      text: "我不同意把私人資本寫成正文。這則償債資料描述的是支出結構，我希望會議把贈款的位置寫得更清楚。",
      bullet: debtBullet,
      questionTags: ["grant", "private", "debt"],
      difficulty: DIFFICULTY_LEVELS[2],
    });
    expect(result.valid).toBe(false);
    expect(result.record).toBe(true);
  });

  it("accepts a support that links the evidence point to the question", () => {
    const result = judgeIntervention({
      mode: "support",
      text: "這則償債資料支持贈款優先，因為新的貸款會讓教育變成另一筆債務。",
      bullet: debtBullet,
      questionTags: ["grant", "debt", "private"],
      difficulty: DIFFICULTY_LEVELS[2],
    });
    expect(result.valid).toBe(true);
    expect(result.consumeUse).toBe(true);
  });
});

describe("diplomacy and voting", () => {
  it("gives Bangladesh the only automatic cosponsor before caucus", () => {
    const tags = collectTags(modelBlanks(), []);
    const result = evaluateCosponsors(tags, { ...INITIAL_AFFINITY }, 2);
    expect(result.cosponsors).toEqual(["bangladesh"]);
    expect(coreSurvived(tags, {})).toBe(true);
  });

  it("lets a nature clause plus one Brazil conversation clear the level-2 gate", () => {
    const talk = resolveCaucus({
      delegateId: "brazil",
      action: "redline",
      nextId: "c1",
    });
    expect("record" in talk).toBe(true);
    if (!("record" in talk)) return;
    const affinities = { ...INITIAL_AFFINITY, brazil: INITIAL_AFFINITY.brazil + talk.delta };
    const tags = collectTags(modelBlanks(), []);
    const result = evaluateCosponsors(tags, affinities, 2);
    expect(result.cosponsors).toContain("bangladesh");
    expect(result.cosponsors).toContain("brazil");
    expect(result.cosponsors.length).toBeGreaterThanOrEqual(2);
  });

  it("passes a coherent draft and records China as movable", () => {
    const tags = collectTags(modelBlanks(), []);
    const courted = { ...INITIAL_AFFINITY, brazil: 58, china: 57 };
    const ballots = buildBallots(tags, courted, {}, false);
    expect(ballots.kenya).toBe("yes");
    expect(ballots.bangladesh).toBe("yes");
    expect(ballots.brazil).toBe("yes");
    expect(ballots.germany).toBe("abstain");
    expect(ballots.china).toBe("yes");
    expect(ballots.usa).toBe("abstain");
    const yes = Object.values(ballots).filter((vote) => vote === "yes").length;
    const no = Object.values(ballots).filter((vote) => vote === "no").length;
    expect(yes).toBeGreaterThan(no);
  });

  it("opens amendments after Brazil is courted and the four model clauses are chosen", () => {
    let state = createInitialState();
    state = { ...state, phase: "unmoderated" };
    state = reducer(state, { type: "CAUCUS", delegateId: "bangladesh", action: "redline" });
    state = reducer(state, { type: "CAUCUS", delegateId: "brazil", action: "redline" });
    state = reducer(state, { type: "CAUCUS", delegateId: "germany", action: "redline" });
    state = reducer(state, { type: "TO_DRAFT" });
    const choices = [
      ["form", "opt-grant"],
      ["access", "opt-community"],
      ["account", "opt-sync"],
      ["scope", "opt-nature"],
    ] as const;
    for (const [blankId, optionId] of choices) {
      state = reducer(state, { type: "SET_BLANK", blankId, value: { kind: "option", optionId } });
    }
    state = reducer(state, { type: "SOLICIT" });
    expect(state.cosponsors).toEqual(expect.arrayContaining(["bangladesh", "brazil"]));
    state = reducer(state, { type: "START_AMENDMENTS" });
    expect(state.amendmentCursor).toBe(0);
  });

  it("opens the amendment page from ask-for-cosponsors even when the blanks are still short", () => {
    let state = { ...createInitialState(), phase: "drafting" as const };
    state = reducer(state, {
      type: "SET_BLANK",
      blankId: "form",
      value: { kind: "custom", custom: "贈款為主。" },
    });
    state = reducer(state, { type: "SOLICIT" });
    expect(state.amendmentCursor).toBe(0);
    expect(state.phase).toBe("drafting");
  });

  it("makes the private-capital temptation lose Bangladesh", () => {
    const blanks = modelBlanks();
    blanks.form = { kind: "option", optionId: "opt-loan" };
    const tags = collectTags(blanks, []);
    const result = evaluateCosponsors(tags, { ...INITIAL_AFFINITY, usa: 70 }, 2);
    expect(result.cosponsors).not.toContain("bangladesh");
    expect(coreSurvived(tags, {})).toBe(false);
  });
});

describe("difficulty", () => {
  it("starts at standard and adapts from recent sessions", () => {
    expect(deriveDifficulty([]).level).toBe(2);
    expect(deriveDifficulty([{ overall: 50 }]).level).toBe(1);
    expect(deriveDifficulty([{ overall: 86 }]).level).toBe(3);
    expect(deriveDifficulty([{ overall: 90 }, { overall: 70 }]).level).toBe(3);
    expect(deriveDifficulty([{ overall: 78 }, { overall: 70 }]).level).toBe(2);
  });
});

describe("opening flow", () => {
  it("blocks a short speech and then reveals the secretariat bullets", () => {
    let state = createInitialState();
    state = reducer(state, { type: "BEGIN" });
    state = reducer(state, { type: "TO_DOSSIER" });
    for (const sentenceId of ["f-debt", "f-kenya", "st-de"]) {
      state = reducer(state, { type: "TOGGLE_HIGHLIGHT", sentenceId });
    }
    state = reducer(state, { type: "TO_QUIZ" });
    for (const question of QUIZ) {
      state = reducer(state, { type: "ANSWER", questionId: question.id, choiceId: question.correctChoiceId });
      state = reducer(state, { type: "NEXT_QUIZ" });
    }
    state = reducer(state, { type: "ATTEND", now: 1_000 });
    expect(state.phase).toBe("opening");
    state = reducer(state, { type: "SET_COMPOSER", text: "太短" });
    state = reducer(state, { type: "SUBMIT_SPEECH" });
    expect(state.openingStep).toBe("write");
    const speech =
      "肯尼亞認為教育援助應以贈款為主，因為脆弱國家每年的償債已經高於公共教育預算。若農村學校用不上輟學預警，這筆錢就還沒有離開首都，女童與社區仍然要獨自承擔學習中斷。";
    state = reducer(state, { type: "SET_COMPOSER", text: speech });
    state = reducer(state, { type: "SUBMIT_SPEECH" });
    expect(state.speechAssessment?.aligned).toBe(true);
    expect(state.openingStep).toBe("floor");
    expect(state.lastNotice?.text).toContain("論據");
    for (let index = 0; index < 5; index += 1) state = reducer(state, { type: "REVEAL_SPEAKER" });
    state = reducer(state, { type: "REVEAL_SECRETARIAT" });
    expect(state.bullets.some((bullet) => bullet.id === "sec-bangladesh")).toBe(true);
    expect(state.bullets.some((bullet) => bullet.source === "secretariat" && bullet.speakerId === "kenya")).toBe(true);
    expect(state.bullets.find((bullet) => bullet.id === "sec-kenya")?.text).toContain("肯尼亞開場主張");
    const said = state.bullets.find((bullet) => bullet.id === "said-kenya-0");
    expect(said?.text).toContain("教育援助應以贈款為主");
    expect(said?.tags).toContain("grant");
    const judgment = judgeIntervention({
      mode: "support",
      text: "因為這句指出每年償債已經高於公共教育預算，所以贈款應當留在正文，而不是被私人資本蓋過。",
      bullet: said,
      questionTags: ["grant", "debt"],
      difficulty: state.difficulty,
      lang: "zh",
      playerId: "kenya",
    });
    expect(judgment.valid).toBe(true);
  });
});

describe("separate delegate desks", () => {
  it("keeps five different aims, moods, and red lines", () => {
    const aims = DELEGATE_ORDER.map((id) => VOICES[id].aim);
    expect(new Set(aims).size).toBe(5);
    const moods = DELEGATE_ORDER.map((id) => moodLabel(id, INITIAL_AFFINITY[id]));
    expect(new Set(moods).size).toBe(5);
    const redlines = DELEGATE_ORDER.map((id) => {
      const talk = resolveCaucus({ delegateId: id, action: "redline", nextId: id });
      if (!("record" in talk)) throw new Error(talk.error);
      return talk.record.reply;
    });
    expect(new Set(redlines).size).toBe(5);
    expect(redlines.find((text) => text.includes("全納"))).toContain("巴西");
    expect(redlines.find((text) => text.includes("強制分攤"))).toContain("美國");
    expect(redlines.find((text) => text.includes("學年"))).toContain("贈款");
    expect(redlines.join("\n")).not.toContain("合作意願");
  });

  it("does not copy one desk's reply or mood onto another", () => {
    let state: GameState = { ...createInitialState(), phase: "unmoderated" };
    state = reducer(state, { type: "CAUCUS", delegateId: "usa", action: "condition" });
    state = reducer(state, { type: "CAUCUS", delegateId: "usa", action: "condition" });
    expect(state.threads.usa.turns).toHaveLength(4);
    expect(state.threads.bangladesh.turns).toHaveLength(0);
    expect(state.threads.usa.aim).not.toBe(state.threads.bangladesh.aim);
    expect(state.threads.usa.turns[1]?.text).not.toBe(state.threads.usa.turns[3]?.text);
    expect(state.caucusLog[1]?.delta).toBe(0);
    expect(state.affinities.bangladesh).toBe(INITIAL_AFFINITY.bangladesh);
    expect(state.affinities.usa).toBe(INITIAL_AFFINITY.usa + (state.caucusLog[0]?.delta ?? 0));
  });
});

describe("save file", () => {
  it("round-trips a session and rejects a plain object", () => {
    const state = createInitialState({ sessionId: "gv-save" });
    const file = serializeSave({ ...state, phase: "moderated" }, "2026-09-26T09:00:00.000Z");
    const parsed = parseSave(JSON.stringify(file));
    expect(parsed?.state.sessionId).toBe("gv-save");
    expect(parsed?.state.phase).toBe("moderated");
    expect(parsed?.savedAt).toBe("2026-09-26T09:00:00.000Z");
    expect(parseSave("{}")).toBeNull();
    expect(parseSave("not json")).toBeNull();
  });

  it("holds the suggested clock at the moment you saved", () => {
    const started = 1_000_000;
    const state = { ...createInitialState(), phase: "moderated" as const, formalStartedAt: started };
    const savedAt = new Date(started + 60_000).toISOString();
    const now = started + 3_600_000;
    const shifted = resumeClock(state, savedAt, now);
    expect(shifted.formalStartedAt).toBe(4_540_000);
    expect(now - (shifted.formalStartedAt ?? 0)).toBe(60_000);
    const loaded = reducer(state, { type: "LOAD_SAVE", state, savedAt, now });
    expect(loaded.formalStartedAt).toBe(4_540_000);
    expect(loaded.phase).toBe("moderated");
    expect(loaded.lastNotice?.tone).toBe("good");
    expect(resumeClock({ ...state, formalStartedAt: null }, savedAt, now).formalStartedAt).toBeNull();
  });
});
