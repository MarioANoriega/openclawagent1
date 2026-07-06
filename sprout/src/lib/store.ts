import { useCallback, useEffect, useMemo, useState } from "react";
import { PLANTS, TIMEFRAMES, type Plant, type Timeframe } from "../data/plants";

const STORAGE_KEY = "sprout:v1";
const FRESH_CASH = 500;

export interface GardenState {
  /** null until onboarding finishes. */
  name: string | null;
  /** true = the pre-grown demo garden; false = a fresh, empty garden. */
  demo: boolean;
  /** Extra dollars the user has planted into each holding. */
  added: Record<string, number>;
  /** Weekly-watering toggle overrides, keyed by plant id. */
  watering: Record<string, boolean>;
  /** Cash added (+) or planted away (−), relative to the starting pot. */
  cashDelta: number;
}

const INITIAL: GardenState = {
  name: null,
  demo: true,
  added: {},
  watering: {},
  cashDelta: 0,
};

function load(): GardenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    return { ...INITIAL, ...(JSON.parse(raw) as Partial<GardenState>) };
  } catch {
    return INITIAL;
  }
}

/** A holding as the user currently sees it: base mock data + their changes. */
export interface PlantView {
  plant: Plant;
  owned: boolean;
  value: number;
  invested: number;
  wateringOn: boolean;
  weeklyAmount: number;
  /** Dollar series per timeframe, scaled to the current value. */
  series: Record<Timeframe, number[]>;
}

function scaleSeries(plant: Plant, value: number): Record<Timeframe, number[]> {
  const factor = plant.value ? value / plant.value : 0;
  const out = {} as Record<Timeframe, number[]>;
  for (const tf of TIMEFRAMES) {
    out[tf] = plant.history[tf].map((v) => v * factor);
  }
  return out;
}

function view(plant: Plant, state: GardenState): PlantView {
  const added = state.added[plant.id] ?? 0;
  let value: number;
  let invested: number;
  if (plant.isCash) {
    value = (state.demo ? plant.value : FRESH_CASH) + state.cashDelta;
    invested = value;
  } else if (state.demo) {
    value = plant.value + added;
    invested = plant.invested + added;
  } else {
    value = added;
    invested = added;
  }
  const weeklyAmount = plant.weeklyWatering || 25;
  const wateringOn =
    state.watering[plant.id] ?? (state.demo && plant.weeklyWatering > 0);
  return {
    plant,
    owned: value > 0.005,
    value,
    invested,
    wateringOn,
    weeklyAmount,
    series: scaleSeries(plant, value),
  };
}

export interface Garden {
  state: GardenState;
  /** All holdings, in display order (cash last). Filter on `.owned`. */
  plants: PlantView[];
  cash: PlantView;
  /** Portfolio dollar series per timeframe (owned plants + cash). */
  portfolio: Record<Timeframe, number[]>;
  totalValue: number;
  begin: (name: string, demo: boolean) => void;
  /** Move `amount` from cash seeds into a holding (or top up cash itself). */
  plantSeed: (plantId: string, amount: number, waterWeekly: boolean) => void;
  setWatering: (plantId: string, on: boolean) => void;
  resetGarden: () => void;
}

export function useGarden(): Garden {
  const [state, setState] = useState<GardenState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked — the garden still grows for this visit.
    }
  }, [state]);

  const plants = useMemo(() => PLANTS.map((p) => view(p, state)), [state]);
  const cash = plants.find((p) => p.plant.isCash)!;

  const portfolio = useMemo(() => {
    const out = {} as Record<Timeframe, number[]>;
    for (const tf of TIMEFRAMES) {
      const length = PLANTS[0].history[tf].length;
      const sum = new Array<number>(length).fill(0);
      for (const p of plants) {
        if (!p.owned) continue;
        p.series[tf].forEach((v, i) => {
          sum[i] += v;
        });
      }
      out[tf] = sum;
    }
    return out;
  }, [plants]);

  const totalValue = plants.reduce((acc, p) => acc + (p.owned ? p.value : 0), 0);

  const begin = useCallback((name: string, demo: boolean) => {
    setState({ ...INITIAL, name: name.trim() || "Friend", demo });
  }, []);

  const plantSeed = useCallback(
    (plantId: string, amount: number, waterWeekly: boolean) => {
      setState((s) => {
        const isCash = plantId === "cash";
        const next: GardenState = {
          ...s,
          added: isCash
            ? s.added
            : { ...s.added, [plantId]: (s.added[plantId] ?? 0) + amount },
          cashDelta: s.cashDelta + (isCash ? amount : -amount),
          watering: waterWeekly ? { ...s.watering, [plantId]: true } : s.watering,
        };
        return next;
      });
    },
    [],
  );

  const setWatering = useCallback((plantId: string, on: boolean) => {
    setState((s) => ({ ...s, watering: { ...s.watering, [plantId]: on } }));
  }, []);

  const resetGarden = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL);
  }, []);

  return { state, plants, cash, portfolio, totalValue, begin, plantSeed, setWatering, resetGarden };
}
