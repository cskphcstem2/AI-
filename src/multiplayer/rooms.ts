import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { firebaseDb } from "@/auth/firebase";
import type { Action } from "@/engine/reducer";
import { ALL_SEATS } from "@/content/seats";
import {
  MAX_HUMAN_PLAYERS,
  type RoomDoc,
  type RoomIntent,
  type RoomPlayer,
  aiSeatsFor,
  canClaimSeat,
  canJoinRoom,
  canStartRoom,
  claimedSeats,
  listPlayers,
  makeRoomCode,
  normalizeRoomCode,
} from "@/multiplayer/types";
import type { AuthUser } from "@/auth/auth";
import type { CountryId, GameState } from "@/types/game";

function roomRef(code: string) {
  return doc(firebaseDb, "rooms", code);
}

export async function createRoom(user: AuthUser): Promise<RoomDoc> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = makeRoomCode();
    const ref = roomRef(code);
    const existing = await getDoc(ref);
    if (existing.exists()) continue;
    const now = new Date().toISOString();
    const player: RoomPlayer = {
      uid: user.id,
      displayName: user.displayName,
      photoURL: user.photoURL,
      seatId: null,
      ready: false,
      joinedAt: now,
    };
    const room: RoomDoc = {
      code,
      hostId: user.id,
      status: "lobby",
      createdAt: now,
      updatedAt: now,
      players: { [user.id]: player },
      humanSeats: [],
      game: null,
      intentSeq: 0,
      lastIntentId: null,
      pendingIntent: null,
    };
    await setDoc(ref, { ...room, serverUpdatedAt: serverTimestamp() });
    return room;
  }
  throw new Error("無法建立房間代碼，請再試一次。");
}

export async function joinRoom(codeRaw: string, user: AuthUser): Promise<RoomDoc> {
  const code = normalizeRoomCode(codeRaw);
  if (code.length < 4) throw new Error("請輸入有效的房間代碼。");
  const ref = roomRef(code);
  return runTransaction(firebaseDb, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("找不到這個房間。請確認代碼。");
    const room = snap.data() as RoomDoc;
    const blocked = canJoinRoom(room, user.id);
    if (blocked) throw new Error(blocked);
    if (room.players[user.id]) return room;
    const now = new Date().toISOString();
    const player: RoomPlayer = {
      uid: user.id,
      displayName: user.displayName,
      photoURL: user.photoURL,
      seatId: null,
      ready: false,
      joinedAt: now,
    };
    const next: RoomDoc = {
      ...room,
      updatedAt: now,
      players: { ...room.players, [user.id]: player },
    };
    tx.update(ref, { players: next.players, updatedAt: now });
    return next;
  });
}

export async function claimSeat(code: string, user: AuthUser, seatId: CountryId | null): Promise<void> {
  const ref = roomRef(code);
  await runTransaction(firebaseDb, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("房間不存在。");
    const room = snap.data() as RoomDoc;
    if (seatId) {
      const blocked = canClaimSeat(room, user.id, seatId);
      if (blocked) throw new Error(blocked);
    }
    const me = room.players[user.id];
    if (!me) throw new Error("你還不在這間議場。");
    const players = {
      ...room.players,
      [user.id]: { ...me, seatId, ready: seatId ? me.ready : false },
    };
    const humans = Object.values(players)
      .map((player) => player.seatId)
      .filter((seat): seat is CountryId => Boolean(seat));
    if (humans.length > MAX_HUMAN_PLAYERS) throw new Error("真人代表不能超過四位。");
    tx.update(ref, {
      players,
      humanSeats: humans,
      updatedAt: new Date().toISOString(),
    });
  });
}

export async function setReady(code: string, uid: string, ready: boolean): Promise<void> {
  const ref = roomRef(code);
  await runTransaction(firebaseDb, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("房間不存在。");
    const room = snap.data() as RoomDoc;
    const me = room.players[uid];
    if (!me) throw new Error("你還不在這間議場。");
    if (ready && !me.seatId) throw new Error("請先選定要代表的國家。");
    tx.update(ref, {
      players: { ...room.players, [uid]: { ...me, ready } },
      updatedAt: new Date().toISOString(),
    });
  });
}

export async function startRoom(code: string, uid: string, game: GameState): Promise<void> {
  const ref = roomRef(code);
  await runTransaction(firebaseDb, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("房間不存在。");
    const room = snap.data() as RoomDoc;
    const blocked = canStartRoom(room, uid);
    if (blocked) throw new Error(blocked);
    const humans = claimedSeats(room);
    tx.update(ref, {
      status: "live",
      humanSeats: humans,
      pendingIntent: null,
      game: {
        ...game,
        mode: "online",
        humanSeats: humans,
        playerId: humans[0] ?? game.playerId,
        openingSpeeches: game.openingSpeeches ?? {},
      },
      updatedAt: new Date().toISOString(),
    });
  });
}

export async function leaveRoom(code: string, uid: string): Promise<void> {
  const ref = roomRef(code);
  await runTransaction(firebaseDb, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const room = snap.data() as RoomDoc;
    if (!room.players[uid]) return;
    const players = { ...room.players };
    delete players[uid];
    const remaining = listPlayers({ ...room, players });
    if (remaining.length === 0) {
      tx.update(ref, {
        players: {},
        humanSeats: [],
        status: "ended",
        updatedAt: new Date().toISOString(),
      });
      return;
    }
    const hostId = room.hostId === uid ? remaining[0]!.uid : room.hostId;
    tx.update(ref, {
      players,
      hostId,
      humanSeats: remaining.map((player) => player.seatId).filter((seat): seat is CountryId => Boolean(seat)),
      updatedAt: new Date().toISOString(),
    });
  });
}

export function subscribeRoom(code: string, onChange: (room: RoomDoc | null) => void): Unsubscribe {
  return onSnapshot(roomRef(code), (snap) => {
    onChange(snap.exists() ? (snap.data() as RoomDoc) : null);
  });
}

export async function publishGameState(code: string, game: GameState, lastIntentId: string | null): Promise<void> {
  await updateDoc(roomRef(code), {
    game,
    lastIntentId,
    pendingIntent: null,
    updatedAt: new Date().toISOString(),
  });
}

export async function enqueueIntent(
  code: string,
  input: { uid: string; seatId: CountryId; action: Action },
): Promise<string> {
  const ref = roomRef(code);
  const intentId = `intent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await runTransaction(firebaseDb, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("房間不存在。");
    const room = snap.data() as RoomDoc & { pendingIntent?: RoomIntent | null };
    if (room.status !== "live") throw new Error("會議尚未開始。");
    if (room.pendingIntent) throw new Error("上一則操作還在處理，請稍候再試。");
    const intent: RoomIntent = {
      id: intentId,
      uid: input.uid,
      seatId: input.seatId,
      createdAt: new Date().toISOString(),
      action: input.action,
    };
    tx.update(ref, {
      pendingIntent: intent,
      intentSeq: (room.intentSeq ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    });
  });
  return intentId;
}

export function onlineHumanSeats(room: RoomDoc): CountryId[] {
  return claimedSeats(room);
}

export function onlineAiSeats(room: RoomDoc): CountryId[] {
  return aiSeatsFor(claimedSeats(room), ALL_SEATS);
}
