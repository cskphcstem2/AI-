import { describe, expect, it } from "vitest";
import { AuthError, authErrorCode, mapFirebaseError, recordId, toAuthUser, userHistoryKey, userSaveKey, userSessionKey } from "@/auth/auth";
import type { User } from "firebase/auth";

function fakeUser(partial: Partial<User> & Pick<User, "uid">): User {
  return {
    displayName: null,
    email: null,
    photoURL: null,
    ...partial,
  } as User;
}

describe("firebase auth helpers", () => {
  it("maps a Google user into the chamber profile", () => {
    const user = toAuthUser(
      fakeUser({
        uid: "uid-1",
        displayName: "Mei Chen",
        email: "mei@example.com",
        photoURL: "https://example.com/a.png",
      }),
    );
    expect(user).toEqual({
      id: "uid-1",
      username: "mei@example.com",
      displayName: "Mei Chen",
      photoURL: "https://example.com/a.png",
      email: "mei@example.com",
    });
  });

  it("falls back to the email local-part when displayName is missing", () => {
    const user = toAuthUser(fakeUser({ uid: "uid-2", email: "delegate@school.edu" }));
    expect(user.displayName).toBe("delegate");
    expect(user.username).toBe("delegate@school.edu");
  });

  it("maps Firebase error codes", () => {
    expect(mapFirebaseError({ code: "auth/popup-blocked" }).code).toBe("popup_blocked");
    expect(mapFirebaseError({ code: "auth/popup-closed-by-user" }).code).toBe("popup_closed");
    expect(mapFirebaseError({ code: "auth/unauthorized-domain" }).code).toBe("unauthorized");
    expect(authErrorCode(new AuthError("network"))).toBe("network");
  });

  it("saves records under the normalized email", () => {
    expect(recordId({ id: "uid-1", email: "Mei@Example.com" })).toBe("mei@example.com");
    expect(recordId({ id: "uid-2", email: "  " })).toBe("uid-2");
    expect(recordId({ id: "uid-3" })).toBe("uid-3");
    const id = recordId({ id: "uid-1", email: "mei@example.com" });
    expect(userHistoryKey(id)).toBe("global-voice.history.v1.mei@example.com");
    expect(userSessionKey(id)).toBe("global-voice.session.v1.mei@example.com");
    expect(userSaveKey(id)).toBe("global-voice.save.v1.mei@example.com");
  });
});
