"use client";

import { useState, useMemo, useCallback } from "react";

const PUM = 4290; // m² — stała z koncepcji architektonicznej

type Scenario = { label: string; cena: number; budowa: number; dzialka: number; note: string };

const SCENARIOS: Scenario[] = [
  { label: "Barczewo dziś",  cena: 7200, budowa: 5800, dzialka: 1_700_000, note: "Aktualne ceny rynkowe Barczewo" },
  { label: "Konserwatywny",  cena: 9000, budowa: 5800, dzialka: 1_700_000, note: "Poziom Olsztyna, ostrożne koszty" },
  { label: "Realistyczny",   cena: 9300, budowa: 5500, dzialka: 1_700_000, note: "Scenariusz bazowy" },
  { label: "Optymistyczny",  cena: 9700, budowa: 5200, dzialka: 1_700_000, note: "Olsztyn premium" },
];

const getPriceHint = (price: number): string => {
  if (price < 7500) return "📍 Barczewo dziś: 6 900–7 500 zł/m²";
  if (price < 9000) return "📈 Powyżej rynku Barczewo — wzrost cenowy";
  if (price <= 9700) return "🏙️ Poziom Olsztyna: 9 000–9 700 zł/m²";
  return "🚀 Powyżej Olsztyna — scenariusz premium";
};

