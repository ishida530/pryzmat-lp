import { ImageResponse } from "next/og";
import { COMPANY } from "@/lib/constants";

export const runtime = "edge";
export const alt = `Biuro Nieruchomości PRYZMAT — Barczewo, Olsztyn`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f2444 0%, #1B3A6B 55%, #2E6EC5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Red accent bar top-left */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "8px",
            height: "100%",
            background: "#C0392B",
          }}
        />

        {/* Logo prism — simplified triangle shapes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            marginBottom: "28px",
          }}
        >
          <svg
            width="80"
            height="76"
            viewBox="0 0 100 94"
            style={{ display: "block" }}
          >
            <path
              d="M50 4L96 88H4L50 4Z"
              fill="none"
              stroke="#2E6EC5"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path d="M50 22L14 82H50V22Z" fill="#2E6EC5" />
            <path d="M30 82L50 26L70 82H30Z" fill="#C0392B" />
            <rect x="24" y="78" width="52" height="8" rx="1" fill="#C0392B" />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                color: "#ffffff",
                fontSize: "72px",
                fontWeight: 800,
                letterSpacing: "-2px",
                lineHeight: 1,
              }}
            >
              PRYZMAT
            </span>
            <span
              style={{
                color: "#93c5fd",
                fontSize: "22px",
                fontWeight: 600,
                letterSpacing: "8px",
                textTransform: "uppercase",
              }}
            >
              Biuro Nieruchomości
            </span>
          </div>
        </div>

        {/* Red divider */}
        <div
          style={{
            width: "140px",
            height: "4px",
            background: "#C0392B",
            borderRadius: "2px",
            marginBottom: "28px",
          }}
        />

        {/* Location */}
        <div
          style={{
            color: "#d1d5db",
            fontSize: "28px",
            letterSpacing: "4px",
            marginBottom: "48px",
          }}
        >
          Barczewo · Olsztyn · Warmia
        </div>

        {/* Trust signals */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            color: "#6b7280",
            fontSize: "20px",
            position: "absolute",
            bottom: "48px",
          }}
        >
          <span>{COMPANY.yearsActive}+ lat doświadczenia</span>
          <span style={{ color: "#374151" }}>·</span>
          <span>Prowizja {COMPANY.commission}</span>
          <span style={{ color: "#374151" }}>·</span>
          <span>Bezpłatna wycena</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
