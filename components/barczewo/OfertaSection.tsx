import { AnimateIn } from "@/components/ui/AnimateIn";

export function OfertaSection() {
  return (
    <section
      id="oferta"
      className="py-24 md:py-36"
      style={{ background: "#f9f7f3" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-24 items-start">

          {/* Left column — label + model steps */}
          <AnimateIn animation="fade-up" delay={0}>
            <div>
              <p className="b-section-label mb-6 flex items-center gap-3">
                <span className="b-gold-line" />
                Model współpracy
              </p>

              <div
                className="space-y-10"
                style={{ borderLeft: "1px solid #d8d4c8", paddingLeft: "1.5rem" }}
              >
                <Step number="01" title="Zakup działki">
                  Działka 393/11 przechodzi na inwestora. Podział geodezyjny
                  przygotowany — zatwierdzenie w ok. 14 dni. Cena: 1 700 000 zł
                  (do negocjacji).
                </Step>
                <Step number="02" title="Budowa">
                  Inwestor realizuje budowę zgodnie z gotową koncepcją
                  architektoniczną — 5 kondygnacji, 80 mieszkań, garaż
                  podziemny. Koncepcja skraca czas i koszt projektu.
                </Step>
                <Step number="03" title="Sprzedaż przez PRYZMAT">
                  Biuro PRYZMAT obejmuje wyłączną sprzedaż wszystkich 80
                  lokali. Prowizja od kupujących — inwestor nie ponosi kosztów
                  sprzedaży. Jeden kontakt przez cały projekt.
                </Step>
              </div>
            </div>
          </AnimateIn>

          {/* Right column — letter to investor */}
          <AnimateIn animation="fade-up" delay={120}>
            <div>
              <h2
                className="font-playfair leading-tight mb-8"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 2.875rem)",
                  color: "#1a1a2e",
                }}
              >
                Nie szukamy kupca.
                <br />
                <span style={{ color: "#1B3A6B" }}>Szukamy partnera.</span>
              </h2>

              <div
                className="space-y-5 text-base md:text-lg"
                style={{ color: "#2d3250", lineHeight: "1.75" }}
              >
                <p>
                  Działka 393/11 przy ulicy Słowackiego w Barczewie nie jest
                  wystawiona na portalach. Trafiasz tu, bo ktoś nam Cię polecił
                  lub bo sam szukasz konkretnych możliwości inwestycyjnych —
                  w obu przypadkach rozmawiamy.
                </p>
                <p>
                  Model, który proponujemy, jest rzadki na rynku. Ty wnosisz
                  kapitał i realizujesz budowę. My bierzemy na siebie całą
                  sprzedaż — wszystkie 80 mieszkań, wyłącznie, na własną
                  odpowiedzialność.
                </p>
                <p>
                  To oznacza, że na etapie budowy masz pełną koncentrację na
                  harmonogramie i kosztach. Nie zajmujesz się marketingiem, nie
                  zatrudniasz działu handlowego, nie negocjujesz z indywidualnymi
                  kupującymi. Skupiasz się na jednej rzeczy: dowozisz budynek.
                </p>
                <p style={{ fontWeight: 500, color: "#1a1a2e" }}>
                  My robimy resztę.
                </p>
              </div>

              {/* Pull quote */}
              <blockquote
                className="mt-10 pl-6 py-1"
                style={{ borderLeft: "3px solid #9a7b3a" }}
              >
                <p
                  className="font-playfair italic text-lg md:text-xl leading-relaxed"
                  style={{ color: "#1B3A6B" }}
                >
                  &ldquo;Barczewo pełni naturalną funkcję sypialni Olsztyna. Ceny
                  na rynku pierwotnym przekraczają już 9&nbsp;000&ndash;9&nbsp;700&nbsp;zł/m²
                  &mdash; proponowany projekt stanowi konkurencyjną alternatywę
                  cenową dla stolicy województwa, zachowując zbliżone standardy
                  życia.&rdquo;
                </p>
                <footer
                  className="mt-3 text-sm font-medium tracking-wide"
                  style={{ color: "#9a7b3a" }}
                >
                  — Jerzy Sawczuk, PRYZMAT Biuro Nieruchomości
                </footer>
              </blockquote>
            </div>
          </AnimateIn>

        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Dot on the timeline */}
      <div
        className="absolute -left-[1.625rem] top-1 w-2.5 h-2.5 rounded-full"
        style={{ background: "#9a7b3a", border: "2px solid #f9f7f3" }}
      />
      <p
        className="font-jetbrains text-xs font-bold mb-1"
        style={{ color: "#9a7b3a", letterSpacing: "0.12em" }}
      >
        {number}
      </p>
      <h3
        className="font-semibold text-base mb-1.5"
        style={{ color: "#1a1a2e" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "#7a7d94" }}>
        {children}
      </p>
    </div>
  );
}
