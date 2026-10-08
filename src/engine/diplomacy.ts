import { AFFINITY_THRESHOLD, DIPLOMACY, INITIAL_AFFINITY, PROPOSALS } from "@/content/caucus";
import { closenessReply } from "@/content/solutions";
import { proposalLine, voiceLine } from "@/content/voices";
import { DRAFT_BLANKS } from "@/content/draft";
import { DELEGATES } from "@/content/delegates";
import { otherSeats } from "@/content/seats";
import { tagsFromText } from "@/engine/tags";
import type { OfficialLang } from "@/i18n/languages";
import { clamp } from "@/lib/utils";
import type {
  AmendmentChoice,
  Ballot,
  BlankValue,
  CaucusAction,
  CaucusRecord,
  CountryId,
  TruthBullet,
} from "@/types/game";

const GENERIC_SELF = [
  "只用你自己的主張當證據，說服力不夠。請指向我們在乎、而且可以核對的資料。",
  "再重複你自己的句子，這一席不會因此改口。",
];

export function collectTags(
  blanks: Record<string, BlankValue | undefined>,
  bullets: TruthBullet[],
): Set<string> {
  const tags = new Set<string>();
  for (const blank of DRAFT_BLANKS) {
    const value = blanks[blank.id];
    if (!value) continue;
    if (value.kind === "option" && value.optionId) {
      blank.options.find((option) => option.id === value.optionId)?.tags.forEach((tag) => tags.add(tag));
    }
    if (value.kind === "bullet" && value.bulletId) {
      bullets.find((bullet) => bullet.id === value.bulletId)?.tags.forEach((tag) => tags.add(tag));
    }
    if (value.kind === "custom" && value.custom) {
      tagsFromText(value.custom).forEach((tag) => tags.add(tag));
      if (value.bulletId) {
        bullets.find((bullet) => bullet.id === value.bulletId)?.tags.forEach((tag) => tags.add(tag));
      }
    }
  }
  return tags;
}

export function tagsAfterAmendments(
  tags: Set<string>,
  choices: Partial<Record<string, AmendmentChoice>>,
  texts: Partial<Record<string, string>> = {},
): Set<string> {
  const next = new Set(tags);
  if (choices["de-audit"] === "accept") {
    next.add("freeze");
    next.add("accountability");
  }
  if (choices["de-audit"] === "counter") {
    const written = texts["de-audit"]?.trim() ?? "";
    if (!written) {
      next.add("report");
      next.add("accountability");
    } else {
      tagsFromText(written).forEach((tag) => next.add(tag));
      if (/不得.*凍結|不.*凍結|must not freeze|not freeze|without freezing/i.test(written)) {
        next.delete("freeze");
        next.add("report");
        next.add("accountability");
      }
    }
  }
  if (choices["us-private"] === "accept") {
    next.add("private-first");
    next.add("override-private");
    next.delete("grant");
  }
  if (choices["us-private"] === "counter") {
    const written = texts["us-private"]?.trim() ?? "";
    if (!written) {
      next.add("voluntary");
      next.add("private");
    } else {
      tagsFromText(written).forEach((tag) => next.add(tag));
      if (/不替代|不取代|does not replace|not replace/i.test(written)) {
        next.delete("private-first");
        next.delete("override-private");
        next.add("voluntary");
      }
    }
  }
  return next;
}

export function clauseText(
  blanks: Record<string, BlankValue | undefined>,
  bullets: TruthBullet[],
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const blank of DRAFT_BLANKS) {
    const value = blanks[blank.id];
    if (!value) continue;
    if (value.kind === "option" && value.optionId) {
      result[blank.id] = blank.options.find((option) => option.id === value.optionId)?.text ?? "";
    } else if (value.kind === "bullet" && value.bulletId) {
      result[blank.id] = bullets.find((bullet) => bullet.id === value.bulletId)?.text ?? "";
    } else if (value.kind === "custom" && value.custom) {
      result[blank.id] = value.custom.trim();
    }
  }
  return result;
}

