import { useState } from "react";
import { DELEGATES } from "@/content/delegates";
import { floorScript, loc } from "@/content/floor";
import { ideaMinChars, visibleOpener } from "@/engine/floorTrial";
import { RubricCard } from "@/components/chamber/RubricCard";
import { VoiceBench } from "@/components/chamber/VoiceBench";
import { Kicker, Paper, Seal } from "@/components/chamber/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTr } from "@/i18n/useTr";
import { useGame } from "@/state/context";
import type { InterventionMode, PresentationReview } from "@/types/game";

export function ModeratedScreen() {
  const { state, dispatch } = useGame();
  const { t, lang } = useTr();
  const script = floorScript(state.floor.round);
  const opener = visibleOpener(state.floor.round, state.playerId, lang);
  const usesLeft = state.difficulty.maxBulletUses - state.bulletUses;

  return (
    <div className="space-y-4">
      <div>
        <Kicker>{t("有秩序動議 · 輪流發言")}</Kicker>
        <p className="mt-1 text-xs tracking-[0.14em] text-brass">{t(`第 ${state.floor.round} 輪 / 3`)}</p>
        <h2 className="mt-1 font-serif text-3xl leading-snug text-paper">{loc(lang, script.promptZh, script.promptEn)}</h2>
        <p className="mt-2 text-sm leading-6 text-[#d9d0c2]">{loc(lang, script.guideZh, script.guideEn)}</p>
      </div>
      <div className="space-y-3">
        {state.floor.lines.map((line) => (
          <Paper key={line.id} className="p-4">
            <div className="flex items-center gap-2">
              <Seal id={line.speaker} size="sm" />
              <p className="font-medium">{t(DELEGATES[line.speaker].placard)}</p>
            </div>
            <p className="mt-2 text-sm leading-7">
              {line.speaker === state.playerId && (line.role === "idea" || line.role === "answer") ? line.text : t(line.text)}
            </p>
          </Paper>
        ))}
        {state.floor.beat === "listen" ? (
          <Paper className="p-4">
            <div className="flex items-center gap-2">
              <Seal id={opener.id} size="sm" />
              <p className="font-medium">{t(DELEGATES[opener.id].placard)}</p>
            </div>
            <p className="mt-2 text-sm leading-7">{opener.catalog ? t(opener.text) : opener.text}</p>
          </Paper>
        ) : null}
      </div>
      {state.floor.beat === "listen" ? (
        <Button variant="paper" data-testid="floor-turn" onClick={() => dispatch({ type: "FLOOR_TURN" })}>
          {t("輪到我了")}
        </Button>
      ) : null}
      {state.floor.beat === "player" ? (
        <IdeaComposer usesLeft={usesLeft} minChars={ideaMinChars(state.difficulty.speechMinChars)} questionTags={script.tags} />
      ) : null}
      {state.floor.beat === "answer" || state.floor.beat === "listen" ? <LatestSpeechScore /> : null}
      {state.floor.beat === "answer" ? <AnswerComposer lastRound={state.floor.round >= 3} /> : null}
      {state.floor.beat === "done" ? (
        <Paper className="p-5">
          <p className="text-sm leading-7">{t("三輪說完了。討論收成已放進論據清單。")}</p>
          <ModeratedRubric />
          <Button className="mt-4" variant="ink" data-testid="to-caucus" onClick={() => dispatch({ type: "TO_CAUCUS" })}>
            {t("進入非監管式議會")}
          </Button>
        </Paper>
      ) : null}
    </div>
  );
}

function latestModerated(presentations: PresentationReview[] | undefined) {
  return presentations?.filter((item) => item.occasion === "moderated").at(-1);
}

function latestSpoken(state: { playerId: string; floor: { lines: { speaker: string; text: string }[] } }) {
  return [...state.floor.lines].reverse().find((line) => line.speaker === state.playerId)?.text;
}

function ModeratedRubric() {
  const { state } = useGame();
  const review = latestModerated(state.presentations);
  if (!review) return null;
  return <RubricCard review={review} text={latestSpoken(state)} />;
}

function LatestSpeechScore() {
  const { state } = useGame();
  const review = latestModerated(state.presentations);
  if (!review) return null;
  return <RubricCard review={review} text={latestSpoken(state)} />;
}

