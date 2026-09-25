// Klient Anthropic dla scripts/seo-agent (oficjalne SDK). Trzy funkcje:
// - generateText: długa, swobodna treść (artykuł),
// - generateTool: jedno wywołanie z wymuszonym narzędziem (ustrukturyzowany JSON, np. metadane SEO),
// - researchWithWebSearch: pętla z wyszukiwarką (server tool web_search) zakończona wywołaniem
//   narzędzia "submit" — zwraca jego input oraz listę URL-i, które wyszukiwarka FAKTYCZNIE
//   zwróciła, żeby wywołujący mógł odrzucić źródła, których model nie widział (zmyślone linki).
// Brak trackingu kosztów jak w postfly (skrypt odpala się 1×/tydzień w CI).
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Brak zmiennej środowiskowej ANTHROPIC_API_KEY.");
  }
  client ??= new Anthropic();
  return client;
}

type ToolDef = { name: string; description: string; input_schema: Record<string, unknown> };

function assertNotRefused(message: Anthropic.Message): void {
  if (message.stop_reason === "refusal") {
    throw new Error(`Claude odmówiło odpowiedzi (${message.stop_details?.category ?? "brak kategorii"}).`);
  }
}

export async function generateText(params: {
  model: string;
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const message = await getClient().messages.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: "user", content: params.prompt }],
  });
  assertNotRefused(message);
  if (message.stop_reason === "max_tokens") {
    throw new Error("Odpowiedź Claude ucięta (max_tokens) — treść niekompletna.");
  }

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
  if (!text) {
    throw new Error("Claude zwróciło pustą odpowiedź tekstową.");
  }
  return text;
}

export async function generateTool<T>(params: {
  model: string;
  prompt: string;
  system?: string;
  tool: ToolDef;
  maxTokens?: number;
}): Promise<T> {
  const message = await getClient().messages.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 1024,
    ...(params.system ? { system: params.system } : {}),
    messages: [{ role: "user", content: params.prompt }],
    tools: [params.tool as Anthropic.Tool],
    tool_choice: { type: "tool", name: params.tool.name },
  });
  assertNotRefused(message);

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === params.tool.name
  );
  if (!toolUse) {
    throw new Error("Claude nie zwróciło oczekiwanego tool_use.");
  }
  return toolUse.input as T;
}

const MAX_RESEARCH_TURNS = 8;

export async function researchWithWebSearch<T>(params: {
  model: string;
  system: string;
  prompt: string;
  allowedDomains: string[];
  maxSearches: number;
  submitTool: ToolDef;
  maxTokens?: number;
}): Promise<{ result: T; seenUrls: Set<string> }> {
  const tools: Anthropic.ToolUnion[] = [
    {
      type: "web_search_20260209",
      name: "web_search",
      max_uses: params.maxSearches,
      allowed_domains: params.allowedDomains,
      user_location: { type: "approximate", country: "PL", city: "Olsztyn", timezone: "Europe/Warsaw" },
    },
    { ...(params.submitTool as Anthropic.Tool), strict: true },
  ];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: params.prompt }];
  const seenUrls = new Set<string>();

  for (let turn = 0; turn < MAX_RESEARCH_TURNS; turn++) {
    const message = await getClient().messages.create({
      model: params.model,
      max_tokens: params.maxTokens ?? 16000,
      system: params.system,
      tools,
      messages,
    });
    assertNotRefused(message);

    for (const block of message.content) {
      if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const result of block.content) seenUrls.add(normalizeUrl(result.url));
      }
    }

    const submit = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === params.submitTool.name
    );
    if (submit) {
      if (message.stop_reason === "max_tokens") {
        throw new Error(`${params.submitTool.name}: input ucięty (max_tokens).`);
      }
      return { result: submit.input as T, seenUrls };
    }

    if (message.stop_reason === "pause_turn") {
      // Długa tura wyszukiwania została wstrzymana po stronie serwera — wznawiamy ją.
      messages.push({ role: "assistant", content: message.content });
      continue;
    }

    // Model skończył bez wywołania submit — przypominamy raz na turę, zamiast zgadywać z tekstu.
    messages.push({ role: "assistant", content: message.content });
    messages.push({
      role: "user",
      content: `Zakończ teraz, wywołując narzędzie ${params.submitTool.name} z dotychczasowymi ustaleniami.`,
    });
  }

  throw new Error(`${params.submitTool.name}: brak wyniku po ${MAX_RESEARCH_TURNS} turach.`);
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}${u.search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
