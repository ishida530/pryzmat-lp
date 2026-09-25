// Zastępuje dawne openai-client.ts — ten sam kontrakt (generateArticle/generateMeta), inny
// dostawca. Claude zamiast GPT-4o (decyzja właściciela, 2026-09-23): jakość treści + jedna mniej
// zewnętrzna zależność, skoro Postfly już całkowicie stoi na Anthropic.
//
// 2026-09-25: weryfikacja faktów. Artykuł nie może już opierać się na "pamięci" modelu:
// 1) researchFacts — wyszukiwarka ograniczona do TRUSTED_SOURCE_DOMAINS zbiera fakty ze źródłami,
//    a fakty z URL-ami, których wyszukiwarka faktycznie nie zwróciła, są odrzucane;
// 2) generateArticle pisze wyłącznie na tej liście i linkuje źródła;
// 3) factCheckArticle — osobny "redaktor" (+ deterministyczny test linków) zgłasza blokery.
import { generateText, generateTool, normalizeUrl, researchWithWebSearch } from "../../../lib/anthropic-client";
import { COMPANY } from "../../../lib/constants";
import {
  MAX_FACT_CHECK_SEARCHES,
  MAX_RESEARCH_SEARCHES,
  MODEL_CONTENT,
  MODEL_META,
  TRUSTED_SOURCE_DOMAINS,
} from "../config";
import {
  buildArticlePrompt,
  buildFactCheckPrompt,
  buildFactCheckSystemPrompt,
  buildMetaPrompt,
  buildResearchPrompt,
  buildRevisionPrompt,
  buildSystemPrompt,
  type InternalLink,
} from "./prompts";
import {
  FactCheckReport,
  GeneratedArticle,
  GeneratedMeta,
  Location,
  ReviewIssue,
  SourcedFact,
  Topic,
} from "./types";

