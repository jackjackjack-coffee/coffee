import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n';
import { HomeApp } from '../features/home/HomeApp';
import { CafeApp } from '../features/cafe/CafeApp';
import { Header } from './Header';
import { SectionNav } from './SectionNav';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const t = useT();
  const mode = useAppStore((s) => s.mode);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile-only top bar + tabs; hidden once the sidebar appears */}
        <div className="lg:hidden">
          <Header />
          <SectionNav />
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-6">
          {mode === 'home' ? <HomeApp /> : <CafeApp />}
        </main>
        <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-2 text-center text-xs text-coffee-400 sm:px-6">
          ☕ {t('app.name')} · {t('set.aboutBlurb')}
        </footer>
      </div>
    </div>
  );
}
