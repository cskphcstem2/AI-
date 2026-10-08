import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/auth/firebase";

export const PREF_LANG_KEY = "global-voice.pref-lang.v1";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  photoURL?: string;
  email?: string;
}

export type AuthErrorCode =
  | "popup_blocked"
  | "popup_closed"
  | "network"
  | "cancelled"
  | "unauthorized"
  | "unknown";

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function toAuthUser(user: User): AuthUser {
  const displayName = user.displayName?.trim() || user.email?.split("@")[0] || "代表";
  return {
    id: user.uid,
    username: user.email ?? user.uid,
    displayName,
    photoURL: user.photoURL ?? undefined,
    email: user.email ?? undefined,
  };
}

export function watchAuth(onChange: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth, (user) => {
    onChange(user ? toAuthUser(user) : null);
  });
}

export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    return toAuthUser(result.user);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
    if (code === "auth/popup-blocked") {
      try {
        await signInWithRedirect(firebaseAuth, googleProvider);
        throw new AuthError("popup_blocked", "redirect");
      } catch (redirectError) {
        if (redirectError instanceof AuthError) throw redirectError;
        throw mapFirebaseError(redirectError);
      }
    }
    throw mapFirebaseError(error);
  }
}

export async function signOutGoogle(): Promise<void> {
  await signOut(firebaseAuth);
}

export function mapFirebaseError(error: unknown): AuthError {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
  if (code === "auth/popup-blocked") return new AuthError("popup_blocked");
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return new AuthError("popup_closed");
  if (code === "auth/network-request-failed") return new AuthError("network");
  if (code === "auth/unauthorized-domain") return new AuthError("unauthorized");
  return new AuthError("unknown");
}

export function authErrorCode(error: unknown): AuthErrorCode {
  if (error instanceof AuthError) return error.code;
  return mapFirebaseError(error).code;
}

/** Stable id for saved records. The same email always maps to the same record. */
export function recordId(user: { id: string; email?: string | null }): string {
  const email = user.email?.trim().toLowerCase();
  return email || user.id;
}

export function userHistoryKey(userId: string): string {
  return `global-voice.history.v1.${userId}`;
}

export function userSessionKey(userId: string): string {
  return `global-voice.session.v1.${userId}`;
}

export function userSaveKey(userId: string): string {
  return `global-voice.save.v1.${userId}`;
}
