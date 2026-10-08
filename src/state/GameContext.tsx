import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { deriveDifficulty } from "@/engine/difficulty";
import { createInitialState, reducer } from "@/engine/reducer";
import { isOfficialLang } from "@/i18n/languages";
import { PREF_LANG_KEY } from "@/auth/auth";
import { fetchAccountRecord, mergeHistory, writeAccountHistory, writeAccountSave } from "@/state/accountRecord";
import { GameContext, type GameApi } from "@/state/context";
import {
  loadHistory,
  loadState,
  migrateStoredRecords,
  recallSave,
  saveHistory,
  saveState,
  setStorageUser,
  writeLocalSave,
} from "@/state/storage";
import type { SessionScore } from "@/types/game";

function preferredLanguage() {
  try {
    const raw = localStorage.getItem(PREF_LANG_KEY);
    return isOfficialLang(raw) ? raw : "zh";
  } catch {
    return "zh" as const;
  }
}

export function GameProvider({
  userId,
  legacyUserId,
  children,
}: {
  userId: string;
  legacyUserId?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    setStorageUser(userId);
    return () => setStorageUser(null);
  }, [userId]);

  migrateStoredRecords(legacyUserId, userId);
  setStorageUser(userId);

  const [history, setHistory] = useState<SessionScore[]>(() => loadHistory());
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const restored = loadState();
    if (restored) return restored;
    const initial = createInitialState({ difficulty: deriveDifficulty(loadHistory()), sessionId: `gv-${Date.now()}` });
    const lang = preferredLanguage();
    return { ...initial, uiLanguage: lang, speechLanguage: lang };
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!state.archived || !state.score) return;
    const current = loadHistory();
    const index = current.findIndex((item) => item.sessionId === state.sessionId);
    if (index < 0) return;
    const saved = current[index];
    if (
      saved?.overall === state.score.overall &&
      saved.coachMark?.overall === state.score.coachMark?.overall &&
      saved.coachMark?.source === state.score.coachMark?.source
    ) {
      return;
    }
    const next = current.slice();
    next[index] = state.score;
    saveHistory(next);
    setHistory(next);
    if (legacyUserId) void writeAccountHistory(legacyUserId, next).catch(() => undefined);
  }, [legacyUserId, state.archived, state.score, state.sessionId]);

  useEffect(() => {
    const uid = legacyUserId;
    if (!uid) return;
    let cancelled = false;
    void (async () => {
      try {
        const remote = await fetchAccountRecord(uid);
        if (cancelled) return;
        const localHistory = loadHistory();
        const localSave = recallSave();
        if (!remote) {
          if (localHistory.length) await writeAccountHistory(uid, localHistory);
          if (localSave) await writeAccountSave(uid, localSave);
          return;
        }
        const merged = mergeHistory(localHistory, remote.history);
        saveHistory(merged);
        setHistory(merged);
        if (merged.length) await writeAccountHistory(uid, merged);
        const remoteSave = remote.save;
        const remoteNewer =
          Boolean(remoteSave) && (!localSave || Date.parse(remoteSave!.savedAt) >= Date.parse(localSave.savedAt));
        if (remoteNewer && remoteSave) writeLocalSave(remoteSave);
        const current = stateRef.current;
        if (current.phase === "lobby") {
          const nextDifficulty = deriveDifficulty(merged);
          if (nextDifficulty.level !== current.difficulty.level) {
            dispatch({ type: "SET_DIFFICULTY", difficulty: nextDifficulty });
          }
        }
      } catch {
        // The account copy can fail offline. The browser copy stays in place.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [legacyUserId]);

  const api = useMemo<GameApi>(() => {
    const rememberScore = () => {
      if (!state.score || state.archived) return;
      const current = loadHistory();
      if (current.some((item) => item.sessionId === state.sessionId)) return;
      const next = [...current, state.score].slice(-20);
      saveHistory(next);
      setHistory(next);
      if (legacyUserId) void writeAccountHistory(legacyUserId, next).catch(() => undefined);
    };
    return {
      state,
      history,
      dispatch,
      restart: () => {
        const latest = loadHistory();
        setHistory(latest);
        dispatch({
          type: "NEW_SESSION",
          sessionId: `gv-${Date.now()}`,
          difficulty: deriveDifficulty(latest),
        });
      },
      enterDebrief: () => {
        rememberScore();
        dispatch({ type: "TO_DEBRIEF" });
      },
    };
  }, [state, history, legacyUserId]);

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}
