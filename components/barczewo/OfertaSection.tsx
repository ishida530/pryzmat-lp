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
                <Step number="01" title="Ty decydujesz.">
                  Przeglądasz dokumentację, rozmawiasz z Jerzym, zadajesz pytania.
                  Gdy jesteś gotowy — podejmujesz decyzję.
                  Bez pośpiechu, bez presji. Cena działki: 1 700 000 zł, do negocjacji.
                </Step>
                <Step number="02" title="Jerzy organizuje budowę.">
                  Jerzy Sawczuk — 11 lat na rynku, zna lokalnych wykonawców i dostawców.
                  Inwestor ma kogoś na miejscu który pilnuje jego interesów przez cały czas budowy.
                  Ty otrzymujesz regularne raporty. Nie musisz znać się na budownictwie.
                </Step>
                <Step number="03" title="Ty odbierasz zysk.">
                  PRYZMAT sprzedaje wszystkie 80 mieszkań na wyłączność.
                  Prowizję pobieramy od kupujących — nie od Ciebie.
                  Gdy ostatnie mieszkanie znajdzie właściciela — odbierasz swój zysk.
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
                  Ta oferta nie jest na portalach nieruchomości.
                  Nie ma jej na OtoDom ani Gratka.
                  Trafiasz tu dlatego że sam jej szukałeś — to już mówi coś o Tobie.
                </p>
                <p>
                  Szukamy jednej osoby. Nie funduszu, nie spółki,
                  nie dewelopera który ma własny dział sprzedaży.
                  Szukamy kogoś kto ma kapitał, chce żeby pracował,
                  i rozumie że dobry partner jest wart więcej niż wszystko samemu.
                </p>
                <p>
                  Jerzy Sawczuk zna się na budowie i zna każdego kupującego
                  w promieniu 30 kilometrów. To nie slogan —
                  to 11 lat transakcji w tym konkretnym miejscu.
                  Inwestor który wejdzie w ten projekt nie jest sam.
                </p>
                <p
                  style={{
                    fontWeight: 600,
                    color: "#1a1a2e",
                    fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
                    lineHeight: "1.5",
                  }}
                >
                  Ty wnosisz kapitał. My wnosimy wszystko inne.
                </p>
              </div>

              {/* Pull quote — Jerzy Sawczuk */}
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
