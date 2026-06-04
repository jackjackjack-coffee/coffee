# ☕ Bean Counter — Coffee Accountant

**Coffee, seen through an accountant's eyes.** One app, two modes:

- **🏠 Home (personal):** the real cost of your coffee habit, equipment depreciation, and a home‑vs‑café break‑even calculator.
- **🏪 Café (business):** per‑drink COGS, full cost, margins, pricing, and menu profitability.

Both modes share one **pure, unit‑tested calculation engine** but keep their data in **separate workspaces**. Everything runs **100% in the browser** — no backend, no account, no cloud. Data is stored locally in IndexedDB.

---

## Features

### Home (Personal)
- **Supplies library** — enter a purchase (qty + unit + price) → per‑unit cost is computed.
- **Recipe builder** — presets (Espresso / Americano / Latte / Cappuccino / Pour‑over) using SCA 1:15–1:18 dosing → consumable cost per cup.
- **Equipment** — register machine/grinder (price + expected lifespan) → depreciation per cup → *true* cost per cup.
- **Equipment ROI** *(Pro)* — "this ₩X machine pays for itself in how many cups / months?" with a cumulative‑savings chart.
- **Spending tracker** *(Pro)* — log beans/equipment/café spend → monthly & yearly trends, home‑vs‑café split.
- **The hook:** *"This year you spent ₩___ on coffee; brewing at home saved you ₩___."*

### Café (Business)
- **Ingredient library** — wholesale purchase units → per‑unit cost, optional supplier.
- **Drink builder** — full cost = ingredients (+ waste) + labour + overhead, with packaging.
- **Pricing** — target margin → suggested price; sell price → real margin & cost ratio; charm rounding.
- **Menu P&L dashboard** *(Pro)* — every drink's cost/price/margin, sorted lowest‑margin‑first, low margins auto‑flagged, CSV/PDF export.
- **What‑if simulator** *(Pro)* — change one ingredient's price → every affected drink's margin moves instantly.
- **Multiple menus** *(Pro)* — seasonal menus, each its own pricing profile.
- **Sales & expenses books** *(Pro)* — mini P&L (revenue − COGS − other costs = profit) with charts.

---

## Tech stack

React + Vite + TypeScript (strict) · Tailwind CSS · Zustand (app state) · Dexie/IndexedDB (persistence) · Recharts (charts) · jsPDF (PDF export) · Vitest (engine + integration tests). No backend.

---

## Run it locally

```bash
npm install
npm run dev        # start the dev server (Vite) → http://localhost:5173
npm test           # watch-mode unit/integration tests
npm run test:run   # run all tests once
npm run typecheck  # tsc --noEmit
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
```

Node 18+ recommended (developed on Node 22).

---

## Project structure

```
src/
├─ engine/            # pure calculation engine (no React/DB) + *.test.ts
│  ├─ units.ts        # (1) unit → base normalisation
│  ├─ cost.ts         # (1) unit cost, (2) drink COGS
│  ├─ pricing.ts      # (3) labour/overhead/full cost, (4) pricing + charm
│  ├─ equipment.ts    # (5) depreciation, (6) true cost per cup
│  ├─ breakeven.ts    # (7) savings, break-even, ROI curve
│  └─ drink.ts        # composeDrinkEconomics() — ties it together
├─ data/              # Dexie DB, types, seed presets, write helpers
├─ store/             # Zustand app store + DB→engine selectors
├─ license/           # Lemon Squeezy activation/validation + feature gating
├─ i18n/              # ko/en string tables + useT()
├─ lib/               # formatting, csv, pdf, dates, hooks
├─ components/        # shell (header, nav, mode switch) + UI primitives
└─ features/          # home/ · cafe/ · shared/ · settings/ panels
```

See **[DEFAULTS.md](./DEFAULTS.md)** for the rationale behind every seeded number and **[MARKETING.md](./MARKETING.md)** for store listing copy.

---

## The calculation engine

All money math is isolated in `src/engine/` as **pure functions** (no side effects), each covered by Vitest:

