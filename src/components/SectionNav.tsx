import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { useTier } from '../lib/hooks';
import { hasFeature } from '../license/gate';
import { useAppStore } from '../store/useAppStore';
import { CAFE_SECTIONS, HOME_SECTIONS } from './sections';

export function SectionNav() {
  const t = useT();
  const tier = useTier();
  const mode = useAppStore((s) => s.mode);
  const homeSection = useAppStore((s) => s.homeSection);
  const cafeSection = useAppStore((s) => s.cafeSection);
  const setHomeSection = useAppStore((s) => s.setHomeSection);
  const setCafeSection = useAppStore((s) => s.setCafeSection);

  const sections = mode === 'home' ? HOME_SECTIONS : CAFE_SECTIONS;
  const active = mode === 'home' ? homeSection : cafeSection;
  const setActive = mode === 'home' ? setHomeSection : setCafeSection;

  return (
    <nav className="border-b border-coffee-100 bg-white">
      <div className="mx-auto w-full">
        <div className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => {
            const locked = s.feature ? !hasFeature(tier, s.feature) : false;
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id as never)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-coffee-700 text-white'
                    : 'text-coffee-600 hover:bg-coffee-100',
                )}
              >
                {t(s.tKey)}
                {locked && <span className="ml-1 text-[10px] opacity-80">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
