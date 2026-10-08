import { useEffect, useRef, useState } from "react";
import { AMENDMENTS, DRAFT_BLANKS, DRAFT_PREAMBLE } from "@/content/draft";
import { DELEGATES } from "@/content/delegates";
import { otherSeats } from "@/content/seats";
import { draftHint } from "@/content/copy";
import { clauseText } from "@/engine/diplomacy";
import { Kicker, Paper, Seal } from "@/components/chamber/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTr } from "@/i18n/useTr";
import { useGame } from "@/state/context";
import type { AmendmentChoice } from "@/types/game";

export function DraftingScreen() {
  const { state } = useGame();
  if (state.amendmentCursor >= 0 && state.amendmentCursor < AMENDMENTS.length) return <AmendmentStep />;
  if (state.amendmentCursor >= AMENDMENTS.length) return <ReadyToVote />;
  return <ComposeDraft />;
}

function ComposeDraft() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const clauses = clauseText(state.blanks, state.bullets);
  const resultRef = useRef<HTMLDivElement>(null);
  const drafts = useRef<Record<string, { custom: string; bulletId?: string }>>({});
  const enough = state.cosponsors.length >= state.difficulty.cosponsorCount;
  useEffect(() => {
    if (!state.solicited) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state.solicited, state.cosponsors.length]);

  const askForCosponsors = () => {
    for (const [blankId, draft] of Object.entries(drafts.current)) {
      const bullet = state.bullets.find((item) => item.id === draft.bulletId);
      const sentence = draft.custom.trim() || bullet?.text || "";
      if (!sentence) continue;
      dispatch({
        type: "SET_BLANK",
        blankId,
        value: { kind: "custom", custom: sentence, bulletId: draft.bulletId },
      });
    }
    dispatch({ type: "SOLICIT" });
  };

  return (
    <div className="space-y-4">
      <div>
        <Kicker>{t("工作文件")}</Kicker>
        <h2 className="mt-1 font-serif text-3xl text-paper">{t("四個關鍵空位")}</h2>
        <p className="mt-2 text-sm leading-6 text-[#d9d0c2]">{t(draftHint(state.difficulty))}</p>
      </div>
      {state.solicited ? (
        <div ref={resultRef}>
          <CosponsorResult />
        </div>
      ) : null}
      <Paper className="p-5 sm:p-6">
        {DRAFT_PREAMBLE.map((line) => (
          <p key={line} className="text-sm leading-7 text-ink-soft">
            {t(line)}
          </p>
        ))}
        <ol className="mt-4 space-y-5">
          {DRAFT_BLANKS.map((blank) => (
            <BlankEditor
              key={blank.id}
              blankId={blank.id}
              clause={clauses[blank.id] ?? ""}
              onDraft={(draft) => {
                drafts.current[blank.id] = draft;
              }}
            />
          ))}
        </ol>
      </Paper>
      <div className="sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-md border border-brass/40 bg-[#0e1c2b]/95 p-3">
        {state.solicited && enough ? (
          <Button data-testid="start-amendments" size="lg" variant="brass" onClick={() => dispatch({ type: "START_AMENDMENTS" })}>
            {t("下一步：處理修正案")}
          </Button>
        ) : null}
        {state.solicited && !enough ? (
          <Button data-testid="working-paper" size="lg" variant="brass" onClick={() => dispatch({ type: "WORK_AS_PAPER" })}>
            {t("連署不足，以工作文件繼續")}
          </Button>
        ) : null}
        {!state.solicited ? (
          <Button data-testid="solicit" size="lg" variant="brass" onClick={askForCosponsors}>
            {t("徵求連署")}
          </Button>
        ) : (
          <Button data-testid="solicit" variant="line" onClick={askForCosponsors}>
            {t("再徵求一次")}
          </Button>
        )}
        {state.actionsLeft > 0 && !enough ? (
          <Button variant="line" onClick={() => dispatch({ type: "BACK_TO_CAUCUS" })}>
            {t(`返回非監管式議會（還有 ${state.actionsLeft} 次）`)}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function BlankEditor({
  blankId,
  clause,
  onDraft,
}: {
  blankId: string;
  clause: string;
  onDraft: (draft: { custom: string; bulletId?: string }) => void;
}) {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const blank = DRAFT_BLANKS.find((item) => item.id === blankId);
  const value = state.blanks[blankId];
  const [custom, setCustom] = useState(value?.kind === "custom" ? (value.custom ?? "") : "");
  const [bulletId, setBulletId] = useState<string | undefined>(value?.kind === "custom" ? value.bulletId : undefined);
  useEffect(() => {
    onDraft({ custom, bulletId });
  }, [custom, bulletId, onDraft]);
  if (!blank) return null;
  const active = state.activeBlankId === blank.id;
  const attached = state.bullets.find((bullet) => bullet.id === bulletId);
  const shown = value?.kind === "custom" ? clause : clause ? t(clause) : "";

  return (
    <li
      className={cn("rounded-sm border p-3", active ? "border-brass" : "border-[#e4d8c4]")}
      onClick={() => dispatch({ type: "FOCUS_BLANK", blankId: blank.id })}
    >
      <p className="text-xs tracking-[0.14em] text-brass-deep">{t(`第 ${blank.numeral} 段 · ${blank.label}`)}</p>
      <p className="mt-1 text-sm leading-7">
        {t(blank.lead)}：{shown || t("（尚未填入）")}
      </p>
      {state.difficulty.hint !== "none" ? <p className="mt-1 text-xs text-ink-soft">{t(blank.hint)}</p> : null}
      <p className="mt-3 text-xs leading-5 text-ink-soft">{t("寫下你願意被表決的句子。論據不能代替這一段。")}</p>
      <textarea
        value={custom}
        onChange={(event) => setCustom(event.target.value)}
        rows={3}
        maxLength={180}
        className="mt-2 w-full rounded-sm border border-[#e4d8c4] p-2 text-sm leading-6"
        placeholder={t("至少 16 字。寫你願意被表決的主張。")}
      />
      <p className="mt-2 text-xs text-ink-soft">{t("附上論據（加分，不是答案）")}</p>
      <div className="mt-1 max-h-32 space-y-1 overflow-y-auto">
        <button
          type="button"
          onClick={() => setBulletId(undefined)}
          className={cn("block w-full rounded-sm border px-2 py-1 text-left text-xs", !bulletId ? "border-brass bg-[#f3e7c8]" : "border-[#e4d8c4]")}
        >
          {t("不附論據")}
        </button>
        {state.bullets.map((bullet) => (
          <button
            key={bullet.id}
            type="button"
            onClick={() => setBulletId(bullet.id)}
            className={cn(
              "block w-full rounded-sm border px-2 py-1 text-left text-xs leading-5",
              bulletId === bullet.id ? "border-brass bg-[#f3e7c8]" : "border-[#e4d8c4]",
            )}
          >
            {t(bullet.text)}
          </button>
        ))}
      </div>
      {attached ? <p className="mt-1 text-xs text-brass-deep">{t("已附論據")}</p> : null}
      <Button
        className="mt-2"
        size="sm"
        variant="quiet"
        onClick={() =>
          dispatch({
            type: "SET_BLANK",
            blankId: blank.id,
            value: { kind: "custom", custom, bulletId },
          })
        }
      >
        {t("使用這句")}
      </Button>
    </li>
  );
}

function CosponsorResult() {
  const { state } = useGame();
  const { t } = useTr();
  const enough = state.cosponsors.length >= state.difficulty.cosponsorCount;
  const ids = otherSeats(state.playerId);
  return (
    <Paper className="p-5">
      <h3 className="font-serif text-2xl">
        {t(`連署 ${state.cosponsors.length}/${state.difficulty.cosponsorCount}`)}
      </h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        {enough
          ? t("人數已經夠。頁面最下方的「下一步：處理修正案」會進入德國和美國的修正。")
          : t("人數還不夠。可以返回非監管式議會，或用頁面最下方的按鈕以工作文件繼續。")}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {ids.map((id) => (
          <li key={id}>
            <span className="font-medium">{t(DELEGATES[id].placard)}：</span>
            {state.cosponsors.includes(id) ? t("願意連署。") : t("不連署。")}
            {t(state.cosponsorNotes[id] ?? "")}
          </li>
        ))}
      </ul>
    </Paper>
  );
}

function AmendmentStep() {
  const { state } = useGame();
  const amendment = AMENDMENTS[state.amendmentCursor];
  if (!amendment) return null;
  return <AmendmentForm key={amendment.id} />;
}

function AmendmentForm() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const amendment = AMENDMENTS[state.amendmentCursor];
  const [counter, setCounter] = useState("");
  if (!amendment) return null;
  const choose = (choice: AmendmentChoice) =>
    dispatch({ type: "RESOLVE_AMENDMENT", amendmentId: amendment.id, choice, text: choice === "counter" ? counter : undefined });
  return (
    <Paper className="p-5 sm:p-6">
      <Kicker>{t(`修正案 ${state.amendmentCursor + 1}/${AMENDMENTS.length}`)}</Kicker>
      <div className="mt-3 flex items-center gap-3">
        <Seal id={amendment.sponsorId} />
        <h2 className="font-serif text-2xl">
          {t(DELEGATES[amendment.sponsorId].placard)} {t("提出修正")}
        </h2>
      </div>
      <p className="mt-4 text-base leading-8">{t(amendment.text)}</p>
      <div className="mt-4 rounded-sm bg-[#f7f1e2] p-3 text-sm leading-7">
        <p className="font-medium">{t("指引")}</p>
        <p>{t(amendment.stakes)}</p>
        <p className="mt-2 text-ink-soft">{t("可以參考這個方向，它不是唯一答案。")}</p>
        <p>{t(amendment.counterText)}</p>
      </div>
      <label htmlFor={`counter-${amendment.id}`} className="mt-4 block text-sm font-medium">
        {t("用你自己的句子寫反建議。至少 16 字。")}
      </label>
      <textarea
        id={`counter-${amendment.id}`}
        data-testid={`counter-${amendment.id}`}
        value={counter}
        onChange={(event) => setCounter(event.target.value)}
        rows={3}
        maxLength={180}
        className="mt-1 w-full rounded-sm border border-[#e4d8c4] p-3 text-sm leading-6"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="quiet" onClick={() => dispatch({ type: "BACK_TO_DRAFT" })}>
          {t("回到空位重寫")}
        </Button>
        <Button data-testid={`amend-${amendment.id}-accept`} variant="quiet" onClick={() => choose("accept")}>
          {t("接受")}
        </Button>
        <Button data-testid={`amend-${amendment.id}-reject`} variant="seal" onClick={() => choose("reject")}>
          {t("拒絕")}
        </Button>
        <Button data-testid={`amend-${amendment.id}-counter`} variant="ink" onClick={() => choose("counter")}>
          {t("提出我寫的反建議")}
        </Button>
      </div>
    </Paper>
  );
}

function ReadyToVote() {
  const { dispatch } = useGame();
  const { t } = useTr();
  return (
    <Paper className="p-6">
      <h2 className="font-serif text-3xl">{t("修正案已處理")}</h2>
      <p className="mt-3 text-sm leading-7">
        {t("接下來唱名表決。簡單多數是贊成多於反對；棄權不計入反對。你的席位會投贊成。通過之後，仍要看核心主張有沒有留在文本裡。")}
      </p>
      <Button className="mt-5" data-testid="open-vote" variant="ink" onClick={() => dispatch({ type: "OPEN_VOTE" })}>
        {t("進入表決")}
      </Button>
    </Paper>
  );
}
