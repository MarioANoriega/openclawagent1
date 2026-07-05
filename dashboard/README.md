# Investment Dashboard

A self-contained, auto-updating market dashboard focused on **BlackRock (BLK)**
and **Berkshire Hathaway (BRK-B)**, with major indices, Berkshire's top 13F
holdings, asset-manager peers, hedge-fund-style signals, and strategy playbooks.

Everything is static — `index.html` + `data/market.json` — so it runs anywhere:
GitHub Pages, any web server, or locally.

## What's on it

- **KPI tiles** — BLK, BRK-B, S&P 500, Dow, Nasdaq 100 with today's move and a 30-day sparkline
- **Price & trend charts** — closes with 50/200-day moving averages, 1M–2Y range filter, hover tooltips
- **Relative performance** — BLK vs BRK-B vs S&P 500 indexed to 100
- **Hedge-fund signal board** — 1D/1M/3M/6M/1Y returns, 30-day realized vol, RSI(14), 200-day trend & golden/death cross, distance from 52-week high, composite momentum score
- **Berkshire 13F clone tracker** — top-10 disclosed holdings with approximate weights, weighted clone return vs the S&P 500
- **Strategy playbooks** — trend following, cross-sectional momentum, 13F cloning, vol targeting, mean reversion, correlation/diversification — each with a live read computed from the current data
- **Headlines** — Yahoo Finance RSS for BLK, BRK-B, and the broad market

Light and dark mode follow your system preference. The page re-fetches its data
every 5 minutes in the browser.

## How the automatic updates work

`.github/workflows/market-dashboard.yml` runs every 30 minutes during US market
hours (plus an after-close snapshot). Each run:

1. executes `scripts/fetch_market_data.py`, which pulls quotes and ~2 years of
   daily history from [Stooq](https://stooq.com) (no API key) and headlines
   from Yahoo Finance RSS,
2. commits the refreshed `dashboard/data/market.json` to `main` if it changed,
3. deploys the `dashboard/` folder to GitHub Pages.

### One-time setup

1. Merge this to `main` (scheduled workflows only run from the default branch).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Optionally kick the first run: **Actions → "Market dashboard — refresh data & deploy" → Run workflow**.

The dashboard then lives at `https://<user>.github.io/<repo>/`.

Until the first live run, the committed `data/market.json` contains clearly
labeled **synthetic sample data** (generated with
`python3 scripts/fetch_market_data.py --sample`) so the page works out of the box.

## Run locally

```bash
python3 scripts/fetch_market_data.py      # or --sample if offline
cd dashboard && python3 -m http.server 8000
# open http://localhost:8000
```

## Updating the 13F weights

Berkshire's holdings and weights are a curated constant (`BRK_13F` in
`index.html`, symbol list in `scripts/fetch_market_data.py`). Filings land
~45 days after quarter end (mid-Feb / May / Aug / Nov) — refresh the weights
from [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001067983&type=13F) then.

## Disclaimer

Research and education only — **not investment advice**. Quotes are delayed
EOD/intraday data from a free source; 13F weights are approximate and lag the
market by up to 45 days.
