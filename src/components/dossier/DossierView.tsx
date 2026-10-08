import { useMemo, useState } from "react";
import { SourceLink } from "@/components/chamber/SourceLink";
import { DOSSIER_TABS, HIGHLIGHT_LIMIT, SENTENCE_MAP, SENTENCES } from "@/content/dossier";
import { DELEGATES } from "@/content/delegates";
import { useTr } from "@/i18n/useTr";
import { cn } from "@/lib/utils";
import { useGame } from "@/state/context";
import type { CountryId, DossierBlock } from "@/types/game";

function seatReferenceIds(playerId: CountryId): string[] {
  return SENTENCES.filter((sentence) => sentence.speakerId === playerId && sentence.id.startsWith("ref-")).map(
    (sentence) => sentence.id,
  );
}

function blocksForTab(tabId: string, playerId: CountryId, raw: DossierBlock[]): DossierBlock[] {
  if (tabId !== "seat") return raw;
  const refs = seatReferenceIds(playerId).map((sentenceId) => ({ type: "sentence" as const, sentenceId }));
  const withoutNote = raw.filter((block) => block.type !== "note");
  const notes = raw.filter((block) => block.type === "note");
  return [...withoutNote, ...refs, ...notes];
}

export function DossierView({ interactive }: { interactive: boolean }) {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const [tab, setTab] = useState(DOSSIER_TABS[0]?.id ?? "background");
  const active = DOSSIER_TABS.find((item) => item.id === tab) ?? DOSSIER_TABS[0];
  const highlighted = new Set(state.bullets.filter((bullet) => bullet.source === "highlight").map((bullet) => bullet.id));
  const player = DELEGATES[state.playerId];
  const blocks = useMemo(
    () => (active ? blocksForTab(active.id, state.playerId, active.blocks) : []),
    [active, state.playerId],
  );

  if (!active) return null;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3">
        {DOSSIER_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "shrink-0 rounded-sm px-3 py-1.5 text-sm",
              item.id === active.id ? "bg-ink text-paper" : "bg-white/70 text-ink",
            )}
          >
            {t(item.label)}
          </button>
        ))}
      </div>
      <p className="text-xs tracking-[0.14em] text-brass-deep">
        {active.id === "seat" && state.playerId !== "kenya" ? t(`由你代表${player.placard}發言`) : t(active.kicker)}
      </p>
      <div className="mt-3 space-y-3 text-sm leading-7">
        {active.id === "seat" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-medium">{t("核心利益")}</p>
              <ul className="mt-1 list-disc pl-5">
                {player.interests.map((interest) => (
                  <li key={interest}>{t(interest)}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">{t("紅線")}</p>
              <ul className="mt-1 list-disc pl-5">
                {player.redLines.map((line) => (
                  <li key={line}>{t(line)}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        {blocks.map((block, index) => {
          if (active.id === "seat" && block.type === "p" && state.playerId !== "kenya") return null;
          if (block.type === "sentence" && active.id === "stances") {
            const stance = SENTENCE_MAP[block.sentenceId];
            if (stance?.speakerId === state.playerId) return null;
          }
          if (block.type === "h") {
            return (
              <h3 key={`${block.text}-${index}`} className="font-serif text-2xl">
                {t(block.text)}
              </h3>
            );
          }
          if (block.type === "p") return <p key={`${block.text}-${index}`}>{t(block.text)}</p>;
          if (block.type === "note") {
            return (
              <p key={`${block.text}-${index}`} className="rounded-sm bg-[#f7f1e2] px-3 py-2 text-ink-soft">
                {t(block.text)}
              </p>
            );
          }
          const sentence = SENTENCE_MAP[block.sentenceId];
          if (!sentence) return null;
          const on = highlighted.has(sentence.id);
          if (!interactive) {
            return (
              <div key={sentence.id} className={cn("rounded-sm px-3 py-2", on && "bg-[#f3e7c8]")}>
                <p>{t(sentence.text)}</p>
                <p className="mt-1 text-xs text-ink-soft">{t(sentence.origin)}</p>
                <SourceLink href={sentence.href} label={sentence.sourceLabel} />
              </div>
            );
          }
          return (
            <button
              key={sentence.id}
              type="button"
              data-testid={`sentence-${sentence.id}`}
              aria-pressed={on}
              onClick={() => dispatch({ type: "TOGGLE_HIGHLIGHT", sentenceId: sentence.id })}
              className={cn(
                "block w-full rounded-sm border px-3 py-2 text-left",
                on ? "border-brass bg-[#f3e7c8]" : "border-[#e4d8c4] bg-white/60 hover:border-brass",
              )}
            >
              <span>{on ? t("已畫線 · ") : t("點此畫成論據 · ")}</span>
              {t(sentence.text)}
              <span className="mt-1 block text-xs text-ink-soft">
                {t(sentence.origin)}
                {t(` · 上限 ${HIGHLIGHT_LIMIT} 則`)}
              </span>
              <SourceLink href={sentence.href} label={sentence.sourceLabel} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
