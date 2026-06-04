/** Locale-aware formatting via Intl. The engine stays unit-agnostic; this is display only. */

import type { Currency, Language } from '../data/types';

const LOCALE: Record<Language, string> = { ko: 'ko-KR', en: 'en-US' };
const FRACTION: Record<Currency, number> = { KRW: 0, USD: 2, EUR: 2 };
export const CURRENCY_SYMBOL: Record<Currency, string> = { KRW: '₩', USD: '$', EUR: '€' };

function safe(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/** Money for totals/prices — uses the currency's natural number of decimals. */
export function formatCurrency(value: number, currency: Currency, language: Language): string {
  return new Intl.NumberFormat(LOCALE[language], {
    style: 'currency',
    currency,
    minimumFractionDigits: FRACTION[currency],
    maximumFractionDigits: FRACTION[currency],
  }).format(safe(value));
}

/**
 * Small per-unit costs (e.g. ₩2.5/ml) need more precision than a total.
 * Shows up to 2 extra fraction digits beyond the currency default.
 */
export function formatUnitCost(value: number, currency: Currency, language: Language): string {
  const v = safe(value);
  const extra = v !== 0 && Math.abs(v) < 100 ? 2 : 0;
  return new Intl.NumberFormat(LOCALE[language], {
    style: 'currency',
    currency,
    minimumFractionDigits: FRACTION[currency],
    maximumFractionDigits: FRACTION[currency] + extra,
  }).format(v);
}

export function formatNumber(value: number, language: Language, maxDigits = 0): string {
  return new Intl.NumberFormat(LOCALE[language], {
    maximumFractionDigits: maxDigits,
  }).format(safe(value));
}

/** Fraction in (0..1) → "65%". */
export function formatPercent(fraction: number, language: Language, digits = 0): string {
  return new Intl.NumberFormat(LOCALE[language], {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(safe(fraction));
}

/** Parse a user-typed number, returning null on blank/invalid. */
export function parseNumber(raw: string): number | null {
  const trimmed = raw.replace(/,/g, '').trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function clampMin(value: number, min = 0): number {
  return value < min ? min : value;
}
