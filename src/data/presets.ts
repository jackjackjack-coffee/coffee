/**
 * Seed data — editable placeholders so the app is useful on first open even
 * before the user knows their real numbers. Prices are KRW examples; every
 * value is meant to be overwritten. Rationale lives in DEFAULTS.md.
 */

import type {
  Drink,
  Ingredient,
  Language,
  Menu,
  HomeSettings,
} from './types';

/** Default waste/loss applied to consumables (see DEFAULTS.md). */
export const DEFAULT_WASTE_PCT = 5;
/** Café default target margin (fraction). */
export const DEFAULT_TARGET_MARGIN = 0.7;
/** Café default low-margin flag threshold (fraction). */
export const DEFAULT_FLAG_MARGIN = 0.6;
/** Café default labour cost per minute (KRW, ≈ 2025 KR minimum wage / 60). */
export const DEFAULT_LABOR_PER_MIN = 170;
/** Home defaults. */
export const DEFAULT_CUPS_PER_DAY = 2;
export const DEFAULT_CAFE_CUP_PRICE = 4500;

type Loc = Record<Language, string>;
const L = (ko: string, en: string): Loc => ({ ko, en });

interface PresetIngredient {
  id: string;
  mode: 'home' | 'cafe';
  name: Loc;
  category: Ingredient['category'];
  purchaseQty: number;
  purchaseUnit: Ingredient['purchaseUnit'];
  purchasePrice: number;
  note?: Loc;
}

const PRESET_INGREDIENTS: PresetIngredient[] = [
  // ── Home library (retail pack sizes) ──────────────────────────────
  { id: 'pre-h-bean', mode: 'home', name: L('원두 (스페셜티)', 'Beans (specialty)'), category: 'bean', purchaseQty: 200, purchaseUnit: 'g', purchasePrice: 12000, note: L('200g 봉지 예시가', 'example: 200g bag') },
  { id: 'pre-h-milk', mode: 'home', name: L('우유', 'Milk'), category: 'milk', purchaseQty: 1, purchaseUnit: 'l', purchasePrice: 2800 },
  { id: 'pre-h-oat', mode: 'home', name: L('오트밀크', 'Oat milk'), category: 'milk', purchaseQty: 1, purchaseUnit: 'l', purchasePrice: 4500 },
  { id: 'pre-h-vanilla', mode: 'home', name: L('바닐라 시럽', 'Vanilla syrup'), category: 'syrup', purchaseQty: 750, purchaseUnit: 'ml', purchasePrice: 9000 },
  { id: 'pre-h-cup', mode: 'home', name: L('테이크아웃 컵 12oz', 'Takeaway cup 12oz'), category: 'packaging', purchaseQty: 50, purchaseUnit: 'ea', purchasePrice: 5000 },
  { id: 'pre-h-lid', mode: 'home', name: L('컵 뚜껑', 'Cup lid'), category: 'packaging', purchaseQty: 50, purchaseUnit: 'ea', purchasePrice: 2500 },

  // ── Café library (wholesale pack sizes) ───────────────────────────
  { id: 'pre-c-bean', mode: 'cafe', name: L('원두 (도매)', 'Beans (wholesale)'), category: 'bean', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 25000, note: L('1kg 도매 예시가', 'example: 1kg wholesale') },
  { id: 'pre-c-milk', mode: 'cafe', name: L('우유 (도매)', 'Milk (wholesale)'), category: 'milk', purchaseQty: 1, purchaseUnit: 'l', purchasePrice: 2400 },
  { id: 'pre-c-oat', mode: 'cafe', name: L('오트밀크', 'Oat milk'), category: 'milk', purchaseQty: 1, purchaseUnit: 'l', purchasePrice: 3800 },
  { id: 'pre-c-vanilla', mode: 'cafe', name: L('바닐라 시럽', 'Vanilla syrup'), category: 'syrup', purchaseQty: 1, purchaseUnit: 'l', purchasePrice: 8000 },
  { id: 'pre-c-caramel', mode: 'cafe', name: L('카라멜 시럽', 'Caramel syrup'), category: 'syrup', purchaseQty: 1, purchaseUnit: 'l', purchasePrice: 8000 },
  { id: 'pre-c-choco', mode: 'cafe', name: L('초콜릿 소스', 'Chocolate sauce'), category: 'sauce', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 9000 },
  { id: 'pre-c-cup', mode: 'cafe', name: L('테이크아웃 컵 12oz', 'Takeaway cup 12oz'), category: 'packaging', purchaseQty: 1000, purchaseUnit: 'ea', purchasePrice: 70000 },
  { id: 'pre-c-lid', mode: 'cafe', name: L('컵 뚜껑', 'Cup lid'), category: 'packaging', purchaseQty: 1000, purchaseUnit: 'ea', purchasePrice: 40000 },
  { id: 'pre-c-sleeve', mode: 'cafe', name: L('컵 슬리브', 'Cup sleeve'), category: 'packaging', purchaseQty: 1000, purchaseUnit: 'ea', purchasePrice: 30000 },
];

