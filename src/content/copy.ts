import type { DifficultyProfile, Phase } from "@/types/game";

export const PHASE_LABEL: Record<Phase, string> = {
  lobby: "會前",
  chair: "開幕式",
  dossier: "閱讀卷宗",
  quiz: "理解檢測",
  opening: "各自發言",
  moderated: "有秩序動議",
  unmoderated: "非監管式議會",
  drafting: "決議草案",
  voting: "表決",
  debrief: "閉幕覆盤",
};

export const PHASE_TIME: Partial<Record<Phase, string>> = {
  opening: "建議 8–10 分鐘",
  moderated: "建議 6–8 分鐘",
  unmoderated: "建議 5–7 分鐘",
  drafting: "建議 8–10 分鐘",
  voting: "建議 4–5 分鐘",
};

export const FORMAL_BUDGET_MS = 40 * 60 * 1000;

export const CHAIR_OPENING = [
  "各位代表，歡迎來到全球之聲訓練議場。我是本場主席。今天我們不處理整個教育系統改革，只處理一個可以在四十分鐘內討論完的決定：如何讓教育援助更可預測，並且真的到達學習機會脆弱的社區。",
  "正式會議開始後，請先說明你的基本看法，再聽其他代表。之後會有聚焦討論、一輪非監管式議會、一份留下四個關鍵空位的草案，以及表決。",
  "請記住：輔助智能整理的資料是起點，不是結論。你引用任何一句話之前，要能說出它支持的主張是什麼。",
];

export const AIDE_GREETING =
  "我是你的會前輔助。卷宗裡有背景、你的席位、其他五席的簡化立場，以及事實摘要。請把你打算在會上負責的句子畫成論據，最多十則。畫線是選擇，不是收集。";

export function openingHint(difficulty: DifficultyProfile): string {
  if (difficulty.hint === "guided") {
    return "結構提示：用自己的話說出主張、理由，以及你畫過的一則資料。主席不會告訴你該站哪一種方案。";
  }
  if (difficulty.hint === "light") {
    return "現在應該提出你對本議題的基本看法。先講你代表誰的利益，再講你希望會議做出什麼決定。";
  }
  return "請提出你對本議題的基本看法。";
}

export function moderatedHint(difficulty: DifficultyProfile): string {
  if (difficulty.hint === "guided") {
    return "支持是把某句話接到當前問題。反駁要指出它沒處理的後果，並寫出轉折，例如「然而」。系統只檢查結構，不替你選擇立場。";
  }
  if (difficulty.hint === "light") {
    return "若要指證，先選一則論據，再寫短理由。普通發言則直接說明你的看法。";
  }
  return "指證時要點出機制：資金形式、程序、問責或資格。只重複原句不會成立。";
}

export function draftHint(difficulty: DifficultyProfile): string {
  if (difficulty.hint === "none") return "填入你願意被表決的句子。";
  if (difficulty.hint === "guided") {
    return "對照你的紅線。連署同時看文本有沒有踩線，以及非監管式議會之後各席的情緒。贊成票和連署不是同一件事。";
  }
  return "四個空位決定這份草案在保護誰。連署人數不足時，不能以正式草案送出。";
}

export const RULES: { title: string; body: string }[] = [
  {
    title: "這是訓練，不是表演",
    body: "目標是把立場說清楚、用資料支持句子、針對別人的原話回應。草案通過只是結果的一部分。你的核心主張若被換掉，通過也不算把席位守住。",
  },
  {
    title: "論據從哪裡來",
    body: "三種來源：你在卷宗裡畫的線（最多 10 則）、理解題答對的內容、秘書處整理的開場摘要。秘書處摘要是「誰說了什麼」，不是「什麼被核實為真」。",
  },
  {
    title: "論據用在哪裡",
    body: "開場發言可以嵌進句子裡。有秩序動議裡，論據用來在輪到你時支持或反駁，不能代替你自己的進一步想法。非監管式議會裡，論據只額外增加說服力，方案要自己寫。草案的空位也要自己填，論據不能單獨成為答案。討論過的來回會收成新的論據。",
  },
  {
    title: "智能怎麼評",
    body: "本場評分檢查結構：有沒有理由、論據有沒有對上當前問題、文本有沒有守住紅線、有沒有人願意連署。它不判斷你的價值觀對不對，也不該被當成事實機器。",
  },
  {
    title: "程序很短",
    body: "準備不計入四十分鐘。正式會議是開場、有秩序動議、非監管式議會、草案、表決。時間是建議節奏，系統不會中途把你切斷。非監管式議會一次只跟一席說話：五席的對話、情緒和目標分開記，不會合成同一種語氣。",
  },
];

export const REFLECTION_PROMPT =
  "秘書處和輔助智能都幫你整理過句子。寫下一件你不會直接照單全收的事，以及你會怎麼核對。這段不計分。";
