"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import type { Scan } from "@/lib/types";
import SignalChart, { CHANNELS } from "@/components/SignalChart";

const DEMO_KEY = "sk_demo_neuralytics";

const SAMPLES = [
  "https://cdn.example.com/spring-launch-hook-a.mp4",
  "https://cdn.example.com/spring-launch-hook-b.mp4",
  "https://cdn.example.com/testimonial-30s.mp4",
];

function SessionBadge() {
  const { data: session } = useSession();
  if (!session?.user) {
    return (
      <div className="row" style={{ gap: 10 }}>
        <span className="pill">demo mode · key {DEMO_KEY}</span>
        <Link href="/login" className="btn btn-outline btn-sm">Log in</Link>
      </div>
    );
  }
  return (
    <div className="row" style={{ gap: 10 }}>
      <span className="pill">{session.user.email}</span>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{ cursor: "pointer" }}
      >
        Sign out
      </button>
    </div>
  );
}

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [scan, setScan] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(CHANNELS.map((c) => [c.key, true]))
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const poll = useCallback(async (id: string) => {
    const res = await fetch(`/api/v1/scans/${id}`, {
      headers: { Authorization: `Bearer ${DEMO_KEY}` },
    });
    if (!res.ok) return;
    const data: Scan = await res.json();
    setScan(data);
    if (data.status === "completed" || data.status === "failed") {
      stopPolling();
      setBusy(false);
    }
  }, []);

  const submit = useCallback(
    async (value: string) => {
      const v = value.trim();
      if (!v) return;
      setError(null);
      setBusy(true);
      setScan(null);
      stopPolling();
      try {
        const res = await fetch("/api/v1/scans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEMO_KEY}`,
          },
          body: JSON.stringify({ url: v }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error ?? `request failed (${res.status})`);
        }
        const created: Scan = await res.json();
        setScan(created);
        pollRef.current = setInterval(() => poll(created.id), 700);
      } catch (err) {
        setError(err instanceof Error ? err.message : "something went wrong");
        setBusy(false);
      }
    },
    [poll]
  );

  useEffect(() => () => stopPolling(), []);

  const b = scan?.benchmarks;
  const e = scan?.events;

  return (
    <div>
      <div style={{ borderBottom: "1px solid var(--line-soft)", padding: "16px 0" }}>
        <div className="container row" style={{ justifyContent: "space-between" }}>
          <Link href="/" className="logo" aria-label="Neuralytics">
            <span className="t2">Neuralytics</span>
            <span className="t3">the analytics of attention</span>
          </Link>
          <SessionBadge />
        </div>
      </div>

      <div className="container" style={{ padding: "40px 22px 80px" }}>
        <div className="eyebrow-wrap" style={{ justifyContent: "flex-start" }}>
          <span className="eyebrow">New scan</span>
        </div>
        <h2 className="dash-h2" style={{ marginBottom: 10 }}>Drop in an ad or video URL.</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Paste a link and Neuralytics returns a per-second neural read. (This demo
          scores a deterministic proxy model — same input, same read.)
        </p>

        <div className="row" style={{ marginTop: 18, marginBottom: 12 }}>
          <input
            className="input"
            placeholder="https://cdn.yoursite.com/ad.mp4"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
            onKeyDown={(ev) => ev.key === "Enter" && submit(url)}
          />
          <button
            className="btn btn-primary"
            onClick={() => submit(url)}
            disabled={busy}
            style={{ whiteSpace: "nowrap", opacity: busy ? 0.6 : 1 }}
          >
            {busy ? "Scanning…" : "Scan"}
          </button>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="faint" style={{ fontSize: 13 }}>Try:</span>
          {SAMPLES.map((s) => (
            <button
              key={s}
              className="pill"
              style={{ cursor: "pointer", background: "transparent" }}
              onClick={() => {
                setUrl(s);
                submit(s);
              }}
            >
              {s.split("/").pop()}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color: "var(--hesitation)", marginTop: 16 }}>Error: {error}</p>
        )}

        {scan && (
          <div style={{ marginTop: 40 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div className="faint mono" style={{ fontSize: 12 }}>{scan.id}</div>
                <div className="muted" style={{ fontSize: 14 }}>{scan.source.value}</div>
              </div>
              <span className={`status-chip status-${scan.status}`}>
                {scan.status}
              </span>
            </div>

            {scan.status !== "completed" ? (
              <div className="card" style={{ textAlign: "center", padding: 48 }}>
                <p className="muted" style={{ margin: 0 }}>
                  {scan.status === "queued"
                    ? "Queued — allocating the model…"
                    : "Reading the clip second by second…"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-3" style={{ marginBottom: 24 }}>
                  <div className="stat">
                    <div className="n" style={{ color: "var(--accent)" }}>
                      {b?.neuralScore}
                      <span style={{ fontSize: 16, color: "var(--text-faint)" }}>/100</span>
                    </div>
                    <div className="l">Composite neural score</div>
                  </div>
                  <div className="stat">
                    <div className="n">
                      {e?.buyMomentT != null ? `${e.buyMomentT}s` : "—"}
                    </div>
                    <div className="l">Buy moment (intent tips over)</div>
                  </div>
                  <div className="stat">
                    <div className="n">
                      {e?.dropoffT != null ? `${e.dropoffT}s` : "none"}
                    </div>
                    <div className="l">Attention drop-off</div>
                  </div>
                  <div className="stat">
                    <div className="n">{scan.durationS}s</div>
                    <div className="l">Clip duration</div>
                  </div>
                  <div className="stat">
                    <div className="n">{((b?.avgAttention ?? 0) * 100).toFixed(0)}%</div>
                    <div className="l">Avg attention</div>
                  </div>
                  <div className="stat">
                    <div className="n">{((b?.attentionDensity ?? 0) * 100).toFixed(0)}%</div>
                    <div className="l">Attention density</div>
                  </div>
                </div>

                <div className="card">
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                    <h3 style={{ margin: 0 }}>Per-second signal timeline</h3>
                    <div className="legend">
                      {CHANNELS.map((c) => (
                        <button
                          key={c.key}
                          onClick={() =>
                            setActive((a) => ({ ...a, [c.key]: !a[c.key] }))
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: active[c.key] ? "var(--text-dim)" : "var(--text-faint)",
                            opacity: active[c.key] ? 1 : 0.45,
                            fontSize: 13,
                          }}
                        >
                          <span className="sw" style={{ background: c.color }} />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <SignalChart signals={scan.signals} events={scan.events} active={active} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
