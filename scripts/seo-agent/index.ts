// Wzorzec code94 (2026-09-23): publikacja artykułu = plik .mdx zmergowany do main, nie wiersz w
// Supabase. Ten skrypt tylko PROPONUJE — tworzy branch/plik/PR, nic więcej. Zatwierdzenie
// (merge = publikacja) dzieje się wyłącznie przez bota Telegram (app/api/telegram/webhook),
// wywołanego przez GitHub webhook (app/api/telegram/pr-notify) w reakcji na to, że PR w ogóle
// powstał — patrz CLAUDE.md code94 dla pełnego opisu tego pipeline'u, tu jest 1:1 ten sam wzorzec.
import { LOCATIONS } from "./config";
import { generateArticle, generateMeta } from "./lib/claude-client";
import { pickNextTopic } from "./lib/topic-picker";
import { getAllPosts } from "../../lib/blog";
import { getBranchSha, createBranch, createFile, createPullRequest } from "../../lib/github";

function ensureUniqueSlug(baseSlug: string): string {
  const existingSlugs = new Set(getAllPosts().map((p) => p.frontmatter.slug));
  let slug = baseSlug;
  let suffix = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
  return slug;
}

// Model dostaje instrukcję (prompts.ts) żeby zostawić dosłowny placeholder "{slug-artykułu}" w
// <PoradnikCTA slug="..."/> zamiast prawdziwego sluga (który w momencie generowania treści jeszcze
// nie istnieje — generateMeta liczy się PO treści). Podmieniamy go tu, znając już finalny slug.
function injectSlug(content: string, slug: string): string {
  return content.split("{slug-artykułu}").join(slug);
}

// Model ma zaczynać treść od "# Tytuł" wyłącznie po to, żeby dało się z niego wyciągnąć tytuł
// (patrz extractTitle w claude-client.ts) — code94's MDX pliki NIE powtarzają tytułu w treści
// (on już jest we frontmatter), więc usuwamy ten wiodący H1 przed zapisem.
function stripLeadingH1(content: string): string {
  return content.replace(/^#\s+.+\n+/, "");
}

function buildFrontmatter(params: {
  title: string;
  description: string;
  slug: string;
  city: string;
  pillar: string;
  targetKeyword: string;
}): string {
  const date = new Date().toISOString().slice(0, 10);
  const escape = (v: string) => v.replace(/"/g, '\\"');
  return [
    "---",
    `title: "${escape(params.title)}"`,
    `description: "${escape(params.description)}"`,
    `date: "${date}"`,
    `slug: "${params.slug}"`,
    `city: "${params.city}"`,
    `pillar: "${params.pillar}"`,
    `targetKeyword: "${escape(params.targetKeyword)}"`,
    "---",
    "",
  ].join("\n");
}

async function run(): Promise<void> {
  console.log("[seo-agent] Start.");

  console.log("[seo-agent] Krok 1/5: wybór tematu...");
  const topic = await pickNextTopic();
  const location = LOCATIONS.find((loc) => loc.name === topic.city);
  if (!location) {
    throw new Error(`Nie znaleziono lokalizacji dla miasta "${topic.city}" w configu.`);
  }
  console.log(`[seo-agent] Temat: "${topic.targetKeyword}" (miasto: ${topic.city}, filar: ${topic.pillar.id})`);

  console.log("[seo-agent] Krok 2/5: generowanie treści artykułu (Claude)...");
  const article = await generateArticle(topic, location);
  console.log(`[seo-agent] Tytuł: "${article.title}" (${article.content.length} znaków)`);

  console.log("[seo-agent] Krok 3/5: generowanie metadanych (Claude)...");
  const meta = await generateMeta(article);

  const slug = ensureUniqueSlug(meta.slug);
  if (slug !== meta.slug) {
    console.log(`[seo-agent] Kolizja slug "${meta.slug}" — użyto "${slug}".`);
  }
  console.log(`[seo-agent] Meta: title="${meta.metaTitle}", slug="${slug}"`);

  const body = injectSlug(stripLeadingH1(article.content), slug);
  const frontmatter = buildFrontmatter({
    title: meta.metaTitle || article.title,
    description: meta.metaDescription,
    slug,
    city: topic.city,
    pillar: topic.pillar.id,
    targetKeyword: topic.targetKeyword,
  });
  const mdxFile = `${frontmatter}${body.trim()}\n`;

  console.log("[seo-agent] Krok 4/5: tworzenie brancha i pliku na GitHubie...");
  const baseBranch = "main";
  const branch = `blog/${slug}`;
  const baseSha = await getBranchSha(baseBranch);
  await createBranch(branch, baseSha);
  await createFile(
    `content/blog/${slug}.mdx`,
    branch,
    mdxFile,
    `blog: dodaj artykuł "${meta.metaTitle}"`
  );

  console.log("[seo-agent] Krok 5/5: otwieranie PR-a...");
  const pr = await createPullRequest({
    title: `Nowy artykuł: ${meta.metaTitle}`,
    head: branch,
    base: baseBranch,
    body: [
      `Temat: ${topic.targetKeyword}`,
      `Miasto: ${topic.city} | Filar: ${topic.pillar.id}`,
      "",
      "Wygenerowane automatycznie przez scripts/seo-agent (Claude). Zatwierdzenie/odrzucenie — przez bota Telegram.",
    ].join("\n"),
  });

  console.log(`[seo-agent] Zakończono. PR: ${pr.html_url}`);
}

run().catch((err) => {
  console.error("[seo-agent] Błąd krytyczny:", err);
  process.exit(1);
});
