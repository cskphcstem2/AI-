import { tagsFromText } from "@/engine/tags";
import type { OfficialLang } from "@/i18n/languages";
import { countMarkers, includesMarker, LEXICON } from "@/i18n/lexicon";
import { tr } from "@/i18n/tr";
import type {
  DeliverySample,
  PresentationMode,
  PresentationOccasion,
  PresentationReview,
  RubricAxisId,
  RubricLevel,
  TruthBullet,
} from "@/types/game";

export type { DeliverySample, PresentationMode, PresentationOccasion, PresentationReview, RubricAxisId, RubricLevel };

export const SPEECH_WINDOW: Record<PresentationOccasion, { minMs: number; maxMs: number; label: string }> = {
  opening: { minMs: 45_000, maxMs: 80_000, label: "開場建議說 45–80 秒" },
  moderated: { minMs: 25_000, maxMs: 50_000, label: "這一輪建議說 25–50 秒" },
};

export const RUBRIC_AXES: {
  id: RubricAxisId;
  label: string;
  english: string;
  typedLabel: string;
  typedEnglish: string;
}[] = [
  { id: "position", label: "立場對齊", english: "Position alignment", typedLabel: "立場對齊", typedEnglish: "Position alignment" },
  { id: "reasoning", label: "論證理由", english: "Reasoning", typedLabel: "論證理由", typedEnglish: "Reasoning" },
  { id: "evidence", label: "論據引用", english: "Evidence citation", typedLabel: "論據引用", typedEnglish: "Evidence citation" },
  { id: "solution", label: "具體方案", english: "Concrete proposal", typedLabel: "具體方案", typedEnglish: "Concrete proposal" },
  { id: "focus", label: "扣題回應", english: "On-topic focus", typedLabel: "扣題回應", typedEnglish: "On-topic focus" },
  { id: "delivery", label: "表達節奏", english: "Spoken delivery", typedLabel: "寫作表達", typedEnglish: "Written expression" },
  { id: "protocol", label: "外交儀態", english: "Diplomatic protocol", typedLabel: "外交儀態", typedEnglish: "Diplomatic protocol" },
];

const LEVEL_LABEL: Record<RubricLevel, string> = {
  5: "優秀",
  4: "良好",
  3: "普通",
  2: "待加強",
  1: "不足",
};

const POSITION_BLURB: Record<RubricLevel, string> = {
  5: "清楚點出這一席的名字或核心利益，聽得懂你代表誰。",
  4: "有席位或政策方向，但還可以再點名一次核心利益。",
  3: "隱約看得出立場，但席位歸屬不夠明確。",
  2: "幾乎聽不出你代表哪一席，只剩下空泛口號。",
  1: "沒有席位立場，聽起來像個人感想。",
};

const REASONING_BLURB: Record<RubricLevel, string> = {
  5: "主張後面有清楚的因果或條件句，理由站得住。",
  4: "有理由連接詞，邏輯大致通順。",
  3: "有一點理由，但因果還偏薄。",
  2: "幾乎只有主張，缺少「因為／若…則…」。",
  1: "沒有論證結構。",
};

const EVIDENCE_BLURB: Record<RubricLevel, string> = {
  5: "嵌進論據或卷宗資料，並用自己的話說明它支持哪一句。",
  4: "有資料或論據痕跡，支撐夠用。",
  3: "提到資料，但沒有扣回自己的主張。",
  2: "證據很少，或只貼了原文。",
  1: "完全沒有資料支撐。",
};

const SOLUTION_BLURB: Record<RubricLevel, string> = {
  5: "提出可執行的做法：窗口、資格、預警或報告機制寫得具體。",
  4: "有方案方向，細節還可再寫清楚。",
  3: "提到做法，但偏概括。",
  2: "幾乎只有口號，沒有可操作步驟。",
  1: "沒有提出任何方案。",
};

const FOCUS_BLURB: Record<RubricLevel, string> = {
  5: "緊扣這一輪題目或本場教育議題，沒有離題。",
  4: "大致扣題，只有少量旁枝。",
  3: "部分扣題，還夾雜無關句子。",
  2: "離題偏多，難對上正在討論的點。",
  1: "完全沒有對上這一輪或本場議題。",
};

const ORATORY_BLURB: Record<RubricLevel, string> = {
  5: "時間用得差不多，聲音清楚，快慢和音量有變化，也有停頓。",
  4: "時間大致恰當，表達清楚，節奏只有小問題。",
  3: "聽得懂，但偏平或忽快忽慢，時間偏短或偏長。",
  2: "時間差很多，或聲音太快、太慢、不清楚。",
  1: "幾乎聽不清，或時間嚴重不足。",
};

