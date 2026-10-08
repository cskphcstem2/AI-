import type { OfficialLang } from "@/i18n/languages";
import { includesMarker, LEXICON } from "@/i18n/lexicon";
import type { CountryId, DifficultyProfile, InterventionMode, TruthBullet } from "@/types/game";

const SUPPORT_MARKERS = ["因為", "因此", "所以", "這表示", "可見", "意味", "如果", "若", "支持"];
const CONTRAST_MARKERS = ["然而", "但是", "不過", "可是", "相反", "不足", "忽略", "無法", "不能", "反而", "漏", "沒有處理", "問題在於", "可是"];
const MECHANISMS = ["贈款", "貸款", "債務", "報告", "審計", "社區", "青年", "私", "自願", "治理", "席位", "預警", "輟學", "全納", "母語", "自然", "生態", "義務", "公共", "程序", "簡化", "南南", "保險", "窗口", "凍結", "教師", "女童"];

export interface Judgment {
  valid: boolean;
  record: boolean;
  consumeUse: boolean;
  feedback: string;
}

function hasAny(text: string, markers: string[], lang: OfficialLang): boolean {
  if (lang === "zh") return markers.some((marker) => text.includes(marker));
  return includesMarker(text, markers);
}

function overlaps(bullet: TruthBullet, questionTags: string[]): boolean {
  return bullet.tags.some((tag) => questionTags.includes(tag));
}

export function judgeIntervention(input: {
  mode: InterventionMode;
  text: string;
  bullet?: TruthBullet;
  questionTags: string[];
  difficulty: DifficultyProfile;
  lang?: OfficialLang;
  playerId?: CountryId;
}): Judgment {
  const lang = input.lang ?? "zh";
  const playerId = input.playerId ?? "kenya";
  const lex = LEXICON[lang];
  const supportMarkers = lang === "zh" ? SUPPORT_MARKERS : lex.support;
  const contrastMarkers = lang === "zh" ? CONTRAST_MARKERS : lex.contrast;
  const mechanisms = lang === "zh" ? MECHANISMS : lex.mechanisms;
  const text = input.text.trim();
  const min = input.mode === "speech" ? input.difficulty.speechMinChars : input.difficulty.rebuttalMinChars;

  if (text.length < min) {
    return {
      valid: false,
      record: false,
      consumeUse: false,
      feedback: `還太短（目前 ${text.length} 字，至少 ${min} 字）。寫清主張，以及它為什麼跟現在這個問題有關。`,
    };
  }

  if (input.mode !== "speech" && !input.bullet) {
    return {
      valid: false,
      record: false,
      consumeUse: false,
      feedback: "支持或反駁都要先選一則論據。沒有原話或資料，指證就不成立。",
    };
  }

  if (input.mode === "rebut" && input.bullet?.speakerId === playerId) {
    return {
      valid: false,
      record: true,
      consumeUse: true,
      feedback: "這則是你自己的主張。反駁要指向其他代表的話，或一則他們沒有處理的事實。這次指證未成立。",
    };
  }

  if (input.bullet && text === input.bullet.text) {
    return {
      valid: false,
      record: true,
      consumeUse: true,
      feedback: "你只重複了論據原文。指證要加上你的推理：它支持什麼，或它漏了什麼。",
    };
  }

  const markerPool = input.mode === "rebut" ? contrastMarkers : supportMarkers;
  if (!hasAny(text, markerPool, lang) && !(input.mode === "speech" && hasAny(text, contrastMarkers, lang))) {
    const hint = input.mode === "rebut" ? "「然而」「但是」或「問題在於」" : "「因為」「因此」或「若」";
    return {
      valid: false,
      record: true,
      consumeUse: input.mode !== "speech",
      feedback:
        input.mode === "speech"
          ? "發言已記入，但缺少把主張和理由連起來的句子，這輪不計為有效論證。"
          : `理由裡還沒有轉折或因果。試著用${hint}說明這則論據和你的判斷是什麼關係。這次未成立。`,
    };
  }

  if (input.bullet && !overlaps(input.bullet, input.questionTags)) {
    return {
      valid: false,
      record: true,
      consumeUse: true,
      feedback: "這則論據和現在的聚焦問題幾乎沒有重疊。換一則，或先說明它如何對上這個問題。這次未成立。",
    };
  }

  if (input.difficulty.strictMechanisms && input.mode !== "speech" && !hasAny(text, mechanisms, lang)) {
    return {
      valid: false,
      record: true,
      consumeUse: true,
      feedback: "嚴謹難度要求你點出機制：贈款、報告、社區、程序、自願窗口、全納教育，或其他具體安排。只有態度詞，指證不成立。",
    };
  }

  if (input.mode === "speech") {
    return {
      valid: true,
      record: true,
      consumeUse: false,
      feedback: "這則發言有基本結構。主席不會替你判斷立場對不對，只確認你把看法說成了可以回應的句子。",
    };
  }

  const verb = input.mode === "support" ? "支持" : "反駁";
  return {
    valid: true,
    record: true,
    consumeUse: true,
    feedback: `這次${verb}在結構上成立：你選了對得上問題的論據，並寫出了自己的理由。這仍是結構檢查，不是在宣布你的價值觀正確。`,
  };
}
