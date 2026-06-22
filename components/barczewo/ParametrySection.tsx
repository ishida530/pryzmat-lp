import { AnimateIn } from "@/components/ui/AnimateIn";

export function ParametrySection() {
  return (
    <section
      id="parametry"
      className="py-24 md:py-36"
      style={{ background: "#f2efe8" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16">

        {/* Section header */}
        <AnimateIn animation="fade-up">
          <div className="mb-16 md:mb-20">
            <p className="b-section-label mb-4 flex items-center gap-3">
              <span className="b-gold-line" />
              Dane inwestycji
            </p>
            <h2
              className="font-playfair"
              style={{ fontSize: "clamp(2rem, 3.5vw, 2.875rem)", color: "#1a1a2e" }}
            >
              Liczby które mają znaczenie
            </h2>
          </div>
        </AnimateIn>

        {/* Big numbers grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px" style={{ background: "#d8d4c8" }}>
          <BigStat value="4 290" unit="m²" label="Powierzchnia mieszkań do sprzedaży" delay={0} />
          <BigStat value="80"    unit="lok." label="Mieszkań (16 na każdej z 5 kondygnacji)" delay={80} />
          <BigStat value="5"     unit="kond." label="Kondygnacji nadziemnych + garaż podziemny" delay={160} />
          <BigStat value="4 438" unit="m²"  label="Powierzchnia działki (393/11 Barczewo)" delay={240} />
          <BigStat value="101"   unit="miejsc" label="Postojowych łącznie (garaż + teren)" delay={320} />
          <BigStat value="15"    unit="min"  label="Od centrum Olsztyna samochodem" delay={400} />
        </div>

        {/* Efficiency highlight */}
        <AnimateIn animation="fade-up" delay={80}>
          <div
            className="mt-8 flex flex-col md:flex-row md:items-center gap-8 md:gap-0 p-8 md:p-10"
            style={{ background: "#1B3A6B" }}
          >
            <div className="flex-shrink-0 md:pr-14">
              <p
                className="font-jetbrains font-bold leading-none"
                style={{ fontSize: "clamp(3.5rem, 7vw, 5rem)", color: "#9a7b3a" }}
              >
                88%
              </p>
              <p
                className="text-xs font-bold tracking-widest uppercase mt-2"
                style={{ color: "rgba(249,247,243,0.4)" }}
              >
                powierzchni to mieszkania — minimum korytarzy
              </p>
            </div>
            <div
              className="md:pl-14"
              style={{ borderLeft: "1px solid rgba(154,123,58,0.25)" }}
            >
              <p className="font-semibold text-base mb-3" style={{ color: "#f9f7f3" }}>
                Wyjątkowo wysoki udział powierzchni sprzedażowej.
              </p>
              <blockquote
                className="pl-4 py-1"
                style={{ borderLeft: "3px solid rgba(154,123,58,0.55)" }}
              >
                <p
                  className="text-sm italic"
                  style={{ color: "rgba(249,247,243,0.7)", lineHeight: "1.8" }}
                >
                  &ldquo;Stosunek powierzchni użytkowej mieszkań do powierzchni
                  całkowitej wynosi aż 88%, co przekłada się na doskonały wynik
                  ekonomiczny &mdash; bardzo mało powierzchni marnuje się na
                  korytarze.&rdquo;
                </p>
                <footer className="text-xs mt-2" style={{ color: "#9a7b3a" }}>
                  — Jerzy Sawczuk, PRYZMAT
                </footer>
              </blockquote>
            </div>
          </div>
        </AnimateIn>

        {/* Structure of apartments */}
        <AnimateIn animation="fade-up" delay={100}>
          <div
            className="mt-16 grid md:grid-cols-3 gap-px"
            style={{ background: "#d8d4c8" }}
          >
            <AptType range="38 – 47 m²" count={7} tag="Na każdej kondygnacji" note="Kompaktowe — rotacja najszybsza" />
            <AptType range="52 – 63 m²" count={7} tag="Na każdej kondygnacji" note="Segment standard" />
            <AptType range="73 – 88 m²" count={2} tag="Na każdej kondygnacji" note="Premium — wyższa cena/m²" />
          </div>
        </AnimateIn>

        {/* MPZP Block */}
        <AnimateIn animation="fade-up" delay={80}>
          <div
            className="mt-16 grid md:grid-cols-2 gap-0 overflow-hidden"
            style={{ border: "1px solid #d8d4c8" }}
          >
            {/* Left — MPZP parameters */}
            <div className="p-8 md:p-10" style={{ background: "#f9f7f3" }}>
              <p className="b-section-label mb-5">Status planistyczny</p>
              <p
                className="font-jetbrains font-bold mb-4"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "#1B3A6B" }}
              >
                MPZP B50MW
              </p>
              <p
                className="text-sm font-semibold mb-6 tracking-wide"
                style={{ color: "#1a1a2e" }}
              >
                Zabudowa mieszkaniowa wielorodzinna
              </p>
              <ul className="space-y-2 text-sm" style={{ color: "#2d3250" }}>
                {[
                  ["Maks. kondygnacji nadziemnych", "5"],
                  ["Maks. wysokość zabudowy", "16,0 m"],
                  ["Wskaźnik zabudowy", "0,40"],
                  ["Teren biologicznie czynny", "min. 15%"],
                  ["Garaż podziemny", "dopuszczony"],
                ].map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-4 py-2" style={{ borderBottom: "1px solid #d8d4c8" }}>
                    <span style={{ color: "#7a7d94" }}>{k}</span>
                    <span className="font-jetbrains font-semibold text-right" style={{ color: "#1a1a2e" }}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — What MPZP means for investor */}
            <div className="p-8 md:p-10" style={{ background: "#1B3A6B" }}>
              <p
                className="font-semibold text-xs tracking-widest uppercase mb-5"
                style={{ color: "#9a7b3a" }}
              >
                Co to oznacza dla inwestora
              </p>
              <p
                className="font-playfair text-xl md:text-2xl leading-snug mb-5"
                style={{ color: "#f9f7f3" }}
              >
                Zero ryzyka planistycznego.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(249,247,243,0.65)", lineHeight: "1.8" }}
              >
                Parametry zabudowy są zapisane w miejscowym planie
                i nie zależą od decyzji urzędnika. Nie ma ryzyka odmowy,
                nie ma etapu negocjacji z planistami.
                Projekt rusza od razu — bez{" "}
                <span className="font-semibold" style={{ color: "#f9f7f3" }}>
                  12–18 miesięcy
                </span>{" "}
                czekania na WZ.
              </p>

              {/* Location note */}
              <div
                className="mt-8 pt-6"
                style={{ borderTop: "1px solid rgba(154,123,58,0.35)" }}
              >
                <p className="b-section-label mb-2">Lokalizacja</p>
                <p className="text-sm" style={{ color: "rgba(249,247,243,0.7)" }}>
                  Barczewo, ul. Słowackiego 2i (KDZ15)
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(249,247,243,0.45)" }}>
                  Sąsiedztwo: istniejące budynki wielorodzinne B1 i B2 —
                  działka wpisuje się w otaczającą zabudowę.
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>

      </div>
    </section>
  );
}

