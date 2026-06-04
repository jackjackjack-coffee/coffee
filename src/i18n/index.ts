import { useAppStore } from '../store/useAppStore';
import { dict, type TKey } from './strings';
import type { Language } from '../data/types';

export type { TKey } from './strings';

export type TParams = Record<string, string | number>;

function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in params ? String(params[k]) : `{${k}}`,
  );
}

/** Pure translator — handy in non-component code. */
export function translate(language: Language, key: TKey, params?: TParams): string {
  const table = dict[language] ?? dict.en;
  const template = table[key] ?? dict.en[key] ?? key;
  return interpolate(template, params);
}

/** Hook returning a `t(key, params?)` bound to the current language. */
export function useT(): (key: TKey, params?: TParams) => string {
  const language = useAppStore((s) => s.language);
  return (key: TKey, params?: TParams) => translate(language, key, params);
}
