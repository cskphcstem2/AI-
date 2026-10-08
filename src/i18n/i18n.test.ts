import { describe, expect, it } from "vitest";
import { PROPOSALS } from "@/content/caucus";
import { AIDE_GREETING, CHAIR_OPENING, PHASE_LABEL, RULES, draftHint, moderatedHint, openingHint } from "@/content/copy";
import { AI_DELEGATES, PLAYER } from "@/content/delegates";
import { DOSSIER_TABS, SENTENCES } from "@/content/dossier";
import { AMENDMENTS, DRAFT_BLANKS, DRAFT_PREAMBLE } from "@/content/draft";
import { FOCUS_QUESTIONS } from "@/content/moderated";
import { QUIZ } from "@/content/quiz";
import { DELEGATE_ORDER, VOICES, playerLineFor } from "@/content/voices";
import { DIFFICULTY_LEVELS } from "@/engine/levels";
import { createInitialState, reducer } from "@/engine/reducer";
import { tr } from "@/i18n/tr";
import { withLanguages } from "@/state/storage";

function walk(value: unknown, into: string[]) {
  if (typeof value === "string") {
    if (value.trim()) into.push(value);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, into);
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    if (key === "countryEn" || key === "id" || key === "seal" || key === "sealInk" || key === "mark") continue;
    walk(item, into);
  }
}

describe("official languages", () => {
  it("translates a lobby label and leaves unknown text in Chinese", () => {
    expect(tr("en", "入席就座")).toBe("Take your seat");
    expect(tr("en", "這句不在詞庫裡")).toBe("這句不在詞庫裡");
    expect(tr("zh", "入席就座")).toBe("入席就座");
  });

  it("sets both languages from the lobby and lets the recorder override speech only", () => {
    let state = reducer(createInitialState(), { type: "SET_UI_LANGUAGE", language: "fr" });
    expect(state.uiLanguage).toBe("fr");
    expect(state.speechLanguage).toBe("fr");
    state = reducer(state, { type: "SET_SPEECH_LANGUAGE", language: "es" });
    expect(state.uiLanguage).toBe("fr");
    expect(state.speechLanguage).toBe("es");
    state = reducer(state, { type: "NEW_SESSION", sessionId: "next", difficulty: state.difficulty });
    expect(state.uiLanguage).toBe("fr");
    expect(state.speechLanguage).toBe("es");
  });

  it("keeps scoring in Chinese while the microphone switches between Mandarin and Cantonese", () => {
    let state = reducer(createInitialState(), { type: "SET_CHINESE_VOICE", voice: "yue" });
    expect(state.speechLanguage).toBe("zh");
    expect(state.chineseVoice).toBe("yue");
    state = reducer(state, { type: "SET_CHINESE_VOICE", voice: "cmn" });
    expect(state.chineseVoice).toBe("cmn");
    state = reducer(state, { type: "SET_SPEECH_LANGUAGE", language: "en" });
    expect(state.speechLanguage).toBe("en");
    expect(state.chineseVoice).toBe("cmn");
    const stripped = { ...state } as typeof state;
    delete (stripped as { chineseVoice?: string }).chineseVoice;
    expect(withLanguages(stripped).chineseVoice).toBe("cmn");
  });

  it("defaults a save without languages to Chinese", () => {
    const state = createInitialState();
    const stripped = { ...state } as typeof state;
    delete (stripped as { uiLanguage?: string }).uiLanguage;
    delete (stripped as { speechLanguage?: string }).speechLanguage;
    const restored = withLanguages(stripped);
    expect(restored.uiLanguage).toBe("zh");
    expect(restored.speechLanguage).toBe("zh");
  });

  it("has an English line for the chamber copy", () => {
    const lines: string[] = [];
    walk(SENTENCES, lines);
    walk(DOSSIER_TABS, lines);
    walk(PLAYER, lines);
    walk(AI_DELEGATES, lines);
    walk(QUIZ, lines);
    walk(FOCUS_QUESTIONS, lines);
    walk(PROPOSALS, lines);
    walk(DRAFT_BLANKS, lines);
    walk(AMENDMENTS, lines);
    walk(DRAFT_PREAMBLE, lines);
    walk(VOICES, lines);
    walk(Object.values(PHASE_LABEL), lines);
    walk(RULES, lines);
    walk(CHAIR_OPENING, lines);
    lines.push(AIDE_GREETING);
    for (const level of [1, 2, 3] as const) {
      lines.push(openingHint(DIFFICULTY_LEVELS[level]));
      lines.push(moderatedHint(DIFFICULTY_LEVELS[level]));
      lines.push(draftHint(DIFFICULTY_LEVELS[level]));
    }
    lines.push(playerLineFor({ action: "redline" }));
    lines.push(playerLineFor({ action: "condition" }));
    lines.push(playerLineFor({ action: "propose", proposalId: PROPOSALS[0]?.id }));
    lines.push(playerLineFor({ action: "persuade", playerLine: "" }));
    for (const id of DELEGATE_ORDER) lines.push(VOICES[id].aim);
    const missing = [...new Set(lines.filter((line) => /[\u4e00-\u9fff]/.test(line) && tr("en", line) === line))];
    expect(missing).toEqual([]);
  });
});
