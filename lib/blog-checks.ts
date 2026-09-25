// Ported z code94's lib/blog-checks.ts. Progi/domena/nazwa CTA dopasowane do tego projektu:
// MIN/MAX_WORDS luźno wokół celu 1200–1600 słów z scripts/seo-agent/lib/prompts.ts (nie 400–900
// jak w code94 — inny, dłuższy format artykułu), CTA komponent to <PoradnikCTA>, domena
// wewnętrznych linków to pryzmatnieruchomosci.pl. Wszystkie ostrzeżenia non-blocking, tak jak w
// oryginale (blokujący jest fact-check w scripts/seo-agent — tu tylko podgląd dla zatwierdzającego).
import matter from "gray-matter";

const REQUIRED_FRONTMATTER_FIELDS = ["title", "description", "date", "slug"] as const;
const MIN_WORDS = 1000;
const MAX_WORDS = 1800;
const MIN_HEADINGS = 2;

export function runContentChecks(rawMdx: string): string[] {
  const warnings: string[] = [];
  const { data, content } = matter(rawMdx);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
    warnings.push(`⚠️ Długość: ${wordCount} słów`);
  }

  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (!data[field]) {
      warnings.push(`⚠️ Brak pola: ${field}`);
    }
  }

  const fullText = `${data.title ?? ""} ${content}`;
  if (/rodo|prawn|podatk/i.test(fullText)) {
    warnings.push("⚠️ Temat prawny — sprawdź zastrzeżenie");
  }

  // SEO on-page (deterministycznie, niezależnie od modelu): długości tytułu/opisu pod SERP i fraza
  // kluczowa tam, gdzie Google ją waży — tytuł, pierwszy akapit, co najmniej jeden H2.
  const title = typeof data.title === "string" ? data.title : "";
  const description = typeof data.description === "string" ? data.description : "";
  if (title.length > 60) warnings.push(`⚠️ SEO: tytuł ma ${title.length} znaków (max 60)`);
  if (description.length < 70 || description.length > 160) {
    warnings.push(`⚠️ SEO: opis ma ${description.length} znaków (cel 70–155)`);
  }
  const keyword = typeof data.targetKeyword === "string" ? data.targetKeyword.toLowerCase() : "";
  if (keyword) {
    const firstParagraph = content.trim().split(/\n\s*\n/)[0]?.toLowerCase() ?? "";
    const h2s = (content.match(/^## .+$/gm) || []).join(" ").toLowerCase();
    // Odmiana w języku polskim: sprawdzamy rdzenie słów frazy (pierwsze 5 liter), nie pełną formę.
    const stems = keyword.split(/\s+/).filter((w) => w.length > 3).map((w) => w.slice(0, 5));
    const covers = (text: string) => stems.length > 0 && stems.every((s) => text.includes(s));
    if (!covers(title.toLowerCase())) warnings.push(`⚠️ SEO: fraza „${keyword}” nie występuje w tytule`);
    if (!covers(firstParagraph)) warnings.push(`⚠️ SEO: fraza „${keyword}” nie występuje we wstępie`);
    if (!covers(h2s)) warnings.push(`⚠️ SEO: fraza „${keyword}” nie występuje w żadnym H2`);
  }

  const headingCount = (content.match(/^## /gm) || []).length;
  if (headingCount < MIN_HEADINGS) {
    warnings.push("⚠️ Mało nagłówków — sprawdź strukturę");
  }

  // Weryfikacja faktów (scripts/seo-agent): brak znacznika = artykuł nie przeszedł pipeline'u
  // research → fact-check (np. dodany ręcznie) — trzeba go sprawdzić samodzielnie.
  if (!data.factChecked) {
    warnings.push("⛔ Artykuł bez automatycznej weryfikacji faktów — sprawdź źródła ręcznie");
  }
  const placeholder = content.match(/\[(?:PRZYKŁAD|PRZYKLAD|opcjonalnie|uzupełnij|TODO)[^\]]*\]/i);
  if (placeholder) {
    warnings.push(`⛔ NIE ZATWIERDZAJ: niewypełniony placeholder „${placeholder[0]}”`);
  }
  if (Array.isArray(data.factCheckNotes)) {
    for (const note of data.factCheckNotes) {
      warnings.push(`🔎 Uwaga redaktora: ${String(note)}`);
    }
  }
  if (/\d/.test(content) && !/^## Źródła/m.test(content)) {
    warnings.push("⚠️ Są liczby, ale brak sekcji „Źródła”");
  }

  if (!/<PoradnikCTA\b/.test(content)) {
    warnings.push("⚠️ Brak wywołania CTA");
  }

  const hasInternalLink = /\]\(\s*(\/|https?:\/\/(?:www\.)?pryzmatnieruchomosci\.pl)/i.test(content);
  if (!hasInternalLink) {
    warnings.push("⚠️ Brak linku wewnętrznego");
  }

  return warnings;
}
