import type { Action } from "@/engine/reducer";
import type { CountryId, GameState } from "@/types/game";

export const MAX_HUMAN_PLAYERS = 4;
export const ROOM_CODE_LENGTH = 6;

export type RoomStatus = "lobby" | "live" | "ended";

export interface RoomPlayer {
  uid: string;
  displayName: string;
  photoURL?: string;
  seatId: CountryId | null;
  ready: boolean;
  joinedAt: string;
}

export interface RoomIntent {
  id: string;
  uid: string;
  seatId: CountryId;
  createdAt: string;
  action: Action;
}

export interface RoomDoc {
  code: string;
  hostId: string;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  players: Record<string, RoomPlayer>;
  humanSeats: CountryId[];
  game: GameState | null;
  intentSeq: number;
  lastIntentId: string | null;
  pendingIntent?: RoomIntent | null;
}

export function makeRoomCode(random = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    code += alphabet[Math.floor(random() * alphabet.length)] ?? "A";
  }
  return code;
}

export function normalizeRoomCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, ROOM_CODE_LENGTH);
}

export function listPlayers(room: RoomDoc): RoomPlayer[] {
  return Object.values(room.players).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
}

export function claimedSeats(room: RoomDoc): CountryId[] {
  return listPlayers(room)
    .map((player) => player.seatId)
    .filter((seat): seat is CountryId => Boolean(seat));
}

export function aiSeatsFor(humanSeats: CountryId[], all: readonly CountryId[]): CountryId[] {
  const taken = new Set(humanSeats);
  return all.filter((seat) => !taken.has(seat));
}

export function canJoinRoom(room: RoomDoc, uid: string): string | null {
  if (room.status !== "lobby") return "會議已開始或已結束，不能再加入。";
  if (room.players[uid]) return null;
  if (listPlayers(room).length >= MAX_HUMAN_PLAYERS) return "這一場已有四位代表，座位已滿。";
  return null;
}

export function canClaimSeat(room: RoomDoc, uid: string, seatId: CountryId): string | null {
  if (room.status !== "lobby") return "會議已開始，不能再換席。";
  const me = room.players[uid];
  if (!me) return "你還不在這間議場。";
  const holder = listPlayers(room).find((player) => player.seatId === seatId && player.uid !== uid);
  if (holder) return `「${holder.displayName}」已代表這一席。`;
  return null;
}

export function canStartRoom(room: RoomDoc, uid: string): string | null {
  if (room.hostId !== uid) return "只有房主可以開議。";
  if (room.status !== "lobby") return "會議已經開始。";
  const seated = listPlayers(room).filter((player) => player.seatId);
  if (seated.length < 1) return "至少要有一位代表選定席位。";
  if (seated.some((player) => !player.ready)) return "還有代表尚未按「準備就緒」。";
  if (seated.length > MAX_HUMAN_PLAYERS) return "真人代表不能超過四位。";
  return null;
}

export function withPerspective(state: GameState, seatId: CountryId): GameState {
  const mine = state.openingSpeeches?.[seatId] ?? "";
  return {
    ...state,
    mode: "online",
    playerId: seatId,
    playerSpeech: mine || (seatId === state.playerId ? state.playerSpeech : mine),
  };
}
