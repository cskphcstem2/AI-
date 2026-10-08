import { useState } from "react";
import { AccountBar } from "@/components/chamber/AccountBar";
import { SaveControls } from "@/components/chamber/SaveControls";
import { Kicker, Mark, Paper, Seal } from "@/components/chamber/primitives";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { findCase, sdgGoal, seatsForCase } from "@/content/cases";
import { RULES } from "@/content/copy";
import { DELEGATES } from "@/content/delegates";
import { cn } from "@/lib/utils";
import { difficultyReason } from "@/engine/difficulty";
import { LanguageBar } from "@/i18n/LanguageBar";
import { useTr } from "@/i18n/useTr";
import { useMultiplayer } from "@/multiplayer/MultiplayerContext";
import { MAX_HUMAN_PLAYERS, normalizeRoomCode } from "@/multiplayer/types";
import { useGame } from "@/state/context";

const PRACTICES = [
  { title: "讀懂不同利益", body: "同一筆教育援助，五個席位在乎的後果不一樣。" },
  { title: "用資料支撐句子", body: "先畫論據，再把它嵌進自己的話，而不是整段照搬。" },
  { title: "針對原話回應", body: "支持或反駁都要指出你在接哪一句，以及為什麼。" },
  { title: "走完簡化程序", body: "開場、有秩序動議、非監管式議會、草案、表決。大約四十分鐘。" },
];