const WRITING_BLURB: Record<RubricLevel, string> = {
  5: "句子完整、分段清楚，長度夠展開主張與做法。",
  4: "寫作清楚，結構大致完整。",
  3: "讀得懂，但句子偏短或結構偏平。",
  2: "過短或幾乎沒有斷句，讀起來吃力。",
  1: "幾乎寫不成完整段落。",
};

const PROTOCOL_BLURB: Record<RubricLevel, string> = {
  5: "用國家或代表團的稱呼，有外交開場和收束，語氣平穩，沒有人身攻擊。",
  4: "大致用對稱呼和禮貌用語，只有很少第一人稱。",
  3: "偶爾說出「我覺得」。有基本禮貌，但還不夠穩定。",
  2: "常常用「我」，開場或致謝不完整，語氣偏衝。",
  1: "幾乎都在說「我」，缺少基本禮節，或出現人身、嘲諷的說法。",
};

const COUNTRY = /肯尼亞|本代表團|代表團|我國|本國|孟加拉|巴西|德國|中國|美國/;
const REASON = /因為|因此|所以|然而|但是|若|如果|同時|否則/;
const SOLUTION = /贈款|社區|預警|輟學|報告|申請|窗口|資格|債務|全納|女童|教師/;
const SLIP = /我覺得|我想|我認為|我希望|我個人|我要|我是/;
const OPENING = /主席|各位代表|尊敬的/;
const CLOSING = /謝謝/;
const ATTACK = /愚蠢|胡說|閉嘴|垃圾|可笑|笨蛋|廢物/;
const TOPIC_TAGS = ["grant", "debt", "community", "warning", "nature", "report", "accountability", "public", "voluntary"];

function level(value: number): RubricLevel {
  const rounded = Math.max(1, Math.min(5, Math.round(value)));
  return rounded as RubricLevel;
}

export function levelLabel(value: RubricLevel): string {
  return LEVEL_LABEL[value];
}

export function axisLabel(id: RubricAxisId, mode: PresentationMode = "voice"): string {
  const row = RUBRIC_AXES.find((item) => item.id === id);
  if (!row) return id;
  return mode === "typed" ? row.typedLabel : row.label;
}

export function measureDelivery(samples: number[], sampleMs: number, durationMs: number): DeliverySample {
  const voiced = samples.filter((value) => value >= 0.02);
  const mean = voiced.length ? voiced.reduce((sum, value) => sum + value, 0) / voiced.length : 0;
  const variance = voiced.length
    ? voiced.reduce((sum, value) => sum + (value - mean) ** 2, 0) / voiced.length
    : 0;
  const spread = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const need = Math.max(1, Math.ceil(400 / sampleMs));
  let pauses = 0;
  let run = 0;
  for (const value of samples) {
    if (value < 0.02) {
      run += 1;
      if (run === need) pauses += 1;
    } else {
      run = 0;
    }
  }
  return {
    durationMs,
    pauseCount: pauses,
    meanVolume: Number(mean.toFixed(4)),
    volumeSpread: Number(spread.toFixed(4)),
  };
}

function timeScore(durationMs: number, occasion: PresentationOccasion): RubricLevel {
  const window = SPEECH_WINDOW[occasion];
  if (durationMs >= window.minMs && durationMs <= window.maxMs) return 5;
  if (durationMs >= window.minMs * 0.7 && durationMs <= window.maxMs * 1.25) return 4;
  if (durationMs >= window.minMs * 0.45 && durationMs <= window.maxMs * 1.6) return 3;
  if (durationMs >= 8_000) return 2;
  return 1;
}

function paceScore(text: string, durationMs: number, lang: OfficialLang): RubricLevel {
  const scale = lang === "zh" ? 1 : lang === "ar" ? 2.4 : 3.2;
  const minutes = Math.max(durationMs, 1) / 60_000;
  const pace = text.trim().length / minutes;
  const sweetLow = 140 * scale;
  const sweetHigh = 280 * scale;
  const nearLow = 100 * scale;
  const nearHigh = 340 * scale;
  const wideLow = 70 * scale;
  const wideHigh = 420 * scale;
  if (pace >= sweetLow && pace <= sweetHigh) return 5;
  if ((pace >= nearLow && pace < sweetLow) || (pace > sweetHigh && pace <= nearHigh)) return 4;
  if ((pace >= wideLow && pace < nearLow) || (pace > nearHigh && pace <= wideHigh)) return 3;
  if (durationMs < 8_000) return 1;
  return 2;
}

