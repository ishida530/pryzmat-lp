// Ported z code94's lib/telegram-format.ts, z jedną zmianą: filtruje komponenty PoradnikCTA /
// PoradnikAuthorBio (nazwy specyficzne dla tego repo) zamiast BlogCTA / BlogAuthorBio.
// HTML (parse_mode: "HTML") zamiast MarkdownV2 — wymaga escapowania tylko & < > ", MarkdownV2
// wymaga ~18 znaków specjalnych, co przy polskim tekście (kropki, myślniki, wykrzykniki) łatwo
// kończy się odrzuceniem wiadomości przez Telegram API.

export const TELEGRAM_MAX_LENGTH = 4096;
export const SPLIT_THRESHOLD = 3800;
export const CHUNK_LIMIT = 3200;

export function escapeTelegramHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Zamienia treść MDX (bez frontmatter) na listę gotowych do wysłania akapitów HTML.
 * Pomija komponenty <PoradnikCTA> i <PoradnikAuthorBio> — jako surowy tekst są nieczytelne.
 */
export function mdxBodyToParagraphs(content: string): string[] {
  const withoutComponents = content
    .split("\n")
    .filter((line) => !/<\s*(PoradnikCTA|PoradnikAuthorBio)\b/.test(line))
    .join("\n");

  return withoutComponents
    .split(/\n\s*\n/)
    .map((paragraph) => formatParagraph(paragraph))
    .filter((paragraph) => paragraph.length > 0);
}

function formatParagraph(paragraph: string): string {
  return paragraph
    .split("\n")
    .map((line) => formatLine(line.trim()))
    .filter((line) => line.length > 0)
    .join("\n");
}

function formatLine(line: string): string {
  if (!line) return "";

  const heading = line.match(/^#{2,3}\s+(.*)$/);
  if (heading) {
    return `<b>${escapeTelegramHtml(heading[1])}</b>`;
  }

  const escaped = escapeTelegramHtml(line);
  return escaped.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function splitLongParagraph(paragraph: string, limit: number): string[] {
  const sentences = paragraph.split(/(?<=[.!?])\s+/);
  const parts: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > limit && current) {
      parts.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) parts.push(current);
  return parts;
}

export function packIntoChunks(sections: string[], limit: number): string[] {
  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current) {
      chunks.push(current);
      current = "";
    }
  };

  for (const section of sections) {
    const pieces = section.length > limit ? splitLongParagraph(section, limit) : [section];

    for (const piece of pieces) {
      const candidate = current ? `${current}\n\n${piece}` : piece;
      if (candidate.length > limit && current) {
        pushCurrent();
        current = piece;
      } else {
        current = candidate;
      }
    }
  }

  pushCurrent();
  return chunks;
}

export function buildMessageBatch(sections: string[], footer: string): string[] {
  const body = sections.join("\n\n");
  const chunks = body.length <= SPLIT_THRESHOLD ? [body] : packIntoChunks(sections, CHUNK_LIMIT);

  const last = chunks[chunks.length - 1] ?? "";
  const withFooter = last ? `${last}\n\n${footer}` : footer;

  if (withFooter.length <= TELEGRAM_MAX_LENGTH) {
    return [...chunks.slice(0, -1), withFooter];
  }

  return [...chunks, footer];
}
