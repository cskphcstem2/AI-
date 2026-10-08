import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RubricCard } from "@/components/chamber/RubricCard";
import { LanguageBar } from "@/i18n/LanguageBar";
import { type OfficialLang } from "@/i18n/languages";
import { useTr } from "@/i18n/useTr";
import { detectSpokenLang, fallbackSpeechTag, nextCantoneseTag, prepareSpeechLanguages, speechTagFor, usesCloudRecognition } from "@/engine/speechLang";
import {
  measureDelivery,
  scorePresentation,
  SPEECH_WINDOW,
  type DeliverySample,
  type PresentationOccasion,
} from "@/engine/presentation";
import { appendSpeech, readSession, undoubleTranscript, type SpeechPiece } from "@/engine/speechCapture";
import type { TruthBullet } from "@/types/game";

interface SpeechAlternative {
  transcript: string;
}

interface SpeechResultLike {
  isFinal: boolean;
  0: SpeechAlternative;
}

interface SpeechResultEvent extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechResultLike>;
}

interface SpeechRecognizer extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  processLocally?: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechCtor = (new () => SpeechRecognizer) & {
  available?: (options: { langs: string[]; processLocally?: boolean }) => Promise<string>;
  install?: (options: { langs: string[] }) => Promise<boolean>;
};

