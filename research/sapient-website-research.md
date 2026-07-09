# Deep Research: thesapientcompany.com ("Sapient")

**Research date:** 2026-07-09
**Goal:** Understand how this website/product works well enough to replicate it.

> **Access note:** Direct access to `*.thesapientcompany.com` was blocked from this
> environment (network policy denial at the gateway, plus the site itself returns
> HTTP 403 to non-browser fetchers — it runs bot protection). All findings below were
> reconstructed from search-engine indexing of the live site, DNS records, and public
> sources. Product copy and structure are well covered; exact visual design (colors,
> typography, imagery) could not be observed and would need a manual browser visit.

---

## 1. What the product is

**Sapient — "Decode what humans think"** is a neuromarketing SaaS. Its core claim:
an AI model **trained on real fMRI brain data** that "watches" any video ad or piece
of content and predicts, **second by second**, how a human brain would respond.

Key product claims (verbatim or near-verbatim from the site's indexed copy):

- Reads **160+ neural signals** to show exactly how the brain responds — "and the
  moment it turns away."
- Maps **attention, emotion, memory, and intent** as they fire, per second.
- Outputs **per-second activation, predicted attention, and buy-moment timelines**
  for every scan — including "the exact second they decide to buy" and "what to cut."
- Reads the brain's **reward vs. hesitation** signals and "marks the moment intent
  tips over."
- Lets you **scan variations of the same ad** and see which one the brain responds to
  (A/B testing without running traffic).
- Positioning: real fMRI ad studies "run five figures"; Sapient is **$29/month**.

### Relationship to QOVES

The site features quotes/testimonials tied to **QOVES** (the AI facial-aesthetics
analysis company founded in 2024 by Shafee Hassan and Leo Olsen Guillot — known from
the QOVES Studio YouTube channel). One indexed quote: *"I'm excited to advance the
science of beauty with QOVES and deepen our empirical understanding of how to improve
facial attractiveness."* Sapient appears to be either a sibling product, spin-off, or
close partner of QOVES — the QOVES customer testimonials ("Qoves made me realize what
I could improve and backed it up with facts", etc.) are indexed on the same domain.

---

## 2. Page structure (reconstructed from indexed copy)

The homepage is a single-page marketing funnel with roughly these sections:

1. **Hero** — headline "Decode what humans think"; subhead about reading 160+ neural
   signals to show how the brain responds and the moment it turns away.
2. **How it works** (3 steps):
   1. *Upload* — "Drop in any ad, video, or piece of content — a link or a file.
      That's the whole setup."
   2. *Analyze* — "A model trained on real fMRI brain data reads it second by second,
      mapping attention, emotion, memory and intent as they fire."
   3. *Results* — "Get the full neural readout — where attention holds, the exact
      second they decide to buy, what to cut — and optimize for the result you want."
3. **Feature showcase** — per-second activation timeline, predicted attention,
   buy-moment detection, reward-vs-hesitation scoring, neural signal heatmaps,
   performance benchmarks, ad-variant comparison.
4. **Developer/API section** — "Send a video URL, poll the scan, read every signal
   per second. POST a video URL or file with your API key. No SDK required, it is
   plain HTTPS." Results can be "piped into your dashboard, your agent, or your ad
   rotation."
5. **Agent/MCP integration** — "Connects to any MCP-capable agent — including Claude
   Code, Codex, Cursor, and Windsurf — in a single command." Works "from a dashboard,
   terminal, or coding agent."
6. **Testimonials** — QOVES-derived social proof.
7. **Pricing** — single plan: **$29/month, 50 scans (ads/pieces of content) per
   month, API key included**.
8. **CTA / footer.**

---

## 3. Technical architecture (observed + inferred)

### Observed via DNS

| Host | Points to | Meaning |
|---|---|---|
| `www.thesapientcompany.com` | `*.vercel-dns-016.com` (216.150.x.x) | Marketing site + app hosted on **Vercel** — almost certainly a **Next.js** app |
| `thesapientcompany.com` | 216.150.1.1 (Vercel apex) | Apex also on Vercel |
| `api.thesapientcompany.com` | `cname.mintlify.builders` (Cloudflare) | **API documentation on Mintlify** (docs platform used by Stripe-style API companies) |
| `app.` / `docs.` subdomains | do not exist | Dashboard likely lives on the main domain (e.g. `/dashboard`) |

The 403s to plain HTTP clients and to Claude's remote fetcher indicate **bot
protection** (Vercel Firewall / attack-challenge mode on the main site; Cloudflare on
the Mintlify docs).

### Inferred backend design (from the documented API behavior)

The public API follows a classic **async job** pattern:

1. `POST` a video URL or file upload, authenticated with a per-user **API key**.
2. Receive a scan ID; **poll** the scan until processing completes.
3. `GET` the result: a per-second time series of ~160 signal scores (attention,
   emotion, memory, intent, reward, hesitation…), plus derived events (buy moment,
   drop-off moment) and aggregate benchmarks.

The "no SDK, plain HTTPS" framing plus Mintlify docs plus MCP server is the modern
API-first playbook: the same key works from the web dashboard, raw curl, or an MCP
server that any coding agent can call.

---

## 4. Growth/distribution mechanics (decoded from the shared URL)

The URL you provided carries the whole funnel in its query string:

```
?inro_id=25361146&ref=inro.social&username=mario__noriega
&utm_campaign=Scenario+-+RRG+x+RRG+x+Sapient+Launch
&utm_content=mario__noriega&utm_medium=inro_link&utm_source=instagram
&fbclid=...
```

- **Inrō (inro.social)** is an Instagram **DM-automation** platform: when followers
  comment on a post or reply to a story, Inrō auto-DMs them a tracked link.
- Each creator in the campaign gets a personalized link (`username=mario__noriega`,
  `utm_content=mario__noriega`) so signups/revenue attribute back to them —
  influencer/affiliate attribution without coupon codes.
- `utm_campaign=Scenario - RRG x RRG x Sapient Launch` names a coordinated
  multi-creator **launch campaign**; `utm_source=instagram` + `fbclid` confirm the
  click came from inside the Instagram app.
- So the acquisition motion is: **Instagram content → comment/DM trigger → Inrō
  auto-DM with tracked link → landing page → $29/mo self-serve subscription.**

---

## 5. Replication blueprint

What it would take to build a functional clone of the *website/product shell*:

### Frontend (marketing + dashboard)
- **Next.js on Vercel**, single scrolling landing page with the 8 sections above.
- Dark, "scientific/premium" aesthetic is typical for this category (unverified —
  needs a manual browser visit for exact design tokens).
- Dashboard route behind auth: upload/URL input → scan progress → per-second timeline
  visualization (line chart of signal scores over the video timeline, with markers
  for buy moment / drop-off), variant comparison view.

### Backend
- Auth + billing: **Stripe subscription** ($29/mo) with a **usage quota** (50
  scans/month) and per-user **API keys**.
- Scan pipeline: `POST /v1/scans` (URL or multipart file) → enqueue job → worker
  downloads video, runs model, writes per-second scores → `GET /v1/scans/{id}`
  returns status then results. Webhooks optional; polling is the documented pattern.
- Result schema: `{ scan_id, status, duration_s, signals: [{t, attention, emotion,
  memory, intent, reward, hesitation, ...}], events: {buy_moment_t, dropoff_t},
  benchmarks: {...} }`.

### Docs & agent surface
- **Mintlify** docs site on a subdomain.
- A small **MCP server** exposing `scan_video` / `get_scan` tools so Claude Code,
  Cursor, Codex, Windsurf connect "in one command."

### Distribution
- Influencer launch via **Inrō** (or ManyChat) DM automation with per-creator UTM
  links, as decoded above.

### The honest caveat
The moat is the **model**, not the website. "Trained on real fMRI data" implies a
proprietary dataset pairing video stimuli with brain recordings (public datasets like
the Human Connectome Project or Neuroscape-style media-viewing fMRI sets exist, but a
credible product needs substantial data + validation). A replica can reproduce the
site, API shape, billing, and funnel exactly; the per-second neural prediction would
need either a licensed model, a proxy model (e.g. attention-saliency + emotion
recognition + engagement-prediction models composed into a single per-second score),
or a from-scratch fMRI data-collection effort. In other words: the marketing site,
dashboard, async scan API, Mintlify docs, MCP server, Stripe billing, and Inrō-style
influencer funnel are all straightforward to clone in days; the differentiator is the
scoring engine behind `POST /v1/scans`, which is where any serious replication effort
should be focused (and validated against held-out human data before making claims).

---

## 6. Suggested build order for a replica

1. **Landing page** (Next.js/Vercel) — hero, 3-step "how it works", feature showcase,
   API/MCP section, testimonials, single $29/mo pricing card, CTA. ~1 day.
2. **Auth + Stripe** subscription with a 50-scan/month quota and API-key issuance.
3. **Scan API** — `POST /v1/scans` (URL or file) → job queue → `GET /v1/scans/{id}`
   returning per-second signal arrays + buy-moment/drop-off events.
4. **Scoring engine** (the hard part) — start with a composed proxy (visual
   saliency + facial-emotion + shot-level engagement) emitting a per-second vector;
   swap in a trained model later. Validate before publishing accuracy claims.
5. **Dashboard** — upload/URL input, scan progress, per-second timeline chart with
   buy-moment/drop-off markers, and A/B variant comparison.
6. **Mintlify docs** on `api.` subdomain + a thin **MCP server** wrapping the two
   endpoints so Claude Code/Cursor/Codex/Windsurf connect in one command.
7. **Distribution** — Inrō (or ManyChat) Instagram DM automation with per-creator UTM
   links, mirroring the `utm_medium=inro_link` funnel in the shared URL.

---

## 7. Sources

- Live site (indexed copy, direct access 403-blocked): https://www.thesapientcompany.com/
- DNS: `www` → Vercel (`vercel-dns-016.com`); `api` → Mintlify (`cname.mintlify.builders`).
- Inrō referral/DM-automation platform: https://www.inro.social/ and
  https://help.inro.social/en/articles/10761052-getting-started-with-the-inro-referral-program
- QOVES (facial-aesthetics AI, founders Shafee Hassan & Leo Olsen Guillot):
  https://en.wikipedia.org/wiki/Qoves