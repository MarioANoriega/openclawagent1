# Sapient — replica

An open, runnable replica of the product at **thesapientcompany.com**, built from
the research writeup in [`../research/sapient-website-research.md`](../research/sapient-website-research.md).

It reproduces everything about the product that is a *shell* — the marketing site,
the async scan API, the dashboard with a per-second neural timeline, the API-key auth,
and the MCP/pricing framing. The one thing it deliberately does **not** reproduce is
the proprietary fMRI-trained scoring model; that is stubbed by a deterministic proxy
engine (see below).

Not affiliated with thesapientcompany.com — for study only.

## Stack

- **Next.js 14** (App Router) + React 18, TypeScript — the same Vercel/Next.js stack
  the original runs on (confirmed via DNS in the research doc).
- No runtime dependencies beyond Next/React. The timeline chart is hand-rolled SVG;
  the scan store is in-memory.

## Run

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

- `/` — landing page (hero, how-it-works, signals, API, MCP, testimonials, pricing).
- `/dashboard` — paste a video URL, watch the scan poll to completion, read the
  per-second signal timeline with buy-moment and drop-off markers.

`npm run build` and `npm run typecheck` both pass.

## Auth

NextAuth is wired at `/api/auth` (config in `lib/auth.ts`):

- **Email (demo)** — works out of the box: any well-formed email signs in and
  gets a real JWT session. The dashboard header shows the user + Sign out.
- **Google / Apple** — activate automatically when their env vars exist
  (`GOOGLE_CLIENT_ID`/`_SECRET`, `APPLE_CLIENT_ID`/`_SECRET` — see
  `.env.example`, including the redirect URIs to register). Until configured,
  the buttons explain what's missing instead of dead-ending.
- Pages: `/login`, `/signup`, plus `/privacy` and `/terms` linked from the
  consent line. Set `NEXTAUTH_URL` + `NEXTAUTH_SECRET` in production.

## API

Classic async-job pattern, mirroring the original's documented behavior.

```bash
# 1. create a scan
curl -X POST http://localhost:3000/api/v1/scans \
  -H "Authorization: Bearer sk_demo_sapient" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://cdn.example.com/ad.mp4"}'
# -> 202 { "id": "scan_...", "status": "queued", ... }

# 2. poll until completed
curl http://localhost:3000/api/v1/scans/<id> \
  -H "Authorization: Bearer sk_demo_sapient"
# -> { "status": "completed", "signals": [...], "events": {...}, "benchmarks": {...} }
```

- `POST /v1/scans` — body `{ "url": "..." }` or `{ "file": "name.mp4" }`. Returns 202.
- `GET  /v1/scans/{id}` — poll; returns the scan in `queued | processing | completed | failed`.
- `GET  /v1/scans` — list recent scans (demo convenience).

Auth: any non-empty `Authorization: Bearer <key>` is accepted in the demo; the
sample key is `sk_demo_sapient`. Missing key → 401, missing source → 400.

### Result schema

```jsonc
{
  "id": "scan_...",
  "status": "completed",
  "durationS": 34,
  "signals": [
    { "t": 0, "attention": 0.9, "emotion": 0.68, "memory": 0.6,
      "intent": 0.42, "reward": 0.32, "hesitation": 0.51 }
    // ... one frame per second
  ],
  "events": { "buyMomentT": 10, "dropoffT": null, "peakAttentionT": 0 },
  "benchmarks": { "avgAttention": 0.81, "avgIntent": 0.43,
                  "attentionDensity": 1.0, "neuralScore": 65 }
}
```

## The scoring engine (the honest part)

`lib/scoring.ts` is **not** a real fMRI model. As the research doc explains, the
original's moat is its proprietary scoring engine; everything else is a shell that's
easy to clone. This stub is a deterministic, seedable generator: it hashes the source
string and produces per-second curves with realistic structure (attention hook →
mid-clip fatigue → reward build-up → a buy moment where intent tips over). Same input
always yields the same read, so the demo behaves like a real service.

To make this a genuine product, replace `scoreSource()` with either:

1. **A composed proxy** — visual-saliency + facial-emotion + shot-level engagement
   models combined into one per-second vector, or
2. **A licensed/trained model** on paired video↔fMRI data,

emitting the same `SignalFrame[]` contract. The API, dashboard, store, and UI all
stay unchanged.

## What's stubbed vs. real for production

| Piece | Here | For production |
|---|---|---|
| Scoring engine | deterministic proxy | trained/licensed fMRI model |
| Scan store | in-memory `Map` | Postgres + job queue + object storage |
| Auth / API keys | any bearer token | per-user keys in a DB |
| Billing | none | Stripe $29/mo + 50-scan quota |
| Docs | this file | Mintlify on `api.` subdomain |
| MCP server | described in UI | thin server wrapping the two endpoints |
