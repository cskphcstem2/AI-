import { useEffect, useRef } from "react";
import { findCase, sdgGoal } from "@/content/cases";
import { REFLECTION_PROMPT } from "@/content/copy";
import { DELEGATES } from "@/content/delegates";
import { deriveDifficulty } from "@/engine/difficulty";
import { amendmentLabel, gradeRound } from "@/engine/scoring";
import { GradeMarks, GradeWeb } from "@/components/chamber/GradeWeb";
import { Kicker, Paper, Seal } from "@/components/chamber/primitives";
import { Button } from "@/components/ui/button";
import { useTr } from "@/i18n/useTr";
import { criteriaFromCoach, gradeSession } from "@/llm/coach";
import { createLlmClient, llmEnvFromImportMeta } from "@/llm/client";
import { useGame } from "@/state/context";
import type { CountryId, GameState, SessionScore } from "@/types/game";

const ROLL: CountryId[] = ["bangladesh", "brazil", "china", "germany", "kenya", "usa"];

const BALLOT_LABEL = { yes: "贊成", no: "反對", abstain: "棄權" } as const;

function average(values: number[]): string {
  if (!values.length) return "0";
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

export function VotingScreen() {
  const { state, dispatch, enterDebrief } = useGame();
  const { t } = useTr();
  const revealed = ROLL.slice(0, state.revealedVotes);
  const pending = ROLL[state.revealedVotes];
  const done = state.revealedVotes >= ROLL.length;

  return (
    <div className="space-y-4">
      <div>
        <Kicker>{t("唱名表決")}</Kicker>
        <h2 className="mt-1 font-serif text-3xl text-paper">A/GV/L.1</h2>
        <p className="mt-2 text-sm text-[#d9d0c2]">
          {state.workingPaper
            ? t("這是工作文件，不是足額連署的正式草案。")
            : t(`連署：${state.cosponsors.map((id) => DELEGATES[id].placard).join("、") || "無"}`)}
        </p>
      </div>
      <div className="space-y-2">
        {revealed.map((id) => {
          const vote = state.votes?.[id];
          return (
            <Paper key={id} className="flex items-center justify-between gap-3 p-3">
              <span className="flex items-center gap-2">
                <Seal id={id} size="sm" />
                {t(DELEGATES[id].placard)}
              </span>
              <span className="font-serif text-lg">{vote ? t(BALLOT_LABEL[vote]) : ""}</span>
            </Paper>
          );
        })}
      </div>
      {!done && pending ? (
        <Button data-testid="reveal-vote" variant="paper" onClick={() => dispatch({ type: "REVEAL_VOTE" })}>
          {t(`唱名：${DELEGATES[pending].placard}`)}
        </Button>
      ) : null}
      {done && state.score ? (
        <Paper className="p-5">
          <p className="font-serif text-2xl">{state.score.passed ? t("草案通過") : t("草案未通過")}</p>
          <p className="mt-2 text-sm leading-7">
            {t(
              `贊成 ${state.score.yesCount} · 反對 ${state.score.noCount} · 棄權 ${ROLL.length - state.score.yesCount - state.score.noCount}`,
            )}
          </p>
          <p className="mt-3 text-sm leading-7">{t(state.score.narrative.closing)}</p>
          <Button className="mt-4" data-testid="to-debrief" variant="ink" onClick={enterDebrief}>
            {t("進入閉幕覆盤")}
          </Button>
        </Paper>
      ) : null}
    </div>
  );
}

const LEVEL_NOTE = {
  1: "這一場屬入門。下一場先留在相近的目標，把同一種利益再說清楚。",
  2: "這一場屬標準。下一場換一個相近目標，用新的例子練同一套程序。",
  3: "這一場屬嚴謹。下一場換席位更多的例子，把協商和草案寫得更完整。",
} as const;

export function DebriefScreen() {
  const { state, history, dispatch, restart } = useGame();
  const { t, lang } = useTr();
  const score = state.score;
  const pack = useRef<{ state: GameState; score: SessionScore; lang: typeof lang } | null>(null);
  if (score) pack.current = { state, score, lang };
  useEffect(() => {
    const snap = pack.current;
    if (!snap || snap.score.coachMark) return;
    let cancelled = false;
    void gradeSession(createLlmClient(llmEnvFromImportMeta(import.meta.env)), snap.state, snap.score, snap.lang).then((mark) => {
      if (!cancelled) dispatch({ type: "APPLY_COACH", mark });
    });
    return () => {
      cancelled = true;
    };
  }, [dispatch, state.sessionId]);
  if (!score) return null;
  const fallback = gradeRound(state, score);
  const criteria = score.coachMark ? criteriaFromCoach(score.coachMark, fallback) : fallback;
  const improvements = score.coachMark?.improvements ?? [];
  const meters = [
    ["立場一致性", score.consistency, score.narrative.consistency],
    ["發言與論證", score.argumentation, score.narrative.argumentation],
    ["盟友爭取", score.alliance, score.narrative.alliance],
    ["對結果的影響", score.influence, score.narrative.influence],
  ] as const;

  return (
    <div className="space-y-4">
      <div>
        <Kicker>{t("閉幕")}</Kicker>
        <h2 className="mt-1 font-serif text-4xl text-paper">{t(score.tierLabel)}</h2>
        <p className="mt-2 text-sm text-[#d9d0c2]">
          {t(`綜合 ${score.overall} · 難度 ${state.difficulty.label} · 理解題 ${score.comprehensionCorrect}/${score.comprehensionTotal}`)}
        </p>
      </div>
      <Paper className="p-5">
        <p className="text-xs tracking-[0.14em] text-brass-deep">{t("本場評分")}</p>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <p className="font-serif text-6xl leading-none" data-testid="round-mark">
            {score.overall}
          </p>
          <p className="pb-1 text-sm text-ink-soft">
            {t(score.coachMark ? "這一分數由評分員給出。蛛網的七個角是它給的模擬聯合國標準，每一項從 1 到 5。" : "評分員正在讀這一場。")}
          </p>
        </div>
        <GradeWeb criteria={criteria} />
        <GradeMarks criteria={criteria} />
        {improvements.length ? (
          <div className="mt-4 border-t border-[#e4d8c4] pt-3">
            <p className="text-sm font-medium">{t("需要改進")}</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
              {improvements.map((item) => (
                <li key={item}>{score.coachMark?.source === "model" ? item : t(item)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Paper>
      <div className="grid gap-3 md:grid-cols-2">
        {meters.map(([label, value, text]) => (
          <Paper key={label} className="p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-serif text-xl">{t(label)}</h3>
              <span className="font-serif text-2xl">{value}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e4d8c4]">
              <div className="h-full bg-brass-deep" style={{ width: `${value}%` }} />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{t(text)}</p>
          </Paper>
        ))}
      </div>
      {state.presentations?.length ? (
        <Paper className="p-5">
          <h3 className="font-serif text-xl">{t("口語與文字評分")}</h3>
          <p className="mt-2 text-sm leading-7 text-ink-soft">
            {t(
              `共 ${state.presentations.length} 次發言。立場 ${average(state.presentations.map((item) => item.axes.position))} · 論證 ${average(state.presentations.map((item) => item.axes.reasoning))} · 證據 ${average(state.presentations.map((item) => item.axes.evidence))} · 方案 ${average(state.presentations.map((item) => item.axes.solution))} · 扣題 ${average(state.presentations.map((item) => item.axes.focus))} · 表達 ${average(state.presentations.map((item) => item.axes.delivery))} · 儀態 ${average(state.presentations.map((item) => item.axes.protocol))}。口語場次的眼神和站姿沒有計入。`,
            )}
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {state.presentations.map((item, index) => (
              <li key={item.id}>
                {t(
                  `第 ${index + 1} 次${item.occasion === "opening" ? "開場" : "有秩序動議"}（${item.mode === "typed" ? "打字" : "口語"}）：立場 ${item.axes.position} · 論證 ${item.axes.reasoning} · 證據 ${item.axes.evidence} · 方案 ${item.axes.solution} · 扣題 ${item.axes.focus} · 表達 ${item.axes.delivery} · 儀態 ${item.axes.protocol}`,
                )}
              </li>
            ))}
          </ul>
        </Paper>
      ) : null}
      <Paper className="p-5">
        <h3 className="font-serif text-xl">{t("修正案")}</h3>
        <p className="mt-2 text-sm leading-6">
          {t("德國的審計案：")}
          {t(amendmentLabel(state.amendmentChoices["de-audit"]))}
        </p>
        <p className="text-sm leading-6">
          {t("美國的私人資本案：")}
          {t(amendmentLabel(state.amendmentChoices["us-private"]))}
        </p>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{t(score.narrative.closing)}</p>
      </Paper>
      <Paper className="p-5">
        <h3 className="font-serif text-xl">{t("核對，而不是照單全收")}</h3>
        <label htmlFor="reflection" className="mt-2 block text-sm leading-6">
          {t(REFLECTION_PROMPT)}
        </label>
        <textarea
          id="reflection"
          value={state.reflection}
          onChange={(event) => dispatch({ type: "SET_REFLECTION", text: event.target.value })}
          rows={4}
          maxLength={300}
          className="mt-3 w-full rounded-sm border border-[#e4d8c4] p-3 text-sm leading-7"
        />
        <p className="mt-2 text-xs text-ink-soft">{t("這段只留在這部瀏覽器，不計分。")}</p>
      </Paper>
      {score.coachMark?.examples.length ? (
        <Paper className="p-5">
          <h3 className="font-serif text-xl">{t("下一場例子")}</h3>
          <p className="mt-2 text-sm leading-7 text-ink-soft">{t(LEVEL_NOTE[score.coachMark.examples[0]?.level ?? 2])}</p>
          <div className="mt-4 space-y-3">
            {score.coachMark.examples.map((pick) => {
              const training = findCase(pick.id);
              if (!training) return null;
              const goal = sdgGoal(training.sdg);
              return (
                <div key={pick.id} className="rounded-sm border border-[#e4d8c4] p-3" data-testid={`example-${pick.id}`}>
                  <p className="text-xs text-brass-deep">{t(`可持續發展目標 ${goal.n}`)} · {t(goal.titleZh)}</p>
                  <p className="mt-1 font-medium">{t(training.titleZh)}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{t(training.questionZh)}</p>
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="ink"
                    data-testid={`practice-${pick.id}`}
                    onClick={() =>
                      dispatch({
                        type: "NEW_SESSION",
                        sessionId: `gv-${Date.now()}`,
                        difficulty: deriveDifficulty(
                          history.some((item) => item.sessionId === score.sessionId) ? history : [...history, score],
                        ),
                        caseId: pick.id,
                      })
                    }
                  >
                    {t("練這個例子")}
                  </Button>
                </div>
              );
            })}
          </div>
        </Paper>
      ) : null}
      <Button data-testid="restart" variant="brass" onClick={restart}>
        {t("再練一場")}
      </Button>
    </div>
  );
}
