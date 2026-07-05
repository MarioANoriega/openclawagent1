#!/usr/bin/env python3
"""Fetch market data for the investment dashboard.

Pulls delayed quotes and ~2 years of daily history from Stooq (no API key
required) and headlines from Yahoo Finance RSS, then writes a single JSON
snapshot the static dashboard reads.

Usage:
    python3 scripts/fetch_market_data.py            # fetch live data
    python3 scripts/fetch_market_data.py --sample   # deterministic sample data

Stdlib only — no dependencies. Designed to run inside a scheduled GitHub
Actions workflow (.github/workflows/market-dashboard.yml).
"""

import argparse
import csv
import io
import json
import math
import random
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / "dashboard" / "data" / "market.json"
HISTORY_DAYS = 520  # ~2 trading years
USER_AGENT = "Mozilla/5.0 (compatible; market-dashboard/1.0)"

# ticker -> (stooq symbol, display name, group)
# groups: focus | index | holding | peer
SYMBOLS = {
    "BLK":   ("blk.us",   "BlackRock",           "focus"),
    "BRK-B": ("brk-b.us", "Berkshire Hathaway B", "focus"),
    "^SPX":  ("^spx",     "S&P 500",             "index"),
    "^DJI":  ("^dji",     "Dow Jones",           "index"),
    "^NDQ":  ("^ndq",     "Nasdaq 100",          "index"),
    "AAPL":  ("aapl.us",  "Apple",               "holding"),
    "AXP":   ("axp.us",   "American Express",    "holding"),
    "BAC":   ("bac.us",   "Bank of America",     "holding"),
    "KO":    ("ko.us",    "Coca-Cola",           "holding"),
    "CVX":   ("cvx.us",   "Chevron",             "holding"),
    "OXY":   ("oxy.us",   "Occidental",          "holding"),
    "MCO":   ("mco.us",   "Moody's",             "holding"),
    "CB":    ("cb.us",    "Chubb",               "holding"),
    "KHC":   ("khc.us",   "Kraft Heinz",         "holding"),
    "DVA":   ("dva.us",   "DaVita",              "holding"),
    "BX":    ("bx.us",    "Blackstone",          "peer"),
    "KKR":   ("kkr.us",   "KKR",                 "peer"),
    "STT":   ("stt.us",   "State Street",        "peer"),
    "TROW":  ("trow.us",  "T. Rowe Price",       "peer"),
}

NEWS_FEEDS = [
    ("BLK", "https://feeds.finance.yahoo.com/rss/2.0/headline?s=BLK&region=US&lang=en-US"),
    ("BRK-B", "https://feeds.finance.yahoo.com/rss/2.0/headline?s=BRK-B&region=US&lang=en-US"),
    ("MARKET", "https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC&region=US&lang=en-US"),
]


def http_get(url, retries=3):
    last_err = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except Exception as err:  # noqa: BLE001 - retry any transport error
            last_err = err
            time.sleep(2 ** attempt)
    raise RuntimeError(f"GET {url} failed after {retries} attempts: {last_err}")


def fetch_history(stooq_symbol):
    url = f"https://stooq.com/q/d/l/?s={stooq_symbol}&i=d"
    text = http_get(url)
    rows = list(csv.DictReader(io.StringIO(text)))
    rows = [r for r in rows if r.get("Close") not in (None, "", "N/D")]
    rows = rows[-HISTORY_DAYS:]
    if not rows:
        raise RuntimeError(f"no history rows for {stooq_symbol}")
    return {
        "dates": [r["Date"] for r in rows],
        "close": [round(float(r["Close"]), 4) for r in rows],
    }


