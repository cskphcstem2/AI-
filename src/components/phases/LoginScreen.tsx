import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { PREF_LANG_KEY, authErrorCode } from "@/auth/auth";
import { Kicker, Mark, Paper } from "@/components/chamber/primitives";
import { Button } from "@/components/ui/button";
import { OFFICIAL_LANGS, isOfficialLang, languageMeta, type OfficialLang } from "@/i18n/languages";
import { tr } from "@/i18n/tr";
import { cn } from "@/lib/utils";

const ERROR_ZH = {
  popup_blocked: "瀏覽器擋下了登入視窗。請允許彈出視窗，或再試一次。",
  popup_closed: "登入視窗已關閉。若要進入議場，請再按一次 Google 登入。",
  network: "網路連線失敗。請檢查網路後再試。",
  cancelled: "已取消登入。",
  unauthorized: "這個網址尚未加入 Firebase 授權網域。請在 Firebase 主控台加入目前網址。",
  unknown: "Google 登入暫時失敗。請稍後再試。",
} as const;

function readPrefLang(): OfficialLang {
  try {
    const raw = localStorage.getItem(PREF_LANG_KEY);
    return isOfficialLang(raw) ? raw : "zh";
  } catch {
    return "zh";
  }
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.5.4-2.7 2.1C5.1 19.5 8.3 21.5 12 21.5c2.5 0 4.6-.8 6.2-2.3l-3.1-2.4c-.9.6-2 .9-3.1.9-2.4 0-4.4-1.6-5.1-3.8z"
      />
      <path
        fill="#4A90E2"
        d="M3.4 7.2C2.7 8.6 2.3 10.2 2.3 12s.4 3.4 1.1 4.8l3.2-2.5c-.3-.9-.5-1.8-.5-2.3s.2-1.5.5-2.3L3.4 7.2z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.3c1.3 0 2.5.5 3.4 1.3l2.5-2.5C16.6 2.7 14.5 1.8 12 1.8 8.3 1.8 5.1 3.8 3.4 7.2l3.2 2.5C7.6 6.9 9.6 5.3 12 5.3z"
      />
    </svg>
  );
}

export function LoginScreen() {
  const { signInGoogle } = useAuth();
  const [lang, setLang] = useState<OfficialLang>(() => readPrefLang());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const t = useMemo(() => (source: string) => tr(lang, source), [lang]);
  const meta = languageMeta(lang);

  useEffect(() => {
    localStorage.setItem(PREF_LANG_KEY, lang);
    document.documentElement.lang = meta.html;
    document.documentElement.dir = meta.dir;
  }, [lang, meta.dir, meta.html]);

  const onGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      await signInGoogle();
    } catch (err) {
      const code = authErrorCode(err);
      if (code === "popup_blocked") {
        // Redirect flow may already be under way.
        setError(t(ERROR_ZH.popup_blocked));
      } else {
        setError(t(ERROR_ZH[code]));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10 sm:px-6" dir={meta.dir}>
      <header className="mb-8 flex items-center gap-3 text-brass">
        <Mark className="size-12" />
        <div>
          <Kicker>Model UN training</Kicker>
          <p className="font-serif text-lg text-paper">{t("全球之聲")}</p>
        </div>
      </header>

      <Paper className="p-6 sm:p-8">
        <p className="text-sm tracking-[0.18em] text-brass-deep">GLOBAL VOICE</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{t("登入議場")}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          {t("使用 Google 帳號登入。登入後，你的進度會依帳號分開保存在這部瀏覽器。")}
        </p>

        <div className="mt-5">
          <p className="mb-2 text-xs tracking-[0.14em] text-brass-deep uppercase">{t("會議語言")}</p>
          <div className="flex flex-wrap gap-2" role="group" data-testid="login-languages">
            {OFFICIAL_LANGS.map((item) => {
              const on = lang === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`login-lang-${item.id}`}
                  aria-pressed={on}
                  lang={item.html}
                  dir={item.dir}
                  onClick={() => setLang(item.id)}
                  className={cn(
                    "rounded-sm px-3 py-1.5 text-sm",
                    on ? "bg-ink text-paper" : "bg-white/70 text-ink",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p role="alert" data-testid="auth-error" className="mt-5 rounded-sm border border-seal/40 bg-[#f8e8e8] px-3 py-2 text-sm text-seal">
            {error}
          </p>
        ) : null}

        <Button
          data-testid="auth-google"
          type="button"
          size="lg"
          variant="ink"
          className="mt-6 w-full"
          disabled={busy}
          onClick={() => void onGoogle()}
        >
          <GoogleMark />
          {busy ? t("處理中…") : t("使用 Google 登入")}
        </Button>

        <p className="mt-4 text-xs leading-5 text-ink-soft">
          {t("需要在 Firebase 主控台開啟 Google 登入，並把本機與正式網址加入授權網域。")}
        </p>
      </Paper>
    </div>
  );
}
