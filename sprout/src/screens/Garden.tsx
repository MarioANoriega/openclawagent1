import { useEffect, useState } from "react";
import { RANGE_LABEL, type Timeframe } from "../data/plants";
import type { Garden as GardenStore } from "../lib/store";
import { BalanceHero } from "../components/BalanceHero";
import { GrowthChart } from "../components/GrowthChart";
import { RangeToggle } from "../components/RangeToggle";
import { QuickActions, type QuickAction } from "../components/QuickActions";
import { NudgeCard } from "../components/NudgeCard";
import { PlantRow, PlantRowSkeleton } from "../components/PlantRow";
import { SproutGlyph } from "../components/SproutGlyph";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function Garden({
  garden,
  onOpenPlant,
  onAction,
  onNudge,
  onPlantFirst,
}: {
  garden: GardenStore;
  onOpenPlant: (id: string) => void;
  onAction: (a: QuickAction) => void;
  onNudge: () => void;
  onPlantFirst: () => void;
}) {
  const [tf, setTf] = useState<Timeframe>("1M");
  const [waking, setWaking] = useState(true);

  // Let the garden "wake up" briefly so the loading state is visible.
  useEffect(() => {
    const t = setTimeout(() => setWaking(false), 700);
    return () => clearTimeout(t);
  }, []);

  const owned = garden.plants.filter((p) => p.owned);
  const hasPlants = owned.some((p) => !p.plant.isCash);
  const series = garden.portfolio[tf];
  const delta = series[series.length - 1] - series[0];
  const name = garden.state.name ?? "Friend";

  return (
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
      {/* Top bar */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-muted">{greeting()}</p>
          <p className="font-display text-[19px] font-bold text-ink">{name}</p>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-tile bg-gradient-to-br from-sprout to-sprout-deep font-display text-[18px] font-bold text-white"
          aria-label={`${name}'s avatar`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      </header>

      {hasPlants ? (
        <>
          <div className="mt-6">
            <BalanceHero
              label="Total garden value"
              value={series[series.length - 1]}
              delta={delta}
              caption={RANGE_LABEL[tf]}
            />
          </div>

          <div className="mt-5 -mx-1">
            <GrowthChart
              data={series}
              timeframe={tf}
              height={150}
              label={`Garden value, ${RANGE_LABEL[tf]}`}
            />
          </div>

          <div className="mt-3">
            <RangeToggle value={tf} onChange={setTf} />
          </div>
        </>
      ) : (
        <section className="mt-10 flex flex-col items-center gap-4 rounded-card bg-card px-6 py-10 text-center shadow-leaf">
          <SproutGlyph size={44} />
          <div>
            <h2 className="font-display text-[20px] font-bold text-ink">Your garden is empty</h2>
            <p className="mt-1.5 text-[14px] font-medium text-muted">
              Plant your first seed and watch it grow.
            </p>
          </div>
          <button
            onClick={onPlantFirst}
            className="shadow-glow rounded-action bg-sprout px-6 py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.98]"
          >
            Plant a seed 🌱
          </button>
        </section>
      )}

      <div className="mt-7">
        <QuickActions onAction={onAction} />
      </div>

      {hasPlants && (
        <div className="mt-6">
          <NudgeCard
            title="Water your garden"
            subtitle="Grow faster with $25 every week"
            onClick={onNudge}
          />
        </div>
      )}

      {/* Plants */}
      <section className="mt-7" aria-label="Your plants">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-[17px] font-bold text-ink">Your plants</h2>
          {hasPlants && (
            <span className="text-[12px] font-semibold text-muted">
              {owned.length} growing
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          {waking ? (
            <>
              <PlantRowSkeleton />
              <PlantRowSkeleton />
              <PlantRowSkeleton />
            </>
          ) : owned.length === 0 ? (
            <p className="rounded-card bg-card px-4 py-5 text-center text-[14px] font-medium text-muted shadow-leaf">
              Nothing planted yet — your first seed starts the garden.
            </p>
          ) : (
            owned.map((h) => (
              <PlantRow key={h.plant.id} holding={h} onOpen={() => onOpenPlant(h.plant.id)} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
