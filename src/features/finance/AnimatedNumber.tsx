/**
 * AnimatedNumber.tsx
 *
 * Provides:
 *   - useCountUp(target, duration?, delay?) — raw hook returning current display value
 *   - <AnimatedNumber value formatter duration delay /> — drop-in component
 *
 * Animation only starts once the element enters the viewport (IntersectionObserver).
 * Re-triggers whenever `value` changes (e.g. tab switch or data refresh).
 */

import { useCallback, useEffect, useRef, useState } from "react";

// ── Easing ────────────────────────────────────────────────────────────────────
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCountUp(
  target: number,
  duration = 1200,
  delay = 0,
): { value: number; ref: React.RefObject<HTMLElement | null> } {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const hasRunRef = useRef(false);

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = startValueRef.current + (target - startValueRef.current) * eased;
      setValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    },
    [target, duration],
  );

  const start = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    startValueRef.current = 0;
    startTimeRef.current = null;
    const kick = () => {
      rafRef.current = requestAnimationFrame(animate);
    };
    if (delay > 0) {
      setTimeout(kick, delay);
    } else {
      kick();
    }
  }, [animate, delay]);

  // Re-run whenever target changes (if already visible)
  useEffect(() => {
    if (hasRunRef.current) {
      start();
    }
    // cleanup on unmount
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // Start only once element enters viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasRunRef.current) {
            hasRunRef.current = true;
            start();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { value, ref };
}

// ── Component ─────────────────────────────────────────────────────────────────
interface AnimatedNumberProps {
  /** The final numeric value to count up to */
  value: number;
  /** Formats the current (interpolated) number into a display string */
  formatter?: (n: number) => string;
  /** Total animation duration in ms. Default: 1200 */
  duration?: number;
  /** Delay before starting in ms. Default: 0 */
  delay?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  formatter,
  duration = 1200,
  delay = 0,
  className,
}: AnimatedNumberProps) {
  const fmt = formatter ?? ((n: number) => Math.round(n).toLocaleString("en-IN"));
  const { value: current, ref } = useCountUp(value, duration, delay);
  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={className}
      aria-label={fmt(value)}
    >
      {fmt(current)}
    </span>
  );
}
