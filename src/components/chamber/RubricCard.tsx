import { useEffect, useState } from "react";
import { RUBRIC_AXES, levelLabel, speechMark, type PresentationReview, type RubricAxisId, type RubricLevel } from "@/engine/presentation";
import { useTr } from "@/i18n/useTr";
import { llmEnvFromImportMeta, createLlmClient } from "@/llm/client";
import { gradeSpeech, type SpeechCoachMark } from "@/llm/coach";

function radarPoints(values: RubricLevel[], radius: number, cx: number, cy: number) {
  const step = (Math.PI * 2) / values.length;
  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + step * index;
      const r = (value / 5) * radius;
      return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
    })
    .join(" ");
}

function gridRing(level: number, radius: number, cx: number, cy: number, count: number) {
  const step = (Math.PI * 2) / count;
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + step * index;
    const r = (level / 5) * radius;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  }).join(" ");
}

function RadarChart({ review }: { review: PresentationReview }) {
  const { t } = useTr();
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 92;
  const ids = RUBRIC_AXES.map((item) => item.id);
  const values = ids.map((id) => review.axes[id]);
  const labelRadius = 118;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[18rem]" role="img" aria-label={t("七項評分雷達圖")} data-testid="rubric-radar">
      {[1, 2, 3, 4, 5].map((level) => (
        <polygon
          key={level}
          points={gridRing(level, radius, cx, cy, ids.length)}
          fill="none"
          stroke={level === 5 ? "#c6a15a" : "#e4d8c4"}
          strokeWidth={level === 5 ? 1.2 : 0.8}
        />
      ))}
      {ids.map((id, index) => {
        const angle = -Math.PI / 2 + ((Math.PI * 2) / ids.length) * index;
        return (
          <line
            key={id}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * radius}
            y2={cy + Math.sin(angle) * radius}
            stroke="#e4d8c4"
            strokeWidth="0.8"
          />
        );
      })}
      <polygon points={radarPoints(values, radius, cx, cy)} fill="rgba(30, 107, 87, 0.28)" stroke="#1e6b57" strokeWidth="2" />
      {ids.map((id, index) => {
        const angle = -Math.PI / 2 + ((Math.PI * 2) / ids.length) * index;
        const x = cx + Math.cos(angle) * labelRadius;
        const y = cy + Math.sin(angle) * labelRadius;
        const meta = RUBRIC_AXES[index];
        const label = review.mode === "typed" ? meta.typedLabel : meta.label;
        return (
          <text
            key={`label-${id}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink text-[10px]"
          >
            {t(label)}
          </text>
        );
      })}
    </svg>
  );
}

function useSpeechCoach(review: PresentationReview, text?: string) {
  const { lang } = useTr();
  const [coach, setCoach] = useState<SpeechCoachMark | null>(null);
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void gradeSpeech(createLlmClient(llmEnvFromImportMeta(import.meta.env)), review, text, lang).then((mark) => {
        if (!cancelled) setCoach(mark);
      });
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [lang, review, text]);
  return coach;
}

export function RubricCard({ review, text }: { review: PresentationReview; text?: string }) {
  const { t } = useTr();
  const coach = useSpeechCoach(review, text);
  const title = review.mode === "typed" ? "文字評分 · 優秀 5 到不足 1" : "口語評分 · 優秀 5 到不足 1";
  const mark = coach?.mark ?? speechMark(review);
  const improvements = coach?.improvements.length ? coach.improvements : review.suggestions;

  return (
    <section className="mt-4 rounded-sm border border-[#e4d8c4] bg-white/60 p-4" data-testid="rubric-card">
      <p className="text-xs text-brass-deep">{t(title)}</p>
      <p className="mt-2 font-serif text-5xl leading-none text-ink" data-testid="speech-mark">
        {mark}
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        {t(coach?.source === "model" ? "這一分數由評分員給出。" : "這次發言滿分 100。七項各從 1 到 5，再合成這一分數。")}
      </p>
      <div className="mt-3 grid items-start gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <RadarChart review={review} />
        <div className="grid gap-3 sm:grid-cols-2">
          {RUBRIC_AXES.map((row) => {
            const id = row.id as RubricAxisId;
            const score = review.axes[id];
            const label = review.mode === "typed" ? row.typedLabel : row.label;
            const english = review.mode === "typed" ? row.typedEnglish : row.english;
            return (
              <div key={id} data-testid={`rubric-axis-${id}`}>
                <p className="text-sm font-medium">{t(label)}</p>
                <p className="text-[11px] text-ink-soft">{english}</p>
                <p className="mt-1 font-serif text-2xl">
                  {score} · {t(levelLabel(score))}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{t(review.notes[id])}</p>
              </div>
            );
          })}
        </div>
      </div>
      {improvements.length ? (
        <div className="mt-4 border-t border-[#e4d8c4] pt-3">
          <p className="text-sm font-medium">{t("下次可以改的地方")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
            {improvements.map((item) => (
              <li key={item}>{coach?.source === "model" ? item : t(item)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
