import * as React from 'react';
import type { TrendPoint } from '@/features/analytics/types';

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 12, right: 12, bottom: 24, left: 32 };

const SERIES = [
  { key: 'totalConversations', label: 'Total conversations', colorVar: '--primary' },
  { key: 'aiResolvedCount', label: 'AI resolved', colorVar: '--success' },
  { key: 'humanTakeoverCount', label: 'Human takeover', colorVar: '--warning' },
] as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const maxValue = Math.max(1, ...data.flatMap((d) => SERIES.map((s) => d[s.key])));

  function x(index: number): number {
    if (data.length <= 1) return PADDING.left + plotWidth / 2;
    return PADDING.left + (index / (data.length - 1)) * plotWidth;
  }
  function y(value: number): number {
    return PADDING.top + plotHeight - (value / maxValue) * plotHeight;
  }

  function pathFor(key: (typeof SERIES)[number]['key']): string {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key])}`).join(' ');
  }

  function handleMouseMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const ratio = relativeX / rect.width;
    const index = Math.round(ratio * (data.length - 1));
    setHoverIndex(Math.min(Math.max(index, 0), data.length - 1));
  }

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Not enough data yet — check back once conversations start coming in.
      </div>
    );
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `var(${s.colorVar})` }} />
            {s.label}
          </div>
        ))}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Conversation trend chart">
          {[0.25, 0.5, 0.75, 1].map((fraction) => (
            <line
              key={fraction}
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y(maxValue * fraction)}
              y2={y(maxValue * fraction)}
              stroke="var(--border)"
              strokeWidth={1}
            />
          ))}

          {SERIES.map((s) => (
            <path
              key={s.key}
              d={pathFor(s.key)}
              fill="none"
              stroke={`var(${s.colorVar})`}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {hoverIndex !== null && (
            <line
              x1={x(hoverIndex)}
              x2={x(hoverIndex)}
              y1={PADDING.top}
              y2={HEIGHT - PADDING.bottom}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}

          {data.map((d, i) => (
            <text
              key={d.date}
              x={x(i)}
              y={HEIGHT - 6}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
              opacity={data.length > 10 ? (i % Math.ceil(data.length / 6) === 0 ? 1 : 0) : 1}
            >
              {formatDate(d.date)}
            </text>
          ))}

          <rect
            x={PADDING.left}
            y={PADDING.top}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          />
        </svg>

        {hovered && hoverIndex !== null && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
            style={{ left: `${(x(hoverIndex) / WIDTH) * 100}%` }}
          >
            <p className="font-medium">{formatDate(hovered.date)}</p>
            {SERIES.map((s) => (
              <p key={s.key} className="text-muted-foreground">
                {s.label}: <span className="text-foreground">{hovered[s.key]}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
