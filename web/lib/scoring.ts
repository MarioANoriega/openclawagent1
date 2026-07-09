import type {
  SignalFrame,
  ScanEvents,
  ScanBenchmarks,
} from "./types";

// ---------------------------------------------------------------------------
// Proxy scoring engine.
//
// This is deliberately NOT a real fMRI-trained model. As the research writeup
// notes, the differentiator of the original product is its proprietary scoring
// engine; everything else (site, API, dashboard, billing, funnel) is a shell.
//
// This module stands in for that engine with a deterministic, seedable
// generator that produces per-second signal curves with realistic structure:
// an attention onset, mid-clip fatigue, a reward build-up, and a buy-moment
// where intent tips over. Seeding by the source means the same input always
// yields the same read, so the demo behaves like a real service.
//
// To make this a genuine product, replace `scoreSource` with a composition of
// real models (visual saliency + facial-emotion + shot-level engagement) or a
// licensed/trained fMRI model, emitting the same SignalFrame[] contract.
// ---------------------------------------------------------------------------

// Small, fast string hash -> 32-bit unsigned seed.
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 deterministic PRNG.
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const round3 = (x: number) => Math.round(x * 1000) / 1000;

const ATTENTION_THRESHOLD = 0.45;
const DROPOFF_THRESHOLD = 0.3;

export interface ScoredResult {
  durationS: number;
  signals: SignalFrame[];
  events: ScanEvents;
  benchmarks: ScanBenchmarks;
}

// Produce a deterministic per-second read for a given source string.
export function scoreSource(source: string): ScoredResult {
  const seed = hashSeed(source);
  const rng = makeRng(seed);

  // Duration between 12 and 45 seconds, seeded.
  const durationS = 12 + Math.floor(rng() * 34);

  // Per-scan "personality": where reward builds, how strong the hook is.
  const hookStrength = 0.4 + rng() * 0.5; // opening attention grab
  const rewardPeak = 0.4 + rng() * 0.55;
  const buyBias = 0.35 + rng() * 0.4; // how far along intent tips over
  const fatigueRate = 0.15 + rng() * 0.3; // mid-clip attention decay
  const noise = 0.06; // per-frame jitter magnitude

  const jitter = () => (rng() - 0.5) * 2 * noise;

  const signals: SignalFrame[] = [];
  for (let t = 0; t < durationS; t++) {
    const p = t / (durationS - 1 || 1); // 0..1 progress

    // Attention: strong hook, decays with fatigue, small re-engagement bump
    // near the end (call-to-action).
    const hook = hookStrength * Math.exp(-3.2 * p);
    const base = 0.35 + 0.25 * Math.sin(Math.PI * p); // arc across the clip
    const fatigue = -fatigueRate * p;
    const cta = 0.18 * Math.exp(-40 * (p - 0.9) * (p - 0.9)); // late bump
    const attention = clamp01(0.25 + hook + base + fatigue + cta + jitter());

    // Reward builds toward rewardPeak around buyBias, then plateaus.
    const rewardCurve =
      rewardPeak * Math.exp(-6 * (p - buyBias) * (p - buyBias));
    const reward = clamp01(0.2 + rewardCurve + jitter());

    // Hesitation is highest early (uncertainty) and spikes if reward is low.
    const hesitation = clamp01(
      0.45 * Math.exp(-2.5 * p) + (0.4 - reward) * 0.5 + jitter()
    );

    // Intent tracks reward minus hesitation, gated by attention.
    const intent = clamp01(
      attention * (reward - hesitation * 0.7) + 0.1 + jitter()
    );

    // Emotion: arousal that rides attention with its own oscillation.
    const emotion = clamp01(
      0.3 + 0.4 * attention + 0.15 * Math.sin(Math.PI * 2 * p) + jitter()
    );

    // Memory encoding: favored by joint attention+emotion (peaks stick).
    const memory = clamp01(0.15 + 0.6 * attention * emotion + jitter());

    signals.push({
      t,
      attention: round3(attention),
      emotion: round3(emotion),
      memory: round3(memory),
      intent: round3(intent),
      reward: round3(reward),
      hesitation: round3(hesitation),
    });
  }

  const events = deriveEvents(signals);
  const benchmarks = deriveBenchmarks(signals);
  return { durationS, signals, events, benchmarks };
}

function deriveEvents(signals: SignalFrame[]): ScanEvents {
  // Buy moment: first second where reward exceeds hesitation AND intent is
  // above a meaningful floor — "the moment intent tips over".
  let buyMomentT: number | null = null;
  for (const f of signals) {
    if (f.reward > f.hesitation && f.intent >= 0.5) {
      buyMomentT = f.t;
      break;
    }
  }

  // Drop-off: first second after the first third where attention falls below
  // the drop-off threshold and stays low next second too.
  let dropoffT: number | null = null;
  const start = Math.floor(signals.length / 3);
  for (let i = start; i < signals.length - 1; i++) {
    if (
      signals[i].attention < DROPOFF_THRESHOLD &&
      signals[i + 1].attention < DROPOFF_THRESHOLD
    ) {
      dropoffT = signals[i].t;
      break;
    }
  }

  let peakAttentionT = 0;
  let peak = -1;
  for (const f of signals) {
    if (f.attention > peak) {
      peak = f.attention;
      peakAttentionT = f.t;
    }
  }

  return { buyMomentT, dropoffT, peakAttentionT };
}

function deriveBenchmarks(signals: SignalFrame[]): ScanBenchmarks {
  const n = signals.length || 1;
  const sum = signals.reduce(
    (acc, f) => {
      acc.attention += f.attention;
      acc.intent += f.intent;
      acc.memory += f.memory;
      acc.above += f.attention >= ATTENTION_THRESHOLD ? 1 : 0;
      return acc;
    },
    { attention: 0, intent: 0, memory: 0, above: 0 }
  );

  const avgAttention = sum.attention / n;
  const avgIntent = sum.intent / n;
  const avgMemory = sum.memory / n;
  const attentionDensity = sum.above / n;

  // Composite 0..100 weighted toward intent + attention retention.
  const neuralScore = Math.round(
    100 *
      clamp01(
        0.4 * avgIntent +
          0.35 * avgAttention +
          0.15 * attentionDensity +
          0.1 * avgMemory
      )
  );

  return {
    avgAttention: round3(avgAttention),
    avgIntent: round3(avgIntent),
    attentionDensity: round3(attentionDensity),
    neuralScore,
  };
}
