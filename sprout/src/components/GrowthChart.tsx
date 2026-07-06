import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { money } from "../lib/format";
import { SproutGlyph } from "./SproutGlyph";

interface Point {
  x: number;
  y: number;
}

/** Catmull-Rom spline through the points, emitted as cubic beziers. */
function smoothPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/**
 * The Sprout growth line: smooth spline, soft area gradient, and the
 * living two-leaf glyph at the last point. Hovering (or touching) shows
 * a crosshair with the value at that point. Rendered in pixel
 * coordinates (measured via ResizeObserver) so strokes stay crisp.
 */
export function GrowthChart({
  data,
  timeframe,
  color = "var(--sprout)",
  height = 150,
  label,
}: {
  data: number[];
  /** Used to retrigger the draw-in animation when the range changes. */
  timeframe: string;
  color?: string;
  height?: number;
  label: string;
}) {
  const gradientId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(358);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const PAD_TOP = 18;
  const PAD_BOTTOM = 6;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts: Point[] = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: PAD_TOP + (1 - (v - min) / span) * (height - PAD_TOP - PAD_BOTTOM),
  }));

  const line = smoothPath(pts);
  const last = pts[pts.length - 1];
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const t = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      setHover(Math.round(t * (data.length - 1)));
    },
    [data.length],
  );

  const hoverPt = hover != null ? pts[hover] : null;

  return (
    <div
      ref={wrapRef}
      className="relative touch-pan-y select-none"
      style={{ height }}
      role="img"
      aria-label={`${label}: from ${money(data[0])} to ${money(data[data.length - 1])}`}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg
        key={`${timeframe}-${width}`}
        className="block overflow-visible"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="anim-area" d={area} fill={`url(#${gradientId})`} />
        <path
          className="anim-line"
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
        />
        {hoverPt && (
          <line
            x1={hoverPt.x}
            y1={PAD_TOP - 8}
            x2={hoverPt.x}
            y2={height}
            stroke="var(--muted-2)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {/* Hover dot + value chip (HTML overlay so text stays crisp) */}
      {hoverPt && hover != null && (
        <>
          <div
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card"
            style={{ left: hoverPt.x, top: hoverPt.y, background: color }}
          />
          <div
            className="tnum pointer-events-none absolute -translate-x-1/2 rounded-pill bg-ink px-2 py-0.5 text-[11px] font-semibold text-card"
            style={{ left: `clamp(30px, ${hoverPt.x}px, ${width - 30}px)`, top: -8 }}
          >
            {money(data[hover])}
          </div>
        </>
      )}

      {/* The living sprout at the tip of the line */}
      <div
        className="anim-sprout pointer-events-none absolute"
        key={`glyph-${timeframe}`}
        style={{ left: last.x, top: last.y, transform: "translate(-72%, -92%)" }}
      >
        <SproutGlyph size={17} color={color} />
      </div>
    </div>
  );
}
