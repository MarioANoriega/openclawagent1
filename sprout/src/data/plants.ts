export type Timeframe = "1W" | "1M" | "1Y" | "ALL";
export type Stage = "Sprouting" | "Growing" | "Mature";

export const TIMEFRAMES: Timeframe[] = ["1W", "1M", "1Y", "ALL"];

/** Points per timeframe — identical across plants so portfolios sum cleanly. */
export const POINTS: Record<Timeframe, number> = {
  "1W": 16,
  "1M": 30,
  "1Y": 48,
  ALL: 60,
};

export const RANGE_LABEL: Record<Timeframe, string> = {
  "1W": "this week",
  "1M": "this month",
  "1Y": "this year",
  ALL: "all time",
};

export interface Plant {
  id: string;
  name: string;
  emoji: string;
  stage: Stage;
  /** 1–4 filled dots on the maturity indicator. */
  maturity: number;
  /** Demo-garden value in dollars. */
  value: number;
  allTimePct: number;
  invested: number;
  /** Dollars auto-invested per week; 0 = watering off. */
  weeklyWatering: number;
  description: string;
  /** Dollar series per timeframe, ending at `value`. */
  history: Record<Timeframe, number[]>;
  isCash?: boolean;
  apy?: number;
}

/** Deterministic PRNG so the garden looks the same on every visit. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded random walk that ends exactly at `end` and grows `growthPct`
 * over the window, with gentle organic wobble.
 */
function walk(seed: number, points: number, end: number, growthPct: number, wobble: number): number[] {
  const rand = mulberry32(seed);
  const start = end / (1 + growthPct / 100);
  const out: number[] = [];
  let noise = 0;
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    // ease the drift so growth accelerates slightly, like a plant
    const drift = start + (end - start) * (t * 0.7 + t * t * 0.3);
    noise = noise * 0.82 + (rand() - 0.5) * 2 * wobble * end;
    // pin both ends so ranges agree with the headline numbers
    const pin = Math.sin(Math.PI * Math.min(1, t * 1.06)) ** 0.6;
    out.push(Math.max(0, drift + noise * pin));
  }
  out[out.length - 1] = end;
  return out;
}

function histories(
  seed: number,
  end: number,
  pct: Partial<Record<Timeframe, number>>,
  wobble = 0.012,
): Record<Timeframe, number[]> {
  return {
    "1W": walk(seed + 1, POINTS["1W"], end, pct["1W"] ?? 0.6, wobble),
    "1M": walk(seed + 2, POINTS["1M"], end, pct["1M"] ?? 2.4, wobble * 1.4),
    "1Y": walk(seed + 3, POINTS["1Y"], end, pct["1Y"] ?? 11, wobble * 2),
    ALL: walk(seed + 4, POINTS.ALL, end, pct.ALL ?? 18, wobble * 2.4),
  };
}

export const PLANTS: Plant[] = [
  {
    id: "total-market",
    name: "Total Market Fund",
    emoji: "🌳",
    stage: "Mature",
    maturity: 4,
    value: 2418.75,
    allTimePct: 21.4,
    invested: 1992.5,
    weeklyWatering: 25,
    description:
      "A slow, steady oak. One share holds a little of thousands of companies, so no single storm can knock it over. It grows quietly over years, not days — the plant you can forget about and still find taller.",
    history: histories(11, 2418.75, { "1W": 0.8, "1M": 2.9, "1Y": 12.6, ALL: 21.4 }, 0.008),
  },
  {
    id: "tech-growth",
    name: "Tech Growth",
    emoji: "🌿",
    stage: "Growing",
    maturity: 3,
    value: 1136.2,
    allTimePct: 14.8,
    invested: 990,
    weeklyWatering: 10,
    description:
      "A fast climber that loves the sun. Technology companies can shoot up quickly — and droop just as fast on cloudy weeks. Water it steadily and give it seasons, not days, to show its height.",
    history: histories(23, 1136.2, { "1W": 1.6, "1M": 4.2, "1Y": 16.5, ALL: 14.8 }, 0.02),
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    emoji: "🌱",
    stage: "Sprouting",
    maturity: 1,
    value: 212.4,
    allTimePct: -3.6,
    invested: 220.33,
    weeklyWatering: 0,
    description:
      "A wild seedling. Bitcoin swings harder than anything else in your garden — some weeks it doubles its stretch, some weeks it wilts. Plant only what you'd be at peace with losing, and let it surprise you.",
    history: histories(37, 212.4, { "1W": -2.1, "1M": 5.8, "1Y": 24, ALL: -3.6 }, 0.045),
  },
  {
    id: "cash",
    name: "Cash seeds",
    emoji: "🌰",
    stage: "Sprouting",
    maturity: 1,
    value: 340.25,
    allTimePct: 0,
    invested: 340.25,
    weeklyWatering: 0,
    description:
      "Seeds waiting in the shed — safe, dry, and earning a little interest while they wait. Ready to plant whenever you spot a sunny patch.",
    history: histories(53, 340.25, { "1W": 0.08, "1M": 0.33, "1Y": 4.1, ALL: 6.2 }, 0.0004),
    isCash: true,
    apy: 4.1,
  },
];

export function getPlant(id: string): Plant {
  const plant = PLANTS.find((p) => p.id === id);
  if (!plant) throw new Error(`No plant with id "${id}"`);
  return plant;
}

/** % change across a series' window. */
export function rangePct(series: number[]): number {
  const first = series[0];
  const last = series[series.length - 1];
  if (!first) return 0;
  return ((last - first) / first) * 100;
}
