import { DELEGATES } from "@/content/delegates";
import { tagsFromText } from "@/engine/tags";
import type { OfficialLang } from "@/i18n/languages";
import { includesMarker, LEXICON } from "@/i18n/lexicon";
import { tr } from "@/i18n/tr";
import type { CountryId, DifficultyProfile, SpeechAssessment, TruthBullet } from "@/types/game";

const KENYA_KEYS = ["肯尼亞", "贈款", "債務", "社區", "輟學", "預警", "女童", "青年", "地方", "農村", "教師"];
const SEAT_KEYS: Record<CountryId, string[]> = {
  kenya: KENYA_KEYS,
  bangladesh: ["孟加拉", "贈款", "債務", "社區", "預警", "輟學", "女童", "學年"],
  brazil: ["巴西", "全納", "母語", "障礙", "治理", "席位", "校舍"],
  germany: ["德國", "報告", "問責", "成果", "公開", "凍結"],
  china: ["中國", "公共", "區別", "南南", "義務", "發達"],
  usa: ["美國", "自願", "私人", "資本", "強制", "科技", "技能"],
};
const EN_COUNTRY: Record<CountryId, string[]> = {
  kenya: ["kenya", "kenyan"],
  bangladesh: ["bangladesh"],
  brazil: ["brazil", "brazilian"],
  germany: ["germany", "german"],
  china: ["china", "chinese"],
  usa: ["united states", "america", "american"],
};
const REASON = /因為|因此|所以|然而|但是|若|如果|同時|否則/;

/** A recognised utterance of this length can be entered and can move the meeting on. */
export const VOICE_MIN_CHARS = 4;

export function assessOpeningSpeech(
  text: string,
  bullets: TruthBullet[],
  difficulty: DifficultyProfile,
  lang: OfficialLang = "zh",
  playerId: CountryId = "kenya",
): SpeechAssessment {
  const trimmed = text.trim();
  const longEnough = trimmed.length >= difficulty.speechMinChars;
  const lex = LEXICON[lang];
  const aligned =
    playerId === "kenya"
      ? lang === "zh"
        ? KENYA_KEYS.some((key) => trimmed.includes(key))
        : includesMarker(trimmed, lex.country) || includesMarker(trimmed, lex.solution)
      : lang === "zh"
        ? SEAT_KEYS[playerId].some((key) => trimmed.includes(key))
        : includesMarker(trimmed, EN_COUNTRY[playerId]) || includesMarker(trimmed, lex.solution);
  const citedBullet = bullets.some((bullet) => {
    const versions = lang === "zh" ? [bullet.text] : [bullet.text, tr(lang, bullet.text)];
    return versions.some((version) => {
      const snippet = version.slice(0, Math.min(16, version.length));
      return snippet.length >= 8 && trimmed.toLowerCase().includes(snippet.toLowerCase());
    });
  });
  const hasReason = lang === "zh" ? REASON.test(trimmed) : includesMarker(trimmed, lex.reason);
  const notes: string[] = [];
  let score = 0;

  if (!longEnough) {
    notes.push(`長度還不夠展開一個完整看法。建議至少 ${difficulty.speechMinChars} 字。`);
  } else {
    score += 30;
  }

  if (aligned) {
    score += 30;
    notes.push("你把這一席在乎的人、地方或資金形式放進了發言。");
  } else {
    notes.push(
      playerId === "kenya"
        ? "讀者還看不出肯尼亞在乎什麼。試著點出社區、債務、輟學預警，或贈款。"
        : "讀者還看不出這一席在乎什麼。試著點出這一國的名字、利益，或紅線。",
    );
  }

  if (hasReason) {
    score += 25;
    notes.push("你寫出了理由，而不只是立場標語。");
  } else {
    notes.push("加上「因為」或「若…則…」，讓主張和理由連在一起。");
  }

  if (citedBullet) {
    score += 15;
    notes.push("你引用了論據。用自己的話收束，說明它支持哪一句主張。");
  } else {
    notes.push("發言裡還沒有嵌進你畫過或答對的資料。引用時不要只貼原文。");
  }

  return {
    score: Math.min(100, score),
    aligned,
    citedBullet,
    hasReason,
    longEnough,
    notes,
  };
}

export function playerSpeechBullet(text: string, playerId: CountryId = "kenya"): { text: string; tags: string[] } {
  const sentence = text.trim().split(/[。！？]/)[0] ?? text.trim();
  const clipped = sentence.length > 42 ? `${sentence.slice(0, 42)}…` : sentence;
  const tags = new Set<string>();
  if (/贈款|債務/.test(text)) tags.add("grant");
  if (/債務/.test(text)) tags.add("debt");
  if (/社區|地方|青年|女童|農村|教師/.test(text)) tags.add("community");
  if (/預警|輟學/.test(text)) tags.add("warning");
  if (/報告|問責/.test(text)) tags.add("accountability");
  if (/全納|母語|障礙|自然|森林|紅樹|生態/.test(text)) tags.add("nature");
  if (/自願/.test(text)) tags.add("voluntary");
  if (/私人|資本|教育科技/.test(text)) tags.add("private");
  if (/公共/.test(text)) tags.add("public-finance");
  if (tags.size === 0) tags.add("position");
  const placard = DELEGATES[playerId].placard;
  return { text: `${placard}開場主張：${clipped}`, tags: [...tags] };
}

/** Spoken sentences saved as evidence for the next stage. */
export function speechEvidenceBullets(text: string, speakerId: CountryId): TruthBullet[] {
  const speech = text.trim();
  if (!speech) return [];
  const speechTags = tagsFromText(speech);
  const parts = speech
    .split(/(?<=[。！？.!?])/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 8);
  const sentences = (parts.length ? parts : [speech]).slice(0, 6);
  const placard = DELEGATES[speakerId].placard;
  return sentences.map((sentence, index) => {
    const tags = tagsFromText(sentence);
    return {
      id: `said-${speakerId}-${index}`,
      text: sentence.length > 180 ? `${sentence.slice(0, 180)}…` : sentence,
      source: "secretariat",
      origin: `開場發言 · ${placard}`,
      note: "這是你說出來的話，下一階段可以選它當論據。",
      speakerId,
      tags: tags.length ? tags : speechTags.length ? speechTags : ["position"],
    };
  });
}
