import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Animates a number from its previous value to `target` with an easeOutCubic
 * ramp. Honors `prefers-reduced-motion` (jumps straight to the value) and is
 * safe when requestAnimationFrame is unavailable.
 */
export function useCountUp(target: number, duration = 900): number {
  // Starts at 0 so the first mount counts up to the target.
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = fromRef.current;
    if (
      from === target ||
      prefersReducedMotion() ||
      typeof requestAnimationFrame !== 'function'
    ) {
      fromRef.current = target;
      setValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = from + (target - from) * easeOutCubic(progress);
      setValue(next);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
      fromRef.current = target;
    };
  }, [target, duration]);

  return value;
}
