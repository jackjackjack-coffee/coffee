import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatUnitCost,
} from './format';
import type { Currency, Language, LicenseTier } from '../data/types';

export interface Formatter {
  money: (v: number) => string;
  unit: (v: number) => string;
  num: (v: number, digits?: number) => string;
  pct: (v: number, digits?: number) => string;
  currency: Currency;
  language: Language;
}

export function useFormat(): Formatter {
  const currency = useAppStore((s) => s.currency);
  const language = useAppStore((s) => s.language);
  return useMemo<Formatter>(
    () => ({
      money: (v) => formatCurrency(v, currency, language),
      unit: (v) => formatUnitCost(v, currency, language),
      num: (v, digits) => formatNumber(v, language, digits ?? 0),
      pct: (v, digits) => formatPercent(v, language, digits ?? 0),
      currency,
      language,
    }),
    [currency, language],
  );
}

export function useTier(): LicenseTier {
  return useAppStore((s) => s.license.tier);
}
