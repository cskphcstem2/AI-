import type { QuizChoice, QuizQuestion } from "@/types/game";

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomUnit(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Stable shuffle so the correct choice is not always in the same slot. */
export function orderQuizChoices(choices: readonly QuizChoice[], seed: string): QuizChoice[] {
  const next = [...choices];
  const random = randomUnit(hashSeed(seed));
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = next[index];
    next[index] = next[swap]!;
    next[swap] = current!;
  }
  return next;
}

export function quizCorrectCount(answers: Record<string, string>): number {
  return QUIZ.filter((question) => answers[question.id] === question.correctChoiceId).length;
}

/** More than half of the questions must be correct. */
export function quizPassed(answers: Record<string, string>): boolean {
  return QUIZ.length > 0 && quizCorrectCount(answers) / QUIZ.length > 0.5;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "以肯尼亞這席來說，教育援助若主要靠新增貸款，最直接的問題是什麼？",
    choices: [
      { id: "a", text: "會讓學習缺口變成新的主權債務" },
      { id: "b", text: "會讓私人公司無法參與教育科技" },
      { id: "c", text: "會取消所有報告義務" },
      { id: "d", text: "會禁止社區學校接收輟學預警" },
    ],
    correctChoiceId: "a",
    explanation:
      "這一席的核心利益是讓教育援助以贈款為主。貸款不是不能討論，但「以貸款為主」會碰到紅線。",
    bullet: {
      origin: "理解檢測 · 答對收入",
      tags: ["grant", "debt"],
      text: "肯尼亞的核心利益：教育援助應以贈款為主，避免脆弱國家為了教育再增加主權債務。",
    },
  },
  {
    id: "q2",
    prompt: "德國代表反對的是哪一種組合？",
    choices: [
      { id: "a", text: "完全拒絕公共資金，只接受私人捐贈" },
      { id: "b", text: "沒有報告的承諾，以及用長審計把撥款無限期凍結" },
      { id: "c", text: "任何形式的年度摘要" },
      { id: "d", text: "只資助島國" },
    ],
    correctChoiceId: "b",
    explanation:
      "德國要的是同步的問責，不是空白支票，也不是把審計變成關卡。兩頭都寫清楚，才聽得見合作。",
    bullet: {
      origin: "理解檢測 · 答對收入",
      tags: ["accountability", "report"],
      text: "德國的紅線是問責方式：要有可核對的報告，但問責不應變成凍結撥款的前置關卡。",
    },
  },
  {
    id: "q3",
    prompt: "為什麼不能假設私人資本會自行填滿優質教育資金缺口？",
    choices: [
      { id: "a", text: "因為公約禁止私人部門說話" },
      { id: "b", text: "因為教育只發生在發達國家" },
      { id: "c", text: "因為基礎教育很多是公共物品，回報不確定，私人資金更常流向可收費技能產品" },
      { id: "d", text: "因為私人資本只存在於農業" },
    ],
    correctChoiceId: "c",
    explanation:
      "技能與教育科技產品比較容易向投資人說明回報。輟學預警、全納支持和農村教師常常沒有人付費，所以公共贈款仍要占一個清楚的位置。",
    bullet: {
      origin: "理解檢測 · 答對收入",
      tags: ["private", "grant"],
      text: "基礎教育往往具有公共物品的性質，私人資本較難單獨補上缺口，所以不能把它寫成公共贈款的替代品。",
    },
  },
  {
    id: "q4",
    prompt: "「共同但有區別的責任」在本場草案裡，主要用來防止哪一種寫法？",
    choices: [
      { id: "a", text: "把所有國家寫成相同的強制出資方，並用南南合作取代公共承諾" },
      { id: "b", text: "讓脆弱社區在理事會有席位" },
      { id: "c", text: "要求項目說明受益學校" },
      { id: "d", text: "討論輟學預警" },
    ],
    correctChoiceId: "a",
    explanation:
      "這個原則不是「只有一國要做事」。它提醒你：義務不相同。補充方案可以寫進去，但不能把已經寫下的公共承諾換掉。",
    bullet: {
      origin: "理解檢測 · 答對收入",
      tags: ["cbdr", "public-finance"],
      text: "共同但有區別的責任：公共教育援助義務並不相同；南南合作是補充，不能寫成取代發達國家承諾的理由。",
    },
  },
];