def fetch_quotes(stooq_symbols):
    joined = ",".join(stooq_symbols)
    url = f"https://stooq.com/q/l/?s={joined}&f=sd2t2ohlcv&h&e=csv"
    text = http_get(url)
    quotes = {}
    for row in csv.DictReader(io.StringIO(text)):
        sym = (row.get("Symbol") or "").lower()
        try:
            quotes[sym] = {
                "date": row.get("Date"),
                "time": row.get("Time"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "price": float(row["Close"]),
                "volume": float(row["Volume"]) if row.get("Volume") not in (None, "", "N/D") else None,
            }
        except (KeyError, ValueError, TypeError):
            continue  # symbol had N/D fields; history fallback covers it
    return quotes


def fetch_news():
    items = []
    for tag, url in NEWS_FEEDS:
        try:
            root = ET.fromstring(http_get(url))
        except Exception as err:  # noqa: BLE001 - one dead feed shouldn't kill the run
            print(f"warn: news feed {tag} failed: {err}", file=sys.stderr)
            continue
        for item in root.iter("item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub = (item.findtext("pubDate") or "").strip()
            if title and link:
                items.append({"tag": tag, "title": title, "link": link, "published": pub})
    # de-dupe by title, newest feeds first, cap the list
    seen, unique = set(), []
    for it in items:
        if it["title"] not in seen:
            seen.add(it["title"])
            unique.append(it)
    return unique[:40]


def build_live():
    stooq_to_ticker = {v[0]: k for k, v in SYMBOLS.items()}
    raw_quotes = fetch_quotes(list(stooq_to_ticker))

    history, quotes, failed = {}, {}, []
    for ticker, (stooq_sym, name, group) in SYMBOLS.items():
        try:
            hist = fetch_history(stooq_sym)
        except Exception as err:  # noqa: BLE001 - tolerate per-symbol outages
            print(f"warn: history for {ticker} failed: {err}", file=sys.stderr)
            failed.append(ticker)
            continue
        history[ticker] = hist
        q = raw_quotes.get(stooq_sym, {})
        last_close = hist["close"][-1]
        prev_close = hist["close"][-2] if len(hist["close"]) > 1 else last_close
        price = q.get("price", last_close)
        # if the intraday quote is for the same date as the last history row,
        # the previous history row is the true prior close
        if q.get("date") == hist["dates"][-1] and len(hist["close"]) > 1:
            prev = hist["close"][-2]
        elif q.get("date") and q.get("date") != hist["dates"][-1]:
            prev = last_close
        else:
            prev = prev_close
        quotes[ticker] = {
            "name": name,
            "group": group,
            "price": round(price, 4),
            "prev_close": round(prev, 4),
            "date": q.get("date") or hist["dates"][-1],
            "time": q.get("time"),
            "open": q.get("open"),
            "high": q.get("high"),
            "low": q.get("low"),
            "volume": q.get("volume"),
        }

    if not history:
        raise RuntimeError("all symbols failed — refusing to write an empty snapshot")

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sample": False,
        "source": "stooq.com (delayed EOD/intraday), Yahoo Finance RSS",
        "failed_symbols": failed,
        "quotes": quotes,
        "history": history,
        "news": fetch_news(),
    }


# ---------------------------------------------------------------- sample mode

SAMPLE_START_PRICES = {
    "BLK": 1050.0, "BRK-B": 495.0, "^SPX": 6200.0, "^DJI": 44500.0,
    "^NDQ": 22400.0, "AAPL": 235.0, "AXP": 300.0, "BAC": 47.0, "KO": 70.0,
    "CVX": 155.0, "OXY": 48.0, "MCO": 500.0, "CB": 290.0, "KHC": 28.0,
    "DVA": 150.0, "BX": 165.0, "KKR": 145.0, "STT": 100.0, "TROW": 110.0,
}


def business_days_back(n, end):
    days, d = [], end
    while len(days) < n:
        if d.weekday() < 5:
            days.append(d)
        d -= timedelta(days=1)
    return list(reversed(days))


def build_sample():
    end = date.today()
    dates = [d.isoformat() for d in business_days_back(HISTORY_DAYS, end)]
    history, quotes = {}, {}
    for ticker, (_, name, group) in SYMBOLS.items():
        rng = random.Random(f"seed-{ticker}")
        price = SAMPLE_START_PRICES.get(ticker, 100.0)
        drift = rng.uniform(0.0001, 0.0007)
        vol = rng.uniform(0.008, 0.022)
        closes = []
        for i in range(HISTORY_DAYS):
            shock = rng.gauss(drift, vol) + 0.004 * math.sin(i / 40 + rng.random())/10
            price = max(1.0, price * (1 + shock))
            closes.append(round(price, 2))
        history[ticker] = {"dates": dates, "close": closes}
        quotes[ticker] = {
            "name": name, "group": group,
            "price": closes[-1], "prev_close": closes[-2],
            "date": dates[-1], "time": None,
            "open": closes[-2], "high": round(max(closes[-2:]) * 1.004, 2),
            "low": round(min(closes[-2:]) * 0.996, 2), "volume": None,
        }
    news = [
        {"tag": "SAMPLE", "title": "Sample headline — live news appears after the first scheduled data refresh",
         "link": "#", "published": ""},
        {"tag": "SAMPLE", "title": "Enable GitHub Pages + Actions to activate automatic updates (see dashboard/README.md)",
         "link": "#", "published": ""},
    ]
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sample": True,
        "source": "synthetic sample data (random walk) — NOT market data",
        "failed_symbols": [],
        "quotes": quotes,
        "history": history,
        "news": news,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sample", action="store_true", help="write deterministic sample data instead of fetching")
    parser.add_argument("--output", default=str(OUTPUT), help="output path")
    args = parser.parse_args()

    data = build_sample() if args.sample else build_live()

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, separators=(",", ":")) + "\n")
    kind = "sample" if data["sample"] else "live"
    print(f"wrote {kind} snapshot: {out} ({out.stat().st_size / 1024:.0f} KiB, "
          f"{len(data['history'])} symbols, {len(data['news'])} headlines)")


if __name__ == "__main__":
    main()
