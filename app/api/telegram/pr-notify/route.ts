// Ported z code94's app/api/telegram/pr-notify/route.ts — GitHub webhook target
// (pull_request/opened), sygnatura HMAC-SHA256 przez GITHUB_WEBHOOK_SECRET, wysyła podgląd
// artykułu na Telegram z przyciskami Zatwierdź/Odrzuć. Bez zmian logiki względem oryginału.
import crypto from "node:crypto";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import { runContentChecks } from "@/lib/blog-checks";
import { listPullRequestFiles, getFileContent, findPreviewUrl } from "@/lib/github";
import { sendMessage } from "@/lib/telegram";
import { escapeTelegramHtml, mdxBodyToParagraphs, buildMessageBatch } from "@/lib/telegram-format";

export const runtime = "nodejs";

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signatureHeader);

  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/** Koduje slug w callback_data, o ile mieści się w limicie 64 bajtów Telegrama. */
function buildCallbackData(action: "approve" | "reject", prNumber: number, slug?: string): string {
  const base = `${action}:${prNumber}`;
  if (!slug) return base;
  const withSlug = `${base}:${slug}`;
  return Buffer.byteLength(withSlug, "utf8") <= 64 ? withSlug : base;
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!verifySignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Nieprawidłowy podpis." }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  const payload = JSON.parse(rawBody);

  if (event !== "pull_request" || payload.action !== "opened") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const pr = payload.pull_request;
  if (!pr?.head?.ref?.startsWith("blog/")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const files = await listPullRequestFiles(pr.number);
  const mdxFile = files.find((f) => f.filename.startsWith("content/blog/") && f.filename.endsWith(".mdx"));

  const warnings: string[] = [];
  let paragraphs: string[] = [];
  let slug: string | undefined;

  if (mdxFile) {
    const raw = await getFileContent(mdxFile.filename, pr.head.sha);
    warnings.push(...runContentChecks(raw));

    const { data, content } = matter(raw);
    slug = typeof data.slug === "string" ? data.slug : undefined;
    paragraphs = mdxBodyToParagraphs(content);
  } else {
    warnings.push("⚠️ Nie znaleziono pliku .mdx w content/blog/ w tym PR-ze");
  }

  const previewUrl = await findPreviewUrl(pr.head.sha);

  const footerLines = [
    `🔗 <a href="${pr.html_url}">Zobacz PR na GitHubie</a>`,
    previewUrl
      ? `👀 <a href="${previewUrl}">Podgląd (Vercel)</a>`
      : "👀 Podgląd pojawi się na GitHubie (deployment jeszcze niegotowy).",
  ];
  if (warnings.length > 0) {
    footerLines.push("", ...warnings);
  }

  const sections = [`<b>${escapeTelegramHtml(pr.title)}</b>`, ...paragraphs];
  const messages = buildMessageBatch(sections, footerLines.join("\n"));

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Zatwierdź i publikuj", callback_data: buildCallbackData("approve", pr.number, slug) },
        { text: "❌ Odrzuć", callback_data: buildCallbackData("reject", pr.number, slug) },
      ],
    ],
  };

  for (let i = 0; i < messages.length; i++) {
    const isLast = i === messages.length - 1;
    await sendMessage(process.env.TELEGRAM_CHAT_ID!, messages[i], isLast ? keyboard : undefined);
  }

  return NextResponse.json({ ok: true });
}
