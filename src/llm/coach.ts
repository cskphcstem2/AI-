import { CASES, findCase, type TrainingCase } from "@/content/cases";
import { DELEGATES } from "@/content/delegates";
import { speechMark, type PresentationReview } from "@/engine/presentation";
import { gradeRound, MUN_CRITERIA, type MunCriterion } from "@/engine/scoring";
import { languageMeta, type OfficialLang } from "@/i18n/languages";
import type { LlmClient } from "@/llm/client";
import type { CoachMark, ExamplePick, GameState, RubricLevel, SessionScore } from "@/types/game";

const IMPROVE: Record<string, string> = {
  representation: "國家立場需要加強。用這一席的名字說出要守住的利益，不要只留口號。",
  knowledge: "議題知識需要加強。把卷宗裡的一句資料嵌進發言，並說明它支持哪一個主張。",
  speaking: "公開發言需要加強。把時間用在建議範圍內，句號後面停一下，關鍵詞放慢。",
  argument: "論證辯論需要加強。每個主張後面加一句「因為」或「若…則…」。",
  diplomacy: "外交協商需要加強。對另外三席各說一次你的方案，並問清對方的紅線。",
  drafting: "決議撰寫需要加強。四個空位都寫成可以表決的句子，並守住這一席的紅線。",
  procedure: "議事規則需要加強。發言要扣住這一輪的問題，附論據時寫出它如何支持或反駁。",
};

const STRONG = "七項都在良好以上。下一場把最低的一項再寫得更具體。";

function clampLevel(value: unknown): RubricLevel | null {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  const rounded = Math.max(1, Math.min(5, Math.round(number)));
  return rounded as RubricLevel;
}

function clampMark(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number)));
}

/** The next session's level from this round's mark. Same bands as the difficulty record. */
export function practiceLevel(overall: number): 1 | 2 | 3 {
  if (overall >= 80) return 3;
  if (overall < 55) return 1;
  return 2;
}

function caseRank(item: TrainingCase, sdg: number, level: 1 | 2 | 3): number {
  const distance = Math.min(Math.abs(item.sdg - sdg), 17 - Math.abs(item.sdg - sdg));
  const seats = item.seats.length;
  if (level === 1) return (item.sdg === sdg ? 0 : 20 + distance) * 10 + seats;
  if (level === 3) return (item.sdg === sdg ? 50 : distance) * 10 - seats;
  return (item.sdg === sdg ? 8 : distance) * 10 + Math.abs(seats - 4);
}

/** Three other examples matched to this round's level. */
export function recommendExamples(currentId: string | null, overall: number): ExamplePick[] {
  const current = findCase(currentId);
  const level = practiceLevel(overall);
  const sdg = current?.sdg ?? 4;
  return CASES.filter((item) => item.id !== current?.id)
    .sort((a, b) => caseRank(a, sdg, level) - caseRank(b, sdg, level) || a.id.localeCompare(b.id))
    .slice(0, 3)
    .map((item) => ({ id: item.id, level }));
}

export function examineRoundLocal(state: GameState, score: SessionScore): CoachMark {
  const criteria = gradeRound(state, score);
  const overall = Math.round((criteria.reduce((sum, item) => sum + item.level, 0) / criteria.length / 5) * 100);
  const weak = [...criteria].sort((a, b) => a.level - b.level).filter((item) => item.level <= 3);
  const picked = (weak.length ? weak : [...criteria].sort((a, b) => a.level - b.level)).slice(0, 3);
  const improvements = weak.length ? picked.map((item) => IMPROVE[item.id] ?? item.label) : [STRONG];
  return {
    overall,
    levels: criteria.map((item) => ({ id: item.id, level: item.level })),
    improvements,
    examples: recommendExamples(state.caseId, overall),
    source: "examiner",
  };
}

export function criteriaFromCoach(mark: CoachMark, fallback: MunCriterion[]): MunCriterion[] {
  const levels = new Map(mark.levels.map((item) => [item.id, item.level]));
  return fallback.map((item) => ({ ...item, level: levels.get(item.id) ?? item.level }));
}

export function applyCoachMark(score: SessionScore, mark: CoachMark): SessionScore {
  const tier = mark.overall >= 80 ? "distinguished" : mark.overall >= 60 ? "steady" : "developing";
  const tierLabel = tier === "distinguished" ? "卓有成效" : tier === "steady" ? "穩健推進" : "仍需磨練";
  return { ...score, overall: mark.overall, tier, tierLabel, coachMark: mark };
}

function clip(text: string, max = 360): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

export function roundDossier(state: GameState, score: SessionScore): string {
  const training = findCase(state.caseId);
  const seat = DELEGATES[state.playerId]?.placard ?? state.playerId;
  const talks = (state.presentations ?? []).map((item, index) => {
    const axes = item.axes;
    return `發言${index + 1} ${item.occasion} ${item.mode}：立場${axes.position} 論證${axes.reasoning} 證據${axes.evidence} 方案${axes.solution} 扣題${axes.focus} 表達${axes.delivery} 儀態${axes.protocol}`;
  });
  const lines = (state.interventions ?? []).slice(0, 6).map((item) => clip(item.text, 180));
  return [
    `席位：${seat}`,
    training ? `題目：${training.questionZh}` : "",
    `理解題：${score.comprehensionCorrect}/${score.comprehensionTotal}`,
    `開場：${clip(state.playerSpeech || "（沒有開場）")}`,
    lines.length ? `有秩序動議：${lines.join(" / ")}` : "有秩序動議：沒有",
    `連署：${state.cosponsors.length} 席，門檻 ${state.difficulty.cosponsorCount}`,
    `草案${score.passed ? "通過" : "未通過"}，核心主張${score.coreSurvived ? "仍在" : "沒有留下"}`,
    talks.join("\n"),
  ]
    .filter(Boolean)
    .join("\n");
}

