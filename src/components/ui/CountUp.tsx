import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Animate a number toward `target`.
 *
 * - Starts at 0 on first mount, so switching section/mode (which remounts the
 *   panel) makes headline numbers "count up" into place.
 * - On later `target` changes (e.g. live input edits) it eases from the previous
 *   value to the new one.
 * - Falls back to the final value with no animation when there's no
 *   requestAnimationFrame (jsdom/SSR), reduced motion is requested, or the
 *   target isn't finite — so tests never hang and a11y is respected.
 */
export function useCountUp(target: number, opts?: { duration?: number }): number {
  const duration = opts?.duration ?? 700;
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(0); // first mount animates 0 → target
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.requestAnimationFrame !== 'function' ||
      prefersReducedMotion() ||
      !Number.isFinite(target)
    ) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(from + (target - from) * easeOutCubic(p));
      if (p < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
      // Re-trigger (target change without remount) eases from the current target.
      fromRef.current = target;
    };
  }, [target, duration]);

  return display;
}

/** Renders an animated, formatted number. Pass a `fmt.*` formatter as `format`. */
export function CountUp({
  value,
  format,
  duration,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const display = useCountUp(value, duration !== undefined ? { duration } : undefined);
  return <span className={className}>{format(display)}</span>;
}