interface PresetDrink {
  id: string;
  mode: 'home' | 'cafe';
  name: Loc;
  items: Array<{ ingredientId: string; amount: number; unit: Ingredient['purchaseUnit']; wastePct?: number }>;
  prepMinutes?: number;
}

const W = DEFAULT_WASTE_PCT;

const PRESET_DRINKS: PresetDrink[] = [
  // ── Home recipes (SCA 1:15–1:18 dosing, no to-go packaging) ───────
  { id: 'pre-h-espresso', mode: 'home', name: L('에스프레소', 'Espresso'), items: [{ ingredientId: 'pre-h-bean', amount: 18, unit: 'g', wastePct: W }] },
  { id: 'pre-h-americano', mode: 'home', name: L('아메리카노', 'Americano'), items: [{ ingredientId: 'pre-h-bean', amount: 18, unit: 'g', wastePct: W }] },
  { id: 'pre-h-latte', mode: 'home', name: L('카페라떼', 'Latte'), items: [{ ingredientId: 'pre-h-bean', amount: 18, unit: 'g', wastePct: W }, { ingredientId: 'pre-h-milk', amount: 200, unit: 'ml', wastePct: W }] },
  { id: 'pre-h-cappuccino', mode: 'home', name: L('카푸치노', 'Cappuccino'), items: [{ ingredientId: 'pre-h-bean', amount: 18, unit: 'g', wastePct: W }, { ingredientId: 'pre-h-milk', amount: 150, unit: 'ml', wastePct: W }] },
  { id: 'pre-h-pourover', mode: 'home', name: L('푸어오버', 'Pour-over'), items: [{ ingredientId: 'pre-h-bean', amount: 20, unit: 'g', wastePct: W }] },

  // ── Café recipes (with cup + lid, prep minutes) ───────────────────
  { id: 'pre-c-espresso', mode: 'cafe', name: L('에스프레소', 'Espresso'), prepMinutes: 1, items: [{ ingredientId: 'pre-c-bean', amount: 18, unit: 'g', wastePct: W }, { ingredientId: 'pre-c-cup', amount: 1, unit: 'ea' }, { ingredientId: 'pre-c-lid', amount: 1, unit: 'ea' }] },
  { id: 'pre-c-americano', mode: 'cafe', name: L('아메리카노', 'Americano'), prepMinutes: 1, items: [{ ingredientId: 'pre-c-bean', amount: 18, unit: 'g', wastePct: W }, { ingredientId: 'pre-c-cup', amount: 1, unit: 'ea' }, { ingredientId: 'pre-c-lid', amount: 1, unit: 'ea' }] },
  { id: 'pre-c-latte', mode: 'cafe', name: L('카페라떼', 'Latte'), prepMinutes: 2, items: [{ ingredientId: 'pre-c-bean', amount: 18, unit: 'g', wastePct: W }, { ingredientId: 'pre-c-milk', amount: 200, unit: 'ml', wastePct: W }, { ingredientId: 'pre-c-cup', amount: 1, unit: 'ea' }, { ingredientId: 'pre-c-lid', amount: 1, unit: 'ea' }] },
  { id: 'pre-c-cappuccino', mode: 'cafe', name: L('카푸치노', 'Cappuccino'), prepMinutes: 2, items: [{ ingredientId: 'pre-c-bean', amount: 18, unit: 'g', wastePct: W }, { ingredientId: 'pre-c-milk', amount: 150, unit: 'ml', wastePct: W }, { ingredientId: 'pre-c-cup', amount: 1, unit: 'ea' }, { ingredientId: 'pre-c-lid', amount: 1, unit: 'ea' }] },
  { id: 'pre-c-vanilla-latte', mode: 'cafe', name: L('바닐라 라떼', 'Vanilla latte'), prepMinutes: 2, items: [{ ingredientId: 'pre-c-bean', amount: 18, unit: 'g', wastePct: W }, { ingredientId: 'pre-c-milk', amount: 200, unit: 'ml', wastePct: W }, { ingredientId: 'pre-c-vanilla', amount: 20, unit: 'ml', wastePct: W }, { ingredientId: 'pre-c-cup', amount: 1, unit: 'ea' }, { ingredientId: 'pre-c-lid', amount: 1, unit: 'ea' }] },
  { id: 'pre-c-pourover', mode: 'cafe', name: L('푸어오버', 'Pour-over'), prepMinutes: 4, items: [{ ingredientId: 'pre-c-bean', amount: 20, unit: 'g', wastePct: W }, { ingredientId: 'pre-c-cup', amount: 1, unit: 'ea' }, { ingredientId: 'pre-c-lid', amount: 1, unit: 'ea' }] },
];