function pauseScore(durationMs: number, pauseCount: number): RubricLevel {
  if (durationMs < 12_000) return 3;
  const expected = durationMs / 12_000;
  if (pauseCount >= expected * 0.4 && pauseCount <= expected * 2.2) return 5;
  if (pauseCount === 0) return 2;
  if (pauseCount < expected * 0.4 || pauseCount > expected * 3) return 3;
  return 4;
}

function volumeScore(sample: DeliverySample): RubricLevel {
  if (sample.meanVolume < 0.015) return 2;
  if (sample.volumeSpread >= 0.12) return 5;
  if (sample.volumeSpread >= 0.06) return 4;
  return 3;
}

function writingScore(text: string): RubricLevel {
  const trimmed = text.trim();
  if (trimmed.length < 12) return 1;
  const sentences = trimmed.split(/[。！？.!?]+/).filter((part) => part.trim().length > 4).length;
  const hasPause = /[，,；;：:]/.test(trimmed);
  if (trimmed.length >= 140 && sentences >= 3 && hasPause) return 5;
  if (trimmed.length >= 100 && sentences >= 3) return 4;
  if (trimmed.length >= 70 && sentences >= 2) return 3;
  if (trimmed.length >= 40) return 2;
  return 1;
}

function citedBullet(text: string, bullets: TruthBullet[], lang: OfficialLang): boolean {
  const hay = text.toLowerCase();
  return bullets.some((bullet) => {
    const versions = lang === "zh" ? [bullet.text] : [bullet.text, tr(lang, bullet.text)];
    return versions.some((version) => {
      const snippet = version.slice(0, Math.min(16, version.length)).toLowerCase();
      return snippet.length >= 8 && hay.includes(snippet);
    });
  });
}

function scoreAxesFromText(
  text: string,
  questionTags: string[] | undefined,
  bullets: TruthBullet[],
  lang: OfficialLang,
): { axes: Pick<PresentationReview["axes"], "position" | "reasoning" | "evidence" | "solution" | "focus">; hits: string[] } {
  const trimmed = text.trim();
  const lex = LEXICON[lang];
  const hits: string[] = [];
  const positioned =
    lang === "zh"
      ? COUNTRY.test(trimmed) || /贈款|債務|社區|預警|輟學|女童|農村/.test(trimmed)
      : includesMarker(trimmed, lex.country) || includesMarker(trimmed, lex.solution);
  if (positioned) hits.push("country");

  const reasoned = lang === "zh" ? REASON.test(trimmed) : includesMarker(trimmed, lex.reason);
  if (reasoned) hits.push("reason");

  const solved = lang === "zh" ? SOLUTION.test(trimmed) : includesMarker(trimmed, lex.solution);
  if (solved) hits.push("solution");

  const cited = citedBullet(trimmed, bullets, lang);
  const evidenced = lang === "zh" ? /資料|根據|研究|百分比|%/.test(trimmed) : includesMarker(trimmed, lex.evidence) || trimmed.includes("%");
  if (cited || evidenced) hits.push("evidence");

  const spokenTags = tagsFromText(trimmed);
  const focusPool = questionTags?.length ? questionTags : TOPIC_TAGS;
  const focusHits = focusPool.filter((tag) => spokenTags.includes(tag)).length;
  if (focusHits > 0) hits.push("focus");

  const shortCap = trimmed.length < 12 ? 1 : trimmed.length < 40 ? 2 : 5;
  const position = level(Math.min(shortCap, positioned ? (COUNTRY.test(trimmed) || includesMarker(trimmed, lex.country) ? 5 : 4) : 1));
  const reasoning = level(Math.min(shortCap, reasoned ? (trimmed.length >= 80 ? 5 : 4) : trimmed.length >= 40 ? 2 : 1));
  const evidence = level(Math.min(shortCap, cited ? 5 : evidenced ? 4 : trimmed.length >= 40 ? 2 : 1));
  const solution = level(Math.min(shortCap, solved ? (trimmed.length >= 80 ? 5 : 4) : trimmed.length >= 40 ? 2 : 1));
  const focus = level(
    Math.min(
      shortCap,
      focusHits >= 2 ? 5 : focusHits === 1 ? 4 : spokenTags.length > 0 ? 2 : trimmed.length >= 40 ? 2 : 1,
    ),
  );

  return {
    axes: { position, reasoning, evidence, solution, focus },
    hits,
  };
}

