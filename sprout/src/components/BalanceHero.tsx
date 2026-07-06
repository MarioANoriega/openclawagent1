import { moneyParts, signedMoney } from "../lib/format";

export function TrendIcon({ down = false }: { down?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={down ? { transform: "scaleY(-1)" } : undefined}
    >
      <path
        d="M1.5 8.5 5 5l2 2 3.5-3.5M7 3.5h3.5V7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Green (or clay) pill summarizing growth over the selected range. */
export function GrowthPill({ delta, caption }: { delta: number; caption: string }) {
  const up = delta >= 0;
  return (
    <span
      className={`tnum inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[13px] font-semibold ${
        up ? "bg-sprout-soft text-sprout-deep" : "bg-clay/10 text-clay"
      }`}
    >
      <TrendIcon down={!up} />
      {signedMoney(delta)} · {caption}
    </span>
  );
}

export function BalanceHero({
  label,
  value,
  delta,
  caption,
}: {
  label: string;
  value: number;
  delta: number;
  caption: string;
}) {
  const parts = moneyParts(value);
  return (
    <section className="flex flex-col items-center gap-2.5 text-center" aria-label={label}>
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <p className="tnum font-display text-[46px] leading-none font-bold tracking-tight text-ink">
        {parts.whole}
        <span className="text-[28px] font-semibold text-muted2">{parts.cents}</span>
      </p>
      <GrowthPill delta={delta} caption={caption} />
    </section>
  );
}