export function blanksComplete(blanks: Record<string, BlankValue | undefined>): boolean {
  return DRAFT_BLANKS.every((blank) => {
    const value = blanks[blank.id];
    if (!value) return false;
    if (value.kind === "option") return Boolean(value.optionId);
    if (value.kind === "bullet") return false;
    return Boolean(value.custom && value.custom.trim().length >= 16);
  });
}

function germanyBlocked(tags: Set<string>): boolean {
  return tags.has("no-accountability") && !tags.has("report");
}

function tagGate(id: CountryId, tags: Set<string>): boolean {
  if (id === "kenya" || id === "bangladesh") return tags.has("grant");
  if (id === "brazil") return tags.has("nature");
  if (id === "germany") return tags.has("report") || tags.has("accountability");
  if (id === "china") return tags.has("public-finance") || tags.has("cbdr") || tags.has("grant");
  return tags.has("voluntary") || tags.has("private");
}

function forbidden(id: CountryId, tags: Set<string>): string | null {
  if (id === "kenya" && (tags.has("freeze") || tags.has("loan-only") || tags.has("private-first") || tags.has("override-private"))) {
    return "草案踩到肯尼亞的紅線：資金若變成貸款、私人資本優先，或在撥款前凍結，他們不會連署。";
  }
  if (id === "bangladesh" && (tags.has("freeze") || tags.has("loan-only") || tags.has("private-first") || tags.has("override-private"))) {
    return "草案踩到孟加拉的紅線：資金若變成貸款、私人資本優先，或在撥款前凍結，他們不會連署。";
  }
  if (id === "germany" && germanyBlocked(tags)) {
    return "德國不連署沒有報告的文本。速度不能拿來刪掉問責。";
  }
  if (id === "china" && tags.has("binding-emerging")) {
    return "文本把新興經濟體寫進相同的強制出資，碰到中國的紅線。";
  }
  if (id === "usa" && (tags.has("binding-obligation") || tags.has("binding-emerging"))) {
    return "文本出現新的強制分攤，美國不會連署。";
  }
  if (id === "brazil" && tags.has("infra") && !tags.has("nature")) {
    return "資格若只剩校舍硬體、沒有全納教育，巴西不會連署。";
  }
  return null;
}

function missingTagReason(id: CountryId): string {
  const reasons: Record<CountryId, string> = {
    kenya: "草案裡還沒有寫清以贈款為主。",
    bangladesh: "草案裡還沒有寫清以贈款為主。",
    brazil: "巴西還沒有在草案裡看到全納教育或母語教學。",
    germany: "德國還沒有看到可核對的年度成果或同等的問責句。",
    china: "中國還沒有看到公共資金原則，或贈款作為公共承諾的寫法。",
    usa: "美國還沒有看到自願窗口或私人工具的位置。",
  };
  return reasons[id];
}

export interface CosponsorResult {
  cosponsors: CountryId[];
  notes: Partial<Record<CountryId, string>>;
}

export function evaluateCosponsors(
  tags: Set<string>,
  affinities: Partial<Record<CountryId, number>>,
  level: 1 | 2 | 3,
  playerId: CountryId = "kenya",
): CosponsorResult {
  const notes: Partial<Record<CountryId, string>> = {};
  const cosponsors: CountryId[] = [];
  for (const id of otherSeats(playerId)) {
    const blocked = forbidden(id, tags);
    if (blocked) {
      notes[id] = blocked;
      continue;
    }
    if (!tagGate(id, tags)) {
      notes[id] = missingTagReason(id);
      continue;
    }
    const need = AFFINITY_THRESHOLD[id][level];
    const affinity = affinities[id] ?? INITIAL_AFFINITY[id];
    if (affinity < need) {
      notes[id] = "文本方向沒有踩線，但目前的合作意願還不足以把名字放上連署。贊成票和連署不是同一件事。";
      continue;
    }
    notes[id] = "文本與合作意願都夠，這一席願意連署。";
    cosponsors.push(id);
  }
  return { cosponsors, notes };
}