function protocolScore(
  text: string,
  lang: OfficialLang,
): { score: RubricLevel; slips: number; attack: boolean; opened: boolean; closed: boolean } {
  if (text.trim().length < 8) return { score: 1, slips: 0, attack: false, opened: false, closed: false };
  const lex = LEXICON[lang];
  const slips = lang === "zh" ? (text.match(new RegExp(SLIP, "g"))?.length ?? 0) : countMarkers(text, lex.slips);
  const attack = lang === "zh" ? ATTACK.test(text) : includesMarker(text, lex.attack);
  const opened = lang === "zh" ? OPENING.test(text) : includesMarker(text, lex.opening);
  const closed = lang === "zh" ? CLOSING.test(text) : includesMarker(text, lex.closing);
  const named = lang === "zh" ? COUNTRY.test(text) : includesMarker(text, lex.country);
  if (attack) return { score: 1, slips, attack, opened, closed };
  let score = 3;
  if (opened) score += 1;
  if (closed) score += 1;
  if (slips === 0 && named) score += 1;
  if (slips >= 1) score -= 1;
  if (slips >= 3) score -= 1;
  if (!named && slips > 0) score -= 1;
  return { score: level(score), slips, attack, opened, closed };
}

function averageLevel(values: RubricLevel[]): RubricLevel {
  if (!values.length) return 1;
  return level(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/** One mark out of 100 for this speech, from the seven axes. */
export function speechMark(review: PresentationReview): number {
  const values = RUBRIC_AXES.map((item) => review.axes[item.id]);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round((mean / 5) * 100);
}

export function scorePresentation(input: {
  id: string;
  occasion: PresentationOccasion;
  text: string;
  delivery?: DeliverySample;
  questionTags?: string[];
  bullets?: TruthBullet[];
  speechLang?: OfficialLang;
  mode?: PresentationMode;
}): PresentationReview {
  const text = input.text.trim();
  const lang = input.speechLang ?? "zh";
  const bullets = input.bullets ?? [];
  const mode: PresentationMode = input.mode ?? (input.delivery ? "voice" : "typed");
  const contentParts = scoreAxesFromText(text, input.questionTags, bullets, lang);
  const protocol = protocolScore(text, lang);

  let delivery: RubricLevel;
  let deliveryNote: string;
  if (mode === "voice" && input.delivery) {
    const timed = timeScore(input.delivery.durationMs, input.occasion);
    const pace = text ? paceScore(text, input.delivery.durationMs, lang) : 1;
    const pauses = pauseScore(input.delivery.durationMs, input.delivery.pauseCount);
    const volume = volumeScore(input.delivery);
    delivery = level(timed * 0.4 + pace * 0.25 + pauses * 0.15 + volume * 0.2);
    deliveryNote = `${ORATORY_BLURB[delivery]} 眼神接觸和肢體語言要鏡頭才評得到，這次不計入分數。`;
  } else {
    delivery = writingScore(text);
    deliveryNote = WRITING_BLURB[delivery];
  }

  const axes = {
    ...contentParts.axes,
    delivery,
    protocol: protocol.score,
  };
  const notes = {
    position: POSITION_BLURB[axes.position],
    reasoning: REASONING_BLURB[axes.reasoning],
    evidence: EVIDENCE_BLURB[axes.evidence],
    solution: SOLUTION_BLURB[axes.solution],
    focus: FOCUS_BLURB[axes.focus],
    delivery: deliveryNote,
    protocol:
      text.length < 8
        ? "還沒有寫出／說出完整的一句，儀態先記為不足。請補上完整主張再送出。"
        : PROTOCOL_BLURB[protocol.score],
  };

  const suggestions: string[] = [];
  if (!contentParts.hits.includes("country") && !contentParts.hits.includes("solution")) {
    suggestions.push("先點名這一席：用「肯尼亞代表團」說出贈款、社區或輟學預警，不要只說「這很重要」。");
  } else if (!contentParts.hits.includes("reason")) {
    suggestions.push("主張後面加一句「因為……」，讓聽的人知道你為什麼這樣寫。");
  } else if (!contentParts.hits.includes("solution")) {
    suggestions.push("補一個具體做法，例如贈款窗口、社區申請，或學期中的輟學預警。");
  } else if (!contentParts.hits.includes("evidence")) {
    suggestions.push("放進一則你畫過的資料，並用自己的話說明它支持哪一句。");
  } else if (!contentParts.hits.includes("focus")) {
    suggestions.push("把句子扣回本場優質教育議題，或這一輪正在問的焦點。");
  }

  if (mode === "voice" && input.delivery) {
    const timed = timeScore(input.delivery.durationMs, input.occasion);
    const pace = text ? paceScore(text, input.delivery.durationMs, lang) : 1;
    const volume = volumeScore(input.delivery);
    const window = SPEECH_WINDOW[input.occasion];
    const seconds = Math.round(input.delivery.durationMs / 1000);
    if (timed <= 2) {
      suggestions.push(`這次約 ${seconds} 秒。${window.label}，把理由說完再停。`);
    } else if (pace <= 2) {
      suggestions.push("速度差太多。在句號後面停一下，關鍵詞放慢。");
    } else if (volume <= 3) {
      suggestions.push("音量幾乎沒有起伏。把你最想被記住的詞稍微加重，其餘保持平穩。");
    }
    if (delivery < 5) {
      suggestions.push("眼神和站姿這次沒有鏡頭，不計分。練習時看向前方，稿子只作提示，不要一路低頭讀。");
    }
  } else if (delivery <= 2) {
    suggestions.push("把主張拆成兩三句完整句子，寫出理由和做法，不要只留一行口號。");
  }

  if (text.length < 8) {
    suggestions.push(mode === "voice" ? "靠近麥克風，確認上方的發言語言，先說出完整的一句。" : "先寫出完整的一句主張，再送出。");
  } else if (protocol.attack) {
    suggestions.push("拿掉人身或嘲諷的字。針對草案句子，不要針對某個人。");
  } else if (protocol.slips > 0) {
    suggestions.push("把「我認為」「我希望」改成「肯尼亞認為」或「本代表團希望」。");
  } else if (!protocol.opened || !protocol.closed) {
    suggestions.push(mode === "voice" ? "開頭稱呼「主席」，最後說「謝謝」。" : "開頭寫「主席」，結尾寫「謝謝」。");
  }

  const content = averageLevel([axes.position, axes.reasoning, axes.evidence, axes.solution, axes.focus]);

  return {
    id: input.id,
    occasion: input.occasion,
    mode,
    axes,
    notes,
    content,
    oratory: axes.delivery,
    protocol: axes.protocol,
    contentNote: notes.position,
    oratoryNote: notes.delivery,
    protocolNote: notes.protocol,
    suggestions: [...new Set(suggestions)].slice(0, 4),
  };
}

/** Upgrade older three-axis reviews saved before the seven-axis rubric. */
export function ensurePresentation(review: PresentationReview | (Omit<PresentationReview, "axes" | "notes" | "mode"> & Partial<Pick<PresentationReview, "axes" | "notes" | "mode">>)): PresentationReview {
  if (review.axes && review.notes && review.mode) return review as PresentationReview;
  const content = review.content ?? 3;
  const delivery = review.oratory ?? 3;
  const protocol = review.protocol ?? 3;
  const axes = {
    position: content,
    reasoning: content,
    evidence: content,
    solution: content,
    focus: content,
    delivery,
    protocol,
  };
  return {
    id: review.id,
    occasion: review.occasion,
    mode: review.mode ?? "voice",
    axes,
    notes: {
      position: review.contentNote ?? POSITION_BLURB[content],
      reasoning: review.contentNote ?? REASONING_BLURB[content],
      evidence: review.contentNote ?? EVIDENCE_BLURB[content],
      solution: review.contentNote ?? SOLUTION_BLURB[content],
      focus: review.contentNote ?? FOCUS_BLURB[content],
      delivery: review.oratoryNote ?? ORATORY_BLURB[delivery],
      protocol: review.protocolNote ?? PROTOCOL_BLURB[protocol],
    },
    content,
    oratory: delivery,
    protocol,
    contentNote: review.contentNote ?? POSITION_BLURB[content],
    oratoryNote: review.oratoryNote ?? ORATORY_BLURB[delivery],
    protocolNote: review.protocolNote ?? PROTOCOL_BLURB[protocol],
    suggestions: Array.isArray(review.suggestions) ? review.suggestions : [],
  };
}

export function ensurePresentations(items: PresentationReview[] | undefined): PresentationReview[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ensurePresentation(item));
}
