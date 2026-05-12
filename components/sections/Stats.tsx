import { COMPANY } from "@/lib/constants";

export function Stats() {
  return (
    <section className="bg-brand-navy py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {COMPANY.stats.map(({ value, label }) => (
            <div key={label} className="space-y-2">
              <p className="text-4xl lg:text-5xl font-extrabold text-white leading-none">
                {value}
              </p>
              <p className="text-gray-300 text-sm leading-snug max-w-[160px] mx-auto">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
