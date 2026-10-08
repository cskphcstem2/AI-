import { useCallback } from "react";
import { languageMeta, type ChineseVoice, type OfficialLang } from "@/i18n/languages";
import { tr } from "@/i18n/tr";
import { useGame } from "@/state/context";

export function useTr() {
  const { state, dispatch } = useGame();
  const lang = state.uiLanguage ?? "zh";
  const t = useCallback((source: string) => tr(lang, source), [lang]);
  const setUi = (language: OfficialLang) => dispatch({ type: "SET_UI_LANGUAGE", language });
  const setSpeech = (language: OfficialLang) => dispatch({ type: "SET_SPEECH_LANGUAGE", language });
  const setChineseVoice = (voice: ChineseVoice) => dispatch({ type: "SET_CHINESE_VOICE", voice });
  return {
    t,
    lang,
    speechLanguage: state.speechLanguage ?? "zh",
    chineseVoice: state.chineseVoice ?? "cmn",
    dir: languageMeta(lang).dir,
    setUi,
    setSpeech,
    setChineseVoice,
  };
}