export function leanScore(
  id: CountryId,
  tags: Set<string>,
  affinity: number,
  amendments: Partial<Record<string, AmendmentChoice>>,
  workingPaper: boolean,
): number {
  const warmth = affinity / 100;
  let score = 0;

  if (id === "kenya" || id === "bangladesh") {
    if (tags.has("loan-only") || tags.has("private-first") || tags.has("override-private")) score = 0.16;
    else {
      score = 0.18 + warmth * 0.28;
      if (tags.has("grant")) score += 0.3;
      if (tags.has("community") || tags.has("access")) score += 0.1;
      if (tags.has("freeze") || amendments["de-audit"] === "accept") score -= 0.26;
      if (amendments["us-private"] === "accept") score -= 0.3;
    }
  }

  if (id === "brazil") {
    score = 0.12 + warmth * 0.22;
    if (tags.has("nature")) score += 0.34;
    if (tags.has("governance")) score += 0.08;
    if (tags.has("community")) score += 0.06;
    if (tags.has("infra") && !tags.has("nature")) score -= 0.2;
  }

  if (id === "germany") {
    score = 0.08 + warmth * 0.4;
    if (tags.has("report") || tags.has("accountability")) score += 0.28;
    if (tags.has("no-accountability") && !tags.has("report")) score -= 0.25;
    if (amendments["de-audit"] === "counter") score += 0.14;
    if (amendments["de-audit"] === "accept") score += 0.12;
    if (amendments["de-audit"] === "reject") score -= 0.12;
    if (!tags.has("report") && !tags.has("accountability")) score = Math.min(score, 0.36);
  }

  if (id === "china") {
    if (tags.has("binding-emerging")) score = 0.14;
    else {
      score = 0.1 + warmth * 0.26;
      if (tags.has("grant") || tags.has("public-finance")) score += 0.36;
      if (tags.has("cbdr")) score += 0.06;
    }
  }

  if (id === "usa") {
    if (tags.has("binding-obligation") || tags.has("binding-emerging")) score = 0.12;
    else {
      score = 0.06 + warmth * 0.4;
      if (tags.has("voluntary")) score += 0.24;
      if (tags.has("private")) score += 0.06;
      if (tags.has("private-first") || tags.has("override-private") || amendments["us-private"] === "accept") {
        score += 0.16;
      }
      if (amendments["us-private"] === "counter") score += 0.06;
      if (amendments["us-private"] === "reject") score -= 0.04;
    }
  }

  if (workingPaper) score -= 0.05;
  return clamp(score, 0, 1);
}

export function ballotFromLean(lean: number): Ballot {
  if (lean >= 0.6) return "yes";
  if (lean >= 0.42) return "abstain";
  return "no";
}

export function buildBallots(
  tags: Set<string>,
  affinities: Partial<Record<CountryId, number>>,
  amendments: Partial<Record<string, AmendmentChoice>>,
  workingPaper: boolean,
  playerId: CountryId = "kenya",
): Record<CountryId, Ballot> {
  const ballots = {} as Record<CountryId, Ballot>;
  ballots[playerId] = "yes";
  for (const id of otherSeats(playerId)) {
    ballots[id] = ballotFromLean(
      leanScore(id, tags, affinities[id] ?? INITIAL_AFFINITY[id], amendments, workingPaper),
    );
  }
  return ballots;
}

export function coreSurvived(
  tags: Set<string>,
  amendments: Partial<Record<string, AmendmentChoice>>,
): boolean {
  const grantKept =
    tags.has("grant") &&
    !tags.has("private-first") &&
    !tags.has("loan-only") &&
    !tags.has("override-private") &&
    amendments["us-private"] !== "accept";
  const people =
    tags.has("community") || tags.has("warning") || tags.has("access") || tags.has("nature");
  return grantKept && people && !tags.has("freeze") && amendments["de-audit"] !== "accept";
}

