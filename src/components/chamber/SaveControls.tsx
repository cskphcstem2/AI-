import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { PHASE_LABEL } from "@/content/copy";
import { Button } from "@/components/ui/button";
import { languageMeta } from "@/i18n/languages";
import { useTr } from "@/i18n/useTr";
import { writeAccountSave } from "@/state/accountRecord";
import { useGame } from "@/state/context";
import { recallSave, rememberSave } from "@/state/storage";

export function SaveControls() {
  const { state, dispatch } = useGame();
  const { user } = useAuth();
  const { t, lang } = useTr();
  const [slot, setSlot] = useState(() => recallSave());
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setSlot(recallSave());
    window.addEventListener("gv-account-save", refresh);
    return () => window.removeEventListener("gv-account-save", refresh);
  }, []);

  function store() {
    const file = rememberSave(state);
    setSlot(file);
    setFeedback("已存進這個帳號。下次用同一個帳號登入即可繼續。");
    if (!user) return;
    void writeAccountSave(user.id, file).catch(() => {
      setFeedback("帳號存檔沒有寫上。這一刻仍留在這部瀏覽器。");
    });
  }

  function openSlot() {
    const saved = recallSave();
    if (!saved) {
      setFeedback("這個帳號還沒有存檔。");
      return;
    }
    dispatch({ type: "LOAD_SAVE", state: saved.state, savedAt: saved.savedAt, now: Date.now() });
    setFeedback(null);
  }

  const slotLabel = slot
    ? t(`帳號存檔 · ${PHASE_LABEL[slot.state.phase]} · ${formatSavedAt(slot.savedAt, languageMeta(lang).html, t("時間不明"))}`)
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button data-testid="save-progress" size="sm" variant="brass" onClick={store}>
        <Save className="size-3.5" aria-hidden="true" />
        {t("儲存進度")}
      </Button>
      {slotLabel ? (
        <Button data-testid="load-local-save" size="sm" variant="line" onClick={openSlot}>
          {slotLabel}
        </Button>
      ) : null}
      {feedback ? (
        <p role="status" className="basis-full text-xs leading-5 text-[#f3e7c8]">
          {t(feedback)}
        </p>
      ) : null}
    </div>
  );
}

function formatSavedAt(savedAt: string, locale: string, unknown: string): string {
  const time = Date.parse(savedAt);
  if (!Number.isFinite(time)) return unknown;
  return new Intl.DateTimeFormat(locale, {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(time);
}
