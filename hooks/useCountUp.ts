"use client";
import { useEffect, useRef, useState } from "react";

export function useCountUp(
  target: number,
  duration = 1300,
  active = false,
  delay = 0
) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    if (target === 0) { setValue(0); return; }
    startedRef.current = true;

    timerRef.current = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        // easeOutExpo
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setValue(Math.round(eased * target));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, target, duration, delay]);

  return value;
}
