import type { Scan } from "./types";
import { scoreSource } from "./scoring";

// ---------------------------------------------------------------------------
// In-memory scan store.
//
// Stands in for the database + job queue of a real deployment. Scans are
// created in `queued` state and "processed" on a short timer so the dashboard
// and API can demonstrate the real poll-until-complete flow. On a real
// deployment this would be Postgres + a worker running the scoring engine.
//
// Persisted on globalThis so it survives Next.js hot-reload in dev.
// ---------------------------------------------------------------------------

interface StoreShape {
  scans: Map<string, Scan>;
}

const g = globalThis as unknown as { __sapientStore?: StoreShape };
const store: StoreShape = g.__sapientStore ?? { scans: new Map() };
if (!g.__sapientStore) g.__sapientStore = store;

// Simulated processing time, in ms, before a scan completes.
const PROCESSING_MS = 2500;

function randomId(): string {
  return "scan_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function createScan(source: { kind: "url" | "file"; value: string }): Scan {
  const scan: Scan = {
    id: randomId(),
    status: "queued",
    createdAt: new Date().toISOString(),
    completedAt: null,
    source,
    durationS: 0,
    signals: [],
    events: null,
    benchmarks: null,
  };
  store.scans.set(scan.id, scan);

  // Kick off async "processing". Move to `processing` quickly, then complete.
  setTimeout(() => {
    const s = store.scans.get(scan.id);
    if (s && s.status === "queued") s.status = "processing";
  }, 400);

  setTimeout(() => {
    const s = store.scans.get(scan.id);
    if (!s || s.status === "completed" || s.status === "failed") return;
    try {
      const result = scoreSource(source.value);
      s.status = "completed";
      s.completedAt = new Date().toISOString();
      s.durationS = result.durationS;
      s.signals = result.signals;
      s.events = result.events;
      s.benchmarks = result.benchmarks;
    } catch (err) {
      s.status = "failed";
      s.error = err instanceof Error ? err.message : "scoring failed";
    }
  }, PROCESSING_MS);

  return scan;
}

export function getScan(id: string): Scan | undefined {
  return store.scans.get(id);
}

export function listScans(): Scan[] {
  return Array.from(store.scans.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}
