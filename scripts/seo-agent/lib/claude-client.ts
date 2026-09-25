// Zastępuje dawne openai-client.ts — ten sam kontrakt (generateArticle/generateMeta), inny
// dostawca. Claude zamiast GPT-4o (decyzja właściciela, 2026-09-23): jakość treści + jedna mniej
// zewnętrzna zależność, skoro Postfly już całkowicie stoi na Anthropic.
import { generateText, generateTool } from "../../../lib/anthropic-client";
import { MODEL_CONTENT, MODEL_META } from "../config";
import { buildArticlePrompt, buildMetaPrompt, buildSystemPrompt } from "./prompts";
import { GeneratedArticle, GeneratedMeta, Location, Topic } from "./types";

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

export async function generateArticle(topic: Topic, location: Location): Promise<GeneratedArticle> {
  const content = await withRetry("generateArticle", () =>
    generateText({
      model: MODEL_CONTENT,
      system: buildSystemPrompt(),
      prompt: buildArticlePrompt(topic, location),
      maxTokens: 6000,
    })
  );

  const title = extractTitle(content, topic.targetKeyword);
  return { title, content, targetKeyword: topic.targetKeyword };
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
