// Ported z code94's app/api/telegram/webhook/route.ts, z jednym dodatkiem: po udanym merge'u
// (= artykuł opublikowany pod /poradnik/{slug}) woła Postfly (lib/postfly-client.ts), żeby
// przygotowało tam DRAFT posta social media czekającego na OSOBNE zatwierdzenie w Telegramie
// Postfly — dwa niezależne kroki akceptacji (treść artykułu tutaj, dystrybucja social tam),
// zgodnie z ustaleniem właściciela. Wywołanie Postfly jest best-effort: jego awaria nigdy nie
// blokuje ani nie cofa publikacji artykułu, która w tym momencie już się dokonała.
import { NextResponse } from "next/server";
import matter from "gray-matter";
import {
  getPullRequest,
  getFileContent,
  mergePullRequest,
  closePullRequest,
  deleteBranch,
  GitHubApiError,
} from "@/lib/github";
import { answerCallbackQuery, editMessageText } from "@/lib/telegram";
import { notifyPostflyContentIntake } from "@/lib/postfly-client";
import { COMPANY } from "@/lib/constants";

export const runtime = "nodejs";

function prUrl(prNumber: number): string {
  return `https://github.com/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/pull/${prNumber}`;
}

function articleUrl(slug: string): string {
  return `${COMPANY.website}/poradnik/${slug}`;
}

function publishedText(slug?: string): string {
  return slug ? `✅ Opublikowano\n${articleUrl(slug)}` : "✅ Opublikowano";
}

// Best-effort — nigdy nie rzuca, merge/publikacja artykułu już się dokonały niezależnie od
// wyniku tego wywołania.
async function triggerSocialDraft(slug: string, baseRef: string): Promise<void> {
  try {
    const raw = await getFileContent(`content/blog/${slug}.mdx`, baseRef);
    const { data } = matter(raw);

    await notifyPostflyContentIntake({
      type: "blog",
      sourceRef: `blog:${slug}`,
      title: typeof data.title === "string" ? data.title : slug,
      excerpt: typeof data.description === "string" ? data.description : "",
      url: articleUrl(slug),
      imageUrl: `${COMPANY.website}/opengraph-image`,
      category: typeof data.pillar === "string" ? data.pillar : undefined,
      location: typeof data.city === "string" ? data.city : undefined,
    });
  } catch (error) {
    console.error("[telegram-webhook] triggerSocialDraft błąd (nie blokuje publikacji):", error);
  }
}

export async function POST(req: Request) {
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  if (secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Nieprawidłowy secret token." }, { status: 401 });
  }

  const update = await req.json();
  const callback = update.callback_query;

  if (!callback) {
    return NextResponse.json({ ok: true });
  }

  const chatId: string = String(callback.message.chat.id);
  if (chatId !== process.env.TELEGRAM_CHAT_ID) {
    return NextResponse.json({ error: "Nieautoryzowany chat." }, { status: 401 });
  }

  await answerCallbackQuery(callback.id);

  const messageId: number = callback.message.message_id;
  const [action, prNumberRaw, slug] = String(callback.data).split(":");
  const prNumber = Number(prNumberRaw);

  if (action === "approve") {
    try {
      await mergePullRequest(prNumber);
    } catch (err) {
      // Podwójne kliknięcie "Zatwierdź" — sprawdzamy realny stan PR-a zamiast
      // zgadywać po treści błędu GitHuba (niedokumentowana, mogła się zmienić).
      const pr = await getPullRequest(prNumber).catch(() => null);
      if (!pr?.merged) {
        const message = err instanceof GitHubApiError ? err.message : "nieznany błąd";
        await editMessageText(chatId, messageId, `⚠️ Błąd mergowania: ${message}\n${prUrl(prNumber)}`);
        return NextResponse.json({ ok: true });
      }
    }

    const pr = await getPullRequest(prNumber);
    await deleteBranch(pr.head.ref);
    await editMessageText(chatId, messageId, publishedText(slug));

    if (slug) {
      await triggerSocialDraft(slug, pr.base.ref);
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    try {
      await closePullRequest(prNumber);
    } catch (err) {
      // Analogicznie: sprawdzamy realny stan zamiast parsować treść błędu.
      const pr = await getPullRequest(prNumber).catch(() => null);
      if (!pr || pr.state !== "closed") {
        const message = err instanceof GitHubApiError ? err.message : "nieznany błąd";
        await editMessageText(chatId, messageId, `⚠️ Błąd odrzucania: ${message}\n${prUrl(prNumber)}`);
        return NextResponse.json({ ok: true });
      }
      if (pr.merged) {
        // Wyścig: PR został tymczasem zatwierdzony (np. drugie kliknięcie "Zatwierdź").
        // Odzwierciedlamy prawdziwy stan zamiast fałszywie twierdzić, że odrzucono.
        await deleteBranch(pr.head.ref);
        await editMessageText(chatId, messageId, publishedText(slug));
        if (slug) {
          await triggerSocialDraft(slug, pr.base.ref);
        }
        return NextResponse.json({ ok: true });
      }
    }

    const pr = await getPullRequest(prNumber);
    await deleteBranch(pr.head.ref);
    await editMessageText(chatId, messageId, "❌ Odrzucono");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
