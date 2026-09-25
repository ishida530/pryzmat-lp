import Link from "next/link";

// Wzorowane na code94's <BlogCTA> — komponent wstawiany bezpośrednio w treść MDX przez
// scripts/seo-agent (patrz prompts.ts) na końcu każdego artykułu. `href` różni się zależnie od
// filaru tematycznego (sprzedaż/zakup → /oferty, najem → /zarzadzanie-najmem).
export function PoradnikCTA({ href = "/oferty", slug }: { href?: string; slug?: string }) {
  const url = slug ? `${href}?utm_source=poradnik&utm_medium=cta&utm_campaign=${encodeURIComponent(slug)}` : href;
  const isRental = href.includes("zarzadzanie-najmem");

  return (
    <div className="not-prose my-10 rounded-2xl border border-brand-navy/20 bg-brand-dark-navy p-8 text-center">
      <h3 className="font-bold text-xl text-white mb-2">
        {isRental ? "Chcesz oddać najem w dobre ręce?" : "Szukasz nieruchomości albo chcesz sprzedać swoją?"}
      </h3>
      <p className="text-blue-100 text-sm leading-relaxed mb-6 max-w-md mx-auto">
        Porozmawiajmy — bezpłatna konsultacja, bez zobowiązań.
      </p>
      <Link
        href={url}
        className="inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
      >
        {isRental ? "Zobacz zarządzanie najmem" : "Zobacz oferty"}
      </Link>
    </div>
  );
}
