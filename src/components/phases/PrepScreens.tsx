import { DELEGATES } from "@/content/delegates";
import { HIGHLIGHT_MINIMUM } from "@/content/dossier";
import { AIDE_GREETING, CHAIR_OPENING } from "@/content/copy";
import { orderQuizChoices, QUIZ, quizCorrectCount, quizPassed } from "@/content/quiz";
import { Kicker, Paper, Seal } from "@/components/chamber/primitives";
import { DossierView } from "@/components/dossier/DossierView";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTr } from "@/i18n/useTr";
import { useGame } from "@/state/context";

export function ChairScreen() {
  const { t } = useTr();
  return (
    <Paper className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-sea px-2 font-serif text-sm text-paper">{t("席")}</span>
        <div>
          <Kicker>{t("主席")}</Kicker>
          <h2 className="font-serif text-3xl">{t("開幕式")}</h2>
        </div>
      </div>
      <div className="mt-5 space-y-4 text-base leading-8">
        {CHAIR_OPENING.map((paragraph) => (
          <p key={paragraph}>{t(paragraph)}</p>
        ))}
      </div>
      <p className="mt-5 rounded-sm bg-[#f7f1e2] px-3 py-2 text-sm leading-6 text-ink-soft">{t(AIDE_GREETING)}</p>
      <ChairContinue />
    </Paper>
  );
}

function ChairContinue() {
  const { dispatch } = useGame();
  const { t } = useTr();
  return (
    <Button className="mt-6" data-testid="to-dossier" variant="ink" onClick={() => dispatch({ type: "TO_DOSSIER" })}>
      {t("閱讀會議資料")}
    </Button>
  );
}

export function DossierScreen() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const count = state.bullets.filter((bullet) => bullet.source === "highlight").length;
  return (
    <Paper className="p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker>{t("會前輔助")}</Kicker>
          <h2 className="font-serif text-3xl">{t("閱讀卷宗")}</h2>
        </div>
        <p className="text-sm text-ink-soft">{t(`已畫 ${count}/10 · 至少 ${HIGHLIGHT_MINIMUM} 則`)}</p>
      </div>
      <div className="mt-5">
        <DossierView interactive />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button data-testid="to-quiz" variant="ink" disabled={count < HIGHLIGHT_MINIMUM} onClick={() => dispatch({ type: "TO_QUIZ" })}>
          {t("我已選好證據，進入理解檢測")}
        </Button>
      </div>
    </Paper>
  );
}

export function QuizScreen() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const question = QUIZ[state.quizIndex];
  if (!question) return null;
  const chosen = state.quizAnswers[question.id];
  const correct = chosen === question.correctChoiceId;
  const finished = Object.keys(state.quizAnswers).length === QUIZ.length && state.quizIndex === QUIZ.length - 1;
  const correctCount = quizCorrectCount(state.quizAnswers);
  const passed = quizPassed(state.quizAnswers);

  return (
    <Paper className="p-5 sm:p-7">
      <Kicker>{t(`理解檢測 · ${state.quizIndex + 1}/${QUIZ.length}`)}</Kicker>
      <h2 className="mt-2 font-serif text-3xl">{t("你聽懂各席在保護什麼了嗎？")}</h2>
      <p className="mt-4 text-lg leading-8">{t(question.prompt)}</p>
      <div className="mt-4 space-y-2">
        {orderQuizChoices(question.choices, `${state.sessionId}:${question.id}`).map((choice) => {
          const selected = chosen === choice.id;
          const show = Boolean(chosen);
          return (
            <button
              key={choice.id}
              type="button"
              data-testid={`quiz-${question.id}-${choice.id}`}
              disabled={Boolean(chosen)}
              onClick={() => dispatch({ type: "ANSWER", questionId: question.id, choiceId: choice.id })}
              className={cn(
                "block w-full rounded-sm border px-3 py-3 text-left text-sm leading-6",
                selected && correct && "border-laurel bg-[#e5f4ee]",
                selected && !correct && "border-seal bg-[#f8e8e8]",
                show && !selected && choice.id === question.correctChoiceId && "border-laurel",
                !show && "border-[#e4d8c4] hover:border-brass",
              )}
            >
              {t(choice.text)}
            </button>
          );
        })}
      </div>
      {chosen ? <p className="mt-4 text-sm leading-7 text-ink-soft">{t(question.explanation)}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="quiet" onClick={() => dispatch({ type: "TO_DOSSIER" })}>
          {t("返回卷宗")}
        </Button>
        {chosen && !finished ? (
          <Button data-testid="quiz-next" variant="ink" onClick={() => dispatch({ type: "NEXT_QUIZ" })}>
            {t("下一題")}
          </Button>
        ) : null}
        {finished ? (
          <>
            <p className="basis-full text-sm leading-7" data-testid="quiz-result">
              {t(`答對 ${correctCount}/${QUIZ.length}。高於五成才能進入下一頁。`)}
            </p>
            {passed ? (
              <Button data-testid="attend" variant="brass" onClick={() => dispatch({ type: "ATTEND", now: Date.now() })}>
                <Seal id={state.playerId} size="sm" />
                {t(`${DELEGATES[state.playerId].placard}代表出席`)}
              </Button>
            ) : (
              <Button data-testid="quiz-back" variant="seal" onClick={() => dispatch({ type: "ATTEND", now: Date.now() })}>
                {t("回到選例子")}
              </Button>
            )}
          </>
        ) : null}
      </div>
    </Paper>
  );
}
