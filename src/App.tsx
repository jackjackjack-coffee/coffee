import { useEffect, useState } from 'react';
import { ensureSeeded, relocalizePresets } from './data/db';
import { useAppStore } from './store/useAppStore';
import { useLicenseValidation } from './license/useLicense';
import { AppShell } from './components/AppShell';

export default function App() {
  const language = useAppStore((s) => s.language);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    ensureSeeded(language)
      .catch((e) => console.error('seed failed', e))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
    // seed once on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    // Re-translate seeded presets to the active language (no-op for edited rows).
    if (ready) relocalizePresets(language).catch((e) => console.error('relocalize failed', e));
  }, [language, ready]);

  useLicenseValidation();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-coffee-500">
        <span className="animate-pulse text-2xl">☕</span>
      </div>
    );
  }

  return <AppShell />;
}
