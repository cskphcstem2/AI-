import { DIFFICULTY_LEVELS } from "@/engine/levels";
import type { DifficultyProfile } from "@/types/game";

export function deriveDifficulty(history: { overall: number }[]): DifficultyProfile {
  const recent = history.slice(-2);
  if (recent.length === 0) return DIFFICULTY_LEVELS[2];
  const average = recent.reduce((sum, item) => sum + item.overall, 0) / recent.length;
  if (average >= 80) return DIFFICULTY_LEVELS[3];
  if (average < 55) return DIFFICULTY_LEVELS[1];
  return DIFFICULTY_LEVELS[2];
}

export function difficultyReason(history: { overall: number }[]): string {
  const recent = history.slice(-2);
  if (recent.length === 0) {
    return "這是記錄中的第一場，難度為標準。系統會依最近兩場的綜合表現調整下一場。";
  }
  const average = Math.round(recent.reduce((sum, item) => sum + item.overall, 0) / recent.length);
  if (average >= 80) {
    return `最近表現平均 ${average}，下一場提高論證與連署門檻。`;
  }
  if (average < 55) {
    return `最近表現平均 ${average}，下一場改為入門：結構提示更多，連署門檻較低。`;
  }
  return `最近表現平均 ${average}，維持標準難度。`;
}