| # | Formula | Function |
|---|---------|----------|
| 1 | Unit cost = `price / toBase(qty, unit)` | `unitCost` |
| 2 | Drink COGS = Σ `amount·unitCost·(1+waste)` + packaging | `drinkCOGS` |
| 3 | Full cost = COGS + labour + overhead | `fullCost`, `laborCost` |
| 4 | Price = `COGS / (1 − margin)`; cost ratio; charm rounding | `priceFromMargin`, `costRatio`, `charmRound` |
| 5 | Depreciation per cup = `price / lifespanCups` | `depreciationPerCup` |
| 6 | True cost/cup = consumables + depreciation (+ utilities) | `trueCostPerCup` |
| 7 | Break‑even cups = `equipmentPrice / savingPerCup`; ROI curve | `breakeven`, `roiCurve` |

Inputs are validated (negative / zero / non‑finite values throw `RangeError`), so the UI can't produce nonsense numbers.

---

## Data & privacy

Everything is stored in your browser via **IndexedDB** (Dexie). There is no account and nothing is sent to a server (the only network call is to Lemon Squeezy when you activate a license). Sample data seeds on first launch; **Settings → Reset sample data** restores it.

## Internationalisation & currency

UI strings are fully translated **Korean / English** (toggle in the header). Currency **₩ / $ / €** is selectable and formatted with `Intl.NumberFormat`.

---

## Lemon Squeezy setup (licensing)

The app uses the **public** [Lemon Squeezy License API](https://docs.lemonsqueezy.com/help/licensing/license-api) — no secret key, the client calls it directly.

### 1. Create two products in your Lemon Squeezy store
- **Personal Pro** — one‑time purchase. Unlocks all Home features.
- **Café Pro** — one‑time or subscription. Unlocks all Café features (and, as the higher tier, Home too).

Enable **license keys** on each product/variant.

### 2. Find your IDs
- **Store ID:** Settings → Stores (a number).
- **Product IDs:** open each product; the id is in the URL / API.

### 3. Fill the constants
Edit `src/license/lemonsqueezy.ts`:

```ts
export const LS_STORE_ID = '12345';
export const LS_PRODUCT_ID_PERSONAL = '67890';
export const LS_PRODUCT_ID_CAFE = '67891';
export const LS_CHECKOUT_PERSONAL = 'https://YOUR_STORE.lemonsqueezy.com/buy/...';
export const LS_CHECKOUT_CAFE = 'https://YOUR_STORE.lemonsqueezy.com/buy/...';
export const ALLOW_DEMO_KEYS = false; // turn the dev shortcut OFF for production
```

### 4. How it works
- **Activate** (Settings → License → enter key): `POST /v1/licenses/activate` with a random per‑device `instance_name`. The response is rejected unless `meta.store_id` matches `LS_STORE_ID` **and** `meta.product_id` matches Personal or Café (that's what decides the tier). Status must be `active`.
- **Validate** (once per day on launch): `POST /v1/licenses/validate`. The tier is cached so it keeps working **offline**; only a confirmed non‑active status downgrades to Free.
- **Deactivate:** clears the local license.

### Demo shortcut (development only)
While `ALLOW_DEMO_KEYS = true`, the keys **`DEMO-PERSONAL`** and **`DEMO-CAFE`** unlock the corresponding tier locally without any network call — handy for trying the Pro features before the store is wired up. Set it to `false` before shipping.

### Tiers

| | Free | Personal Pro | Café Pro |
|---|---|---|---|
| Core calculators, libraries, recipes, basic pricing | ✅ | ✅ | ✅ |
| Saved drinks per mode | 5 | Home: ∞ | Café: ∞ (Home too) |
| Home: equipment ROI + charts, spending, export | 🔒 | ✅ | ✅ |
| Café: menu P&L, what‑if, multi‑menu, sales/expense books, export | 🔒 | 🔒 | ✅ |

Locked features show a value preview + checkout CTA.

---

## Deployment

It's a static SPA — build and serve `dist/`. No environment variables required.

**Vercel:** import the repo → framework preset **Vite** → deploy. (Build `npm run build`, output `dist`.)

**Netlify:** build command `npm run build`, publish directory `dist`.

**Cloudflare Pages:** framework preset **Vite** (or build `npm run build`), output `dist`.

If you host the coffee app from this repo's root, point the platform's root/output at the repo root and `dist`. (The repo also contains the unrelated PowerShell tool, which deployment ignores.)

---

## Notes & limitations
- **PDF export** uses jsPDF's built‑in Latin fonts, so Korean glyphs may not render in PDFs; headers are emitted in English for that reason. CSV export (UTF‑8 + BOM) handles Korean fine in Excel.
- All defaults are **example values** — edit them to your real prices. See DEFAULTS.md.