export function LobbyScreen() {
  const { state, history, dispatch } = useGame();
  const { t, lang } = useTr();
  const stop = lang === "zh" ? "。" : ". ";
  const training = findCase(state.caseId);
  const seats = seatsForCase(state.caseId);
  const goal = training ? sdgGoal(training.sdg) : null;
  const mp = useMultiplayer();
  const [open, setOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const previous = history.at(-1);

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 text-brass">
        <div className="flex items-center gap-3">
          <Mark className="size-12" />
          <div>
            <Kicker>{t("模擬聯合國訓練")}</Kicker>
            <p className="font-serif text-lg text-paper">{t("單人訓練議場")}</p>
          </div>
        </div>
        <AccountBar tone="dark" />
      </header>
      <div className="mt-10 grid items-end gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.8fr)]">
        <div>
          <p className="text-sm tracking-[0.22em] text-brass">{t("全球之聲")}</p>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-paper sm:text-6xl">{t("全球之聲")}</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-[#e7dfd0]">
            {t("一場給中學生的模擬聯合國訓練。正式會議約四十分鐘，練習把立場說清楚。")}
          </p>
          <div className="mt-6">
            <p className="mb-2 text-sm text-brass">{t("會議語言")}</p>
            <LanguageBar mode="session" />
            <p className="mt-2 max-w-xl text-xs leading-5 text-[#d9d0c2]">
              {t("選擇會議語言。介面和預設錄音會一起換。錄音時可改辨識語言，中文再分國語和廣東話。")}
            </p>
          </div>

          <Paper className="mt-6 border border-brass/40 bg-[#1a2a28]/80 p-4 text-paper">
            <Kicker>{t("聯機會議")}</Kicker>
            <p className="mt-2 text-sm leading-6 text-[#e7dfd0]">
              {t(
                `最多 ${MAX_HUMAN_PLAYERS} 人同一場，各自代表一國發言；沒人選的席位由 AI 補充。需已用 Google 登入。`,
              )}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <Button data-testid="create-room" size="lg" variant="brass" disabled={mp.busy} onClick={() => void mp.create()}>
                {t("建立房間")}
              </Button>
              <div className="flex flex-wrap items-end gap-2">
                <label className="block text-xs text-brass">
                  {t("房間代碼")}
                  <input
                    data-testid="join-code"
                    value={joinCode}
                    onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))}
                    maxLength={6}
                    placeholder="ABC123"
                    className="mt-1 block w-32 rounded-sm border border-white/20 bg-white/10 px-3 py-2 font-mono text-sm tracking-widest text-paper outline-none"
                  />
                </label>
                <Button
                  data-testid="join-room"
                  size="lg"
                  variant="line"
                  disabled={mp.busy || joinCode.length < 4}
                  onClick={() => void mp.join(joinCode)}
                >
                  {t("加入房間")}
                </Button>
              </div>
            </div>
            {mp.error ? <p className="mt-3 text-sm text-[#f0c4a8]">{mp.error}</p> : null}
          </Paper>

          <div className="mt-6">
            <p className="mb-2 text-sm text-brass">{t("你的席位")}</p>
            <p className="mb-3 max-w-xl text-xs leading-5 text-[#d9d0c2]">
              {t("單人訓練：這個案例可代表的國家如下。點一張席位卡，再入席。")}
            </p>
            <div className="grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3">
              {seats.map((id) => {
                const seat = DELEGATES[id];
                const on = state.playerId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    data-testid={`seat-${id}`}
                    onClick={() => dispatch({ type: "SET_PLAYER", playerId: id })}
                    className={cn(
                      "rounded-sm border px-3 py-3 text-left",
                      on ? "border-brass bg-brass text-ink" : "border-white/15 bg-white/5 text-paper",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Seal id={id} size="sm" />
                      <span className="font-serif text-lg">{t(seat.placard)}</span>
                    </span>
                    <span className={cn("mt-2 block text-xs leading-5", on ? "text-ink/80" : "text-[#d9d0c2]")}>
                      {t(seat.interests[0] ?? "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button data-testid="lobby-start" size="lg" onClick={() => dispatch({ type: "BEGIN" })}>
              {t("入席就座")}
            </Button>
            <Button data-testid="change-case" size="lg" variant="line" onClick={() => dispatch({ type: "CLEAR_CASE" })}>
              {t("更換案例")}
            </Button>
            <Button size="lg" variant="line" onClick={() => setOpen(true)}>
              {t("先看規則")}
            </Button>
          </div>
          <div className="mt-4">
            <SaveControls />
          </div>
        </div>
        <Paper className="p-5">
          <Kicker>{t("本場議題")}</Kicker>
          <h2 className="mt-2 font-serif text-2xl">
            {training ? t(training.titleZh) : t("讓優質教育趕在輟學前到達")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            {goal && training
              ? `${t(`可持續發展目標 ${goal.n}`)} ${t(goal.titleZh)}${stop}${t(training.questionZh)}`
              : t("可持續發展委員會，簡化議程。對應 SDG 4 優質教育，以及 SDG 17 夥伴關係。")}{" "}
            {t(`你的席位是${DELEGATES[state.playerId].placard}。`)}
          </p>
          <p className="mt-3 text-sm leading-6">
            {t("難度")} {t(state.difficulty.label)}。{t(difficultyReason(history))}
          </p>
          {previous ? (
            <p className="mt-3 border-t border-[#e4d8c4] pt-3 text-sm">
              {t(
                `上一場「${previous.tierLabel}」。立場 ${previous.consistency} · 論證 ${previous.argumentation} · 盟友 ${previous.alliance} · 影響 ${previous.influence}`,
              )}
            </p>
          ) : (
            <p className="mt-3 border-t border-[#e4d8c4] pt-3 text-sm text-ink-soft">{t("還沒有上一場紀錄。")}</p>
          )}
        </Paper>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PRACTICES.map((item) => (
          <Paper key={item.title} className="p-4">
            <h2 className="font-serif text-xl">{t(item.title)}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{t(item.body)}</p>
          </Paper>
        ))}
      </div>
      <Paper className="mt-4 p-5">
        <h2 className="font-serif text-xl">{t("怎麼對待會場裡的智能")}</h2>
        <p className="mt-2 text-sm leading-7 text-ink-soft">
          {t(
            "輔助智能、主席和秘書處都會給你整理好的句子。整理過的句子更順，也更容易把「大約」和反對意見刪掉。論據要你自己挑選。評分只檢查結構：有沒有理由、有沒有對上那句話、文本有沒有守住紅線。它不判斷你的價值觀對不對。",
          )}
        </p>
        <p className="mt-2 text-sm leading-7 text-ink-soft">
          {t("五個席位的立場經過簡化，用來練習談判結構，不是各國政府的完整政策。")}
        </p>
      </Paper>
      <Dialog open={open} onOpenChange={setOpen} title={t("本場怎麼進行")} description={t("準備時間不計入四十分鐘。")}>
        <div className="space-y-4 text-sm leading-7">
          {RULES.map((rule) => (
            <section key={rule.title}>
              <h3 className="font-serif text-lg">{t(rule.title)}</h3>
              <p>{t(rule.body)}</p>
            </section>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
