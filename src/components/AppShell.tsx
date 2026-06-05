import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n';
import { HomeApp } from '../features/home/HomeApp';
import { CafeApp } from '../features/cafe/CafeApp';
import { Backdrop } from './Backdrop';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const t = useT();
  const mode = useAppStore((s) => s.mode);

  return (
    <div className="min-h-screen lg:pl-64">
      <Backdrop />
      <Sidebar />
      <main className="mx-auto max-w-4xl px-4 py-6">{mode === 'home' ? <HomeApp /> : <CafeApp />}</main>
      <footer className="mx-auto max-w-4xl px-4 pb-8 pt-2 text-center text-xs text-coffee-400">
        ☕ {t('app.name')} · {t('set.aboutBlurb')}
      </footer>
    </div>
  );
}
