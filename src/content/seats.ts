import type { CountryId } from "@/types/game";

export const ALL_SEATS: readonly CountryId[] = ["kenya", "bangladesh", "brazil", "germany", "china", "usa"];

export function isSeat(value: unknown): value is CountryId {
  return typeof value === "string" && (ALL_SEATS as readonly string[]).includes(value);
}

export function otherSeats(playerId: CountryId = "kenya"): CountryId[] {
  return ALL_SEATS.filter((id) => id !== playerId);
}

/** AI seats that speak on the opening floor (everyone not controlled by a human). */
export function speechOrder(playerId: CountryId = "kenya", humanSeats?: readonly CountryId[]): CountryId[] {
  const humans = new Set(humanSeats?.length ? humanSeats : [playerId]);
  const classic: CountryId[] = ["bangladesh", "germany", "usa", "china", "brazil", "kenya"];
  return classic.filter((id) => !humans.has(id));
}

export function humanSeatsOf(state: { playerId: CountryId; humanSeats?: readonly CountryId[] }): CountryId[] {
  return state.humanSeats?.length ? [...state.humanSeats] : [state.playerId];
}
