import { findCase } from "@/content/cases";
import { INITIAL_AFFINITY } from "@/content/caucus";
import { contactsRemaining } from "@/engine/diplomacy";
import { emptyFloor } from "@/content/floor";
import { ALL_SEATS, isSeat } from "@/content/seats";
import { emptyThreads, moodLabel, turnsFromLog } from "@/content/voices";
import { ensurePresentations } from "@/engine/presentation";
import { isChineseVoice, isOfficialLang } from "@/i18n/languages";
import type { ChatTurn, FloorBeat, GameState, Phase, SessionScore } from "@/types/game";

export const HISTORY_KEY = "global-voice.history.v1";
export const SESSION_KEY = "global-voice.session.v1";
export const SAVE_KEY = "global-voice.save.v1";

let activeUserId: string | null = null;

export function setStorageUser(userId: string | null): void {
  activeUserId = userId;
}

export function historyKeyFor(userId: string | null = activeUserId): string {
  return userId ? `global-voice.history.v1.${userId}` : HISTORY_KEY;
}

export function sessionKeyFor(userId: string | null = activeUserId): string {
  return userId ? `global-voice.session.v1.${userId}` : SESSION_KEY;
}

export function saveKeyFor(userId: string | null = activeUserId): string {
  return userId ? `global-voice.save.v1.${userId}` : SAVE_KEY;
}

function copyStoredItem(storage: Storage, fromKey: string, toKey: string): void {
  if (fromKey === toKey || storage.getItem(toKey)) return;
  const value = storage.getItem(fromKey);
  if (value) storage.setItem(toKey, value);
}

/** Move records saved under a previous id (Firebase uid) onto the email record when that record is still empty. */
export function migrateStoredRecords(fromUserId: string | null | undefined, toUserId: string | null | undefined): void {
  if (!fromUserId || !toUserId || fromUserId === toUserId) return;
  try {
    copyStoredItem(localStorage, historyKeyFor(fromUserId), historyKeyFor(toUserId));
    copyStoredItem(localStorage, saveKeyFor(fromUserId), saveKeyFor(toUserId));
    copyStoredItem(sessionStorage, sessionKeyFor(fromUserId), sessionKeyFor(toUserId));
  } catch {
    // Private mode or a blocked storage API should not stop the session.
  }
}

const PHASES = new Set<Phase>([
  "lobby",
  "chair",
  "dossier",
  "quiz",
  "opening",
  "moderated",
  "unmoderated",
  "drafting",
  "voting",
  "debrief",
]);

export function loadHistory(): SessionScore[] {
  try {
    const raw = localStorage.getItem(historyKeyFor());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionScore[];
    return Array.isArray(parsed) ? parsed.slice(-20) : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: SessionScore[]): void {
  localStorage.setItem(historyKeyFor(), JSON.stringify(items.slice(-20)));
}

interface SavedSession {
  version: 1;
  state: GameState;
}

export interface SaveFile {
  version: 1;
  savedAt: string;
  state: GameState;
}

export function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const state = value as GameState;
  return Boolean(
    typeof state.sessionId === "string" &&
      typeof state.phase === "string" &&
      PHASES.has(state.phase) &&
      state.difficulty &&
      state.affinities &&
      typeof state.affinities.bangladesh === "number" &&
      Array.isArray(state.bullets) &&
      Array.isArray(state.interventions) &&
      Array.isArray(state.caucusLog) &&
      state.blanks,
  );
}

export function serializeSave(state: GameState, savedAt = new Date().toISOString()): SaveFile {
  return { version: 1, savedAt, state };
}

