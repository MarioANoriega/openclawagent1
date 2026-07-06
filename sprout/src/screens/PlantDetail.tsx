import { useState } from "react";
import { RANGE_LABEL, rangePct, type Timeframe } from "../data/plants";
import type { PlantView } from "../lib/store";
import { GrowthPill } from "../components/BalanceHero";
import { GrowthChart } from "../components/GrowthChart";
import { RangeToggle } from "../components/RangeToggle";
import { StatTile } from "../components/StatTile";
import { MaturityDots } from "../components/PlantRow";
import { money, moneyParts, signedMoney } from "../lib/format";

export function PlantDetail({
  holding,
  onBack,
  onWater,
  onHarvest,
}: {
  holding: PlantView;
  onBack: () => void;
  onWater: () => void;
  onHarvest: () => void;
}) {
  const [tf, setTf] = useState<Timeframe>("1M");
  const { plant, value, invested, wateringOn, weeklyAmount } = holding;
  const series = holding.series[tf];
  const negative = rangePct(series) < 0;
  const returns = value - invested;
  const parts = moneyParts(value);

  return (
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
      <header className="flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Back to garden"
          className="flex h-10 w-10 items-center justify-center rounded-tile bg-card shadow-leaf"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11.5 3.5 6 9l5.5 5.5" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[20px]" aria-hidden="true">{plant.emoji}</span>
          <span className="font-display text-[17px] font-bold text-ink">{plant.name}</span>
        </div>
        <button
          aria-label="More options"
          className="flex h-10 w-10 items-center justify-center rounded-tile bg-card shadow-leaf"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="var(--ink)" aria-hidden="true">
            <circle cx="4" cy="9" r="1.6" />
            <circle cx="9" cy="9" r="1.6" />
            <circle cx="14" cy="9" r="1.6" />
          </svg>
        </button>
      </header>

      <section className="mt-6 flex flex-col items-center gap-2.5 text-center">
        <p className="tnum font-display text-[42px] leading-none font-bold tracking-tight text-ink">
          {parts.whole}
          <span className="text-[26px] font-semibold text-muted2">{parts.cents}</span>
        </p>
        <GrowthPill delta={returns} caption="all time" />
        <span className="mt-0.5 flex items-center gap-2 text-[12.5px] font-semibold text-muted">
          {plant.stage}
          <MaturityDots filled={plant.maturity} />
        </span>
      </section>

      <div className="mt-4 -mx-1">
        <GrowthChart
          data={series}
          timeframe={tf}
          height={140}
          color={negative ? "var(--clay)" : "var(--sprout)"}
          label={`${plant.name} value, ${RANGE_LABEL[tf]}`}
        />
      </div>

      <div className="mt-3">
        <RangeToggle value={tf} onChange={setTf} />
      </div>

      <div className="mt-6 flex gap-2.5">
        <StatTile label="Invested" value={money(invested)} />
        <StatTile label="Returns" value={signedMoney(returns)} tone={returns >= 0 ? "sprout" : "clay"} />
        <StatTile
          label="Watering"
          value={wateringOn && !plant.isCash ? `$${weeklyAmount}/wk` : plant.isCash ? `${plant.apy?.toFixed(1)}% APY` : "Off"}
        />
      </div>

      <section className="mt-6 rounded-card bg-card px-4.5 py-4 shadow-leaf">
        <h2 className="font-display text-[15px] font-bold text-ink">How this plant grows</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed font-medium text-ink2">
          {plant.description}
        </p>
      </section>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onHarvest}
          className="flex-1 rounded-action bg-sprout-soft py-3.5 text-[15px] font-bold text-sprout-deep transition-transform active:scale-[0.98]"
        >
          Harvest
        </button>
        <button
          onClick={onWater}
          className="shadow-glow flex-1 rounded-action bg-sprout py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.98]"
        >
          {plant.isCash ? "Add seeds" : "Water more"}
        </button>
      </div>
    </div>
  );
}
