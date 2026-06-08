// @vitest-environment jsdom
/**
 * Integration smoke test. Runs the real client render path (not SSR) with a
 * fake IndexedDB seeded with the preset library, so every section renders with
 * actual data. Catches crashes across the whole component tree.
 */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeAll } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { ensureSeeded } from './data/db';
import { translate } from './i18n';
import { useAppStore } from './store/useAppStore';
import { CAFE_SECTIONS, HOME_SECTIONS } from './components/sections';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(async () => {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
  if (!window.matchMedia) {
    window.matchMedia = () =>
      ({ matches: false, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
  }
  await ensureSeeded('ko');
});

describe('app integration', () => {
  it('boots, seeds, and renders every screen with data', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('숫자로 보는 내 커피')).toBeTruthy());

    // Café tier unlocks every Pro feature so the real panels render (no paywall).
    act(() => useAppStore.setState({ license: { tier: 'cafe' } }));

    for (const s of HOME_SECTIONS) {
      await act(async () => {
        useAppStore.setState({ mode: 'home', homeSection: s.id });
        await Promise.resolve();
      });
      await waitFor(() => expect(document.body.textContent?.length ?? 0).toBeGreaterThan(50));
    }

    for (const s of CAFE_SECTIONS) {
      await act(async () => {
        useAppStore.setState({ mode: 'cafe', cafeSection: s.id });
        await Promise.resolve();
      });
      await waitFor(() => expect(document.body.textContent?.length ?? 0).toBeGreaterThan(50));
    }

    // Spot-check that seeded data flows through to a real screen.
    await act(async () => {
      useAppStore.setState({ mode: 'cafe', cafeSection: 'drinks' });
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getAllByText('카페라떼').length).toBeGreaterThan(0));

    await act(async () => {
      useAppStore.setState({ mode: 'cafe', cafeSection: 'pricing' });
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getByText('가격책정')).toBeTruthy());
  });

  it('translates both languages', () => {
    expect(translate('en', 'app.name')).toBe('Roasting Numbers');
    expect(translate('ko', 'app.name')).toBe('로스팅 넘버스');
    expect(translate('en', 'pro.limitBlurb', { n: 5 })).toContain('5');
  });
});
