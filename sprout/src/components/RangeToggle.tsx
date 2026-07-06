import { TIMEFRAMES, type Timeframe } from "../data/plants";

export function RangeToggle({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
}) {
  return (
    <div className="flex justify-center gap-1.5" role="tablist" aria-label="Chart range">
      {TIMEFRAMES.map((tf) => {
        const active = tf === value;
        return (
          <button
            key={tf}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tf)}
            className={`rounded-pill px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              active ? "bg-ink text-card" : "text-muted hover:text-ink2"
            }`}
          >
            {tf === "ALL" ? "All" : tf}
          </button>
        );
      })}
    </div>
  );
}
