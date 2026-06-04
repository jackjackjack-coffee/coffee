import { useCountUp } from '../../lib/useCountUp';

/**
 * Renders a number that counts up to `value` using the shared easing.
 * `format` turns the in-flight numeric value into display text (money, %, etc.).
 */
export function AnimatedNumber({
  value,
  format,
  duration,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const animated = useCountUp(value, duration);
  return <>{format(animated)}</>;
}
