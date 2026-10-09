import { describe, expect, it } from "vitest";
import { CASES, SDGS, casesForSdg, seatsForCase } from "@/content/cases";
import { ALL_SEATS } from "@/content/seats";
import { createInitialState, reducer } from "@/engine/reducer";
import { OFFICIAL_LANGS } from "@/i18n/languages";
import { tr } from "@/i18n/tr";

describe("SDG cases", () => {
  it("offers two or three examples for every goal from 1 to 17", () => {
    expect(SDGS.map((goal) => goal.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    const lengths = SDGS.map((goal) => {
      const cases = casesForSdg(goal.n);
      expect(cases.length).toBeGreaterThanOrEqual(2);
      expect(cases.length).toBeLessThanOrEqual(3);
      expect(new Set(cases.map((item) => item.id)).size).toBe(cases.length);
      return cases.length;
    });
    expect(lengths).toContain(2);
    expect(lengths).toContain(3);
    expect(CASES).toHaveLength(43);
  });

  it("lets countries differ between cases and also stay the same", () => {
    const lines = CASES.map((item) => item.seats.join(","));
    expect(new Set(lines).size).toBeGreaterThan(1);
    expect(lines.filter((line) => line === lines[0]).length).toBeGreaterThan(0);
    const shared = lines.find((line, index) => lines.indexOf(line) !== index);
    expect(shared).toBeTruthy();
    const variedWithinGoal = SDGS.some((goal) => {
      const seatLines = casesForSdg(goal.n).map((item) => item.seats.join(","));
      return new Set(seatLines).size === seatLines.length;
    });
    expect(variedWithinGoal).toBe(true);
    for (const item of CASES) {
      expect(item.seats.length).toBeGreaterThanOrEqual(4);
      expect(new Set(item.seats).size).toBe(item.seats.length);
      for (const seat of item.seats) expect(ALL_SEATS).toContain(seat);
    }
  });

  it("chooses a case before a country, and rejects a country outside that case", () => {
    const start = createInitialState();
    expect(start.caseId).toBeNull();
    expect(start.phase).toBe("lobby");
    const chosen = reducer(start, { type: "SELECT_CASE", caseId: "sdg14-fish" });
    expect(chosen.caseId).toBe("sdg14-fish");
    expect(seatsForCase(chosen.caseId)).toEqual(["bangladesh", "kenya", "china", "usa"]);
    expect(chosen.playerId).toBe("kenya");
    const blocked = reducer(chosen, { type: "SET_PLAYER", playerId: "brazil" });
    expect(blocked.playerId).toBe("kenya");
    const seated = reducer(chosen, { type: "SET_PLAYER", playerId: "usa" });
    expect(seated.playerId).toBe("usa");
    const back = reducer(seated, { type: "CLEAR_CASE" });
    expect(back.caseId).toBeNull();
    expect(back.phase).toBe("lobby");
    const restarted = reducer(reducer(chosen, { type: "BEGIN" }), {
      type: "NEW_SESSION",
      sessionId: "again",
      difficulty: chosen.difficulty,
    });
    expect(restarted.phase).toBe("lobby");
    expect(restarted.caseId).toBeNull();
  });

  it("renders every case note in the language the user chose", () => {
    const notes = [
      "先選例子，再選國家",
      "十七個可持續發展目標，每個有兩到三個例子。選定例子後，下一頁才選擇你要代表的國家。不同例子涉及的國家可以不一樣。",
      "3 個例子。選一個，再去選國家。這一組國家可以和其他例子不同。",
      "例子 2",
      "可持續發展目標 14",
      ...CASES.flatMap((item) => [item.titleZh, item.questionZh]),
      ...SDGS.map((goal) => goal.titleZh),
    ];
    for (const note of notes) {
      expect(tr("zh", note)).toBe(note);
      for (const language of OFFICIAL_LANGS) {
        if (language.id === "zh") continue;
        const translated = tr(language.id, note);
        expect(translated).not.toBe(note);
        expect(translated).not.toMatch(/[\u4e00-\u9fff]/);
      }
    }
    expect(tr("fr", "可持續發展目標 4")).toBe("ODD 4");
    expect(tr("es", "例子 1")).toBe("Ejemplo 1");
    expect(tr("ar", "選擇此例子")).toBe("اختيار هذا المثال");
  });

  it("moves the default seat when the chosen case does not include Kenya", () => {
    const chosen = reducer(createInitialState(), { type: "SELECT_CASE", caseId: "sdg6-city" });
    expect(seatsForCase(chosen.caseId)).not.toContain("kenya");
    expect(chosen.playerId).toBe("china");
    expect(chosen.humanSeats).toEqual(["china"]);
  });
});