const RETRY_DELAY_MS = 2000;

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[claude-client] ${label} nie powiodło się, ponawiam za ${RETRY_DELAY_MS}ms:`, err);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return fn();
  }
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function today(): string {
  return new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}

function isTrustedDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return TRUSTED_SOURCE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

// Wyszukiwarka/lista wyników to nie źródło — czytelnik klikający przypis ma trafić na dokument.
const SEARCH_PAGE_PATTERN = /wyszukiwark|\/search|[?&](query|q|search|szukaj)=/i;

export async function researchFacts(topic: Topic, location: Location): Promise<SourcedFact[]> {
  const { result, seenUrls } = await withRetry("researchFacts", () =>
    researchWithWebSearch<{ facts: SourcedFact[] }>({
      model: MODEL_CONTENT,
      system: buildFactCheckSystemPrompt(),
      prompt: buildResearchPrompt(topic, location, today()),
      allowedDomains: TRUSTED_SOURCE_DOMAINS,
      maxSearches: MAX_RESEARCH_SEARCHES,
      submitTool: {
        name: "submit_facts",
        description: "Zwraca listę zweryfikowanych faktów ze źródłami znalezionymi wyszukiwarką.",
        input_schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            facts: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  claim: { type: "string" },
                  sourceUrl: { type: "string" },
                  sourceTitle: { type: "string" },
                  quote: { type: "string" },
                },
                required: ["claim", "sourceUrl", "sourceTitle", "quote"],
              },
            },
          },
          required: ["facts"],
        },
      },
    })
  );

  const accepted = result.facts.filter((fact) => {
    const ok =
      isTrustedDomain(fact.sourceUrl) &&
      seenUrls.has(normalizeUrl(fact.sourceUrl)) &&
      !SEARCH_PAGE_PATTERN.test(fact.sourceUrl);
    if (!ok) console.warn(`[claude-client] Odrzucony fakt (źródło niezweryfikowane): ${fact.sourceUrl}`);
    return ok;
  });
  return accepted;
}

export async function generateArticle(
  topic: Topic,
  location: Location,
  facts: SourcedFact[],
  internalLinks: InternalLink[]
): Promise<GeneratedArticle> {
  const content = await withRetry("generateArticle", () =>
    generateText({
      model: MODEL_CONTENT,
      system: buildSystemPrompt(),
      prompt: buildArticlePrompt(topic, location, facts, internalLinks),
      maxTokens: 8000,
    })
  );

  const title = extractTitle(content, topic.targetKeyword);
  return { title, content, targetKeyword: topic.targetKeyword };
}

// Deterministyczny bezpiecznik niezależny od modelu: każdy link zewnętrzny w artykule musi
// prowadzić do źródła z listy zweryfikowanych faktów.
export function findUnverifiedLinks(content: string, facts: SourcedFact[]): ReviewIssue[] {
  const allowed = new Set(facts.map((f) => normalizeUrl(f.sourceUrl)));
  const ownHost = new URL(COMPANY.website).hostname.replace(/^www\./, "");
  const issues: ReviewIssue[] = [];

  for (const match of Array.from(content.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g))) {
    const url = match[1];
    let host = "";
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      // Zniekształcony URL — traktujemy jak niezweryfikowany.
    }
    if (host === ownHost || allowed.has(normalizeUrl(url))) continue;
    issues.push({
      excerpt: match[0],
      problem: "Link zewnętrzny spoza listy zweryfikowanych źródeł.",
      severity: "blocker",
      fix: "Usuń link albo zastąp go źródłem z listy faktów.",
    });
  }
  return issues;
}

export async function factCheckArticle(content: string, facts: SourcedFact[]): Promise<ReviewIssue[]> {
  const { result } = await withRetry("factCheckArticle", () =>
    researchWithWebSearch<FactCheckReport>({
      model: MODEL_CONTENT,
      system: buildFactCheckSystemPrompt(),
      prompt: buildFactCheckPrompt(content, facts, today()),
      allowedDomains: TRUSTED_SOURCE_DOMAINS,
      maxSearches: MAX_FACT_CHECK_SEARCHES,
      submitTool: {
        name: "submit_review",
        description: "Zwraca listę problemów merytorycznych w artykule (pusta, jeśli artykuł jest rzetelny).",
        input_schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            issues: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  excerpt: { type: "string" },
                  problem: { type: "string" },
                  severity: { type: "string", enum: ["blocker", "minor"] },
                  fix: { type: "string" },
                },
                required: ["excerpt", "problem", "severity", "fix"],
              },
            },
          },
          required: ["issues"],
        },
      },
    })
  );

  return [...findUnverifiedLinks(content, facts), ...result.issues];
}

export async function reviseArticle(
  article: GeneratedArticle,
  issues: ReviewIssue[],
  facts: SourcedFact[]
): Promise<GeneratedArticle> {
  const content = await withRetry("reviseArticle", () =>
    generateText({
      model: MODEL_CONTENT,
      system: buildSystemPrompt(),
      prompt: buildRevisionPrompt(article.content, issues, facts),
      maxTokens: 8000,
    })
  );
  return { ...article, title: extractTitle(content, article.title), content };
}

type MetaToolResult = Partial<GeneratedMeta>;

export async function generateMeta(article: GeneratedArticle): Promise<GeneratedMeta> {
  const result = await withRetry("generateMeta", () =>
    generateTool<MetaToolResult>({
      model: MODEL_META,
      prompt: buildMetaPrompt(article),
      tool: {
        name: "article_meta",
        description: "Zwraca metadane SEO artykułu: metaTitle, metaDescription, slug.",
        input_schema: {
          type: "object",
          properties: {
            metaTitle: { type: "string" },
            metaDescription: { type: "string" },
            slug: { type: "string" },
          },
          required: ["metaTitle", "metaDescription", "slug"],
        },
      },
      maxTokens: 500,
    })
  );

  if (!result.metaTitle || !result.metaDescription || !result.slug) {
    throw new Error(`Niekompletne metadane z Claude: ${JSON.stringify(result)}`);
  }

  return { metaTitle: result.metaTitle, metaDescription: result.metaDescription, slug: result.slug };
}
