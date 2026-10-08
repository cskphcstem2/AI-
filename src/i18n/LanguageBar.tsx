import { OFFICIAL_LANGS, type ChineseVoice, type OfficialLang } from "@/i18n/languages";
import { useTr } from "@/i18n/useTr";
import { cn } from "@/lib/utils";

const CHINESE_BUTTONS: { voice: ChineseVoice; label: string; html: string }[] = [
  { voice: "cmn", label: "國語", html: "zh-Hant" },
  { voice: "yue", label: "廣東話", html: "zh-HK" },
];

export function LanguageBar({ mode }: { mode: "session" | "speech" }) {
  const { t, lang, speechLanguage, chineseVoice, setUi, setSpeech, setChineseVoice } = useTr();
  const current = mode === "session" ? lang : speechLanguage;
  return (
    <div className="flex flex-wrap gap-2" data-testid={mode === "session" ? "ui-languages" : "speech-languages"} role="group">
      {OFFICIAL_LANGS.map((item) => {
        if (mode === "speech" && item.id === "zh") {
          return CHINESE_BUTTONS.map((button) => {
            const on = current === "zh" && chineseVoice === button.voice;
            return (
              <button
                key={button.voice}
                type="button"
                data-testid={`speech-lang-${button.voice}`}
                aria-pressed={on}
                lang={button.html}
                dir="ltr"
                onClick={() => setChineseVoice(button.voice)}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-sm",
                  on ? "bg-ink text-paper" : "bg-white/70 text-ink",
                )}
              >
                {t(button.label)}
              </button>
            );
          });
        }
        return (
          <SpeechLangButton
            key={item.id}
            mode={mode}
            id={item.id}
            label={item.label}
            html={item.html}
            dir={item.dir}
            on={current === item.id}
            onPick={() => (mode === "session" ? setUi(item.id) : setSpeech(item.id))}
          />
        );
      })}
    </div>
  );
}

function SpeechLangButton({
  mode,
  id,
  label,
  html,
  dir,
  on,
  onPick,
}: {
  mode: "session" | "speech";
  id: OfficialLang;
  label: string;
  html: string;
  dir: "ltr" | "rtl";
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      data-testid={`${mode}-lang-${id}`}
      aria-pressed={on}
      lang={html}
      dir={dir}
      onClick={onPick}
      className={cn("rounded-sm px-3 py-1.5 text-sm", on ? "bg-ink text-paper" : "bg-white/70 text-ink")}
    >
      {label}
    </button>
  );
}
