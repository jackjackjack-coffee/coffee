# Seeded defaults — rationale

Every seeded number is an **editable example** meant to be replaced with your real figures. This document explains where the defaults come from so you can trust or adjust them. Constants live in `src/data/presets.ts`; the math lives in `src/engine/`.

Currency in the examples is **KRW** (the app's default), but all values are currency‑agnostic.

---

## Dosing (recipes) — SCA 1:15–1:18

The Specialty Coffee Association brew ratio guidance is roughly **1 g coffee : 15–18 g water**. Presets use typical real‑world doses:

| Drink | Coffee | Notes |
|---|---|---|
| Espresso | **18 g** | Standard double shot (18–20 g basket). |
| Americano | 18 g | Double shot + hot water (water is ~free). |
| Latte | 18 g + **200 ml** milk | Double shot, ~8–10 oz milk. |
| Cappuccino | 18 g + **150 ml** milk | Smaller milk volume than a latte. |
| Vanilla latte | 18 g + 200 ml + **20 ml** syrup | One pump ≈ 8–10 ml; ~2 pumps. |
| Pour‑over | **20 g** | ~320 ml water ⇒ ~1:16 ratio. |

Water and ice aren't costed (negligible); if you want to, add them as ingredients.

## Waste / loss — default **5%**

A flat **5%** loss is applied to consumables to cover grinder retention, purge shots, spillage, and milk left in the pitcher. Industry rules of thumb put beverage waste around **5–10%**; we seed the conservative low end. Bump milk to ~8–10% if you steam in larger batches.

## Café target margin — **70%** (low‑margin flag at **60%**)

Hospitality costing usually targets a **beverage cost ratio of ~20–35%** of menu price. A **70% gross margin** corresponds to a **30% cost ratio** — a common, slightly conservative target for specialty drinks. The **low‑margin flag at 60%** (≈ 40% cost ratio) highlights drinks eating into profit. Both are adjustable per menu.

> Note: the engine applies the target margin to the **margin base cost** (COGS + labour + fixed overhead). The displayed **cost ratio** is COGS ÷ price (classic "food cost %"), so the two numbers diverge once labour/overhead are added — that's expected.

## Labour — **₩170 / minute**

≈ the 2025 Korean minimum wage (**₩10,030/hour ⇒ ₩167/min**), rounded to ₩170. Combined with each drink's prep minutes (espresso 1, latte/cappuccino 2, pour‑over 4) it gives a defensible labour cost. Set it to your real loaded wage (incl. payroll taxes/benefits) for accuracy.

## Overhead — default **₩0 (per‑drink)**

Off by default so the first suggested price is easy to read. Rent + utilities commonly run **10–20% of revenue**; switch overhead to "% of revenue" and enter your figure. The engine folds revenue‑% overhead into the pricing denominator: `price = base / (1 − margin − overhead%)`.

## Charm rounding — default **₩x,900** (Café)

Korean café prices typically end in **900** (e.g. ₩4,900). Other options: `x.99` / `x.95` for $/€, nearest 100/500/1,000, or none.

## Home defaults
- **Cups/day: 2** — a common home habit; drives annual projections and ROI timing.
- **Average café cup: ₩4,500** — mid‑range Korean Americano/latte price; the baseline you're saving against.
- **Electricity / water per cup:** off by default (usually a rounding error per cup; add if you want precision).
- **Equipment lifespan:** entered per item. Example basis — a home machine at ~2 cups/day over ~5 years ≈ **3,650 cups**, so a ₩500,000 machine ≈ **₩137/cup**.

## Example ingredient prices (KRW)

Placeholders only — **edit to your receipts.**

| Home (retail) | Pack | Price | Café (wholesale) | Pack | Price |
|---|---|---|---|---|---|
| Beans (specialty) | 200 g | ₩12,000 | Beans (wholesale) | 1 kg | ₩25,000 |
| Milk | 1 L | ₩2,800 | Milk | 1 L | ₩2,400 |
| Oat milk | 1 L | ₩4,500 | Oat milk | 1 L | ₩3,800 |
| Vanilla syrup | 750 ml | ₩9,000 | Vanilla/Caramel syrup | 1 L | ₩8,000 |
| Cup 12oz | 50 ea | ₩5,000 | Chocolate sauce | 1 kg | ₩9,000 |
| Lid | 50 ea | ₩2,500 | Cup / Lid / Sleeve (1,000 ea) | — | ₩70k / ₩40k / ₩30k |

---

**Bottom line:** defaults exist so the app is useful on first open. Replace them with your numbers and the calculations become *your* numbers.
