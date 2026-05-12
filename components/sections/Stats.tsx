"use client";
import { COMPANY } from "@/lib/constants";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";

function parseStatValue(raw: string): { numeric: number | null; suffix: string } {
  // Skip values with decimal comma (e.g. "2,5%")
  if (/\d,\d/.test(raw)) return { numeric: null, suffix: raw };
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return { numeric: null, suffix: raw };
  return { numeric: parseInt(match[1], 10), suffix: match[2] };
}

function StatCard({
  value,
  label,
  active,
  delay,
}: {
  value: string;
  label: string;
  active: boolean;
  delay: number;
}) {
  const { numeric, suffix } = parseStatValue(value);
  const count = useCountUp(numeric ?? 0, 1300, active, delay);

  return (
    <div
      className={`space-y-2 text-center ${active ? "animate-fade-up" : "opacity-0"}`}
      style={active ? { animationDelay: `${delay}ms` } : undefined}
    >
      <p className="text-4xl lg:text-5xl font-extrabold text-white leading-none tabular-nums">
        {numeric !== null ? `${count}${suffix}` : value}
      </p>
      <p className="text-gray-300 text-sm leading-snug max-w-[160px] mx-auto">
        {label}
      </p>
    </div>
  );
}

export function Stats() {
  const { ref, inView } = useInView(0.2);

  return (
    <section ref={ref} className="bg-brand-navy py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {COMPANY.stats.map(({ value, label }, i) => (
            <StatCard
              key={label}
              value={value}
              label={label}
              active={inView}
              delay={i * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
