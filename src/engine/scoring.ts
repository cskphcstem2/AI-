import { INITIAL_AFFINITY } from "@/content/caucus";
import { DELEGATES } from "@/content/delegates";
import { QUIZ } from "@/content/quiz";
import { otherSeats } from "@/content/seats";
import { coreSurvived } from "@/engine/diplomacy";
import { clamp } from "@/lib/utils";
import type {
  AmendmentChoice,
  Ballot,
  CountryId,
  GameState,
  RubricAxisId,
  RubricLevel,
  SessionScore,
} from "@/types/game";

function round(value: number): number {
  return Math.round(clamp(value, 0, 100));
}

function seatCore(playerId: CountryId, tags: Set<string>, amendments: Partial<Record<string, AmendmentChoice>>): boolean {
  if (playerId === "usa") {
    return (tags.has("voluntary") || tags.has("private")) && !tags.has("binding-obligation") && !tags.has("binding-emerging");
  }
  if (playerId === "brazil") return tags.has("nature") && !(tags.has("infra") && !tags.has("nature"));
  if (playerId === "germany") return (tags.has("report") || tags.has("accountability")) && !tags.has("no-accountability");
  if (playerId === "china") {
    return (tags.has("public-finance") || tags.has("grant") || tags.has("cbdr")) && !tags.has("binding-emerging");
  }
  return coreSurvived(tags, amendments);
}

export function scoreSession(
  state: GameState,
  tags: Set<string>,
  ballots: Record<CountryId, Ballot>,
): SessionScore {
  const quizTotal = QUIZ.length;
  const quizCorrect = QUIZ.filter((question) => state.quizAnswers[question.id] === question.correctChoiceId).length;
  const speech = state.speechAssessment;
  const attempts = state.interventions.length;
  const valid = state.interventions.filter((item) => item.valid).length;
  const playerId = state.playerId ?? "kenya";
  const core = playerId === "kenya" ? coreSurvived(tags, state.amendmentChoices) : seatCore(playerId, tags, state.amendmentChoices);
  const badAmendment =
    state.amendmentChoices["us-private"] === "accept" || state.amendmentChoices["de-audit"] === "accept";
  const bulletInDraft = Object.values(state.blanks).some((value) => Boolean(value?.bulletId));
  const yesCount = Object.values(ballots).filter((vote) => vote === "yes").length;
  const noCount = Object.values(ballots).filter((vote) => vote === "no").length;
  const passed = yesCount > noCount;

  let consistency = 0;
  if (speech?.aligned) consistency += 25;
  if (speech?.hasReason) consistency += 15;
  if (core) consistency += 40;
  if (!badAmendment) consistency += 20;
  consistency = round(consistency);

  const quizPart = (quizCorrect / quizTotal) * 25;
  const speechPart = ((speech?.score ?? 0) / 100) * 35;
  const interventionPart = attempts === 0 ? 8 : (valid / attempts) * 25;
  const evidencePart = (speech?.citedBullet ? 8 : 0) + (bulletInDraft ? 7 : 0);
  const argumentation = round(quizPart + speechPart + interventionPart + evidencePart);

  const sponsorRatio = Math.min(1, state.cosponsors.length / state.difficulty.cosponsorCount);
  const ids = otherSeats(playerId);
  const deltaValues = ids.map((id) => (state.affinities[id] ?? INITIAL_AFFINITY[id]) - INITIAL_AFFINITY[id]);
  const meanDelta = deltaValues.reduce((sum, value) => sum + value, 0) / deltaValues.length;
  const alliance = round(sponsorRatio * 60 + clamp((meanDelta + 6) / 24, 0, 1) * 40);

  let influence = 0;
  if (passed) influence += 30;
  if (tags.has("grant") && !tags.has("override-private") && !tags.has("private-first") && !tags.has("loan-only")) {
    influence += 30;
  }
  if (tags.has("community") || tags.has("access")) influence += 15;
  if (tags.has("nature") || tags.has("warning")) influence += 15;
  if (tags.has("report")) influence += 10;
  if (state.workingPaper) influence -= 8;
  influence = round(influence);

  const overall = round(consistency * 0.25 + argumentation * 0.3 + alliance * 0.2 + influence * 0.25);
  const tier = overall >= 80 ? "distinguished" : overall >= 60 ? "steady" : "developing";
  const tierLabel = tier === "distinguished" ? "卓有成效" : tier === "steady" ? "穩健推進" : "仍需磨練";

  const consistencyText =
    playerId === "kenya"
      ? core
        ? "你的核心主張留在最終文本裡：贈款沒有被拿掉，社區或預警仍在，撥款也沒有被預先凍結。"
        : "最終文本沒有同時守住贈款、社區或預警，以及「報告不得凍結撥款」。先對照紅線，再看你接受了哪項修正。"
      : core
        ? "你的核心主張留在最終文本裡。"
        : "最終文本沒有守住這一席的紅線。先對照你接受了哪項修正。";

  const argumentationText =
    attempts === 0
      ? "開場和理解題有記入。有秩序動議裡你沒有使用指證，下一場可以試一次：選論據，寫出因為或然而。"
      : `有秩序動議 ${attempts} 次介入，其中 ${valid} 次在結構上成立。成立只代表理由接得上論據，不代表立場自動正確。`;

  const allianceText = state.workingPaper
    ? `連署 ${state.cosponsors.length} 席，未達 ${state.difficulty.cosponsorCount} 席，草案以工作文件進入表決。`
    : `你爭取到 ${state.cosponsors.length} 席連署，本場門檻是 ${state.difficulty.cosponsorCount} 席。`;

  const influenceText = passed
    ? core
      ? "草案通過，而且你的核心主張還在文本裡。"
      : "草案通過了，但你最在乎的句子沒有留下來。通過不等於這一席的目標達成。"
    : core
      ? "草案未通過。核心主張寫清楚了，下一場可以再多做一次對得上的接觸。"
      : "草案未通過，核心主張也不夠清楚。先減少互相打架的句子。";

  let closing = "主席感謝各位在簡化議程中把不同意的地方說成了可以修改的句子。";
  if (passed && core) {
    closing =
      playerId === "kenya"
        ? "主席宣布草案通過。肯尼亞的核心主張仍在文本中。這不是國際法，是你把證據、紅線和程序接在一起的訓練結果。"
        : `主席宣布草案通過。${DELEGATES[playerId].placard}的核心主張仍在文本中。這不是國際法，是你把證據、紅線和程序接在一起的訓練結果。`;
  } else if (passed && !core) {
    closing = "主席宣布草案通過。請注意：通過的文本已經離開你原本的核心主張。閉幕之後，對照你接受的修正。";
  } else if (!passed && core) {
    closing = "主席宣布草案未獲簡單多數。你的主張還在，連署或問責句還沒有說服足夠的席位。";
  } else {
    closing = "主席宣布草案未獲簡單多數。下一場先選更少、但你願意負責的論據，再寫進空位。";
  }

  return {
    sessionId: state.sessionId,
    playedAt: new Date().toISOString(),
    difficultyLevel: state.difficulty.level,
    consistency,
    argumentation,
    alliance,
    influence,
    overall,
    tier,
    tierLabel,
    comprehensionCorrect: quizCorrect,
    comprehensionTotal: quizTotal,
    validInterventions: valid,
    interventionAttempts: attempts,
    cosponsors: state.cosponsors,
    workingPaper: state.workingPaper,
    passed,
    coreSurvived: core,
    yesCount,
    noCount,
    narrative: {
      consistency: consistencyText,
      argumentation: argumentationText,
      alliance: allianceText,
      influence: influenceText,
      closing,
    },
  };
}

