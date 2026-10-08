import { Quote } from "lucide-react";
import { SourceLink } from "@/components/chamber/SourceLink";
import { Button } from "@/components/ui/button";
import { HIGHLIGHT_LIMIT } from "@/content/dossier";
import { useTr } from "@/i18n/useTr";
import { useGame } from "@/state/context";
import type { BulletSource, TruthBullet } from "@/types/game";

const SOURCE_LABEL: Record<BulletSource, string> = {
  highlight: "我畫的線",
  comprehension: "理解題",
  secretariat: "秘書處摘要",
  discussion: "討論收成",
};

export function BulletTray() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const groups: BulletSource[] = ["highlight", "comprehension", "secretariat", "discussion"];
  const canInsertSpeech = state.phase === "opening" && state.openingStep === "write";
  const canAttachDraft = state.phase === "drafting" && state.amendmentCursor < 0 && Boolean(state.activeBlankId);
  const usesLeft = state.difficulty.maxBulletUses - state.bulletUses;
  const highlightCount = state.bullets.filter((bullet) => bullet.source === "highlight").length;

  return (
    <aside id="bullet-tray" className="rounded-md border border-brass/30 bg-[#101c2b]/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-brass">{t("論據清單")}</p>
          <h2 className="font-serif text-xl">{t("論據清單")}</h2>
        </div>
        <Quote className="size-4 text-brass" aria-hidden="true" />
      </div>
      <p className="mt-2 text-xs leading-5 text-[#d9d0c2]">
        {state.phase === "moderated"
          ? t(`畫線 ${highlightCount}/${HIGHLIGHT_LIMIT} · 指證剩餘 ${usesLeft}`)
          : t(`畫線 ${highlightCount}/${HIGHLIGHT_LIMIT}`)}
      </p>
      {state.bullets.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[#d9d0c2]">{t("還沒有論據。在卷宗裡點選你願意負責的句子。")}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {groups.map((source) => {
            const items = state.bullets.filter((bullet) => bullet.source === source);
            if (items.length === 0 && source === "discussion") {
              return (
                <div key={source}>
                  <p className="text-xs text-brass">{t(SOURCE_LABEL[source])}</p>
                  <p className="mt-2 text-xs leading-5 text-[#d9d0c2]">
                    {t("目前還沒有討論收成。有秩序動議和非監管式議會的來回會出現在這裡。")}
                  </p>
                </div>
              );
            }
            if (items.length === 0) return null;
            return (
              <div key={source}>
                <p className="text-xs text-brass">
                  {t(SOURCE_LABEL[source])} · {items.length}
                </p>
                <ul className="mt-2 space-y-2">
                  {items.map((bullet) => (
                    <BulletCard
                      key={bullet.id}
                      bullet={bullet}
                      actionLabel={canInsertSpeech ? t("插入發言") : canAttachDraft && source !== "discussion" ? t("附上說服") : undefined}
                      onUse={
                        canInsertSpeech || (canAttachDraft && source !== "discussion")
                          ? () => dispatch({ type: "INSERT_BULLET", bulletId: bullet.id })
                          : undefined
                      }
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

function BulletCard({
  bullet,
  actionLabel,
  onUse,
}: {
  bullet: TruthBullet;
  actionLabel?: string;
  onUse?: () => void;
}) {
  const { t } = useTr();
  return (
    <li className="rounded-sm border border-white/10 bg-white/5 p-2">
      <p className="text-sm leading-6">{t(bullet.text)}</p>
      <p className="mt-1 text-[11px] leading-4 text-[#b7c0cc]">{t(bullet.note || bullet.origin)}</p>
      {bullet.note ? <p className="text-[11px] leading-4 text-[#8ea0b5]">{t(bullet.origin)}</p> : null}
      <SourceLink
        href={bullet.href}
        label={bullet.sourceLabel}
        className="mt-1 inline-flex items-center gap-1 text-[11px] text-brass underline underline-offset-2 hover:text-paper"
      />
      {actionLabel && onUse ? (
        <Button className="mt-2" size="sm" variant="line" onClick={onUse}>
          {actionLabel}
        </Button>
      ) : null}
    </li>
  );
}
