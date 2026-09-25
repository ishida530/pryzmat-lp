// Wzorzec code94 (2026-09-23): publikacja artykułu = plik .mdx zmergowany do main, nie wiersz w
// Supabase. Ten skrypt tylko PROPONUJE — tworzy branch/plik/PR, nic więcej. Zatwierdzenie
// (merge = publikacja) dzieje się wyłącznie przez bota Telegram (app/api/telegram/webhook),
// wywołanego przez GitHub webhook (app/api/telegram/pr-notify) w reakcji na to, że PR w ogóle
// powstał — patrz CLAUDE.md code94 dla pełnego opisu tego pipeline'u, tu jest 1:1 ten sam wzorzec.
import { LOCATIONS } from "./config";
import { factCheckArticle, generateArticle, generateMeta, researchFacts, reviseArticle } from "./lib/claude-client";
import { ReviewIssue, SourcedFact } from "./lib/types";
import type { InternalLink } from "./lib/prompts";
import { pickNextTopic } from "./lib/topic-picker";
import { getAllPosts } from "../../lib/blog";
import { getBranchSha, createBranch, createFile, createPullRequest } from "../../lib/github";

const MAX_REVISION_ROUNDS = 2;
const PLACEHOLDER_PATTERN = /\[(?:PRZYKŁAD|PRZYKLAD|opcjonalnie|uzupełnij|TODO)[^\]]*\]|\{slug-artykułu\}/i;

// Strony, do których artykuł może linkować wewnętrznie: stałe strony usług + opublikowane artykuły.
function buildInternalLinks(): InternalLink[] {
  return [
    { title: "Aktualne oferty nieruchomości", path: "/oferty" },
    { title: "Zarządzanie najmem", path: "/zarzadzanie-najmem" },
    { title: "Bezpłatna konsultacja i kontakt", path: "/kontakt" },
    { title: "O biurze PRYZMAT", path: "/o-nas" },
    ...getAllPosts()
      .slice(0, 20)
      .map((post) => ({ title: post.frontmatter.title, path: `/poradnik/${post.frontmatter.slug}` })),
  ];
}

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
  factCheckNotes: string[];
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
    // Zapis przebiegu weryfikacji — lib/blog-checks.ts pokazuje to w podglądzie na Telegramie.
    // JSON.stringify daje poprawny YAML-owy string w cudzysłowie (także z polskimi znakami).
    `factChecked: "${date}"`,
    ...(params.factCheckNotes.length > 0
      ? ["factCheckNotes:", ...params.factCheckNotes.map((note) => `  - ${JSON.stringify(note)}`)]
      : []),
    "---",
    "",
  ].join("\n");
}

// "## Źródła" składane przez kod, nie przez model: tylko źródła z listy zweryfikowanych faktów,
// które faktycznie są podlinkowane w treści. Wstawiane przed komponentem CTA.
function appendSources(content: string, facts: SourcedFact[]): string {
  const used = new Map<string, string>();
  for (const fact of facts) {
    if (content.includes(fact.sourceUrl) && !used.has(fact.sourceUrl)) {
      used.set(fact.sourceUrl, fact.sourceTitle);
    }
  }
  if (used.size === 0) return content;

  const section = [
    "## Źródła",
    "",
    ...Array.from(used, ([url, title]) => `- [${title}](${url})`),
    "",
  ].join("\n");
  const ctaIndex = content.search(/<PoradnikCTA\b/);
  return ctaIndex === -1
    ? `${content.trim()}\n\n${section}`
    : `${content.slice(0, ctaIndex)}${section}\n${content.slice(ctaIndex)}`;
}

function formatIssue(issue: ReviewIssue): string {
  return `${issue.problem} — "${issue.excerpt.slice(0, 120)}"`;
}

