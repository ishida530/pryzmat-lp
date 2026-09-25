// Ported z code94's lib/blog-checks.ts. Progi/domena/nazwa CTA dopasowane do tego projektu:
// MIN/MAX_WORDS luźno wokół celu 1200–1600 słów z scripts/seo-agent/lib/prompts.ts (nie 400–900
// jak w code94 — inny, dłuższy format artykułu), AI_DISCLOSURE dopasowane do frazy wymaganej w
// tym samym pliku promptów, CTA komponent to <PoradnikCTA>, domena wewnętrznych linków to
// pryzmatnieruchomosci.pl. Wszystkie ostrzeżenia non-blocking, tak jak w oryginale.
import matter from "gray-matter";

const REQUIRED_FRONTMATTER_FIELDS = ["title", "description", "date", "slug"] as const;
const MIN_WORDS = 1000;
const MAX_WORDS = 1800;
const MIN_HEADINGS = 2;
const AI_DISCLOSURE = "wspomagany ai";

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

  if (!content.toLowerCase().includes(AI_DISCLOSURE)) {
    warnings.push("⚠️ Brak oznaczenia AI");
  }

  const headingCount = (content.match(/^## /gm) || []).length;
  if (headingCount < MIN_HEADINGS) {
    warnings.push("⚠️ Mało nagłówków — sprawdź strukturę");
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