function pln(n: number) {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(n: number) {
  return n.toFixed(1).replace(".", ",") + "%";
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold" style={{ color: "#1a1a2e" }}>
          {label}
        </label>
        <span className="font-jetbrains font-bold text-base" style={{ color: "#1B3A6B" }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        className="b-range w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, #1B3A6B 0%, #1B3A6B ${pct}%, #d8d4c8 ${pct}%, #d8d4c8 100%)`,
        }}
        aria-label={label}
      />
      <div className="flex justify-between text-xs" style={{ color: "#7a7d94" }}>
        <span>{format(min)}</span>
        <span className="text-center opacity-70">{hint}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export function KalkulatorSection() {
  const [cena,    setCena]    = useState(9000);      // zł/m²
  const [budowa,  setBudowa]  = useState(5800);      // zł/m²
  const [dzialka, setDzialka] = useState(1_700_000); // zł
  const [active,  setActive]  = useState(1);         // 0=Barczewo dziś 1=Konserwatywny 2=Realistyczny 3=Optymistyczny
  const [flash,   setFlash]   = useState(false);

  const applyScenario = useCallback((s: Scenario, idx: number) => {
    setFlash(true);
    setCena(s.cena);
    setBudowa(s.budowa);
    setDzialka(s.dzialka);
    setActive(idx);
    setTimeout(() => setFlash(false), 200);
  }, []);

  const handleSlider = useCallback(
    (setter: (v: number) => void) => (v: number) => {
      setter(v);
      setActive(-1); // clear preset when user adjusts manually
    },
    []
  );

  const results = useMemo(() => {
    const przychod       = PUM * cena;
    const kosztBudowy    = PUM * budowa;
    const bazowe         = kosztBudowy + dzialka;
    const inne           = bazowe * 0.15;
    const kosztyLaczne   = bazowe + inne;
    const zysk           = przychod - kosztyLaczne;
    const marza          = (zysk / przychod) * 100;
    return { przychod, kosztBudowy, bazowe, inne, kosztyLaczne, zysk, marza };
  }, [cena, budowa, dzialka]);

  const marzetColor =
    results.marza >= 30 ? "#2d7a2d" :
    results.marza >= 20 ? "#1B3A6B" :
                          "#C0392B";

  return (
    <section
      id="kalkulator"
      className="py-24 md:py-36"
      style={{ background: "#f9f7f3" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16">

        {/* Header */}
        <div className="mb-12 max-w-xl">
          <p className="b-section-label mb-4 flex items-center gap-3">
            <span className="b-gold-line" />
            Analiza finansowa
          </p>
          <h2
            className="font-playfair mb-4"
            style={{ fontSize: "clamp(2rem, 3.5vw, 2.875rem)", color: "#1a1a2e" }}
          >
            Kalkulator rentowności
          </h2>
          <p className="text-sm" style={{ color: "#7a7d94", lineHeight: "1.7" }}>
            Dostosuj założenia do swojej strategii. PUM koncepcji: {pln(PUM)} m².
            Kalkulacja nie uwzględnia VAT, CIT ani kosztów finansowania zewnętrznego.
          </p>
        </div>

        {/* Scenario presets */}
        <div className="flex flex-wrap gap-2 mb-10">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => applyScenario(s, i)}
              className="flex flex-col items-start px-4 py-2.5 text-left transition-all duration-200"
              style={{
                borderRadius: "2px",
                background: active === i ? "#1B3A6B" : "transparent",
                color: active === i ? "#f9f7f3" : "#2d3250",
                border: active === i ? "1px solid #1B3A6B" : "1px solid #d8d4c8",
              }}
            >
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="text-xs mt-0.5" style={{ opacity: 0.6 }}>{s.note}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-start">

          {/* Sliders */}
          <div className="flex flex-col gap-8">
            <div>
              <Slider
                label="Cena sprzedaży mieszkań"
                hint="zł / m²"
                value={cena}
                min={6500}
                max={10500}
                step={100}
                format={(v) => `${pln(v)} zł/m²`}
                onChange={handleSlider(setCena)}
              />
              <p className="text-xs mt-2 italic" style={{ color: "#7a7d94" }}>
                {getPriceHint(cena)}
              </p>
            </div>
            <Slider
              label="Koszt budowy"
              hint="zł / m² PUM"
              value={budowa}
              min={4000}
              max={8000}
              step={100}
              format={(v) => `${pln(v)} zł/m²`}
              onChange={handleSlider(setBudowa)}
            />
            {/* Działka — hidden on mobile (uses default), visible md+ */}
            <div className="hidden md:block">
              <Slider
                label="Cena zakupu działki"
                hint="do negocjacji"
                value={dzialka}
                min={1_000_000}
                max={2_500_000}
                step={50_000}
                format={(v) => `${pln(v)} zł`}
                onChange={handleSlider(setDzialka)}
              />
            </div>

            {/* Mobile — show działka as static note */}
            <div className="md:hidden text-sm p-4" style={{ background: "#f2efe8", borderRadius: "2px" }}>
              <span style={{ color: "#7a7d94" }}>Cena działki (przyjęta): </span>
              <span className="font-jetbrains font-semibold" style={{ color: "#1B3A6B" }}>
                {pln(dzialka)} zł
              </span>
            </div>
          </div>

          {/* Results */}
          <div
            className="transition-opacity duration-200"
            style={{ opacity: flash ? 0.5 : 1 }}
          >
            {/* Main metric — zysk */}
            <div
              className="p-8 mb-4"
              style={{ background: "#f2efe8", borderRadius: "2px" }}
            >
              <p className="b-section-label mb-3">Szacowany zysk brutto</p>
              <p
                className="font-jetbrains font-bold leading-none mb-1"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  color: results.zysk > 0 ? "#1B3A6B" : "#C0392B",
                  transition: "color 0.3s",
                }}
              >
                {results.zysk > 0 ? "" : "−"}{pln(Math.abs(results.zysk))} zł
              </p>
              <p className="text-xs mt-1" style={{ color: "#7a7d94" }}>
                przed podatkami i kosztami finansowania
              </p>

              {/* Margin badge */}
              <div className="flex items-center gap-3 mt-4">
                <span
                  className="font-jetbrains font-bold text-2xl"
                  style={{ color: marzetColor, transition: "color 0.3s" }}
                >
                  {pct(results.marza)}
                </span>
                <span className="text-xs" style={{ color: "#7a7d94" }}>
                  marża brutto (zysk / przychód)
                </span>
              </div>
            </div>

            {/* Breakdown rows */}
            <div
              className="divide-y text-sm"
              style={{ borderRadius: "2px", overflow: "hidden", border: "1px solid #d8d4c8" }}
            >
              <Row label="Przychód ze sprzedaży" value={pln(results.przychod) + " zł"} highlight />
              <Row label={`Koszt budowy (${pln(PUM)} m² × ${pln(budowa)} zł)`} value={pln(results.kosztBudowy) + " zł"} />
              <Row label="Cena działki" value={pln(dzialka) + " zł"} />
              <Row label="Koszty pozostałe (15% bazowych)" value={pln(results.inne) + " zł"} />
              <Row label="Koszty łącznie" value={pln(results.kosztyLaczne) + " zł"} />
            </div>

            <div
              className="mt-3 px-5 py-3 text-xs"
              style={{ background: "#f2efe8", borderRadius: "2px" }}
            >
              <span style={{ color: "#7a7d94" }}>
                Potencjalny zarobek PRYZMAT ze sprzedaży mieszkań:{" "}
              </span>
              <span className="font-jetbrains font-semibold" style={{ color: "#1B3A6B" }}>
                {pln(PUM * cena * 0.025)} zł
              </span>
              <span style={{ color: "#7a7d94" }}>
                {" "}(prowizja 2,5% po stronie kupujących)
              </span>
            </div>

            <p
              className="mt-4 text-xs leading-relaxed"
              style={{ color: "#7a7d94" }}
            >
              To szacunek poglądowy. Skontaktuj się z nami po szczegółową
              analizę uwzględniającą Twoje koszty finansowania i strukturę
              podatkową.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-3"
      style={{
        background: highlight ? "#f9f7f3" : "#fff",
      }}
    >
      <span style={{ color: highlight ? "#1a1a2e" : "#7a7d94", fontWeight: highlight ? 600 : 400 }}>
        {label}
      </span>
      <span
        className="font-jetbrains font-semibold text-right whitespace-nowrap"
        style={{ color: highlight ? "#1B3A6B" : "#2d3250" }}
      >
        {value}
      </span>
    </div>
  );
}