export function parseSave(raw: string): SaveFile | null {
  try {
    const parsed = JSON.parse(raw) as SaveFile;
    if (parsed?.version !== 1 || typeof parsed.savedAt !== "string" || !isGameState(parsed.state)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function rememberSave(state: GameState): SaveFile {
  const file = serializeSave(state);
  writeLocalSave(file);
  return file;
}

export function writeLocalSave(file: SaveFile): void {
  localStorage.setItem(saveKeyFor(), JSON.stringify(file));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("gv-account-save"));
}

export function recallSave(): SaveFile | null {
  try {
    const raw = localStorage.getItem(saveKeyFor());
    if (!raw) return null;
    return parseSave(raw);
  } catch {
    return null;
  }
}

export function resumeClock(state: GameState, savedAt: string, now: number): GameState {
  if (!state.formalStartedAt) return state;
  const savedMs = Date.parse(savedAt);
  if (!Number.isFinite(savedMs)) return state;
  const away = now - savedMs;
  if (away <= 0) return state;
  return { ...state, formalStartedAt: state.formalStartedAt + away };
}

function usableTurns(turns: ChatTurn[] | undefined): ChatTurn[] {
  if (!Array.isArray(turns)) return [];
  return turns.filter(
    (turn) =>
      Boolean(turn) &&
      typeof turn.id === "string" &&
      typeof turn.text === "string" &&
      isSeat(turn.speaker),
  );
}

export function ensureThreads(state: GameState): GameState {
  const playerId = isSeat(state.playerId) ? state.playerId : "kenya";
  const affinities = { ...INITIAL_AFFINITY, ...state.affinities };
  const fresh = emptyThreads();
  const threads = { ...fresh };
  for (const id of ALL_SEATS) {
    const saved = state.threads?.[id];
    threads[id] = {
      aim: fresh[id].aim,
      moodLabel: moodLabel(id, affinities[id] ?? INITIAL_AFFINITY[id]),
      turns: usableTurns(saved?.turns),
    };
  }
  const anyTurns = ALL_SEATS.some((id) => threads[id].turns.length > 0);
  if (!anyTurns && state.caucusLog.length > 0) {
    const rebuilt = turnsFromLog(state.caucusLog, playerId);
    for (const id of ALL_SEATS) threads[id].turns = rebuilt[id];
  }
  return { ...state, playerId, affinities, threads };
}

const FLOOR_BEATS = new Set<FloorBeat>(["listen", "player", "answer", "done"]);

export function ensureDebate(state: GameState): GameState {
  const floor = state.floor;
  const valid = Boolean(
    floor &&
      FLOOR_BEATS.has(floor.beat) &&
      (floor.round === 1 || floor.round === 2 || floor.round === 3) &&
      Array.isArray(floor.lines),
  );
  const training = findCase(state.caseId);
  let playerId = isSeat(state.playerId) ? state.playerId : "kenya";
  if (training && state.phase === "lobby" && !training.seats.includes(playerId)) {
    playerId = training.seats[0]!;
  }
  const log = Array.isArray(state.caucusLog) ? state.caucusLog : [];
  const humanSeats =
    Array.isArray(state.humanSeats) && state.humanSeats.length > 0
      ? state.humanSeats.filter(isSeat)
      : [playerId];
  const mode = state.mode === "online" ? "online" : "solo";
  const openingSpeeches =
    state.openingSpeeches && typeof state.openingSpeeches === "object" ? state.openingSpeeches : {};
  return {
    ...state,
    caseId: training?.id ?? null,
    playerId,
    mode,
    humanSeats: humanSeats.length ? humanSeats : [playerId],
    openingSpeeches,
    affinities: { ...INITIAL_AFFINITY, ...state.affinities },
    floor: valid ? floor : emptyFloor(),
    amendmentTexts: state.amendmentTexts && typeof state.amendmentTexts === "object" ? state.amendmentTexts : {},
    actionsLeft: contactsRemaining(log, playerId),
  };
}

export function withLanguages(state: GameState): GameState {
  return {
    ...state,
    uiLanguage: isOfficialLang(state.uiLanguage) ? state.uiLanguage : "zh",
    speechLanguage: isOfficialLang(state.speechLanguage) ? state.speechLanguage : "zh",
    chineseVoice: isChineseVoice(state.chineseVoice) ? state.chineseVoice : "cmn",
  };
}

export function loadState(): GameState | null {
  try {
    const raw = sessionStorage.getItem(sessionKeyFor());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSession;
    if (parsed.version !== 1 || !isGameState(parsed.state)) return null;
    const restored = ensureThreads(parsed.state);
    return ensureDebate(
      withLanguages({
        ...restored,
        presentations: ensurePresentations(restored.presentations),
      }),
    );
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  const payload: SavedSession = { version: 1, state };
  sessionStorage.setItem(sessionKeyFor(), JSON.stringify(payload));
}
