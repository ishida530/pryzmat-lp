import { ImageResponse } from "next/og";

// Grafika 1200×630 dla artykułu poradnika (tytuł + filar/miasto). Współdzielona przez:
// - app/poradnik/[slug]/opengraph-image.tsx — obrazek OG strony artykułu,
// - app/api/og/route.tsx — ten sam obrazek z parametrów URL, dla Postfly: działa od razu po
//   merge'u, zanim skończy się deploy z nowym plikiem artykułu.
export const OG_SIZE = { width: 1200, height: 630 };

export const PILLAR_LABELS: Record<string, string> = {
  sprzedaz: "Sprzedaż",
  najem: "Najem",
  zakup: "Zakup",
  rynek_lokalny: "Rynek lokalny",
};

export function renderArticleOg(params: { title: string; pillar?: string; city?: string }): ImageResponse {
  const title = params.title.slice(0, 140);
  const label = [params.pillar ? PILLAR_LABELS[params.pillar] ?? null : null, params.city ?? null]
    .filter(Boolean)
    .join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f2444 0%, #1B3A6B 60%, #2E6EC5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: "10px", height: "100%", background: "#C0392B" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#93c5fd", fontSize: "26px", fontWeight: 700, letterSpacing: "6px" }}>PORADNIK</span>
          {label ? <span style={{ color: "#d1d5db", fontSize: "26px" }}>{`· ${label}`}</span> : null}
        </div>

        <div
          style={{
            color: "#ffffff",
            fontSize: title.length > 70 ? "52px" : "62px",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-1px",
            display: "flex",
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#ffffff", fontSize: "40px", fontWeight: 800, letterSpacing: "-1px" }}>PRYZMAT</span>
            <span style={{ color: "#93c5fd", fontSize: "18px", fontWeight: 600, letterSpacing: "6px" }}>
              BIURO NIERUCHOMOŚCI
            </span>
          </div>
          <span style={{ color: "#d1d5db", fontSize: "24px" }}>pryzmatnieruchomosci.pl</span>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