export interface MunCriterion {
  id: string;
  label: string;
  english: string;
  level: RubricLevel;
}

/** Seven criteria used when conferences mark a delegate for the whole session. */
export const MUN_CRITERIA: { id: string; label: string; english: string }[] = [
  { id: "representation", label: "國家立場", english: "Country representation" },
  { id: "knowledge", label: "議題知識", english: "Topic knowledge" },
  { id: "speaking", label: "公開發言", english: "Public speaking" },
  { id: "argument", label: "論證辯論", english: "Argumentation" },
  { id: "diplomacy", label: "外交協商", english: "Diplomacy and negotiation" },
  { id: "drafting", label: "決議撰寫", english: "Resolution writing" },
  { id: "procedure", label: "議事規則", english: "Rules of procedure" },
];

function toLevel(value: number): RubricLevel {
  if (value >= 85) return 5;
  if (value >= 70) return 4;
  if (value >= 55) return 3;
  if (value >= 40) return 2;
  return 1;
}

function meanAxis(state: GameState, id: RubricAxisId): number | null {
  const talks = state.presentations ?? [];
  if (!talks.length) return null;
  return talks.reduce((sum, item) => sum + item.axes[id], 0) / talks.length;
}

function blend(percent: number, axis: number | null): RubricLevel {
  const mixed = axis == null ? percent : percent * 0.6 + (axis / 5) * 100 * 0.4;
  return toLevel(mixed);
}

/** Turns this round's record into the seven Model UN marks, each from 1 to 5. */
export function gradeRound(state: GameState, score: SessionScore): MunCriterion[] {
  const quizRatio = score.comprehensionTotal === 0 ? 0 : score.comprehensionCorrect / score.comprehensionTotal;
  const attempts = score.interventionAttempts;
  const validRatio = attempts === 0 ? 0.45 : score.validInterventions / attempts;
  const filled = Object.values(state.blanks).filter((value) => value?.optionId || value?.bulletId || value?.custom?.trim()).length;
  const draftRatio = Math.min(1, filled / 4);
  const amendments = [state.amendmentChoices["de-audit"], state.amendmentChoices["us-private"]].filter(Boolean).length;
  const drafting = draftRatio * 70 + (score.coreSurvived ? 20 : 0) + amendments * 5;
  const procedure = validRatio * 70 + (meanAxis(state, "protocol") ?? 3) * 6;

  const levels: Record<string, RubricLevel> = {
    representation: blend(score.consistency, meanAxis(state, "position")),
    knowledge: blend(quizRatio * 100, meanAxis(state, "evidence")),
    speaking: blend(score.argumentation, meanAxis(state, "delivery")),
    argument: blend(score.argumentation, meanAxis(state, "reasoning")),
    diplomacy: blend(score.alliance, null),
    drafting: blend(Math.min(100, drafting), meanAxis(state, "solution")),
    procedure: toLevel(Math.min(100, procedure)),
  };

  return MUN_CRITERIA.map((item) => ({
    ...item,
    level: levels[item.id] ?? 1,
  }));
}

export function amendmentLabel(choice: AmendmentChoice | undefined): string {
  if (choice === "accept") return "接受";
  if (choice === "reject") return "拒絕";
  if (choice === "counter") return "提出反建議";
  return "尚未處理";
}
