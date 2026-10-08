import { createContext, useContext, type Dispatch } from "react";
import type { Action } from "@/engine/reducer";
import type { GameState, SessionScore } from "@/types/game";

export interface GameApi {
  state: GameState;
  history: SessionScore[];
  dispatch: Dispatch<Action>;
  restart: () => void;
  enterDebrief: () => void;
}

export const GameContext = createContext<GameApi | null>(null);

export function useGame(): GameApi {
  const api = useContext(GameContext);
  if (!api) throw new Error("useGame 必須在 GameProvider 內使用");
  return api;
}
