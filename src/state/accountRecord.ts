import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseDb } from "@/auth/firebase";
import { isGameState, type SaveFile } from "@/state/storage";
import type { SessionScore } from "@/types/game";

export interface AccountRecord {
  history: SessionScore[];
  save: SaveFile | null;
}

function userRef(uid: string) {
  return doc(firebaseDb, "users", uid);
}

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isScore(value: unknown): value is SessionScore {
  if (!value || typeof value !== "object") return false;
  const score = value as SessionScore;
  return typeof score.sessionId === "string" && typeof score.overall === "number" && typeof score.playedAt === "string";
}

function readSave(value: unknown): SaveFile | null {
  if (!value || typeof value !== "object") return null;
  const file = value as SaveFile;
  if (file.version !== 1 || typeof file.savedAt !== "string" || !isGameState(file.state)) return null;
  return file;
}

export function mergeHistory(local: SessionScore[], remote: SessionScore[]): SessionScore[] {
  const byId = new Map<string, SessionScore>();
  for (const item of [...local, ...remote]) {
    if (!isScore(item)) continue;
    const prev = byId.get(item.sessionId);
    const nextAt = Date.parse(item.playedAt);
    const prevAt = prev ? Date.parse(prev.playedAt) : Number.NEGATIVE_INFINITY;
    if (!prev || nextAt >= prevAt) byId.set(item.sessionId, item);
  }
  return [...byId.values()]
    .sort((a, b) => Date.parse(a.playedAt) - Date.parse(b.playedAt))
    .slice(-20);
}

export async function fetchAccountRecord(uid: string): Promise<AccountRecord | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  const history = Array.isArray(data.history) ? data.history.filter(isScore).slice(-20) : [];
  return { history, save: readSave(data.save) };
}

export async function writeAccountHistory(uid: string, history: SessionScore[]): Promise<void> {
  await setDoc(
    userRef(uid),
    { history: plain(history.slice(-20)), updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

export async function writeAccountSave(uid: string, file: SaveFile): Promise<void> {
  await setDoc(userRef(uid), { save: plain(file), updatedAt: new Date().toISOString() }, { merge: true });
}