export function parseRoundCoach(raw: string): Omit<CoachMark, "source"> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const body = parsed as {
    overall?: unknown;
    levels?: Record<string, unknown>;
    improvements?: unknown;
    examples?: unknown;
  };
  const overall = clampMark(body.overall);
  if (overall == null || !body.levels) return null;
  const levels = MUN_CRITERIA.map((item) => {
    const level = clampLevel(body.levels?.[item.id]);
    return level ? { id: item.id, level } : null;
  });
  if (levels.some((item) => !item)) return null;
  const improvements = Array.isArray(body.improvements)
    ? body.improvements
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim().slice(0, 180))
        .slice(0, 4)
    : [];
  if (!improvements.length) return null;
  const known = new Set(CASES.map((item) => item.id));
  const examples = Array.isArray(body.examples)
    ? body.examples
        .filter((item): item is string => typeof item === "string" && known.has(item))
        .slice(0, 3)
        .map((id) => ({ id, level: practiceLevel(overall) }))
    : [];
  return { overall, levels: levels as { id: string; level: RubricLevel }[], improvements, examples };
}

function fillExamples(picked: ExamplePick[], overall: number, currentId: string | null): ExamplePick[] {
  const level = practiceLevel(overall);
  const seen = new Set(picked.map((item) => item.id));
  if (currentId) seen.add(currentId);
  const rest = recommendExamples(currentId, overall).filter((item) => !seen.has(item.id));
  return [...picked.map((item) => ({ ...item, level })), ...rest].slice(0, 3);
}

const ROUND_INSTRUCTIONS = `你是模擬聯合國的評分員。只根據提供的這一場紀錄給分，不要替學生發明沒有發生的發言。
回傳 JSON，不要加說明：
{"overall":0到100的整數,"levels":{"representation":1到5,"knowledge":1到5,"speaking":1到5,"argument":1到5,"diplomacy":1到5,"drafting":1到5,"procedure":1到5},"improvements":["要改進的部分", "最多四句"],"examples":["另外三個例子的 id"]}
levels 的七個鍵必須齊。improvements 點名最弱的部分。examples 必須是名單裡的 id，不要重複這一場，並配合分數：低於 55 選同一目標或相近目標，80 以上選席位較多的其他目標，其餘選相近目標。`;

export async function gradeSession(
  client: LlmClient,
  state: GameState,
  score: SessionScore,
  lang: OfficialLang,
): Promise<CoachMark> {
  const local = examineRoundLocal(state, score);
  if (client.id !== "openai-compatible") return local;
  try {
    const raw = await client.complete({
      purpose: "judge",
      temperature: 0.2,
      instructions: `${ROUND_INSTRUCTIONS}\n改進建議用${languageMeta(lang).label}書寫。`,
      input: `${roundDossier(state, score)}\n可推薦的例子：\n${CASES.filter((item) => item.id !== state.caseId)
        .map((item) => `${item.id} 目標${item.sdg} ${item.seats.length}席 ${item.titleZh}`)
        .join("\n")}`,
    });
    const parsed = parseRoundCoach(raw);
    if (!parsed) return local;
    return {
      ...parsed,
      examples: fillExamples(parsed.examples, parsed.overall, state.caseId),
      source: "model",
    };
  } catch {
    return local;
  }
}

export interface SpeechCoachMark {
  mark: number;
  improvements: string[];
  source: "model" | "examiner";
}

export function examineSpeechLocal(review: PresentationReview): SpeechCoachMark {
  const weak = (Object.entries(review.axes) as [keyof PresentationReview["axes"], number][])
    .filter(([, level]) => level <= 3)
    .map(([id]) => review.notes[id]);
  const improvements = (weak.length ? weak : review.suggestions).slice(0, 3);
  return {
    mark: speechMark(review),
    improvements: improvements.length ? improvements : [STRONG],
    source: "examiner",
  };
}

export function parseSpeechCoach(raw: string): Omit<SpeechCoachMark, "source"> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const body = JSON.parse(raw.slice(start, end + 1)) as { mark?: unknown; improvements?: unknown };
    const mark = clampMark(body.mark);
    if (mark == null || !Array.isArray(body.improvements)) return null;
    const improvements = body.improvements
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim().slice(0, 180))
      .slice(0, 4);
    if (!improvements.length) return null;
    return { mark, improvements };
  } catch {
    return null;
  }
}

export async function gradeSpeech(
  client: LlmClient,
  review: PresentationReview,
  text: string | undefined,
  lang: OfficialLang,
): Promise<SpeechCoachMark> {
  const local = examineSpeechLocal(review);
  const spoken = text?.trim() ?? "";
  if (client.id !== "openai-compatible" || spoken.length < 8) return local;
  try {
    const raw = await client.complete({
      purpose: "judge",
      temperature: 0.2,
      instructions: `你是模擬聯合國的評分員。只根據這一次發言給分。回傳 JSON：{"mark":0到100,"improvements":["最需要改的部分，最多四句"]}。改進建議用${languageMeta(lang).label}書寫。`,
      input: `場合：${review.occasion}。方式：${review.mode}。\n發言：${clip(spoken, 900)}`,
    });
    const parsed = parseSpeechCoach(raw);
    if (!parsed) return local;
    return { ...parsed, source: "model" };
  } catch {
    return local;
  }
}
