import { useState } from "react";
import { openingHint } from "@/content/copy";
import { DELEGATES } from "@/content/delegates";
import { humanSeatsOf, speechOrder } from "@/content/seats";
import { RubricCard } from "@/components/chamber/RubricCard";
import { VoiceBench } from "@/components/chamber/VoiceBench";
import { Kicker, Paper, Seal } from "@/components/chamber/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTr } from "@/i18n/useTr";
import { useGame } from "@/state/context";
import type { CountryId } from "@/types/game";

export function OpeningScreen() {
  const { state } = useGame();
  const { t } = useTr();
  const humans = humanSeatsOf(state);
  const mySpeechDone = Boolean(state.openingSpeeches?.[state.playerId]?.trim());
  const waitingOthers =
    state.openingStep === "write" && mySpeechDone && humans.some((seat) => !state.openingSpeeches?.[seat]?.trim());

  return (
    <div className="space-y-4">
      <div>
        <Kicker>{t("各自發言")}</Kicker>
        <h2 className="mt-1 font-serif text-3xl text-paper">{t("先說你的基本看法")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d9d0c2]">{t(openingHint(state.difficulty))}</p>
        {state.mode === "online" ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-brass">
            {t(
              `聯機開場：真人席 ${humans.map((id) => DELEGATES[id].placard).join("、")} 各自發言；其餘由 AI 補充。`,
            )}
          </p>
        ) : null}
      </div>
      {state.openingStep === "write" && !mySpeechDone ? <Composer /> : null}
      {waitingOthers ? <WaitingHumans /> : null}
      {state.openingStep !== "write" ? <Floor /> : null}
      {state.openingStep === "secretariat" ? <Secretariat /> : null}
    </div>
  );
}

function WaitingHumans() {
  const { state } = useGame();
  const { t } = useTr();
  const humans = humanSeatsOf(state);
  return (
    <Paper className="p-5">
      <Kicker>{t("等候其他代表")}</Kicker>
      <h3 className="mt-1 font-serif text-2xl">{t("你的開場已送出")}</h3>
      <p className="mt-2 text-sm leading-7 text-ink-soft">
        {t("其餘真人代表完成開場後，會一起進入聽取 AI 席位發言。")}
      </p>
      <ul className="mt-4 space-y-2">
        {humans.map((id) => {
          const done = Boolean(state.openingSpeeches?.[id]?.trim());
          return (
            <li key={id} className="flex items-center justify-between rounded-sm bg-[#f7f1e2] px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <Seal id={id} size="sm" />
                {t(DELEGATES[id].placard)}
              </span>
              <span className={done ? "text-brass-deep" : "text-ink-soft"}>{done ? t("已發言") : t("撰寫中")}</span>
            </li>
          );
        })}
      </ul>
      {state.speechAssessment ? (
        <div className="mt-4">
          <OpeningRubric />
        </div>
      ) : null}
    </Paper>
  );
}

