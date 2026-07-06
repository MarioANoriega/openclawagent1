import { useCallback, useState } from "react";
import { useGarden } from "./lib/store";
import { PhoneFrame } from "./components/PhoneFrame";
import { BottomNav, type Tab } from "./components/BottomNav";
import { Toast } from "./components/Toast";
import type { QuickAction } from "./components/QuickActions";
import { Garden } from "./screens/Garden";
import { PlantDetail } from "./screens/PlantDetail";
import { SeedSheet, type SeedRequest } from "./screens/SeedSheet";
import { Onboarding } from "./screens/Onboarding";
import { ComingSoon, You } from "./screens/Placeholder";

export default function App() {
  const garden = useGarden();
  const [tab, setTab] = useState<Tab>("garden");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [seed, setSeed] = useState<SeedRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const closeSeed = useCallback(() => setSeed(null), []);
  const clearToast = useCallback(() => setToast(null), []);

  const detail = detailId ? garden.plants.find((p) => p.plant.id === detailId) : null;
  const seedTarget = seed ? (garden.plants.find((p) => p.plant.id === seed.targetId) ?? null) : null;

  /** Default holding to invest into: the first one growing, else the oak. */
  const investTarget =
    garden.plants.find((p) => p.owned && !p.plant.isCash)?.plant.id ?? "total-market";

  const onQuickAction = (a: QuickAction) => {
    if (a === "add") setSeed({ targetId: "cash" });
    else if (a === "invest") setSeed({ targetId: investTarget });
    else if (a === "send") setToast("Sending seeds to friends is still sprouting — check back soon.");
    else setToast("More tools are still taking root.");
  };

  if (!garden.state.name) {
    return (
      <PhoneFrame>
        <Onboarding onBegin={garden.begin} />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      {detail ? (
        <PlantDetail
          holding={detail}
          onBack={() => setDetailId(null)}
          onWater={() =>
            setSeed({ targetId: detail.plant.id, amount: detail.plant.isCash ? 50 : 25 })
          }
          onHarvest={() =>
            setToast("Harvest is still ripening in this prototype — let it keep growing.")
          }
        />
      ) : tab === "garden" ? (
        <Garden
          garden={garden}
          onOpenPlant={setDetailId}
          onAction={onQuickAction}
          onNudge={() => setSeed({ targetId: investTarget, amount: 25, water: true })}
          onPlantFirst={() => setSeed({ targetId: "total-market", amount: 50 })}
        />
      ) : tab === "explore" ? (
        <ComingSoon
          emoji="🗺️"
          title="Explore new seeds"
          note="A nursery of funds and plants to browse is on its way. For now, tend the garden you have."
        />
      ) : tab === "grow" ? (
        <ComingSoon
          emoji="📈"
          title="Grow"
          note="Lessons on patient investing, goals, and watering schedules will live here."
        />
      ) : (
        <You garden={garden} />
      )}

      {!detail && <BottomNav tab={tab} onChange={setTab} />}
      {detail && <div className="pb-[env(safe-area-inset-bottom)]" />}

      <SeedSheet
        request={seed}
        target={seedTarget}
        cashAvailable={garden.cash.value}
        onClose={closeSeed}
        onConfirm={(amount, water) => {
          if (seed) garden.plantSeed(seed.targetId, amount, water);
        }}
      />

      <Toast message={toast} onDone={clearToast} />
    </PhoneFrame>
  );
}
