import { useAuth } from "@/auth/AuthContext";
import { AccountBar } from "@/components/chamber/AccountBar";
import { Kicker, Mark, Paper, Seal } from "@/components/chamber/primitives";
import { Button } from "@/components/ui/button";
import { findCase, seatsForCase } from "@/content/cases";
import { DELEGATES } from "@/content/delegates";
import { LanguageBar } from "@/i18n/LanguageBar";
import { useTr } from "@/i18n/useTr";
import { cn } from "@/lib/utils";
import { useMultiplayer } from "@/multiplayer/MultiplayerContext";
import { MAX_HUMAN_PLAYERS, aiSeatsFor, listPlayers } from "@/multiplayer/types";
import { useGame } from "@/state/context";

export function RoomLobbyScreen() {
  const { user } = useAuth();
  const { state } = useGame();
  const { t } = useTr();
  const mp = useMultiplayer();
  const room = mp.room;
  if (!room || !user) return null;
  const training = findCase(state.caseId);
  const seats = seatsForCase(state.caseId);

  const players = listPlayers(room);
  const me = room.players[user.id];
  const myReady = Boolean(me?.ready);
  const seatedIds = players.map((p) => p.seatId).filter((seat): seat is NonNullable<typeof seat> => Boolean(seat));
  const aiSeats = aiSeatsFor(seatedIds, seats);

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 text-brass">
        <div className="flex items-center gap-3">
          <Mark className="size-12" />
          <div>
            <Kicker>{t("聯機議場")}</Kicker>
            <p className="font-serif text-lg text-paper">{t("聯機議場")}</p>
          </div>
        </div>
        <AccountBar tone="dark" />
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <div>
          <p className="text-sm tracking-[0.22em] text-brass">{t("聯機議場")} {room.code}</p>
          <h1 className="mt-2 font-serif text-4xl text-paper sm:text-5xl">{t("選席等候開議")}</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#e7dfd0]">
            {t(
              `最多 ${MAX_HUMAN_PLAYERS} 位真人代表不同國家發言，其餘席位由輔助智能補充。選定席位後按「準備就緒」，房主開議。`,
            )}
          </p>
          <div className="mt-5">
            <p className="mb-2 text-sm text-brass">{t("會議語言")}</p>
            <LanguageBar mode="session" />
          </div>
          <div className="mt-6">
            <p className="mb-2 text-sm text-brass">{t("選擇你的席位")}</p>
            {training ? (
              <p className="mb-3 text-sm leading-6 text-[#e7dfd0]">
                {t(training.titleZh)}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {seats.map((id) => {
                const seat = DELEGATES[id];
                const holder = players.find((p) => p.seatId === id);
                const mine = mp.mySeat === id;
                const taken = Boolean(holder && !mine);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={taken || mp.busy}
                    data-testid={`room-seat-${id}`}
                    onClick={() => void mp.claim(mine ? null : id)}
                    className={cn(
                      "rounded-sm border px-3 py-3 text-left",
                      mine
                        ? "border-brass bg-brass text-ink"
                        : taken
                          ? "cursor-not-allowed border-white/10 bg-white/5 text-[#9a9184]"
                          : "border-white/15 bg-white/5 text-paper",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Seal id={id} size="sm" />
                      <span className="font-serif text-lg">{t(seat.placard)}</span>
                    </span>
                    <span className={cn("mt-2 block text-xs leading-5", mine ? "text-ink/80" : "text-[#d9d0c2]")}>
                      {taken
                        ? t(`已由 ${holder!.displayName} 代表`)
                        : mine
                          ? t("你的席位 · 再點取消")
                          : t(seat.interests[0] ?? "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              data-testid="room-ready"
              size="lg"
              disabled={!mp.mySeat || mp.busy}
              onClick={() => void mp.ready(!myReady)}
            >
              {myReady ? t("取消就緒") : t("準備就緒")}
            </Button>
            {mp.isHost ? (
              <Button
                data-testid="room-start"
                size="lg"
                variant="brass"
                disabled={mp.busy}
                onClick={() =>
                  void mp.start({
                    ui: state.uiLanguage,
                    speech: state.speechLanguage,
                  })
                }
              >
                {t("開議")}
              </Button>
            ) : null}
            <Button size="lg" variant="line" disabled={mp.busy} onClick={() => void mp.leave()}>
              {t("離開房間")}
            </Button>
          </div>
          {mp.error ? <p className="mt-3 text-sm text-[#f0c4a8]">{mp.error}</p> : null}
        </div>

        <Paper className="p-5">
          <Kicker>{t("本房代表")}</Kicker>
          <p className="mt-2 text-sm text-ink-soft">
            {t(`真人 ${players.length}/${MAX_HUMAN_PLAYERS}`)}
            {mp.isHost ? ` · ${t("你是房主")}` : ""}
          </p>
          <ul className="mt-4 space-y-2">
            {players.map((player) => (
              <li
                key={player.uid}
                className="flex items-center justify-between gap-2 rounded-sm bg-[#f7f1e2] px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-medium">{player.displayName}</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    {player.seatId ? t(DELEGATES[player.seatId].placard) : t("尚未選席")}
                    {player.uid === room.hostId ? ` · ${t("房主")}` : ""}
                  </span>
                </span>
                <span className={cn("text-xs", player.ready ? "text-brass-deep" : "text-ink-soft")}>
                  {player.ready ? t("就緒") : t("未就緒")}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-[#e4d8c4] pt-3">
            <p className="text-xs text-ink-soft">{t("輔助智能將代表")}</p>
            <p className="mt-1 text-sm leading-6">
              {aiSeats.length ? aiSeats.map((id) => t(DELEGATES[id].placard)).join("、") : t("（全席皆由真人代表）")}
            </p>
          </div>
        </Paper>
      </div>
    </div>
  );
}
