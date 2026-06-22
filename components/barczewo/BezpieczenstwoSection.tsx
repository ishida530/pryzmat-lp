export function BezpieczenstwoSection() {
  const items = [
    {
      q: '"A co jeśli mieszkania się nie sprzedają?"',
      a: "Barczewo ma niedobór mieszkań na rynku pierwotnym przy rosnącym popycie " +
        "ze strony Olsztyna. PRYZMAT sprzedaje nieruchomości w tym rejonie od 11 lat — " +
        "znamy każdego potencjalnego kupującego zanim pojawi się pierwsza reklama. " +
        "Podpisujemy umowę na wyłączność z konkretnymi warunkami i terminami.",
      red: false,
    },
    {
      q: '"A co jeśli koszty budowy wzrosną?"',
      a: "Kalkulator poniżej celowo zawiera scenariusz konserwatywny " +
        "z wyższymi kosztami (5 800 zł/m²). " +
        "Nawet wtedy zysk brutto przekracza 8 mln zł. " +
        "Margines bezpieczeństwa jest wbudowany w projekt od początku.",
      red: false,
    },
    {
      q: '"A co jeśli nie znam się na budownictwie?"',
      a: "Nie musisz. Jerzy Sawczuk zna lokalnych wykonawców i dostawców — " +
        "jest na miejscu i pilnuje interesów inwestora przez cały czas budowy. " +
        "Twoja rola to akceptacja kluczowych etapów i decyzje finansowe. " +
        "Resztą zajmuje się człowiek który zna ten rynek od 11 lat.",
      red: false,
    },
    {
      q: '"Dlaczego mam zaufać PRYZMAT?"',
      a: "Nie musisz wierzyć na słowo. Zadzwoń do Jerzego Sawczuka " +
        "i zadaj wszystkie pytania które masz. Pierwsza rozmowa trwa 15 minut " +
        "i nie zobowiązuje do niczego. Oceń sam po rozmowie. ",
      a_cta: true,
      red: true,
    },
  ] as const;

  return (
    <section className="py-20" style={{ background: "#f2efe8" }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="b-section-label mb-3"
          style={{ color: "#9a7b3a" }}
        >
          Bezpieczeństwo inwestycji
        </p>
        <h2
          className="font-playfair leading-tight mb-4"
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
            color: "#1a1a2e",
          }}
        >
          Zanim zapytasz o zysk —<br />
          zapytaj o ryzyko.
        </h2>
        <p
          className="text-base leading-relaxed mb-10"
          style={{ color: "#2d3250" }}
        >
          Każdy inwestor prywatny zadaje te same cztery pytania.
          Odpowiadamy wprost.
        </p>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="px-6 py-5 bg-white"
              style={{
                borderLeft: `4px solid ${item.red ? "#C0392B" : "#1B3A6B"}`,
              }}
            >
              <p
                className="font-bold text-base mb-2"
                style={{ color: "#1B3A6B" }}
              >
                {item.q}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#2d3250" }}
              >
                {item.a}
                {"a_cta" in item && item.a_cta && (
                  <a
                    href="tel:+48607677034"
                    className="font-bold underline underline-offset-2"
                    style={{ color: "#1B3A6B" }}
                  >
                    Zadzwoń: +48 607 677 034
                  </a>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