async function run(): Promise<void> {
  console.log("[seo-agent] Start.");

  console.log("[seo-agent] Krok 1/7: wybór tematu...");
  const topic = await pickNextTopic();
  const location = LOCATIONS.find((loc) => loc.name === topic.city);
  if (!location) {
    throw new Error(`Nie znaleziono lokalizacji dla miasta "${topic.city}" w configu.`);
  }
  console.log(`[seo-agent] Temat: "${topic.targetKeyword}" (miasto: ${topic.city}, filar: ${topic.pillar.id})`);

  console.log("[seo-agent] Krok 2/7: research faktów w zaufanych źródłach (Claude + web search)...");
  const facts = await researchFacts(topic, location);
  console.log(`[seo-agent] Zweryfikowane fakty: ${facts.length}`);
  facts.forEach((f) => console.log(`  - ${f.claim} [${f.sourceUrl}]`));

  console.log("[seo-agent] Krok 3/7: generowanie treści artykułu (Claude)...");
  let article = await generateArticle(topic, location, facts, buildInternalLinks());
  console.log(`[seo-agent] Tytuł: "${article.title}" (${article.content.length} znaków)`);

  console.log("[seo-agent] Krok 4/7: fact-check (niezależny redaktor + test linków)...");
  let issues = await factCheckArticle(article.content, facts);
  let blockers = issues.filter((i) => i.severity === "blocker");
  for (let round = 1; round <= MAX_REVISION_ROUNDS && blockers.length > 0; round++) {
    console.log(`[seo-agent] ${blockers.length} blokerów — poprawka ${round}/${MAX_REVISION_ROUNDS}.`);
    blockers.forEach((b) => console.log(`  ! ${formatIssue(b)}`));
    article = await reviseArticle(article, issues, facts);
    issues = await factCheckArticle(article.content, facts);
    blockers = issues.filter((i) => i.severity === "blocker");
  }
  if (blockers.length > 0) {
    // Lepiej nie mieć artykułu w tym tygodniu niż opublikować nieprawdę pod marką biura.
    blockers.forEach((b) => console.error(`  ! ${formatIssue(b)}`));
    throw new Error(`Fact-check nie przeszedł (${blockers.length} blokerów po poprawce) — PR nie zostanie utworzony.`);
  }
  // Runda szlifu: drobne uwagi (gramatyka, odmiana frazy, nieprecyzyjne sformułowania) też
  // poprawiamy, zamiast tylko je notować. Jeśli szlif wprowadzi bloker, zostaje wersja sprzed niego.
  if (issues.length > 0) {
    console.log(`[seo-agent] Szlif: poprawiam ${issues.length} drobnych uwag.`);
    const polished = await reviseArticle(article, issues, facts);
    const polishedIssues = await factCheckArticle(polished.content, facts);
    if (polishedIssues.every((i) => i.severity !== "blocker")) {
      article = polished;
      issues = polishedIssues;
    } else {
      console.log("[seo-agent] Szlif wprowadził bloker — zostaje wersja sprzed szlifu.");
    }
  }
  const factCheckNotes = issues.map(formatIssue);
  console.log(`[seo-agent] Fact-check OK (uwagi drobne: ${factCheckNotes.length}).`);

  console.log("[seo-agent] Krok 5/7: generowanie metadanych (Claude)...");
  const meta = await generateMeta(article);

  const slug = ensureUniqueSlug(meta.slug);
  if (slug !== meta.slug) {
    console.log(`[seo-agent] Kolizja slug "${meta.slug}" — użyto "${slug}".`);
  }
  console.log(`[seo-agent] Meta: title="${meta.metaTitle}", slug="${slug}"`);

  const body = appendSources(injectSlug(stripLeadingH1(article.content), slug), facts);
  // Twarda blokada niezależna od modelu: żaden placeholder nie może trafić na stronę (zatwierdzenie
  // z Telegrama nie daje możliwości jego uzupełnienia).
  const leftover = body.match(PLACEHOLDER_PATTERN);
  if (leftover) {
    throw new Error(`Artykuł zawiera placeholder "${leftover[0]}" — PR nie zostanie utworzony.`);
  }
  const frontmatter = buildFrontmatter({
    title: meta.metaTitle || article.title,
    description: meta.metaDescription,
    slug,
    city: topic.city,
    pillar: topic.pillar.id,
    targetKeyword: topic.targetKeyword,
    factCheckNotes,
  });
  const mdxFile = `${frontmatter}${body.trim()}\n`;

  console.log("[seo-agent] Krok 6/7: tworzenie brancha i pliku na GitHubie...");
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

  console.log("[seo-agent] Krok 7/7: otwieranie PR-a...");
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
