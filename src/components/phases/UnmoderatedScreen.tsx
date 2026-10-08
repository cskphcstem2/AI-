import { useEffect, useRef, useState } from "react";
import { DELEGATES } from "@/content/delegates";
import { otherSeats } from "@/content/seats";
import { VOICES } from "@/content/voices";
import { countriesTalked, deltaLabel, seatContactsLeft } from "@/engine/diplomacy";
import { VoiceBench } from "@/components/chamber/VoiceBench";
import { Kicker, Paper, Seal } from "@/components/chamber/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTr } from "@/i18n/useTr";
import { useGame } from "@/state/context";
import type { CaucusAction, CountryId } from "@/types/game";

export function UnmoderatedScreen() {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const selected = state.selectedDelegateId;

  return (
    <div className="space-y-4">
      <div>
        <Kicker>{t("非監管式議會")}</Kicker>
        <h2 className="mt-1 font-serif text-3xl text-paper">{t("五席都開得了")}</h2>
        <p className="mt-2 text-sm leading-6 text-[#d9d0c2]">
          {t("點另一國就換過去。跟完一國不會鎖住其他國。每一席各自可以再談三次。")}
          {t("至少要跟三個國家談過，才能寫草案。")}
          {t(`目前已跟 ${countriesTalked(state.caucusLog)} 國談過。`)}
        </p>
      </div>
      <div className="sticky top-0 z-20 grid gap-2 bg-[#0b1520]/95 py-2 sm:grid-cols-5">
        {otherSeats(state.playerId).map((id) => {
          const thread = state.threads[id];
          const open = selected === id;
          return (
            <button
              key={id}
              type="button"
              data-testid={`caucus-${id}`}
              onClick={() => dispatch({ type: "SELECT_DELEGATE", delegateId: id })}
              className={cn(
                "rounded-sm border px-2 py-2 text-left text-sm",
                open ? "border-brass bg-brass text-ink" : "border-white/15 text-paper",
              )}
            >
              <span className="block font-medium">{t(DELEGATES[id].placard)}</span>
              <span className={cn("mt-1 block text-[11px] leading-4", open ? "text-ink/80" : "text-[#d9d0c2]")}>
                {t(thread.moodLabel)}
                {thread.turns.length > 0 ? t(` · ${Math.floor(thread.turns.length / 2)} 則`) : ""}
              </span>
            </button>
          );
        })}
      </div>
      {selected ? (
        <DelegateRoom key={selected} delegateId={selected} />
      ) : (
        <p className="text-sm text-[#d9d0c2]">{t("先選一個席位。每一席的紀錄只留在那一席。")}</p>
      )}
      <Button data-testid="to-draft" variant="paper" onClick={() => dispatch({ type: "TO_DRAFT" })}>
        {t("結束接觸，進入草案")}
      </Button>
    </div>
  );
}

function SpeakOrType({ input, onInput }: { input: "voice" | "type"; onInput: (next: "voice" | "type") => void }) {
  const { t } = useTr();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onInput("voice")}
        className={cn("rounded-sm border px-3 py-1.5 text-sm", input === "voice" ? "border-ink bg-ink text-paper" : "border-[#e4d8c4] bg-white")}
      >
        {t("語音發言")}
      </button>
      <button
        type="button"
        onClick={() => onInput("type")}
        className={cn("rounded-sm border px-3 py-1.5 text-sm", input === "type" ? "border-ink bg-ink text-paper" : "border-[#e4d8c4] bg-white")}
      >
        {t("打字寫這一句")}
      </button>
    </div>
  );
}

