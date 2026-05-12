import Image from "next/image";
import { COMPANY } from "@/lib/constants";

const highlights = [
  { value: "11", unit: "lat", label: "doświadczenia" },
  { value: "200+", unit: "", label: "transakcji" },
  { value: "3", unit: "powiaty", label: "obsługiwane" },
];

export function About() {
  return (
    <section id="o-nas" className="py-20 lg:py-28 bg-brand-light-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Photo */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-navy/20 to-brand-blue/20">
              <div className="text-center px-8">
                <div className="w-20 h-20 bg-brand-navy/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-brand-navy/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-brand-navy/70 font-semibold text-sm">
                  Biuro Nieruchomości PRYZMAT
                </p>
                <p className="text-brand-navy/50 text-xs mt-1">
                  Barczewo · Olsztyn · Warmia
                </p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-7">
            <div>
              <p className="section-label mb-3">O NAS</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy leading-tight">
                Rodzinne biuro z pasją do&nbsp;nieruchomości
              </h2>
            </div>

            <p className="text-gray-600 text-base leading-relaxed">
              Biuro Nieruchomości PRYZMAT działa w Barczewie od{" "}
              <strong className="text-brand-navy">ponad 11 lat</strong>. To,
              co nas wyróżnia, to głęboka znajomość lokalnego rynku —
              znamy każdą dzielnicę Olsztyna, każdą ulicę Barczewa i
              specyfikę warmińskich miejscowości.
            </p>

            <p className="text-gray-600 text-base leading-relaxed">
              Jerzy i jego zespół podchodzą do każdego klienta indywidualnie.
              Nie ma tu numerów kolejkowych ani anonimowych transakcji —
              jesteśmy dostępni pod telefonem i zawsze wyjaśniamy każdy krok
              procesu sprzedaży czy wynajmu.
            </p>

            {/* Inline stats */}
            <div className="flex flex-wrap gap-8 pt-3">
              {highlights.map(({ value, unit, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-extrabold text-brand-navy leading-none">
                    {value}
                    {unit && (
                      <span className="text-lg font-bold text-brand-blue ml-1">
                        {unit}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>

            <a
              href="/o-nas"
              className="inline-flex items-center text-brand-blue font-semibold text-sm hover:text-brand-navy transition-colors"
            >
              Poznaj nasz zespół →
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
