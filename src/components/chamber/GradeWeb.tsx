import { levelLabel } from "@/engine/presentation";
import type { MunCriterion } from "@/engine/scoring";
import { useTr } from "@/i18n/useTr";
import type { RubricLevel } from "@/types/game";

function ring(level: number, radius: number, cx: number, cy: number, count: number) {
  const step = (Math.PI * 2) / count;
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + step * index;
    const reach = (level / 5) * radius;
    return `${cx + Math.cos(angle) * reach},${cy + Math.sin(angle) * reach}`;
  }).join(" ");
}

function shape(values: RubricLevel[], radius: number, cx: number, cy: number) {
  const step = (Math.PI * 2) / values.length;
  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + step * index;
      const reach = (value / 5) * radius;
      return `${cx + Math.cos(angle) * reach},${cy + Math.sin(angle) * reach}`;
    })
    .join(" ");
}

export function GradeWeb({ criteria }: { criteria: MunCriterion[] }) {
  const { t } = useTr();
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 112;
  const labelRadius = 148;
  const values = criteria.map((item) => item.level);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-[24rem]"
      role="img"
      aria-label={t("本場模擬聯合國評分蛛網圖")}
      data-testid="grade-web"
    >
      {[1, 2, 3, 4, 5].map((level) => (
        <polygon
          key={level}
          points={ring(level, radius, cx, cy, criteria.length)}
          fill={level === 1 ? "rgba(198, 161, 90, 0.08)" : "none"}
          stroke={level === 5 ? "#c6a15a" : "#d9cbb6"}
          strokeWidth={level === 5 ? 1.4 : 0.9}
        />
      ))}
      {criteria.map((item, index) => {
        const angle = -Math.PI / 2 + ((Math.PI * 2) / criteria.length) * index;
        return (
          <line
            key={item.id}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * radius}
            y2={cy + Math.sin(angle) * radius}
            stroke="#d9cbb6"
            strokeWidth="0.9"
          />
        );
      })}
      <polygon points={shape(values, radius, cx, cy)} fill="rgba(30, 107, 87, 0.35)" stroke="#1e6b57" strokeWidth="2.4" />
      {criteria.map((item, index) => {
        const angle = -Math.PI / 2 + ((Math.PI * 2) / criteria.length) * index;
        const x = cx + Math.cos(angle) * ((item.level / 5) * radius);
        const y = cy + Math.sin(angle) * ((item.level / 5) * radius);
        return <circle key={`dot-${item.id}`} cx={x} cy={y} r="3.5" fill="#1e6b57" />;
      })}
      {criteria.map((item, index) => {
        const angle = -Math.PI / 2 + ((Math.PI * 2) / criteria.length) * index;
        const x = cx + Math.cos(angle) * labelRadius;
        const y = cy + Math.sin(angle) * labelRadius;
        return (
          <text key={`label-${item.id}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-ink text-[11px]">
            {t(item.label)}
          </text>
        );
      })}
    </svg>
  );
}

export function GradeMarks({ criteria }: { criteria: MunCriterion[] }) {
  const { t } = useTr();
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {criteria.map((item) => (
        <li key={item.id} data-testid={`grade-${item.id}`}>
          <p className="text-sm font-medium">{t(item.label)}</p>
          <p className="text-[11px] text-ink-soft">{item.english}</p>
          <p className="mt-1 font-serif text-2xl">
            {item.level} · {t(levelLabel(item.level))}
          </p>
        </li>
      ))}
    </ul>
  );
}
