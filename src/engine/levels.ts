import type { DifficultyProfile } from "@/types/game";

export const DIFFICULTY_LEVELS: Record<1 | 2 | 3, DifficultyProfile> = {
  1: {
    level: 1,
    label: "入門",
    summary: "結構提示較多，連署門檻較低。指證先看你有沒有把理由說完。",
    speechMinChars: 36,
    rebuttalMinChars: 18,
    strictMechanisms: false,
    maxBulletUses: 3,
    cosponsorCount: 2,
    hint: "guided",
  },
  2: {
    level: 2,
    label: "標準",
    summary: "需要自己組織主張。連署要同時對上文本與合作意願。",
    speechMinChars: 56,
    rebuttalMinChars: 28,
    strictMechanisms: false,
    maxBulletUses: 3,
    cosponsorCount: 2,
    hint: "light",
  },
  3: {
    level: 3,
    label: "嚴謹",
    summary: "指證要點出機制，正式草案需要三位連署，發言要更完整。",
    speechMinChars: 88,
    rebuttalMinChars: 40,
    strictMechanisms: true,
    maxBulletUses: 2,
    cosponsorCount: 3,
    hint: "none",
  },
};