function speechCtor(): SpeechCtor | null {
  const host = window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

export function VoiceBench({
  occasion,
  notes,
  onNotes,
  notesLabel,
  questionTags,
  bullets,
  onDeliver,
  disabled,
}: {
  occasion: PresentationOccasion;
  notes: string;
  onNotes: (text: string) => void;
  notesLabel: string;
  questionTags?: string[];
  bullets?: TruthBullet[];
  onDeliver: (text: string, delivery: DeliverySample) => void;
  disabled?: boolean;
}) {
  const { t, speechLanguage, chineseVoice, setSpeech } = useTr();
  const windowSpec = SPEECH_WINDOW[occasion];
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [heard, setHeard] = useState("");
  const [scoredLang, setScoredLang] = useState<OfficialLang>(speechLanguage);
  const [delivery, setDelivery] = useState<DeliverySample | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const samples = useRef<number[]>([]);
  const startedAt = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<SpeechRecognizer | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recordingRef = useRef(false);
  const finalRef = useRef("");
  const interimRef = useRef("");
  const committedRef = useRef("");
  const sessionFinalRef = useRef("");
  const bestRef = useRef("");
  const deliveredRef = useRef(false);
  const deliverTimer = useRef<number | null>(null);
  const langRef = useRef(speechTagFor(speechLanguage, chineseVoice));
  const speechLangRef = useRef(speechLanguage);
  const voiceRef = useRef(chineseVoice);
  const audioUrlRef = useRef<string | null>(null);
  const listenRetries = useRef(0);
  const holdRestart = useRef(false);
  const pinned = useRef(false);
  const detecting = useRef(false);
  const voicedMs = useRef(0);
  const triedAltCantonese = useRef(false);
  voiceRef.current = chineseVoice;

  useEffect(() => {
    const tag = speechTagFor(speechLanguage, chineseVoice);
    const fromDetector = detecting.current;
    detecting.current = false;
    const changed = speechLangRef.current !== speechLanguage || langRef.current !== tag;
    speechLangRef.current = speechLanguage;
    if (changed && !fromDetector) {
      pinned.current = true;
      langRef.current = tag;
    }
    if (!changed || !recordingRef.current) return;
    holdRestart.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
  }, [speechLanguage, chineseVoice]);

  useEffect(() => {
    return () => {
      recordingRef.current = false;
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (deliverTimer.current) window.clearTimeout(deliverTimer.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void audioRef.current?.close();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const review = useMemo(() => {
    if (!delivery) return null;
    return scorePresentation({
      id: "preview",
      occasion,
      text: heard,
      delivery,
      questionTags,
      bullets,
      speechLang: scoredLang,
    });
  }, [bullets, delivery, heard, occasion, questionTags, scoredLang]);

  function liveTranscript() {
    const body = appendSpeech(committedRef.current, sessionFinalRef.current);
    const pending = interimRef.current && body.endsWith(interimRef.current) ? "" : interimRef.current;
    return undoubleTranscript(appendSpeech(body, pending));
  }

  function remember(text: string) {
    const next = undoubleTranscript(text);
    if (next.trim().length >= bestRef.current.trim().length) bestRef.current = next;
    return bestRef.current;
  }

  function publishHeard() {
    const heard = remember(liveTranscript());
    finalRef.current = heard;
    setHeard(heard);
    return heard;
  }

  function settle() {
    const heard = remember(liveTranscript());
    committedRef.current = heard;
    finalRef.current = heard;
    setHeard(heard);
    return heard;
  }

  function listen() {
    const Ctor = speechCtor();
    if (!Ctor || !recordingRef.current) return;
    const recognition = new Ctor();
    recognition.lang = langRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    if (usesCloudRecognition(langRef.current)) recognition.processLocally = false;
    recognition.onresult = (event) => {
      const pieces: SpeechPiece[] = [];
      for (let index = 0; index < event.results.length; index += 1) {
        pieces.push({
          isFinal: event.results[index].isFinal,
          transcript: event.results[index][0]?.transcript ?? "",
        });
      }
      const session = readSession(pieces);
      sessionFinalRef.current = session.finalText;
      interimRef.current = session.interim;
      const heardText = publishHeard();
      const detected = detectSpokenLang(heardText);
      if (!pinned.current && detected && detected !== speechLangRef.current) {
        detecting.current = true;
        speechLangRef.current = detected;
        langRef.current = speechTagFor(detected, voiceRef.current);
        setSpeech(detected);
        try {
          recognition.stop();
        } catch {
          /* already stopped */
        }
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        recordingRef.current = false;
        setError("麥克風或語音辨識被拒絕。請在瀏覽器允許之後再按一次。");
        return;
      }
      if (event.error === "language-not-supported") {
        const next = fallbackSpeechTag(langRef.current);
        if (next) {
          langRef.current = next;
          return;
        }
        holdRestart.current = true;
        if (usesCloudRecognition(langRef.current) || voiceRef.current === "yue") {
          setError("廣東話辨識未能開始。請用 Chrome，並保持網絡連線後再按一次。");
        }
      }
    };
    recognition.onend = () => {
      settle();
      sessionFinalRef.current = "";
      interimRef.current = "";
      if (!recordingRef.current || holdRestart.current) return;
      window.setTimeout(() => {
        if (recognitionRef.current !== recognition || !recordingRef.current) return;
        listen();
      }, 250);
    };
    recognitionRef.current = recognition;
    try {
      listenRetries.current = 0;
      recognition.start();
    } catch {
      listenRetries.current += 1;
      if (listenRetries.current > 6) return;
      window.setTimeout(() => {
        if (recognitionRef.current === recognition && recordingRef.current) listen();
      }, 400);
    }
  }

  async function start() {
    setError(null);
    setDelivery(null);
    setHeard("");
    finalRef.current = "";
    interimRef.current = "";
    committedRef.current = "";
    sessionFinalRef.current = "";
    bestRef.current = "";
    deliveredRef.current = false;
    if (deliverTimer.current) window.clearTimeout(deliverTimer.current);
    listenRetries.current = 0;
    holdRestart.current = false;
    pinned.current = false;
    voicedMs.current = 0;
    triedAltCantonese.current = false;
    langRef.current = speechTagFor(speechLangRef.current, voiceRef.current);
    void prepareSpeechLanguages(speechCtor());
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("這部瀏覽器不能使用麥克風。請改用 Chrome，並允許麥克風。");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const context = new AudioContext();
      audioRef.current = context;
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      samples.current = [];
      startedAt.current = Date.now();
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const value of data) {
          const centered = (value - 128) / 128;
          sum += centered * centered;
        }
        const level = Math.sqrt(sum / data.length);
        samples.current.push(level);
        if (level >= 0.02) voicedMs.current += 100;
        const addedChars = `${finalRef.current}${interimRef.current}`.trim().length;
        const alt = nextCantoneseTag({
          tag: langRef.current,
          voicedMs: voicedMs.current,
          addedChars,
          tried: triedAltCantonese.current,
        });
        if (alt) {
          triedAltCantonese.current = true;
          langRef.current = alt;
          try {
            recognitionRef.current?.stop();
          } catch {
            /* already stopped */
          }
        }
        setElapsed(Date.now() - startedAt.current);
      }, 100);
      chunks.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      recorder.start(250);
      recordingRef.current = true;
      setRecording(true);
      if (speechCtor()) listen();
      else setError("這部瀏覽器沒有語音轉文字。請用 Chrome。你可以先錄音，但要辨識出文字才能記入會議。");
    } catch {
      recordingRef.current = false;
      setError("沒有拿到麥克風。請允許網站使用麥克風，然後再按「開始發言」。");
    }
  }

  function releaseMic() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioRef.current?.close();
    audioRef.current = null;
  }

  function enterSpeech(sample: DeliverySample) {
    if (deliveredRef.current) return;
    const text = settle().trim();
    if (!text) {
      setError("沒有辨識到文字。請靠近麥克風再說一次，或改用打字。");
      return;
    }
    deliveredRef.current = true;
    onNotes(text);
    onDeliver(text, sample);
  }

  function stop() {
    recordingRef.current = false;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    const durationMs = Math.max(0, Date.now() - startedAt.current);
    const sample = measureDelivery(samples.current, 100, durationMs);
    setDelivery(sample);
    setElapsed(durationMs);
    setScoredLang(speechLangRef.current);
    settle();
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    if (deliverTimer.current) window.clearTimeout(deliverTimer.current);
    deliverTimer.current = window.setTimeout(() => enterSpeech(sample), 450);
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = url;
        setAudioUrl(url);
        releaseMic();
      };
      recorder.stop();
    } else {
      releaseMic();
    }
    setRecording(false);
  }

  const seconds = Math.round(elapsed / 1000);

  return (
    <div className="mt-4">
      <label htmlFor={`notes-${occasion}`} className="block text-sm font-medium">
        {t(notesLabel)}
      </label>
      <textarea
        id={`notes-${occasion}`}
        data-testid="speech-notes"
        value={notes}
        onChange={(event) => onNotes(event.target.value)}
        rows={5}
        maxLength={600}
        placeholder={t("可以先寫講稿。記入會議的是你說出來的話，不是這格文字。")}
        className="mt-2 w-full resize-y rounded-sm border border-[#e4d8c4] bg-white/70 p-3 text-sm leading-7 outline-none"
      />
      <p className="mt-2 text-xs text-ink-soft">
        {t(windowSpec.label)} {t("講完會按七項標準給分，並顯示雷達圖。")}
      </p>
      <p className="mt-3 text-xs leading-5 text-ink-soft">
        {t("語音輸入可辨識阿拉伯文、國語、廣東話、英文、法文、俄文和西班牙文。國語和廣東話請按對應按鈕。聽出另一種語言時，會改用那種語言繼續聽，並用它評分。")}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <LanguageBar mode="speech" />
        {recording ? (
          <Button data-testid="speech-stop" variant="seal" onClick={stop}>
            <Square className="size-3.5" aria-hidden="true" />
            {t(`停止並評分 · ${seconds} 秒`)}
          </Button>
        ) : (
          <Button data-testid="speech-record" variant="ink" onClick={() => void start()} disabled={disabled}>
            <Mic className="size-3.5" aria-hidden="true" />
            {t("開始發言")}
          </Button>
        )}
      </div>
      {recording ? (
        <p data-testid="speech-live" className="mt-3 min-h-6 text-sm leading-6 text-[#d9d0c2]">
          {heard.trim() ? heard : t("正在聽。說完一句可以停頓，它會接著聽下一句，直到你按停止。")}
        </p>
      ) : null}
      {error ? (
        <p role="status" className="mt-3 text-sm leading-6 text-seal">
          {t(error)}
        </p>
      ) : null}
      {delivery ? (
        <div className="mt-4 space-y-3">
          <label htmlFor={`heard-${occasion}`} className="block text-sm font-medium">
            {t("辨識到的發言")}
          </label>
          <textarea
            id={`heard-${occasion}`}
            data-testid="speech-heard"
            value={heard}
            onChange={(event) => setHeard(event.target.value)}
            rows={5}
            maxLength={1500}
            className="w-full rounded-sm border border-[#e4d8c4] bg-white/70 p-3 text-sm leading-7 outline-none"
          />
          <p className="text-xs text-ink-soft">{t("辨識有錯可以改字。時間、快慢和音量仍以剛才的錄音計分。")}</p>
          {audioUrl ? <audio controls src={audioUrl} className="w-full" data-testid="speech-playback" /> : null}
          {review ? <RubricCard review={review} text={heard} /> : null}
          <Button
            data-testid="speech-submit"
            variant="brass"
            disabled={!heard.trim() || disabled}
            onClick={() => delivery && enterSpeech(delivery)}
          >
            {t("以這段語音記入會議")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
