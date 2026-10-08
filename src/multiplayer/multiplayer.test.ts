import { describe, expect, it } from "vitest";
import {
  MAX_HUMAN_PLAYERS,
  aiSeatsFor,
  canClaimSeat,
  canJoinRoom,
  canStartRoom,
  makeRoomCode,
  normalizeRoomCode,
  withPerspective,
  type RoomDoc,
  type RoomPlayer,
} from "@/multiplayer/types";
import { createInitialState, reducer } from "@/engine/reducer";
import { speechOrder } from "@/content/seats";
import { ALL_SEATS } from "@/content/seats";
import type { CountryId } from "@/types/game";

function player(uid: string, seatId: RoomPlayer["seatId"] = null, ready = false): RoomPlayer {
  return {
    uid,
    displayName: uid,
    seatId,
    ready,
    joinedAt: new Date(0).toISOString(),
  };
}

function room(partial?: Partial<RoomDoc>): RoomDoc {
  return {
    code: "ABC123",
    hostId: "host",
    status: "lobby",
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    players: { host: player("host", "kenya", true) },
    humanSeats: ["kenya"],
    game: null,
    intentSeq: 0,
    lastIntentId: null,
    ...partial,
  };
}

describe("online room helpers", () => {
  it("makes and normalizes room codes", () => {
    expect(makeRoomCode(() => 0)).toHaveLength(6);
    expect(normalizeRoomCode(" ab-c1 ")).toBe("ABC1");
  });

  it("caps human players at four", () => {
    expect(MAX_HUMAN_PLAYERS).toBe(4);
    const full = room({
      players: {
        a: player("a", "kenya"),
        b: player("b", "usa"),
        c: player("c", "china"),
        d: player("d", "brazil"),
      },
    });
    expect(canJoinRoom(full, "e")).toMatch(/四位/);
    expect(canJoinRoom(full, "a")).toBeNull();
  });

  it("blocks claiming a taken seat", () => {
    const r = room({
      players: {
        host: player("host", "kenya", true),
        guest: player("guest", null, false),
      },
    });
    expect(canClaimSeat(r, "guest", "kenya")).toMatch(/已代表/);
    expect(canClaimSeat(r, "guest", "usa")).toBeNull();
  });

  it("requires host and ready seated players to start", () => {
    const waiting = room({
      players: {
        host: player("host", "kenya", true),
        guest: player("guest", "usa", false),
      },
    });
    expect(canStartRoom(waiting, "guest")).toMatch(/房主/);
    expect(canStartRoom(waiting, "host")).toMatch(/準備就緒/);
    const ready = room({
      players: {
        host: player("host", "kenya", true),
        guest: player("guest", "usa", true),
      },
    });
    expect(canStartRoom(ready, "host")).toBeNull();
  });

  it("lists AI seats for remaining countries", () => {
    expect(aiSeatsFor(["kenya", "usa"], ALL_SEATS)).toEqual(["bangladesh", "brazil", "germany", "china"]);
  });

  it("applies local seat perspective for opening speech", () => {
    const state = {
      ...createInitialState(),
      mode: "online" as const,
      humanSeats: ["kenya", "usa"] as CountryId[],
      openingSpeeches: { kenya: "肯言", usa: "美言" },
      playerId: "kenya" as const,
      playerSpeech: "肯言",
    };
    expect(withPerspective(state, "usa").playerId).toBe("usa");
    expect(withPerspective(state, "usa").playerSpeech).toBe("美言");
  });
});

describe("multi-human opening", () => {
  it("waits for every human seat before revealing AI speakers", () => {
    let state = createInitialState();
    state = {
      ...state,
      mode: "online",
      humanSeats: ["kenya", "usa"],
      phase: "opening",
      openingStep: "write",
      playerId: "kenya",
    };
    const long =
      "肯尼亞要求把社區學校和償債壓力寫進正文，因為輟學預警若沒有贈款窗口，鄉村教室會先關門。我們支持可追蹤的贈款機制，並保留國家主導的實施節奏。";
    state = reducer(state, { type: "SUBMIT_SPEECH", text: long, actorSeat: "kenya" });
    expect(state.openingStep).toBe("write");
    expect(state.openingSpeeches.kenya).toBe(long);
    expect(speechOrder(state.playerId, state.humanSeats)).toEqual(["bangladesh", "germany", "china", "brazil"]);

    const usaSpeech =
      "美國支持自願貢獻和教育科技，因為學習機會缺口不能只靠口號。若草案保留自願窗口，並說明項目如何提高學習成果，我們可以討論一個有限度的公共窗口。";
    state = reducer(state, { type: "SUBMIT_SPEECH", text: usaSpeech, actorSeat: "usa" });
    expect(state.openingStep).toBe("floor");
    expect(state.openingSpeeches.usa).toBe(usaSpeech);
  });
});
