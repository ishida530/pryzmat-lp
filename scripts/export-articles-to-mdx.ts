// Migracja jednorazowa (2026-09-23): eksportuje opublikowane artykuły z Supabase `articles` do
// content/blog/*.mdx — krok 1 przejścia bloga na wzorzec code94 (git + PR + Telegram zamiast
// Supabase + ręczna zmiana statusu). Supabase NIE jest kasowane po migracji — zostaje jako
// nieaktywna kopia zapasowa, na wypadek gdyby trzeba było do czegoś wrócić.
//
// WAŻNE — slug musi zostać identyczny z tym w Supabase, inaczej stracimy pozycje w Google dla
// tych artykułów (ten sam URL /poradnik/{slug} musi dalej działać). Skrypt tego nie zmienia.
//
// Uruchomienie (lokalnie, z uzupełnionym .env.local): npx tsx scripts/export-articles-to-mdx.ts
import fs from "fs";
import path from "path";
import { supabase } from "../lib/supabase";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

interface DbArticle {
  slug: string;
  title: string;
  content: string;
  meta_description: string;
  target_keyword: string;
  city: string;
  pillar: string;
  published_at: string | null;
  created_at: string;
}

function stripLeadingH1(content: string): string {
  return content.replace(/^#\s+.+\n+/, "");
}

function escape(v: string): string {
  return v.replace(/"/g, '\\"');
}

function buildFrontmatter(a: DbArticle): string {
  const date = (a.published_at ?? a.created_at).slice(0, 10);
  return [
    "---",
    `title: "${escape(a.title)}"`,
    `description: "${escape(a.meta_description)}"`,
    `date: "${date}"`,
    `slug: "${a.slug}"`,
    `city: "${escape(a.city)}"`,
    `pillar: "${a.pillar}"`,
    `targetKeyword: "${escape(a.target_keyword)}"`,
    "---",
    "",
  ].join("\n");
}

async function run(): Promise<void> {
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, content, meta_description, target_keyword, city, pillar, published_at, created_at")
    .eq("status", "published");

  if (error) {
    throw new Error(`Błąd odczytu z Supabase: ${error.message}`);
  }

  const articles = (data ?? []) as DbArticle[];
  if (articles.length === 0) {
    console.log("[export] Brak opublikowanych artykułów w Supabase — nic do zrobienia.");
    return;
  }

  fs.mkdirSync(BLOG_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;

  for (const article of articles) {
    const filePath = path.join(BLOG_DIR, `${article.slug}.mdx`);
    if (fs.existsSync(filePath)) {
      console.log(`[export] Pomijam ${article.slug}.mdx — plik już istnieje.`);
      skipped++;
      continue;
    }

    const body = stripLeadingH1(article.content).trim();
    const mdxFile = `${buildFrontmatter(article)}${body}\n`;
    fs.writeFileSync(filePath, mdxFile, "utf8");
    console.log(`[export] Zapisano content/blog/${article.slug}.mdx`);
    written++;
  }

  console.log(`[export] Zakończono. Zapisano: ${written}, pominięto: ${skipped}, razem w Supabase: ${articles.length}.`);
  console.log("[export] Następny krok: przejrzyj wygenerowane pliki, zacommituj i wypchnij do main (nie przez PR — to jednorazowy import, nie nowy artykuł do recenzji).");
}

run().catch((err) => {
  console.error("[export] Błąd krytyczny:", err);
  process.exit(1);
});