function replyKeyOf(record: CaucusRecord): string {
  if (record.replyKey) return record.replyKey;
  if (record.action === "propose") return `propose:${record.proposalId ?? ""}`;
  return record.action;
}

function heardTimes(prior: CaucusRecord[] | undefined, replyKey: string): number {
  return (prior ?? []).filter((record) => replyKeyOf(record) === replyKey).length;
}

type ClosenessBand = "close" | "far" | "redline";

function bandFor(id: CountryId, tags: Set<string>): ClosenessBand {
  if ((id === "kenya" || id === "bangladesh") && (tags.has("private-first") || tags.has("loan-only") || tags.has("freeze"))) return "redline";
  if (id === "germany" && tags.has("no-accountability") && !tags.has("report") && !tags.has("accountability")) return "redline";
  if (id === "china" && tags.has("binding-emerging")) return "redline";
  if (id === "usa" && (tags.has("binding-obligation") || tags.has("binding-emerging"))) return "redline";
  if (id === "brazil" && tags.has("infra") && !tags.has("nature")) return "redline";
  const listen = DIPLOMACY[id]?.listenTags ?? [];
  if ([...tags].some((tag) => listen.includes(tag))) return "close";
  return "far";
}

export const CONTACTS_PER_SEAT = 3;

export function countriesTalked(log: CaucusRecord[]): number {
  return new Set(log.map((item) => item.delegateId)).size;
}

export function seatContactsLeft(log: CaucusRecord[], id: CountryId): number {
  const used = log.filter((item) => item.delegateId === id).length;
  return Math.max(0, CONTACTS_PER_SEAT - used);
}

export function contactsRemaining(log: CaucusRecord[], playerId: CountryId = "kenya"): number {
  return otherSeats(playerId).reduce((sum, id) => sum + seatContactsLeft(log, id), 0);
}

