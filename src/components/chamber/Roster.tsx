import { DELEGATES } from "@/content/delegates";
import { otherSeats } from "@/content/seats";
import { moodLabel } from "@/content/voices";
import { cn } from "@/lib/utils";
import { useGame } from "@/state/context";
import { useTr } from "@/i18n/useTr";
import { Seal } from "@/components/chamber/primitives";

const SHOW_AFFINITY = new Set(["unmoderated", "drafting", "voting", "debrief"]);

export function Roster() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const showAffinity = SHOW_AFFINITY.has(state.phase);
  const player = DELEGATES[state.playerId];

  return (
    <aside className="space-y-3">
      <div className="rounded-md border border-brass/40 bg-[#24180f]/70 p-3">
        <div className="flex items-center gap-3">
          <Seal id={state.playerId} />
          <div>
            <p className="text-[11px] tracking-[0.16em] text-brass">{t("你的席位")}</p>
            <p className="font-serif text-lg">{t(player.placard)}</p>
            <p className="text-xs text-[#d9d0c2]">{player.countryEn}</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#d9d0c2]">{t(player.interests[0] ?? "")}</p>
      </div>
      <div className="rounded-md border border-white/10 p-3">
        <p className="text-[11px] tracking-[0.16em] text-brass">{t("其他代表")}</p>
        <ul className="mt-3 space-y-2">
          {otherSeats(state.playerId).map((id) => {
            const delegate = DELEGATES[id];
            const affinity = state.affinities[id];
            const selected = state.selectedDelegateId === id && state.phase === "unmoderated";
            return (
              <li key={id}>
                <button
                  type="button"
                  data-testid={`roster-${id}`}
                  onClick={() => {
                    if (state.phase === "unmoderated") dispatch({ type: "SELECT_DELEGATE", delegateId: id });
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-1 py-1 text-left",
                    selected && "bg-white/10",
                    state.phase !== "unmoderated" && "cursor-default",
                  )}
                >
                  <Seal id={id} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{t(delegate.placard)}</span>
                    {showAffinity ? (
                      <span className="mt-1 block">
                        <span className="block h-1 overflow-hidden rounded-full bg-white/10">
                          <span className="block h-full bg-brass" style={{ width: `${affinity}%` }} />
                        </span>
                        <span className="text-[11px] text-[#d9d0c2]">
                          {t(state.threads?.[id]?.moodLabel ?? moodLabel(id, affinity))}
                        </span>
                      </span>
                    ) : (
                      <span className="block truncate text-[11px] text-[#b7c0cc]">{t(delegate.style)}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {!showAffinity ? (
          <p className="mt-3 text-[11px] leading-4 text-[#b7c0cc]">{t("各席的情緒會在非監管式議會分開顯示。現在先聽他們怎麼說。")}</p>
        ) : null}
      </div>
    </aside>
  );
}
