"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade-up" | "fade-in";
  threshold?: number;
}

export function AnimateIn({
  children,
  className = "",
  delay = 0,
  animation = "fade-up",
  threshold = 0.12,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${inView ? `animate-${animation}` : "opacity-0"} ${className}`}
      style={inView ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
