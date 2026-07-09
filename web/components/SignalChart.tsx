"use client";

import type { SignalFrame, ScanEvents } from "@/lib/types";

// Pure-SVG per-second timeline. No chart lib — keeps the demo dependency-free.
// Draws each signal channel as a line across the clip's duration, with markers
// for the buy moment and the drop-off second.

const CHANNELS: { key: keyof Omit<SignalFrame, "t">; label: string; color: string }[] = [
  { key: "attention", label: "Attention", color: "#22d3ee" },
  { key: "intent", label: "Intent", color: "#7c5cff" },
  { key: "reward", label: "Reward", color: "#34d399" },
  { key: "hesitation", label: "Hesitation", color: "#f87171" },
  { key: "emotion", label: "Emotion", color: "#fbbf24" },
  { key: "memory", label: "Memory", color: "#c084fc" },
];

const W = 920;
const H = 320;
const PAD = { top: 20, right: 20, bottom: 34, left: 40 };

export default function SignalChart({
  signals,
  events,
  active,
}: {
  signals: SignalFrame[];
  events: ScanEvents | null;
  active: Record<string, boolean>;
}) {
  if (signals.length === 0) return null;
  const n = signals.length;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (t: number) => PAD.left + (n <= 1 ? 0 : (t / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + (1 - v) * plotH;

  const linePath = (key: keyof Omit<SignalFrame, "t">) =>
    signals
      .map((f, i) => `${i === 0 ? "M" : "L"} ${x(f.t).toFixed(1)} ${y(f[key]).toFixed(1)}`)
      .join(" ");

  const gridY = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Per-second neural signal timeline"
      style={{ display: "block" }}
    >
      {/* horizontal grid */}
      {gridY.map((g) => (
        <g key={g}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(g)}
            y2={y(g)}
            stroke="#1c1c2e"
            strokeWidth={1}
          />
          <text x={8} y={y(g) + 4} fill="#6b6a86" fontSize={11} fontFamily="monospace">
            {g.toFixed(2)}
          </text>
        </g>
      ))}

      {/* x-axis second labels (sparse) */}
      {signals
        .filter((_, i) => i % Math.max(1, Math.round(n / 8)) === 0)
        .map((f) => (
          <text
            key={f.t}
            x={x(f.t)}
            y={H - 12}
            fill="#6b6a86"
            fontSize={11}
            fontFamily="monospace"
            textAnchor="middle"
          >
            {f.t}s
          </text>
        ))}

      {/* drop-off marker */}
      {events?.dropoffT != null && (
        <g>
          <line
            x1={x(events.dropoffT)}
            x2={x(events.dropoffT)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="#f87171"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={0.8}
          />
          <text
            x={x(events.dropoffT)}
            y={PAD.top - 6}
            fill="#f87171"
            fontSize={11}
            fontFamily="monospace"
            textAnchor="middle"
          >
            drop-off
          </text>
        </g>
      )}

      {/* buy-moment marker */}
      {events?.buyMomentT != null && (
        <g>
          <line
            x1={x(events.buyMomentT)}
            x2={x(events.buyMomentT)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="#7c5cff"
            strokeWidth={2}
            opacity={0.9}
          />
          <text
            x={x(events.buyMomentT)}
            y={PAD.top - 6}
            fill="#a78bfa"
            fontSize={11}
            fontFamily="monospace"
            textAnchor="middle"
          >
            buy moment · {events.buyMomentT}s
          </text>
        </g>
      )}

      {/* signal lines */}
      {CHANNELS.filter((c) => active[c.key]).map((c) => (
        <path
          key={c.key}
          d={linePath(c.key)}
          fill="none"
          stroke={c.color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.95}
        />
      ))}
    </svg>
  );
}

export { CHANNELS };
