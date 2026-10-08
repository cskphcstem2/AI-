import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode } from "react";
import { useAuth } from "@/auth/AuthContext";
import { createInitialState, reducer, type Action } from "@/engine/reducer";
import { enqueueIntent, publishGameState } from "@/multiplayer/rooms";
import { withPerspective, type RoomDoc } from "@/multiplayer/types";
import { GameContext, type GameApi } from "@/state/context";
import { writeAccountHistory } from "@/state/accountRecord";
import { loadHistory, saveHistory } from "@/state/storage";
import type { CountryId, GameState, SessionScore } from "@/types/game";

function tagActor(action: Action, seatId: CountryId): Action {
  if (action.type === "SUBMIT_SPEECH") {
    return { ...action, actorSeat: action.actorSeat ?? seatId };
  }
  return action;
}

function canonicalGame(state: GameState, humanSeats: CountryId[]): GameState {
  return {
    ...state,
    mode: "online",
    humanSeats,
    playerId: humanSeats[0] ?? state.playerId,
  };
}

export function OnlineGameProvider({
  room,
  mySeat,
  isHost,
  children,
}: {
  room: RoomDoc;
  mySeat: CountryId;
  isHost: boolean;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [history, setHistory] = useState<SessionScore[]>(() => loadHistory());
  const [localComposer, setLocalComposer] = useState("");
  const applyingIntent = useRef<string | null>(null);
  const game = room.game ?? createInitialState();

  useEffect(() => {
    if (!isHost || !room.pendingIntent || !room.game) return;
    const intent = room.pendingIntent;
    if (applyingIntent.current === intent.id || room.lastIntentId === intent.id) return;
    applyingIntent.current = intent.id;
    const tagged = tagActor(intent.action, intent.seatId);
    const next = reducer(room.game, tagged);
    const published = canonicalGame(
      { ...next, composer: "" },
      room.humanSeats.length ? room.humanSeats : next.humanSeats,
    );
    void publishGameState(room.code, published, intent.id)
      .catch(() => {
        applyingIntent.current = null;
      })
      .finally(() => {
        applyingIntent.current = null;
      });
  }, [isHost, room.code, room.pendingIntent, room.game, room.lastIntentId, room.humanSeats]);

  const dispatch = useCallback<Dispatch<Action>>(
    (action) => {
      if (!user || !room.game) return;
      const base = room.game;
      if (action.type === "SET_COMPOSER") {
        setLocalComposer(action.text.slice(0, 600));
        return;
      }
      if (action.type === "INSERT_BULLET" && base.phase === "opening" && base.openingStep === "write") {
        const bullet = base.bullets.find((item) => item.id === action.bulletId);
        if (!bullet) return;
        const quote = `「${bullet.text}」`;
        if (localComposer.includes(quote)) return;
        const nextText = localComposer.trim().length ? `${localComposer.trim()} ${quote}` : quote;
        setLocalComposer(nextText.slice(0, 600));
        return;
      }
      const tagged = tagActor(action, mySeat);
      if (tagged.type === "SUBMIT_SPEECH") {
        const text = tagged.text ?? localComposer;
        const payload = { ...tagged, text };
        if (isHost) {
          const next = reducer(base, payload);
          setLocalComposer("");
          void publishGameState(
            room.code,
            canonicalGame({ ...next, composer: "" }, room.humanSeats.length ? room.humanSeats : next.humanSeats),
            null,
          );
        } else {
          void enqueueIntent(room.code, { uid: user.id, seatId: mySeat, action: payload }).then(() => {
            setLocalComposer("");
          });
        }
        return;
      }
      if (isHost) {
        const next = reducer(base, tagged);
        void publishGameState(
          room.code,
          canonicalGame({ ...next, composer: "" }, room.humanSeats.length ? room.humanSeats : next.humanSeats),
          null,
        );
      } else {
        void enqueueIntent(room.code, { uid: user.id, seatId: mySeat, action: tagged });
      }
    },
    [isHost, localComposer, mySeat, room.code, room.game, room.humanSeats, user],
  );

  const api = useMemo<GameApi>(() => {
    const perspective = withPerspective(game, mySeat);
    const state: GameState = {
      ...perspective,
      composer: localComposer,
      playerId: mySeat,
    };
    return {
      state,
      history,
      dispatch,
      restart: () => undefined,
      enterDebrief: () => {
        if (state.score && !state.archived) {
          const current = loadHistory();
          if (!current.some((item) => item.sessionId === state.sessionId)) {
            const next = [...current, state.score].slice(-20);
            saveHistory(next);
            setHistory(next);
            if (user) void writeAccountHistory(user.id, next).catch(() => undefined);
          }
        }
        dispatch({ type: "TO_DEBRIEF" });
      },
    };
  }, [game, history, dispatch, localComposer, mySeat, user]);

  if (!room.game || !user) return null;
  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}
