import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n';
import { HomeApp } from '../features/home/HomeApp';
import { CafeApp } from '../features/cafe/CafeApp';
import { Header } from './Header';
import { SectionNav } from './SectionNav';

export function AppShell() {
  const t = useT();
  const mode = useAppStore((s) => s.mode);

  return (
    <div className="min-h-screen">
      <Header />
      <SectionNav />
      <main className="mx-auto max-w-3xl px-4 py-5">{mode === 'home' ? <HomeApp /> : <CafeApp />}</main>
      <footer className="mx-auto max-w-3xl px-4 pb-8 pt-2 text-center text-xs text-coffee-400">
        ☕ {t('app.name')} · {t('set.aboutBlurb')}
      </footer>
    </div>
  );
}