export function resolveCaucus(input: {
  delegateId: CountryId;
  action: CaucusAction;
  proposalId?: string;
  bullet?: TruthBullet;
  playerLine?: string;
  nextId: string;
  prior?: CaucusRecord[];
  lang?: OfficialLang;
  playerId?: CountryId;
  voice?: boolean;
}): { record: CaucusRecord; delta: number } | { error: string } {
  const profile = DIPLOMACY[input.delegateId];
  const lang = input.lang ?? "zh";
  const playerId = input.playerId ?? "kenya";
  if (!profile) return { error: "找不到這一席。" };

  if (input.action === "propose") {
    const own = input.playerLine?.trim() ?? "";
    const proposalMin = input.voice ? 4 : 16;
    if (own.length >= proposalMin || !input.proposalId) {
      if (own.length < proposalMin) {
        return { error: "方案至少 16 字。指引只是方向，句子要你自己寫。" };
      }
      const textTags = new Set(tagsFromText(own));
      const band = bandFor(input.delegateId, textTags);
      const boosted = Boolean(
        input.bullet && band !== "redline" && input.bullet.tags.some((tag) => profile.listenTags.includes(tag)),
      );
      const base = band === "close" ? 8 : band === "redline" ? -4 : 1;
      const replyKey = `own:${band}:${own.slice(0, 48)}`;
      const heard = heardTimes(input.prior, replyKey);
      const delta = heard === 0 ? base + (boosted ? 3 : 0) : 0;
      return {
        delta,
        record: {
          id: input.nextId,
          delegateId: input.delegateId,
          action: "propose",
          bulletId: input.bullet?.id,
          playerLine: own,
          reply: closenessReply(input.delegateId, band, boosted, lang),
          delta,
          replyKey,
        },
      };
    }
    const proposal = PROPOSALS.find((item) => item.id === input.proposalId);
    if (!proposal) return { error: "先選擇一份合作提案。" };
    const reply = profile.proposals[proposal.id];
    const text = proposalLine(input.delegateId, proposal.id, heardTimes(input.prior, `propose:${proposal.id}`));
    if (!reply || !text) return { error: "這一席沒有這份提案的回應。" };
    const heard = heardTimes(input.prior, `propose:${proposal.id}`);
    return {
      delta: heard === 0 ? reply.delta : 0,
      record: {
        id: input.nextId,
        delegateId: input.delegateId,
        action: "propose",
        proposalId: proposal.id,
        reply: text,
        delta: heard === 0 ? reply.delta : 0,
        replyKey: `propose:${proposal.id}`,
      },
    };
  }

  if (input.action === "persuade") {
    if (!input.bullet) return { error: "說服需要一則論據。" };
    const line = input.playerLine?.trim() ?? "";
    if (line.length < (input.voice ? 4 : 12)) return { error: "用至少 12 個字說明你希望對方聽見什麼。不要只貼論據。" };
    let reply = profile.persuadeMiss;
    let key: "persuadeMiss" | "selfPitch" | "echo" | "persuadeHit" = "persuadeMiss";
    if (input.bullet.speakerId === playerId) {
      reply = profile.selfPitch;
      key = "selfPitch";
    } else if (input.bullet.speakerId === input.delegateId) {
      reply = profile.echo;
      key = "echo";
    } else if (input.bullet.tags.some((tag) => profile.listenTags.includes(tag))) {
      reply = profile.persuadeHit;
      key = "persuadeHit";
    }
    const replyKey = `persuade:${key}`;
    const heard = heardTimes(input.prior, replyKey);
    return {
      delta: heard === 0 ? reply.delta : 0,
      record: {
        id: input.nextId,
        delegateId: input.delegateId,
        action: "persuade",
        bulletId: input.bullet.id,
        playerLine: line,
        reply:
          key === "selfPitch" && playerId !== "kenya"
            ? (GENERIC_SELF[Math.min(heard, GENERIC_SELF.length - 1)] ?? GENERIC_SELF[0])
            : voiceLine(input.delegateId, key, heard),
        delta: heard === 0 ? reply.delta : 0,
        replyKey,
      },
    };
  }

  const reply = input.action === "redline" ? profile.redline : profile.condition;
  const key = input.action === "redline" ? "redline" : "condition";
  const heard = heardTimes(input.prior, key);
  return {
    delta: heard === 0 ? reply.delta : 0,
    record: {
      id: input.nextId,
      delegateId: input.delegateId,
      action: input.action,
      reply: voiceLine(input.delegateId, key, heard),
      delta: heard === 0 ? reply.delta : 0,
      replyKey: key,
    },
  };
}

export function postureLabel(value: number): string {
  if (value >= 70) return "高";
  if (value >= 55) return "中上";
  if (value >= 40) return "觀望";
  return "低";
}

export function deltaLabel(delta: number): string {
  if (delta >= 8) return "合作意願明顯上升";
  if (delta > 0) return "合作意願上升";
  if (delta === 0) return "合作意願沒有變化";
  if (delta > -8) return "合作意願下降";
  return "合作意願明顯下降";
}

export function likelyAllies(affinities: Partial<Record<CountryId, number>>, playerId: CountryId = "kenya"): {
  closer: string[];
  opposed: string[];
} {
  const seats = otherSeats(playerId).map((id) => DELEGATES[id]);
  const closer = seats.filter((delegate) => (affinities[delegate.id] ?? 0) >= 60).map((delegate) => delegate.placard);
  const opposed = seats.filter((delegate) => (affinities[delegate.id] ?? 0) < 40).map((delegate) => delegate.placard);
  return { closer, opposed };
}

export function usedBulletInDraft(
  blanks: Record<string, BlankValue | undefined>,
): boolean {
  return Object.values(blanks).some((value) => value?.kind === "bullet" && value.bulletId);
}
