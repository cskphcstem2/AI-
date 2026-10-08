import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/auth/AuthContext";
import { DELEGATES } from "@/content/delegates";
import { deriveDifficulty } from "@/engine/difficulty";
import { createInitialState } from "@/engine/reducer";
import {
  claimSeat,
  createRoom,
  joinRoom,
  leaveRoom,
  setReady,
  startRoom,
  subscribeRoom,
} from "@/multiplayer/rooms";
import { listPlayers, type RoomDoc } from "@/multiplayer/types";
import { loadHistory } from "@/state/storage";
import type { CountryId } from "@/types/game";
import type { OfficialLang as Lang } from "@/i18n/languages";

export interface MultiplayerApi {
  room: RoomDoc | null;
  roomCode: string | null;
  mySeat: CountryId | null;
  isHost: boolean;
  onlineLive: boolean;
  inLobby: boolean;
  busy: boolean;
  error: string | null;
  create: () => Promise<void>;
  join: (code: string) => Promise<void>;
  claim: (seat: CountryId | null) => Promise<void>;
  ready: (value: boolean) => Promise<void>;
  start: (langs: { ui: Lang; speech: Lang }) => Promise<void>;
  leave: () => Promise<void>;
  clearError: () => void;
}

const MultiplayerContext = createContext<MultiplayerApi | null>(null);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      return;
    }
    return subscribeRoom(roomCode, (next) => {
      setRoom(next);
      if (!next) {
        setRoomCode(null);
        setError("房間已關閉或不存在。");
      }
    });
  }, [roomCode]);

  const run = useCallback(async (work: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(err instanceof Error ? err.message : "聯機操作失敗。");
    } finally {
      setBusy(false);
    }
  }, []);

  const api = useMemo<MultiplayerApi>(() => {
    const me = user && room ? room.players[user.id] : null;
    const mySeat = me?.seatId ?? null;
    const isHost = Boolean(user && room && room.hostId === user.id);
    const onlineLive = Boolean(room && room.status === "live" && room.game && mySeat);
    const inLobby = Boolean(room && room.status === "lobby");

    return {
      room,
      roomCode,
      mySeat,
      isHost,
      onlineLive,
      inLobby,
      busy,
      error,
      clearError: () => setError(null),
      create: async () => {
        if (!user) return;
        await run(async () => {
          const created = await createRoom(user);
          setRoomCode(created.code);
          setRoom(created);
        });
      },
      join: async (code: string) => {
        if (!user) return;
        await run(async () => {
          const joined = await joinRoom(code, user);
          setRoomCode(joined.code);
          setRoom(joined);
        });
      },
      claim: async (seat) => {
        if (!user || !roomCode) return;
        await run(async () => {
          await claimSeat(roomCode, user, seat);
        });
      },
      ready: async (value) => {
        if (!user || !roomCode) return;
        await run(async () => {
          await setReady(roomCode, user.id, value);
        });
      },
      start: async (langs) => {
        if (!user || !roomCode || !room) return;
        await run(async () => {
          const humans = listPlayers(room)
            .map((player) => player.seatId)
            .filter((seat): seat is CountryId => Boolean(seat));
          if (!humans.length) throw new Error("至少要有一位代表選定席位。");
          const history = loadHistory();
          const initial = createInitialState({
            sessionId: `gv-online-${roomCode}-${Date.now()}`,
            difficulty: deriveDifficulty(history),
          });
          const game = {
            ...initial,
            mode: "online" as const,
            humanSeats: humans,
            playerId: humans[0]!,
            openingSpeeches: {},
            uiLanguage: langs.ui,
            speechLanguage: langs.speech,
            phase: "chair" as const,
            lastNotice: {
              tone: "info" as const,
              text: `聯機會議開始。真人代表：${humans.map((id) => DELEGATES[id].placard).join("、")}。其餘席位由輔助智能補充。`,
            },
          };
          await startRoom(roomCode, user.id, game);
        });
      },
      leave: async () => {
        if (!user || !roomCode) {
          setRoomCode(null);
          setRoom(null);
          return;
        }
        const code = roomCode;
        setRoomCode(null);
        setRoom(null);
        await run(async () => {
          await leaveRoom(code, user.id);
        });
      },
    };
  }, [user, room, roomCode, busy, error, run]);

  return <MultiplayerContext.Provider value={api}>{children}</MultiplayerContext.Provider>;
}

export function useMultiplayer(): MultiplayerApi {
  const api = useContext(MultiplayerContext);
  if (!api) throw new Error("useMultiplayer 必須在 MultiplayerProvider 內使用");
  return api;
}
