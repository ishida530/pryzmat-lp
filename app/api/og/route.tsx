import { renderArticleOg } from "@/lib/og-article";

// GET /api/og?title=...&pillar=...&city=... — grafika artykułu z parametrów, dla Postfly.
export const runtime = "edge";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return renderArticleOg({
    title: searchParams.get("title") || "Poradnik nieruchomości",
    pillar: searchParams.get("pillar") ?? undefined,
    city: searchParams.get("city") ?? undefined,
  });
}
