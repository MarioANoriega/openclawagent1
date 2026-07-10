// Shared types for the Sapient-replica scan API.
//
// A scan follows the classic async-job pattern documented by the original:
//   POST /v1/scans        -> create a scan (status: queued)
//   GET  /v1/scans/{id}   -> poll until status: completed, then read results

export type ScanStatus = "queued" | "processing" | "completed" | "failed";

// The six primary neural channels we surface per second. The original claims
// "160+ signals"; those are condensed here into interpretable, validated-style
// channels. Every value is normalized 0..1.
export interface SignalFrame {
  t: number; // second offset from start
  attention: number;
  emotion: number; // valence-weighted arousal
  memory: number; // encoding likelihood
  intent: number; // purchase intent
  reward: number; // approach / reward signal
  hesitation: number; // avoidance / friction signal
}

export interface ScanEvents {
  // Second at which purchase intent tips over reward>hesitation, or null.
  buyMomentT: number | null;
  // Second at which attention drops below the drop-off threshold, or null.
  dropoffT: number | null;
  // Peak-attention second.
  peakAttentionT: number;
}

export interface ScanBenchmarks {
  avgAttention: number;
  avgIntent: number;
  attentionDensity: number; // fraction of seconds above the attention threshold
  // 0..100 composite, comparable across scans in the same account.
  neuralScore: number;
}

export interface Scan {
  id: string;
  status: ScanStatus;
  createdAt: string;
  completedAt: string | null;
  source: { kind: "url" | "file"; value: string };
  durationS: number;
  signals: SignalFrame[];
  events: ScanEvents | null;
  benchmarks: ScanBenchmarks | null;
  error?: string;
}

// The public shape returned by the API (omits nothing sensitive in this demo).
export type ScanResponse = Scan;