function BigStat({
  value,
  unit,
  label,
  delay,
}: {
  value: string;
  unit: string;
  label: string;
  delay: number;
}) {
  return (
    <AnimateIn animation="fade-up" delay={delay} className="h-full">
      <div
        className="p-8 md:p-10 flex flex-col gap-2 h-full"
        style={{ background: "#f2efe8" }}
      >
        <div className="flex items-baseline gap-2">
          <span
            className="font-jetbrains font-bold leading-none"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", color: "#1B3A6B" }}
          >
            {value}
          </span>
          <span
            className="font-jetbrains font-semibold"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)", color: "#9a7b3a" }}
          >
            {unit}
          </span>
        </div>
        <p className="text-xs leading-snug" style={{ color: "#7a7d94" }}>
          {label}
        </p>
      </div>
    </AnimateIn>
  );
}

function AptType({
  range,
  count,
  tag,
  note,
}: {
  range: string;
  count: number;
  tag: string;
  note: string;
}) {
  return (
    <div
      className="p-6 md:p-8 flex flex-col gap-1"
      style={{ background: "#f9f7f3" }}
    >
      <p
        className="font-jetbrains font-bold"
        style={{ fontSize: "1.25rem", color: "#1a1a2e" }}
      >
        {range}
      </p>
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#9a7b3a" }}>
        ×{count} lokale · {tag}
      </p>
      <p className="text-xs mt-1" style={{ color: "#7a7d94" }}>
        {note}
      </p>
    </div>
  );
}
