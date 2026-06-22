import { AnimateIn } from "@/components/ui/AnimateIn";

const ARGUMENTS = [
  {
    num: "I",
    title: "Znamy kupujących zanim ogłosisz budowę.",
    body: "Przez 11 lat obsługiwaliśmy rodziny kupujące mieszkania w Barczewie i Olsztynie. Wiemy kto szuka kawalerki, kto czeka na trzypokojowe, kto ma kredyt gotowy do uruchomienia. Gdy Twój budynek stanie — lista chętnych już czeka.",
    stat: "11 lat",
    statLabel: "wyłącznie Barczewo i Olsztyn",
  },
  {
    num: "II",
    title: "Prowizja od kupujących, nie od inwestora",
    body: "Nasz model wynagrodzenia jest przejrzysty: pobieramy prowizję od nabywców lokali. Inwestor nie ponosi kosztów sprzedaży. Zarabiamy, gdy Ty zarabiasz — nasze interesy są zbieżne przez cały projekt.",
    stat: "0 zł",
    statLabel: "koszt sprzedaży dla inwestora",
  },
  {
    num: "III",
    title: "Jeden człowiek odpowiada za wszystko.",
    body: "Jerzy Sawczuk. Nie dział, nie rotacja, nie call center. Jeden człowiek który zna projekt od pierwszego telefonu do ostatniego aktu notarialnego. Numer bezpośredni: +48 607 677 034 — odbiera osobiście.",
    stat: "80",
    statLabel: "mieszkań — jedna odpowiedzialność",
  },
];

export function PryzmatSection() {
  return (
    <section
      id="dlaczego-pryzmat"
      className="py-24 md:py-36"
      style={{ background: "#f2efe8" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16">

        {/* Header */}
        <AnimateIn animation="fade-up">
          <div className="max-w-2xl mb-16 md:mb-20">
            <p className="b-section-label mb-4 flex items-center gap-3">
              <span className="b-gold-line" />
              Dlaczego PRYZMAT
            </p>
            <h2
              className="font-playfair mb-4"
              style={{ fontSize: "clamp(2rem, 3.5vw, 2.875rem)", color: "#1a1a2e" }}
            >
              Inwestor skupia się na zysku.
              <br />
              <span style={{ color: "#1B3A6B" }}>Jerzy Sawczuk na wszystkim innym.</span>
            </h2>
            <div className="space-y-4 mt-1">
              <p className="text-base" style={{ color: "#7a7d94", lineHeight: "1.75" }}>
                Za tą ofertą stoi Jerzy Sawczuk — założyciel PRYZMAT,
                11 lat wyłącznie na rynku Barczewa i Olsztyna.
                Zna lokalnych wykonawców i dostawców. Wie co budować
                żeby się sprzedało. I sprzeda to osobiście.
              </p>
              <blockquote
                className="pl-5 py-1"
                style={{ borderLeft: "3px solid #9a7b3a" }}
              >
                <p className="text-base italic" style={{ color: "#2d3250", lineHeight: "1.75" }}>
                  &ldquo;Nie ukrywam, że głównym moim zadaniem jest pozyskanie inwestora
                  dla tej działki. Będzie dla mnie przyjemnością i zaszczytem,
                  jeżeli Państwo powierzycie mi sprzedaż wybudowanych mieszkań.&rdquo;
                </p>
                <footer className="text-xs mt-2 font-medium" style={{ color: "#9a7b3a" }}>
                  — Jerzy Sawczuk, fragment oryginalnej oferty
                </footer>
              </blockquote>
            </div>
          </div>
        </AnimateIn>

        {/* Arguments */}
        <div className="grid md:grid-cols-3 gap-px" style={{ background: "#d8d4c8" }}>
          {ARGUMENTS.map((arg, i) => (
            <AnimateIn key={arg.num} animation="fade-up" delay={i * 100} className="h-full">
              <div
                className="flex flex-col gap-6 p-8 md:p-10 h-full"
                style={{ background: "#f2efe8" }}
              >
                {/* Roman numeral */}
                <p
                  className="font-jetbrains text-xs font-bold tracking-widest"
                  style={{ color: "#9a7b3a" }}
                >
                  {arg.num}
                </p>

                {/* Big stat */}
                <div>
                  <p
                    className="font-jetbrains font-bold leading-none mb-1"
                    style={{ fontSize: "2.5rem", color: "#1B3A6B" }}
                  >
                    {arg.stat}
                  </p>
                  <p className="text-xs" style={{ color: "#7a7d94" }}>
                    {arg.statLabel}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-8 h-px" style={{ background: "#9a7b3a" }} />

                {/* Text */}
                <div>
                  <h3
                    className="font-semibold text-base mb-3"
                    style={{ color: "#1a1a2e" }}
                  >
                    {arg.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#7a7d94", lineHeight: "1.75" }}
                  >
                    {arg.body}
                  </p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Closing note */}
        <AnimateIn animation="fade-up" delay={80}>
          <div
            className="mt-12 p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10"
            style={{ background: "#1B3A6B", borderRadius: "2px" }}
          >
            <div className="flex-1">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: "#9a7b3a" }}
              >
                Kompletny pakiet dla inwestora
              </p>
              <p
                className="font-playfair text-xl md:text-2xl leading-snug mb-2"
                style={{ color: "#f9f7f3" }}
              >
                Działka + wyłączna sprzedaż 80 mieszkań — w jednym pakiecie.
              </p>
              <p
                className="text-sm"
                style={{ color: "rgba(249,247,243,0.55)", lineHeight: "1.65" }}
              >
                Prowadzimy sprzedaż na wyłączność: od pierwszej prezentacji do
                ostatniego aktu notarialnego. Prowizję pobieramy od nabywców lokali
                — po stronie inwestora koszt sprzedaży wynosi zero.
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p
                className="font-jetbrains font-bold"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "#9a7b3a" }}
              >
                0 zł
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(249,247,243,0.4)" }}>
                koszt sprzedaży dla inwestora
              </p>
            </div>
          </div>
        </AnimateIn>

      </div>
    </section>
  );
}