export interface SeedData {
  ingredients: Ingredient[];
  drinks: Drink[];
  menu: Menu;
  homeSettings: HomeSettings;
}

export function buildSeed(language: Language, now = Date.now()): SeedData {
  const ingredients: Ingredient[] = PRESET_INGREDIENTS.map((p) => ({
    id: p.id,
    mode: p.mode,
    name: p.name[language],
    category: p.category,
    purchaseQty: p.purchaseQty,
    purchaseUnit: p.purchaseUnit,
    purchasePrice: p.purchasePrice,
    isPreset: true,
    ...(p.note ? { note: p.note[language] } : {}),
    createdAt: now,
    updatedAt: now,
  }));

  const drinks: Drink[] = PRESET_DRINKS.map((p) => ({
    id: p.id,
    mode: p.mode,
    name: p.name[language],
    items: p.items.map((it) => ({
      ingredientId: it.ingredientId,
      amount: it.amount,
      unit: it.unit,
      wastePct: it.wastePct ?? 0,
    })),
    ...(p.prepMinutes !== undefined ? { prepMinutes: p.prepMinutes } : {}),
    isPreset: true,
    createdAt: now,
    updatedAt: now,
  }));

  const cafeDrinkIds = PRESET_DRINKS.filter((d) => d.mode === 'cafe').map((d) => d.id);

  const menu: Menu = {
    id: 'pre-menu-main',
    name: language === 'ko' ? '기본 메뉴' : 'Main Menu',
    drinkIds: cafeDrinkIds,
    pricing: {
      targetMargin: DEFAULT_TARGET_MARGIN,
      flagThresholdMargin: DEFAULT_FLAG_MARGIN,
      laborCostPerMin: DEFAULT_LABOR_PER_MIN,
      overhead: { mode: 'perDrink', amount: 0 },
      charm: 'ending900',
    },
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  };

  const homeSettings: HomeSettings = {
    id: 'home',
    cupsPerDay: DEFAULT_CUPS_PER_DAY,
    avgCafeCupPrice: DEFAULT_CAFE_CUP_PRICE,
  };

  return { ingredients, drinks, menu, homeSettings };
}