function DelegateRoom({ delegateId }: { delegateId: CountryId }) {
  const { state, dispatch } = useGame();
  const { t } = useTr();
  const thread = state.threads[delegateId];
  const voice = VOICES[delegateId];
  const delegate = DELEGATES[delegateId];
  const [action, setAction] = useState<CaucusAction>("propose");
  const [input, setInput] = useState<"voice" | "type">("voice");
  const [bulletId, setBulletId] = useState<string | undefined>();
  const [line, setLine] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const latest = [...state.caucusLog].reverse().find((item) => item.delegateId === delegateId);
  const seatLeft = seatContactsLeft(state.caucusLog, delegateId);

  useEffect(() => {
    const node = endRef.current?.parentElement;
    if (node) node.scrollTop = node.scrollHeight;
  }, [thread.turns.length]);

  return (
    <Paper className="p-5" data-testid={`desk-${delegateId}`}>
      <div className="flex items-start gap-3">
        <Seal id={delegateId} />
        <div className="min-w-0">
          <p className="font-serif text-2xl">{t(delegate.countryZh)}</p>
          <p className="text-sm text-ink-soft" data-testid={`mood-${delegateId}`}>
            {t(thread.moodLabel)}
          </p>
          <p className="mt-2 text-sm leading-6">
            <span className="text-brass-deep">{t("這一席要寫進草案的一句。 ")}</span>
            {t(thread.aim)}
          </p>
        </div>
      </div>
      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1" data-testid={`thread-${delegateId}`}>
        {thread.turns.length === 0 ? (
          <p className="rounded-sm bg-[#f3e7c8] px-3 py-2 text-sm leading-6">{t(voice.greeting)}</p>
        ) : (
          thread.turns.map((turn) => (
            <div key={turn.id} className={cn("flex", turn.speaker === state.playerId ? "justify-end" : "justify-start")}>
              <p
                className={cn(
                  "max-w-[36rem] rounded-sm px-3 py-2 text-sm leading-6",
                  turn.speaker === state.playerId ? "bg-ink text-paper" : "bg-[#f3e7c8]",
                )}
              >
                <span className="mb-1 block text-[11px] opacity-70">
                  {turn.speaker === state.playerId ? t(DELEGATES[state.playerId].placard) : t(delegate.placard)}
                </span>
                {t(turn.text)}
              </p>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      {latest ? <p className="mt-3 text-xs text-brass-deep">{t(deltaLabel(latest.delta))}</p> : null}
      <div className="mt-4">
        <p className="text-xs text-ink-soft">
          {t("換一國繼續談")}
          {t(`這一席還可以再談 ${seatLeft} 次。`)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {otherSeats(state.playerId)
            .filter((id) => id !== delegateId)
            .map((id) => {
            const talked = state.caucusLog.some((item) => item.delegateId === id);
            return (
              <button
                key={id}
                type="button"
                data-testid={`switch-${id}`}
                onClick={() => dispatch({ type: "SELECT_DELEGATE", delegateId: id })}
                className="rounded-sm border border-[#e4d8c4] bg-white px-3 py-1.5 text-sm"
              >
                {t(DELEGATES[id].placard)}
                {talked ? "" : t(" · 未談")}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["propose", "提出我的方案"],
            ["redline", "詢問紅線"],
            ["condition", "詢問合作條件"],
            ["persuade", "用論據說服"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setAction(value)}
            className={cn("rounded-sm px-3 py-1.5 text-sm", action === value ? "bg-ink text-paper" : "bg-white/70")}
          >
            {t(label)}
          </button>
        ))}
      </div>
      {action === "propose" ? (
        <div className="mt-3 space-y-2">
          <p className="rounded-sm bg-[#f3e7c8] px-3 py-2 text-sm leading-6">
            {t("指引：對照這一席要守住的句子來寫。方案必須是你的話，論據只加說服力。")}
          </p>
          <SpeakOrType input={input} onInput={setInput} />
          {input === "voice" ? (
            <VoiceBench
              occasion="moderated"
              notes={line}
              onNotes={setLine}
              notesLabel="你的方案"
              bullets={state.bullets}
              onDeliver={(spoken) => {
                dispatch({
                  type: "CAUCUS",
                  delegateId,
                  action: "propose",
                  bulletId,
                  playerLine: spoken,
                  fromVoice: true,
                });
                setLine("");
              }}
            />
          ) : (
            <>
              <label htmlFor={`plan-${delegateId}`} className="block text-sm">
                {t("你的方案")}
              </label>
              <textarea
                id={`plan-${delegateId}`}
                data-testid="own-proposal"
                value={line}
                onChange={(event) => setLine(event.target.value)}
                rows={4}
                maxLength={240}
                placeholder={t("至少 16 字。寫你願意被表決的主張。")}
                className="w-full rounded-sm border border-[#e4d8c4] p-3 text-sm leading-6"
              />
            </>
          )}
          <p className="text-xs text-ink-soft">{t("可選：附上論據，增加說服力")}</p>
          <div className="max-h-36 space-y-2 overflow-y-auto">
            <button
              type="button"
              onClick={() => setBulletId(undefined)}
              className={cn("block w-full rounded-sm border px-3 py-2 text-left text-sm", !bulletId ? "border-brass bg-[#f3e7c8]" : "border-[#e4d8c4]")}
            >
              {t("不附論據")}
            </button>
            {state.bullets.map((bullet) => (
              <button
                key={bullet.id}
                type="button"
                onClick={() => setBulletId(bullet.id)}
                className={cn(
                  "block w-full rounded-sm border px-3 py-2 text-left text-sm",
                  bulletId === bullet.id ? "border-brass bg-[#f3e7c8]" : "border-[#e4d8c4]",
                )}
              >
                {t(bullet.text)}
                <span className="mt-1 block text-xs text-ink-soft">{t(bullet.note || bullet.origin)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {action === "persuade" ? (
        <div className="mt-3 space-y-2">
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {state.bullets.map((bullet) => (
              <button
                key={bullet.id}
                type="button"
                onClick={() => setBulletId(bullet.id)}
                className={cn(
                  "block w-full rounded-sm border px-3 py-2 text-left text-sm",
                  bulletId === bullet.id ? "border-brass bg-[#f3e7c8]" : "border-[#e4d8c4]",
                )}
              >
                {t(bullet.text)}
              </button>
            ))}
          </div>
          <SpeakOrType input={input} onInput={setInput} />
          {input === "voice" ? (
            <VoiceBench
              occasion="moderated"
              notes={line}
              onNotes={setLine}
              notesLabel="你希望這一席聽見的一句話"
              bullets={state.bullets}
              onDeliver={(spoken) => {
                dispatch({
                  type: "CAUCUS",
                  delegateId,
                  action: "persuade",
                  bulletId,
                  playerLine: spoken,
                  fromVoice: true,
                });
                setLine("");
              }}
            />
          ) : (
            <>
              <label htmlFor={`pitch-${delegateId}`} className="block text-sm">
                {t("你希望這一席聽見的一句話")}
              </label>
              <textarea
                id={`pitch-${delegateId}`}
                value={line}
                onChange={(event) => setLine(event.target.value)}
                rows={3}
                maxLength={160}
                className="w-full rounded-sm border border-[#e4d8c4] p-3 text-sm leading-6"
              />
            </>
          )}
        </div>
      ) : null}
      {input === "voice" && (action === "propose" || action === "persuade") ? null : (
        <Button
          className="mt-4"
          data-testid="caucus-act"
          variant="ink"
          disabled={seatLeft <= 0}
          onClick={() =>
            dispatch({
              type: "CAUCUS",
              delegateId,
              action,
              bulletId: action === "persuade" || action === "propose" ? bulletId : undefined,
              playerLine: action === "persuade" || action === "propose" ? line : undefined,
            })
          }
        >
          {seatLeft <= 0 ? t("這一席先聽到這裡") : action === "propose" ? t("送出方案") : t(`送出給${delegate.placard}`)}
        </Button>
      )}
    </Paper>
  );
}
