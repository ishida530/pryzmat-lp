// Cienki klient Anthropic Messages API — zastępuje dawne użycie OpenAI (scripts/seo-agent).
// Wzorowany na postfly/lib/server/anthropic-client.ts (ten sam produkt, ten sam właściciel) —
// dwie funkcje: generateText (długa, swobodna treść — artykuł) i generateTool (wymuszone
// tool-use, ustrukturyzowany JSON — metadane SEO). Brak trackingu kosztów jak w postfly (ten
// skrypt odpala się 1×/tydzień w CI, nie ma sensu osobna tabela na to w tym repo).
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_TIMEOUT_MS = 60_000;

function endpoint(): string {
  return process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com/v1/messages";
}

function apiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Brak zmiennej środowiskowej ANTHROPIC_API_KEY.");
  return key;
}

async function callMessages(body: Record<string, unknown>, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint(), {
      method: "POST",
      headers: {
        "x-api-key": apiKey(),
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${text}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function generateText(params: {
  model: string;
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const payload = await callMessages({
    model: params.model,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: "user", content: params.prompt }],
  });

  const textBlock = (payload.content ?? []).find((block: any) => block.type === "text");
  const text = textBlock?.text?.trim();
  if (!text) {
    throw new Error("Claude zwróciło pustą odpowiedź tekstową.");
  }
  return text;
}

export async function generateTool<T>(params: {
  model: string;
  prompt: string;
  system?: string;
  tool: { name: string; description: string; input_schema: Record<string, unknown> };
  maxTokens?: number;
}): Promise<T> {
  const payload = await callMessages({
    model: params.model,
    max_tokens: params.maxTokens ?? 1024,
    ...(params.system ? { system: params.system } : {}),
    messages: [{ role: "user", content: params.prompt }],
    tools: [
      {
        name: params.tool.name,
        description: params.tool.description,
        input_schema: params.tool.input_schema,
      },
    ],
    tool_choice: { type: "tool", name: params.tool.name },
  });

  const toolUse = (payload.content ?? []).find(
    (block: any) => block.type === "tool_use" && block.name === params.tool.name
  );
  if (!toolUse?.input) {
    throw new Error("Claude nie zwróciło oczekiwanego tool_use.");
  }
  return toolUse.input as T;
}
