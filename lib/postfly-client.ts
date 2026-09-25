// Wywołanie Postfly po zmergowaniu PR-a bloga (app/api/telegram/webhook) lub po wykryciu nowej
// oferty w /api/sync — tworzy tam DRAFT posta social media czekającego na osobne zatwierdzenie
// w Telegramie Postfly. Best-effort: awaria Postfly nigdy nie może zepsuć głównego przepływu
// (publikacji artykułu / synchronizacji ofert), więc ta funkcja nigdy nie rzuca — zwraca tylko
// czy się udało, do zalogowania przez wywołującego.
// Do każdego zgłoszenia dołączane są ustawienia marki: BRAND_CONTEXT (usługi, region, ton) i zasady
// pisania per platforma (lib/social-style.ts). W Postfly to wartości DOMYŚLNE — ustawienia konta
// PRYZMAT w panelu Postfly (gdy zostaną uzupełnione) mają pierwszeństwo.
import { BRAND_CONTEXT } from "./constants";
import { BRAND_HASHTAG, PLATFORM_GUIDES, SITE_LABEL } from "./social-style";

export type ContentIntakePayload = {
  type: "blog" | "listing";
  sourceRef: string;
  title: string;
  excerpt: string;
  url: string;
  imageUrl: string;
  price?: number;
  location?: string;
  category?: string;
};

export async function notifyPostflyContentIntake(
  payload: ContentIntakePayload
): Promise<{ ok: true } | { ok: false; error: string }> {
  const baseUrl = process.env.POSTFLY_URL;
  const secret = process.env.EXTERNAL_CONTENT_SECRET;

  if (!baseUrl || !secret) {
    console.warn("[postfly-client] Brak POSTFLY_URL lub EXTERNAL_CONTENT_SECRET — pomijam wywołanie.");
    return { ok: false, error: "not-configured" };
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/external/content-intake`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        ...payload,
        brandContext: BRAND_CONTEXT,
        platformGuides: PLATFORM_GUIDES,
        brandHashtag: BRAND_HASHTAG,
        siteLabel: SITE_LABEL,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[postfly-client] content-intake odpowiedziało ${res.status}: ${text}`);
      return { ok: false, error: `http-${res.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error("[postfly-client] Błąd wywołania content-intake:", error);
    return { ok: false, error: "network" };
  }
}