function Composer() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const [mode, setMode] = useState<"voice" | "type">("voice");
  const min = state.difficulty.speechMinChars;

  return (
    <Paper className="p-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="opening-voice-mode"
          onClick={() => setMode("voice")}
          className={cn(
            "rounded-sm border px-3 py-1.5 text-sm",
            mode === "voice" ? "border-ink bg-ink text-paper" : "border-[#e4d8c4] bg-white text-ink",
          )}
        >
          {t("語音發言")}
        </button>
        <button
          type="button"
          data-testid="opening-type-mode"
          onClick={() => setMode("type")}
          className={cn(
            "rounded-sm border px-3 py-1.5 text-sm",
            mode === "type" ? "border-ink bg-ink text-paper" : "border-[#e4d8c4] bg-white text-ink",
          )}
        >
          {t("打字寫開場")}
        </button>
      </div>
      {mode === "type" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-6">
            {t(
              `在下面寫出你的開場主張。右側論據可以插進句子。送出之後這段文字會記入會議，秘書處整理後會收成論據。至少寫到 ${min} 字。`,
            )}
          </p>
          <label htmlFor="opening-typed" className="block text-sm font-medium">
            {t("開場主張")}
          </label>
          <textarea
            id="opening-typed"
            data-testid="opening-typed"
            value={state.composer}
            onChange={(event) => dispatch({ type: "SET_COMPOSER", text: event.target.value })}
            rows={8}
            maxLength={600}
            placeholder={t("寫出你代表這一席的基本看法、理由，以及你希望會議做出什麼決定。")}
            className="w-full resize-y rounded-sm border border-[#e4d8c4] bg-white/70 p-3 text-sm leading-7 outline-none"
          />
          <p className="text-xs text-ink-soft">
            {state.composer.trim().length}/{min} {t("字起計")} · {t("送出後會按七項標準評分，並顯示雷達圖。")}
          </p>
          <Button
            data-testid="opening-type-submit"
            variant="brass"
            onClick={() => dispatch({ type: "SUBMIT_SPEECH", text: state.composer, actorSeat: state.playerId })}
          >
            {t("用打字送出開場")}
          </Button>
          {state.speechAssessment && !state.speechAssessment.longEnough ? (
            <ul className="list-disc pl-5 text-sm leading-6 text-ink-soft">
              {state.speechAssessment.notes.map((note) => (
                <li key={note}>{t(note)}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm leading-6">
            {t(
              `講稿可以先寫，也可以把右側論據插進講稿。正式發言請按「開始發言」，說完才會計入會議。至少說到 ${min} 字。`,
            )}
          </p>
          <VoiceBench
            occasion="opening"
            notes={state.composer}
            onNotes={(text) => dispatch({ type: "SET_COMPOSER", text })}
            notesLabel="開場講稿"
            bullets={state.bullets}
            onDeliver={(text, delivery) =>
              dispatch({ type: "SUBMIT_SPEECH", text, delivery, actorSeat: state.playerId })
            }
          />
          {state.speechAssessment && !state.speechAssessment.longEnough ? (
            <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-ink-soft">
              {state.speechAssessment.notes.map((note) => (
                <li key={note}>{t(note)}</li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </Paper>
  );
}

function Floor() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const humans = humanSeatsOf(state);
  const order = speechOrder(state.playerId, humans);
  const revealed = order.slice(0, state.aiRevealed);
  const next = order[state.aiRevealed];
  return (
    <div className="space-y-3">
      {state.speechAssessment ? (
        <Paper className="p-4">
          <p className="text-xs text-brass-deep">{t("結構回饋 · 不是立場對錯")}</p>
          <ul className="mt-2 list-disc pl-5 text-sm leading-6">
            {state.speechAssessment.notes.map((note) => (
              <li key={note}>{t(note)}</li>
            ))}
          </ul>
          <OpeningRubric />
        </Paper>
      ) : null}
      {humans.map((id) => {
        const text = state.openingSpeeches?.[id] ?? (id === state.playerId ? state.playerSpeech : "");
        if (!text) return null;
        return <SpeechCard key={id} speaker={id} text={text} human />;
      })}
      {revealed.map((id) => (
        <SpeechCard key={id} speaker={id} text={DELEGATES[id].openingSpeech} />
      ))}
      {state.openingStep === "floor" && next ? (
        <Button data-testid="reveal-speaker" variant="paper" onClick={() => dispatch({ type: "REVEAL_SPEAKER" })}>
          {t(`請${DELEGATES[next].placard}代表發言`)}
        </Button>
      ) : null}
      {state.openingStep === "floor" && !next ? (
        <Button data-testid="secretariat" variant="paper" onClick={() => dispatch({ type: "REVEAL_SECRETARIAT" })}>
          {t("請秘書處整理發言")}
        </Button>
      ) : null}
    </div>
  );
}

function OpeningRubric() {
  const { state } = useGame();
  const review = state.presentations?.filter((item) => item.occasion === "opening").at(-1);
  if (!review) return null;
  return <RubricCard review={review} text={state.playerSpeech} />;
}

function SpeechCard({
  speaker,
  text,
  human = false,
}: {
  speaker: CountryId;
  text: string;
  human?: boolean;
}) {
  const { t } = useTr();
  const delegate = DELEGATES[speaker];
  return (
    <Paper className="p-4">
      <div className="flex items-center gap-3">
        <Seal id={speaker} size="sm" />
        <div>
          <p className="font-medium">{t(delegate.countryZh)}</p>
          <p className="text-xs text-ink-soft">
            {human ? t("真人代表") : t(delegate.style)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-7">{human ? text : t(text)}</p>
    </Paper>
  );
}

function Secretariat() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const summaries = state.bullets.filter((bullet) => bullet.source === "secretariat");
  return (
    <Paper className="p-5">
      <Kicker>{t("秘書處")}</Kicker>
      <h3 className="mt-1 font-serif text-2xl">{t("發言摘要已收入論據")}</h3>
      <p className="mt-2 text-sm leading-7 text-ink-soft">
        {t("這些短句記錄誰說了什麼，不是事實核查。引用某一席的摘要，是在回應那一席；引用事實摘要，是在動用資料。兩種都要加上你自己的推理。")}
      </p>
      <ul className="mt-4 space-y-2">
        {summaries.map((bullet) => (
          <li key={bullet.id} className="rounded-sm bg-[#f7f1e2] px-3 py-2 text-sm leading-6">
            {t(bullet.text)}
            <span className="mt-1 block text-xs text-ink-soft">{t(bullet.origin)}</span>
          </li>
        ))}
      </ul>
      <Button className="mt-5" data-testid="to-moderated" variant="ink" onClick={() => dispatch({ type: "TO_MODERATED" })}>
        {t("進入有秩序動議")}
      </Button>
    </Paper>
  );
}