function IdeaComposer({
  usesLeft,
  minChars,
  questionTags,
}: {
  usesLeft: number;
  minChars: number;
  questionTags: string[];
}) {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const [mode, setMode] = useState<InterventionMode>("speech");
  const [input, setInput] = useState<"voice" | "type">("voice");
  const [text, setText] = useState("");
  const [bulletId, setBulletId] = useState<string | undefined>();
  const latest = [...state.interventions].reverse().find((item) => item.questionId === `floor-${state.floor.round}`);

  return (
    <Paper className="p-5">
      <p className="text-sm leading-6">{t("選一則論據。它只加強這一句，不能代替你的想法。")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ["speech", "只發表想法"],
            ["support", "附上論據支持"],
            ["rebut", "附上論據反駁"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            data-testid={`mode-${value}`}
            onClick={() => setMode(value)}
            className={cn("rounded-sm px-3 py-1.5 text-sm", mode === value ? "bg-ink text-paper" : "bg-white/70")}
          >
            {t(label)}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        {t(`論據指證剩餘 ${usesLeft} 次。用完之後仍可普通發言。`)}
      </p>
      {mode !== "speech" ? (
        <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
          {state.bullets.map((bullet) => (
            <button
              key={bullet.id}
              type="button"
              onClick={() => setBulletId(bullet.id)}
              className={cn(
                "block w-full rounded-sm border px-3 py-2 text-left text-sm leading-6",
                bulletId === bullet.id ? "border-brass bg-[#f3e7c8]" : "border-[#e4d8c4]",
              )}
            >
              {t(bullet.text)}
              <span className="mt-1 block text-xs text-ink-soft">{t(bullet.note || bullet.origin)}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="floor-voice-mode"
          onClick={() => setInput("voice")}
          className={cn("rounded-sm border px-3 py-1.5 text-sm", input === "voice" ? "border-ink bg-ink text-paper" : "border-[#e4d8c4] bg-white")}
        >
          {t("語音發言")}
        </button>
        <button
          type="button"
          data-testid="floor-type-mode"
          onClick={() => setInput("type")}
          className={cn("rounded-sm border px-3 py-1.5 text-sm", input === "type" ? "border-ink bg-ink text-paper" : "border-[#e4d8c4] bg-white")}
        >
          {t("打字寫這一句")}
        </button>
      </div>
      {input === "voice" ? (
        <VoiceBench
          occasion="moderated"
          notes={text}
          onNotes={setText}
          notesLabel="進一步想法"
          questionTags={questionTags}
          bullets={state.bullets}
          onDeliver={(spoken, delivery) =>
            dispatch({
              type: "FLOOR_SPEAK",
              mode,
              text: spoken,
              bulletId: mode === "speech" ? undefined : bulletId,
              delivery,
            })
          }
        />
      ) : (
        <>
          <label htmlFor="floor-idea" className="mt-3 block text-sm font-medium">
            {t("進一步想法")}
          </label>
          <textarea
            id="floor-idea"
            data-testid="floor-idea"
            data-min-chars={minChars}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            maxLength={400}
            className="mt-1 w-full rounded-sm border border-[#e4d8c4] p-3 text-sm leading-6"
          />
          <Button
            className="mt-3"
            variant="ink"
            data-testid="floor-speak"
            onClick={() => dispatch({ type: "FLOOR_SPEAK", mode, text, bulletId: mode === "speech" ? undefined : bulletId })}
          >
            {t("送出這一句")}
          </Button>
        </>
      )}
      {latest ? <p className="mt-3 text-sm leading-7 text-ink-soft">{t(latest.feedback)}</p> : null}
    </Paper>
  );
}

function AnswerComposer({ lastRound }: { lastRound: boolean }) {
  const { dispatch } = useGame();
  const { t } = useTr();
  const [input, setInput] = useState<"voice" | "type">("voice");
  const [text, setText] = useState("");
  return (
    <Paper className="p-5">
      <p className="text-sm leading-7">{t("對方已經回應。你可以再應對，也可以不回應。")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="answer-voice-mode"
          onClick={() => setInput("voice")}
          className={cn("rounded-sm border px-3 py-1.5 text-sm", input === "voice" ? "border-ink bg-ink text-paper" : "border-[#e4d8c4] bg-white")}
        >
          {t("語音發言")}
        </button>
        <button
          type="button"
          data-testid="answer-type-mode"
          onClick={() => setInput("type")}
          className={cn("rounded-sm border px-3 py-1.5 text-sm", input === "type" ? "border-ink bg-ink text-paper" : "border-[#e4d8c4] bg-white")}
        >
          {t("打字寫這一句")}
        </button>
      </div>
      {input === "voice" ? (
        <VoiceBench
          occasion="moderated"
          notes={text}
          onNotes={setText}
          notesLabel="寫下你的應對"
          onDeliver={(spoken, delivery) => dispatch({ type: "FLOOR_ANSWER", text: spoken, delivery })}
        />
      ) : (
        <>
          <label htmlFor="floor-answer" className="mt-3 block text-sm font-medium">
            {t("寫下你的應對")}
          </label>
          <textarea
            id="floor-answer"
            data-testid="floor-answer"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            maxLength={240}
            className="mt-1 w-full rounded-sm border border-[#e4d8c4] p-3 text-sm leading-6"
          />
          <Button className="mt-3" variant="ink" data-testid="floor-reply" onClick={() => dispatch({ type: "FLOOR_ANSWER", text })}>
            {t("應對")}
          </Button>
        </>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="quiet" data-testid="floor-pass" onClick={() => dispatch({ type: "FLOOR_PASS" })}>
          {lastRound ? t("不回應，收成論據") : t("不回應，下一輪")}
        </Button>
      </div>
    </Paper>
  );
}
