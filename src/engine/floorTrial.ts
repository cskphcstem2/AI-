import { DELEGATES } from "@/content/delegates";
import { floorScript, loc } from "@/content/floor";
import { otherSeats } from "@/content/seats";
import { tagsFromText } from "@/engine/tags";
import type { OfficialLang } from "@/i18n/languages";
import type { CountryId, FloorLine, GameState, InterventionMode, TruthBullet } from "@/types/game";

export function ideaMinChars(speechMin: number): number {
  return Math.max(20, Math.round(speechMin * 0.5));
}

export function reactToIdea(input: {
  round: 1 | 2 | 3;
  text: string;
  mode: InterventionMode;
  valid: boolean;
  bullet?: TruthBullet;
  lang: OfficialLang;
  playerId?: CountryId;
}): { speakerId: CountryId; text: string } {
  const script = floorScript(input.round);
  const playerId = input.playerId ?? "kenya";
  const tags = new Set(tagsFromText(input.text));
  for (const tag of input.bullet?.tags ?? []) tags.add(tag);
  const overlap = script.tags.some((tag) => tags.has(tag));
  const conflict =
    (script.round === 1 && (tags.has("private-first") || tags.has("loan-only"))) ||
    (script.round === 2 && tags.has("freeze")) ||
    (script.round === 3 && tags.has("infra") && !tags.has("nature"));

  let chosen: { speakerId: CountryId; text: string };
  if ((input.mode === "rebut" || input.mode === "support") && !input.valid) {
    chosen = { speakerId: script.openerId, text: loc(input.lang, script.openerMissZh, script.openerMissEn) };
  } else if (input.mode === "rebut" && input.valid) {
    chosen = { speakerId: script.openerId, text: loc(input.lang, script.openerRebutZh, script.openerRebutEn) };
  } else if (input.mode === "support" && input.valid) {
    chosen = { speakerId: script.openerId, text: loc(input.lang, script.openerSupportZh, script.openerSupportEn) };
  } else if (conflict) {
    chosen = { speakerId: script.reactorId, text: loc(input.lang, script.reactorConflictZh, script.reactorConflictEn) };
  } else if (overlap) {
    chosen = { speakerId: script.reactorId, text: loc(input.lang, script.reactorCloseZh, script.reactorCloseEn) };
  } else {
    chosen = { speakerId: script.reactorId, text: loc(input.lang, script.reactorFarZh, script.reactorFarEn) };
  }
  if (chosen.speakerId !== playerId) return chosen;
  const alt = (chosen.speakerId === script.openerId ? script.reactorId : script.openerId) as CountryId;
  const speakerId = alt === playerId ? otherSeats(playerId)[0]! : alt;
  if (speakerId === script.openerId) {
    return { speakerId, text: loc(input.lang, script.openerMissZh, script.openerMissEn) };
  }
  return { speakerId, text: loc(input.lang, script.reactorFarZh, script.reactorFarEn) };
}

function discussionBullet(input: {
  id: string;
  text: string;
  origin: string;
  note: string;
  speakerId: TruthBullet["speakerId"];
  tags: string[];
}): TruthBullet {
  return {
    id: input.id,
    text: input.text.trim().slice(0, 140),
    source: "discussion",
    origin: input.origin,
    note: input.note,
    speakerId: input.speakerId,
    tags: input.tags,
  };
}

export function harvestFloor(state: GameState): TruthBullet[] {
  if (state.floor.harvested) return [];
  const known = new Set(state.bullets.map((bullet) => bullet.id));
  const added: TruthBullet[] = [];
  for (const round of [1, 2, 3] as const) {
    const idea = [...state.floor.lines].reverse().find((line) => line.round === round && line.role === "idea");
    const react = [...state.floor.lines].reverse().find((line) => line.round === round && line.role === "react");
    const script = floorScript(round);
    if (idea && !known.has(`disc-floor-${round}-you`)) {
      added.push(
        discussionBullet({
          id: `disc-floor-${round}-you`,
          text: idea.text,
          origin: `有秩序動議 · 第${round}輪`,
          note: "你在這一輪提出的進一步想法",
          speakerId: state.playerId ?? "kenya",
          tags: tagsFromText(idea.text).length > 0 ? tagsFromText(idea.text) : script.tags.slice(0, 2),
        }),
      );
    }
    if (react && !known.has(`disc-floor-${round}-ai`)) {
      added.push(
        discussionBullet({
          id: `disc-floor-${round}-ai`,
          text: react.text,
          origin: `有秩序動議 · 第${round}輪`,
          note: "對方對你這輪的回應",
          speakerId: react.speaker,
          tags: script.tags.slice(0, 3),
        }),
      );
    }
  }
  return added;
}

export function harvestCaucus(state: GameState): TruthBullet[] {
  const known = new Set(state.bullets.map((bullet) => bullet.id));
  const added: TruthBullet[] = [];
  const seen = new Set<string>();
  for (const record of [...state.caucusLog].reverse()) {
    if (seen.has(record.delegateId)) continue;
    seen.add(record.delegateId);
    const id = `disc-caucus-${record.delegateId}`;
    if (known.has(id)) continue;
    const placard = DELEGATES[record.delegateId].placard;
    const tags = tagsFromText(record.reply);
    added.push(
      discussionBullet({
        id,
        text: record.reply,
        origin: `非監管式議會 · ${placard}`,
        note: "這一席對你方案的判斷",
        speakerId: record.delegateId,
        tags,
      }),
    );
  }
  return added;
}

export function openerLine(state: GameState): FloorLine {
  const script = floorScript(state.floor.round);
  const playerId = state.playerId ?? "kenya";
  const openerIsPlayer = script.openerId === playerId;
  const speaker = openerIsPlayer
    ? script.reactorId === playerId
      ? otherSeats(playerId)[0]!
      : script.reactorId
    : script.openerId;
  return {
    id: `floor-${state.floor.round}-open`,
    round: state.floor.round,
    speaker,
    role: "open",
    text: openerIsPlayer ? loc(state.uiLanguage, script.reactorFarZh, script.reactorFarEn) : script.opener,
  };
}

export function visibleOpener(round: 1 | 2 | 3, playerId: CountryId, lang: OfficialLang): { id: CountryId; text: string; catalog: boolean } {
  const script = floorScript(round);
  if (script.openerId !== playerId) return { id: script.openerId, text: script.opener, catalog: true };
  const id = script.reactorId === playerId ? otherSeats(playerId)[0]! : script.reactorId;
  return { id, text: loc(lang, script.reactorFarZh, script.reactorFarEn), catalog: false };
}
