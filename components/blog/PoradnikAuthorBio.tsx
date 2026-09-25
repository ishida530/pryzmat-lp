import { COMPANY } from "@/lib/constants";

// Wzorowane na code94's <BlogAuthorBio>, ale bez zdjęcia osobistego (brak takiego zasobu w tym
// repo) — podpis zespołu biura zamiast jednej osoby, spójne z tonem "piszemy w imieniu firmy"
// z prompts.ts.
export function PoradnikAuthorBio() {
  return (
    <div className="not-prose my-10 rounded-2xl border border-gray-100 bg-white p-6">
      <p className="font-bold text-sm text-brand-navy mb-1">Zespół {COMPANY.name}</p>
      <p className="text-sm text-gray-600 leading-relaxed mb-2">
        Działamy lokalnie na terenie {COMPANY.areaServed.join(", ")} od {COMPANY.foundingYear} roku.
      </p>
      <a href="/zespol" className="text-brand-blue font-semibold text-sm hover:underline">
        Poznaj nasz zespół →
      </a>
    </div>
  );
}
