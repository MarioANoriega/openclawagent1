import type { PlantView } from "../lib/store";
import { money, signedPct } from "../lib/format";

export function MaturityDots({ filled }: { filled: number }) {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`Maturity ${filled} of 4`}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-[5px] w-[5px] rounded-full ${i < filled ? "bg-sprout" : "bg-line"}`}
        />
      ))}
    </span>
  );
}

export function PlantRow({ holding, onOpen }: { holding: PlantView; onOpen: () => void }) {
  const { plant, value, wateringOn } = holding;
  const pct = plant.allTimePct;
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3.5 rounded-card bg-card px-4 py-3.5 text-left shadow-leaf transition-transform active:scale-[0.99]"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-tile bg-sky text-[22px]"
        aria-hidden="true"
      >
        {plant.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-ink">{plant.name}</span>
        <span className="mt-0.5 flex items-center gap-2 text-[12px] font-medium text-muted">
          {plant.isCash ? "Ready to plant" : plant.stage}
          <MaturityDots filled={plant.maturity} />
          {wateringOn && !plant.isCash && <span aria-label="Watering weekly">💧</span>}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="tnum block text-[15px] font-semibold text-ink">{money(value)}</span>
        {plant.isCash ? (
          <span className="tnum block text-[12px] font-semibold text-muted">
            {plant.apy?.toFixed(1)}% APY
          </span>
        ) : (
          <span
            className={`tnum block text-[12px] font-semibold ${
              pct >= 0 ? "text-sprout-deep" : "text-clay"
            }`}
          >
            {signedPct(pct)}
          </span>
        )}
      </span>
    </button>
  );
}

/** Skeleton row shown while the garden "wakes up". */
export function PlantRowSkeleton() {
  return (
    <div className="anim-shimmer flex items-center gap-3.5 rounded-card bg-card px-4 py-3.5 shadow-leaf" aria-hidden="true">
      <div className="h-11 w-11 rounded-tile bg-line2" />
      <div className="flex-1">
        <div className="h-3.5 w-32 rounded-pill bg-line2" />
        <div className="mt-2 h-2.5 w-20 rounded-pill bg-line2" />
      </div>
      <div className="h-3.5 w-16 rounded-pill bg-line2" />
    </div>
  );
}
