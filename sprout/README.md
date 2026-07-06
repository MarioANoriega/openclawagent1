# Sprout 🌱

An investing app for first-time investors that feels like tending a garden.
Holdings are *plants* with maturity stages; the core actions are **Add,
Invest, Water, Harvest**. Calm, warm, encouraging — never intimidating.

This is a self-contained frontend prototype: no backend, no auth, no real
trading. All data is mocked in `src/data/plants.ts` (seeded random walks, so
the charts are organic and reproducible) and user changes persist to
`localStorage`.

## Run it

```bash
cd sprout
npm install
npm run dev     # → http://localhost:5173/
```

`npm run build` typechecks and produces a production bundle in `dist/`.

## Stack

- Vite + React 19 + TypeScript + Tailwind CSS v4
- Hand-rolled SVG charts (Catmull-Rom spline + soft area gradient, with the
  brand's two-leaf sprout glyph living at the tip of every growth line)
- Google Fonts: Bricolage Grotesque (display/numbers) + Hanken Grotesk (body)

## Structure

```
src/
  data/plants.ts      Mock holdings + seeded random-walk history generator
  lib/store.ts        useGarden() — state, derived views, localStorage
  lib/format.ts       Tabular currency/percent formatting
  components/         PhoneFrame, BalanceHero, GrowthChart, SproutGlyph,
                      RangeToggle, QuickActions, PlantRow (+MaturityDots),
                      NudgeCard, StatTile, AmountEntry, Toggle, BottomNav,
                      Sheet, Toast
  screens/            Garden (home), PlantDetail, SeedSheet (bottom sheet),
                      Onboarding, Placeholder (Explore/Grow/You)
  App.tsx             Tiny state-machine router + sheet/toast orchestration
```

Onboarding offers two paths: **Start growing** lands on an empty garden that
invites the first seed; **Peek at a grown garden** seeds a demo portfolio
(Total Market Fund 🌳, Tech Growth 🌿, Bitcoin 🌱, Cash seeds 🌰).
