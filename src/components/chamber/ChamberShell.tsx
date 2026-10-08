import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, Scale, Timer } from "lucide-react";
import { AccountBar } from "@/components/chamber/AccountBar";
import { BulletTray } from "@/components/chamber/BulletTray";
import { SaveControls } from "@/components/chamber/SaveControls";
import { Kicker, Mark, NoticeBanner } from "@/components/chamber/primitives";
import { Roster } from "@/components/chamber/Roster";
import { DossierView } from "@/components/dossier/DossierView";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FORMAL_BUDGET_MS, PHASE_LABEL, PHASE_TIME, RULES } from "@/content/copy";
import { createLlmClient, llmEnvFromImportMeta } from "@/llm/client";
import { useTr } from "@/i18n/useTr";
import { useMultiplayer } from "@/multiplayer/MultiplayerContext";
import { useGame } from "@/state/context";
import type { Phase } from "@/types/game";

const AGENDA: { label: string; phases: Phase[] }[] = [
  { label: "準備", phases: ["chair", "dossier", "quiz"] },
  { label: "開場", phases: ["opening"] },
  { label: "有秩序", phases: ["moderated"] },
  { label: "非監管", phases: ["unmoderated"] },
  { label: "草案", phases: ["drafting"] },
  { label: "表決", phases: ["voting", "debrief"] },
];

export function ChamberShell({ children }: { children: ReactNode }) {
  const { state, dispatch, restart } = useGame();
  const { t } = useTr();
  const mp = useMultiplayer();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const client = createLlmClient(llmEnvFromImportMeta(import.meta.env));
  const online = state.mode === "online" || mp.onlineLive;

  return (
    <div className="mx-auto min-h-dvh max-w-7xl px-3 py-3 sm:px-5">
      <header className="border-b border-brass/30 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Mark className="size-10 text-brass" />
            <div>
              <Kicker>Global Voice</Kicker>
              <p className="font-serif text-xl">{t("全球之聲")}</p>
            </div>
          </div>
          <ol className="flex gap-1 overflow-x-auto text-xs">
            {AGENDA.map((item) => {
              const on = item.phases.includes(state.phase);
              return (
                <li key={item.label} className={on ? "rounded-sm bg-brass px-2 py-1 text-ink" : "rounded-sm px-2 py-1 text-[#d9d0c2]"}>
                  {t(item.label)}
                </li>
              );
            })}
          </ol>
          <FormalClock startedAt={state.formalStartedAt} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[#d9d0c2]">
            {t(PHASE_LABEL[state.phase])}
            {PHASE_TIME[state.phase] ? ` · ${t(PHASE_TIME[state.phase] ?? "")}` : ` · ${t("不計入四十分鐘")}`}
            {` · ${t("難度")} ${t(state.difficulty.label)}`}
            {online && mp.roomCode ? ` · ROOM ${mp.roomCode}` : ""}
          </span>
          <Button size="sm" variant="line" onClick={() => setRulesOpen(true)}>
            <Scale className="size-3.5" aria-hidden="true" />
            {t("規則")}
          </Button>
          <Button size="sm" variant="line" onClick={() => setDossierOpen(true)}>
            <BookOpen className="size-3.5" aria-hidden="true" />
            {t("卷宗")}
          </Button>
          {online ? (
            <Button size="sm" variant="ghost" onClick={() => void mp.leave()}>
              {t("離開房間")}
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setRestartOpen(true)}>
              {t("重開本場")}
            </Button>
          )}
          {!online ? <SaveControls /> : null}
          <AccountBar tone="dark" />
          <a href="#bullet-tray" className="ml-auto text-xs text-brass lg:hidden">
            {t(`論據 ${state.bullets.length}`)}
          </a>
        </div>
      </header>
      {state.lastNotice ? (
        <div className="mt-3">
          <NoticeBanner tone={state.lastNotice.tone} text={state.lastNotice.text} />
          <button type="button" className="mt-1 text-xs text-[#b7c0cc]" onClick={() => dispatch({ type: "CLEAR_NOTICE" })}>
            {t("收起提示")}
          </button>
        </div>
      ) : null}
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        <div className="order-2 lg:order-1">
          <Roster />
        </div>
        <main className="order-1 min-w-0 lg:order-2">{children}</main>
        <div className="order-3">
          <BulletTray />
        </div>
      </div>
      <footer className="mt-6 border-t border-white/10 py-4 text-xs leading-5 text-[#b7c0cc]">
        {t("對白、連署與表決由內建規則決定，用來守住各席紅線。")}
        {client.id === "openai-compatible"
          ? t("已接上評分員。閉幕分數和改進建議由它給出。連署與表決仍由規則決定。")
          : t("評分員會在閉幕給出分數，並指出要改進的部分。連署與表決仍由規則決定。")}
        {t("按「儲存進度」會把這一刻和練習紀錄存進你的帳號。換裝置後，用同一個帳號登入即可繼續。")}
      </footer>
      <Dialog open={rulesOpen} onOpenChange={setRulesOpen} title={t("本場怎麼進行")} description={t("簡化程序，用來練習論證，不是完整的聯合國議事規則。")}>
        <div className="space-y-4 text-sm leading-7">
          {RULES.map((rule) => (
            <section key={rule.title}>
              <h3 className="font-serif text-lg">{t(rule.title)}</h3>
              <p>{t(rule.body)}</p>
            </section>
          ))}
        </div>
      </Dialog>
      <Dialog
        open={dossierOpen}
        onOpenChange={setDossierOpen}
        title={t("會議卷宗")}
        description={t("會中可以回看。畫線只在會前開放，避免把論據玩成無限收集。")}
        wide
      >
        <DossierView interactive={false} />
      </Dialog>
      <Dialog
        open={restartOpen}
        onOpenChange={setRestartOpen}
        title={t("重開本場？")}
        description={t("目前的發言、論據和合作意願會清除。已結束的場次仍留在這個帳號的紀錄裡。")}
      >
        <div className="flex justify-end gap-2">
          <Button variant="quiet" onClick={() => setRestartOpen(false)}>
            {t("留下")}
          </Button>
          <Button
            variant="seal"
            onClick={() => {
              setRestartOpen(false);
              restart();
            }}
          >
            {t("重開")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function FormalClock({ startedAt }: { startedAt: number | null }) {
  const { t } = useTr();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);
  const remain = startedAt ? FORMAL_BUDGET_MS - (now - startedAt) : FORMAL_BUDGET_MS;
  const overtime = remain < 0;
  const absolute = Math.abs(remain);
  const minutes = Math.floor(absolute / 60000);
  const seconds = Math.floor((absolute % 60000) / 1000);
  const label = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return (
    <p className="flex items-center gap-2 text-sm text-[#d9d0c2]">
      <Timer className="size-4 text-brass" aria-hidden="true" />
      <span>{startedAt ? t(overtime ? `已超出建議 ${label}` : `建議剩餘 ${label}`) : t("準備不計時")}</span>
    </p>
  );
}
