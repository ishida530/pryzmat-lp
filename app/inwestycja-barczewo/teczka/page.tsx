"use client";

import Link from "next/link";

/* ─── Dane finansowe ──────────────────────────────────────── */
const PUM = 4290;

function pln(n: number) {
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(n);
}
function pct(n: number) {
  return n.toFixed(1).replace(".", ",") + "%";
}

const SCENARIOS = [
  { name: "Konserwatywny", note: "Poziom Olsztyna, ostrożne koszty", cena: 9000, budowa: 5800, dzialka: 1_700_000 },
  { name: "Realistyczny",  note: "Scenariusz bazowy",                 cena: 9300, budowa: 5500, dzialka: 1_700_000 },
  { name: "Optymistyczny", note: "Poziom Olsztyna premium",           cena: 9700, budowa: 5200, dzialka: 1_700_000 },
] as const;

function calc(s: { cena: number; budowa: number; dzialka: number }) {
  const przychod     = PUM * s.cena;
  const kosztBudowy  = PUM * s.budowa;
  const bazowe       = kosztBudowy + s.dzialka;
  const inne         = bazowe * 0.15;
  const koszty       = bazowe + inne;
  const zysk         = przychod - koszty;
  const marza        = (zysk / przychod) * 100;
  return { przychod, kosztBudowy, inne, koszty, zysk, marza };
}

const DOCS = [
  { label: "Plan zagospodarowania terenu",   desc: "Koncepcja — Plansza 1" },
  { label: "Rzut parteru z metrażami",        desc: "Plansza 3" },
  { label: "Rzut powtarzalnej kondygnacji",   desc: "Plansza 4" },
  { label: "Rzut garażu podziemnego",         desc: "41 miejsc postojowych" },
  { label: "Wypis z MPZP",                    desc: "B50MW Barczewo" },
  { label: "Mapa podziału działki",           desc: "393/11 — gotowy geodezyjnie" },
  { label: "Oryginalna oferta inwestycyjna",  desc: "List Jerzego Sawczuka" },
];

/* ─── Strona ─────────────────────────────────────────────── */
export default function TeczkaPage() {
  return (
    <>
      {/* ── Print CSS ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        @media print {
          nav, footer, .no-print { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; }
          body { background: white !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .teczka-page {
            page-break-after: always;
            break-after: page;
            box-shadow: none !important;
          }
          .teczka-page:last-of-type {
            page-break-after: auto;
            break-after: auto;
          }
        }
        @media screen {
          .teczka-wrap { background: #e8e6e0; padding: 32px 0 64px; }
          .teczka-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 24px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.18);
            background: #fff;
            position: relative;
            overflow: hidden;
          }
        }
      ` }} />

      {/* ── Toolbar (ekran, ukryty przy druku) ── */}
      <div className="no-print sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#1B3A6B] border-b-2 border-[#9a7b3a]">
        <Link
          href="/inwestycja-barczewo"
          className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity text-[rgba(249,247,243,0.7)]"
        >
          ← Wróć do strony
        </Link>
        <p
          className="text-xs font-bold tracking-widest uppercase text-[#9a7b3a]"
        >
          Teczka inwestycyjna · Barczewo
        </p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2 font-semibold text-sm transition-opacity hover:opacity-90 bg-[#C0392B] text-white rounded-sm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 4V1h10v3M2 10H1V5h12v5h-1M4 13h6V8H4v5z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Zapisz jako PDF
        </button>
      </div>

      <div className="teczka-wrap">

        {/* ══════════════════════════════════════════════════
            STRONA 1 — OKŁADKA
        ══════════════════════════════════════════════════ */}
        <div
          className="teczka-page flex flex-col"
          style={{ background: "#0f2444", padding: "18mm 20mm 14mm 20mm" }}
        >
          {/* Gold left bar */}
          <div
            className="absolute left-0 top-0 bottom-0"
            style={{ width: "5px", background: "linear-gradient(to bottom, transparent 5%, #9a7b3a 20%, #9a7b3a 80%, transparent 95%)" }}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-auto">
            <div>
              <p
                className="font-jetbrains font-bold tracking-widest"
                style={{ fontSize: "11px", color: "#9a7b3a", letterSpacing: "0.22em" }}
              >
                PRYZMAT
              </p>
              <p style={{ fontSize: "9px", color: "rgba(249,247,243,0.4)", letterSpacing: "0.08em" }}>
                BIURO NIERUCHOMOŚCI
              </p>
            </div>
            <p style={{ fontSize: "9px", color: "rgba(249,247,243,0.3)", letterSpacing: "0.06em" }}>
              MATERIAŁ POUFNY
            </p>
          </div>

          {/* Main content */}
          <div style={{ marginTop: "auto", marginBottom: "auto", paddingTop: "28mm" }}>
            <p
              className="font-jetbrains font-bold tracking-widest uppercase mb-6"
              style={{ fontSize: "9px", color: "#9a7b3a", letterSpacing: "0.28em" }}
            >
              Oferta inwestycyjna · Barczewo · {new Date().getFullYear()}
            </p>

            <h1
              className="font-playfair leading-tight mb-4"
              style={{ fontSize: "42px", color: "#f9f7f3", lineHeight: "1.08" }}
            >
              Grunt pod 80 mieszkań
              <br />
              <span style={{ color: "rgba(249,247,243,0.55)" }}>w Barczewie.</span>
            </h1>

            <p style={{ fontSize: "13px", color: "rgba(249,247,243,0.5)", marginBottom: "10mm", letterSpacing: "0.04em" }}>
              ul. Słowackiego 2i · MPZP B50MW · zabudowa wielorodzinna
            </p>

            {/* Gold divider */}
            <div style={{ height: "1px", background: "rgba(154,123,58,0.5)", marginBottom: "10mm", width: "80mm" }} />

            {/* Key stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0", borderTop: "1px solid rgba(154,123,58,0.3)" }}>
              {[
                { val: "4 438 m²",  lab: "powierzchnia działki" },
                { val: "80 lok.",   lab: "koncepcja architektoniczna" },
                { val: "1,7 mln",   lab: "cena działki (do negocjacji)" },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8mm 0 0",
                    borderRight: i < 2 ? "1px solid rgba(154,123,58,0.2)" : "none",
                    paddingRight: i < 2 ? "8mm" : 0,
                    paddingLeft: i > 0 ? "8mm" : 0,
                  }}
                >
                  <p
                    className="font-jetbrains font-bold"
                    style={{ fontSize: "24px", color: "#f9f7f3", lineHeight: 1 }}
                  >
                    {s.val}
                  </p>
                  <p style={{ fontSize: "8px", color: "#9a7b3a", marginTop: "4px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {s.lab}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{ borderTop: "1px solid rgba(154,123,58,0.2)", paddingTop: "6mm", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}
          >
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#f9f7f3" }}>Jerzy Sawczuk</p>
              <p style={{ fontSize: "10px", color: "#9a7b3a", marginTop: "2px" }}>+48 607 677 034 · biuro@marzdom.pl</p>
            </div>
            <p style={{ fontSize: "8px", color: "rgba(249,247,243,0.25)", textAlign: "right" }}>
              PRYZMAT Biuro Nieruchomości<br />
              Barczewko 126B, 11-010 Barczewo
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            STRONA 2 — CZYM JEST TA OFERTA
        ══════════════════════════════════════════════════ */}
        <div className="teczka-page" style={{ padding: "16mm 20mm", background: "#f9f7f3" }}>
          <PageHeader eyebrow="Model współpracy" title="Czym jest ta oferta" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14mm", marginTop: "10mm" }}>
            {/* Left — intro */}
            <div>
              <p style={{ fontSize: "13px", color: "#2d3250", lineHeight: "1.75", marginBottom: "8mm" }}>
                Ta oferta nie jest na portalach nieruchomości. Nie ma jej na OtoDom ani Gratka.
                Trafiasz tu dlatego że sam jej szukałeś — to już mówi coś o Tobie.
              </p>
              <p style={{ fontSize: "13px", color: "#2d3250", lineHeight: "1.75", marginBottom: "8mm" }}>
                Szukamy jednej osoby. Nie funduszu, nie spółki, nie dewelopera który ma własny dział sprzedaży.
                Szukamy kogoś kto ma kapitał, chce żeby pracował, i rozumie że dobry partner jest wart więcej
                niż wszystko samemu.
              </p>
              <p style={{ fontSize: "13px", color: "#2d3250", lineHeight: "1.75", marginBottom: "10mm" }}>
                Jerzy Sawczuk zna lokalnych wykonawców i dostawców. Wie co budować żeby się sprzedało.
                I sprzeda to osobiście — znamy każdego kupującego w promieniu 30 kilometrów.
              </p>

              {/* P4 highlight */}
              <div
                style={{
                  borderLeft: "4px solid #9a7b3a",
                  paddingLeft: "6mm",
                  paddingTop: "3mm",
                  paddingBottom: "3mm",
                }}
              >
                <p
                  className="font-playfair"
                  style={{ fontSize: "17px", color: "#1B3A6B", lineHeight: "1.45", fontWeight: 600 }}
                >
                  Ty wnosisz kapitał.
                  <br />
                  My wnosimy wszystko inne.
                </p>
              </div>

              {/* Jerzy quote */}
              <blockquote style={{ marginTop: "8mm", paddingLeft: "6mm", borderLeft: "2px solid rgba(154,123,58,0.4)" }}>
                <p
                  className="font-playfair"
                  style={{ fontSize: "11px", color: "#1B3A6B", fontStyle: "italic", lineHeight: "1.7" }}
                >
                  &ldquo;Barczewo pełni naturalną funkcję sypialni Olsztyna. Ceny na rynku pierwotnym
                  przekraczają już 9 000–9 700 zł/m² — proponowany projekt stanowi konkurencyjną
                  alternatywę cenową dla stolicy województwa.&rdquo;
                </p>
                <p style={{ fontSize: "9px", color: "#9a7b3a", marginTop: "4px", fontWeight: 700 }}>
                  — Jerzy Sawczuk, PRYZMAT Biuro Nieruchomości
                </p>
              </blockquote>
            </div>

            {/* Right — 3 steps */}
            <div>
              <p
                className="font-jetbrains"
                style={{ fontSize: "8px", color: "#9a7b3a", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, marginBottom: "8mm" }}
              >
                Trzy kroki
              </p>
              <div style={{ borderLeft: "1px solid #d8d4c8", paddingLeft: "7mm", display: "flex", flexDirection: "column", gap: "9mm" }}>
                {[
                  {
                    n: "01",
                    t: "Ty decydujesz.",
                    b: "Przeglądasz dokumentację, rozmawiasz z Jerzym, zadajesz pytania. Gdy jesteś gotowy — podejmujesz decyzję. Bez pośpiechu, bez presji. Cena działki: 1 700 000 zł, do negocjacji.",
                  },
                  {
                    n: "02",
                    t: "Jerzy organizuje budowę.",
                    b: "11 lat na rynku, zna lokalnych wykonawców i dostawców. Inwestor ma kogoś na miejscu który pilnuje jego interesów przez cały czas budowy. Ty otrzymujesz regularne raporty.",
                  },
                  {
                    n: "03",
                    t: "Ty odbierasz zysk.",
                    b: "PRYZMAT sprzedaje wszystkie 80 mieszkań na wyłączność. Prowizję pobieramy od kupujących — nie od Ciebie. Gdy ostatnie mieszkanie znajdzie właściciela — odbierasz swój zysk.",
                  },
                ].map((s) => (
                  <div key={s.n} style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: "-10mm",
                        top: "1px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#9a7b3a",
                        border: "2px solid #f9f7f3",
                      }}
                    />
                    <p className="font-jetbrains" style={{ fontSize: "8px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.12em", marginBottom: "3px" }}>
                      {s.n}
                    </p>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e", marginBottom: "4px" }}>{s.t}</p>
                    <p style={{ fontSize: "10.5px", color: "#7a7d94", lineHeight: "1.65" }}>{s.b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            STRONA 3 — PARAMETRY TECHNICZNE
        ══════════════════════════════════════════════════ */}
        <div className="teczka-page" style={{ padding: "16mm 20mm", background: "#fff" }}>
          <PageHeader eyebrow="Dane inwestycji" title="Parametry techniczne" />

          {/* Main stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1px",
              background: "#d8d4c8",
              marginTop: "8mm",
              marginBottom: "8mm",
            }}
          >
            {[
              { val: "4 290 m²",   lab: "Powierzchnia mieszkań do sprzedaży (PUM)" },
              { val: "80 lok.",    lab: "Mieszkań — 16 na każdej z 5 kondygnacji" },
              { val: "5 kond.",    lab: "Kondygnacji nadziemnych + garaż podziemny" },
              { val: "4 438 m²",  lab: "Powierzchnia działki 393/11 Barczewo" },
              { val: "101 miejsc",lab: "Postojowych (garaż 41 + teren 60)" },
              { val: "88%",       lab: "Efektywności PUM — minimum korytarzy" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#f9f7f3", padding: "7mm 8mm" }}>
                <p
                  className="font-jetbrains font-bold"
                  style={{ fontSize: "22px", color: "#1B3A6B", lineHeight: 1, marginBottom: "4px" }}
                >
                  {s.val}
                </p>
                <p style={{ fontSize: "8.5px", color: "#7a7d94", lineHeight: "1.4" }}>{s.lab}</p>
              </div>
            ))}
          </div>

          {/* Apartment types */}
          <p className="font-jetbrains" style={{ fontSize: "8px", color: "#9a7b3a", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: "4mm" }}>
            Struktura mieszkań (per kondygnacja)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: "#d8d4c8", marginBottom: "8mm" }}>
            {[
              { range: "38 – 47 m²", count: "×7 lokal", note: "Kompaktowe — najszybsza rotacja" },
              { range: "52 – 63 m²", count: "×7 lokal", note: "Segment standard" },
              { range: "73 – 88 m²", count: "×2 lokal", note: "Premium — wyższa cena/m²" },
            ].map((a, i) => (
              <div key={i} style={{ background: "#fff", padding: "5mm 6mm" }}>
                <p className="font-jetbrains font-bold" style={{ fontSize: "14px", color: "#1a1a2e" }}>{a.range}</p>
                <p style={{ fontSize: "8px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" }}>{a.count}</p>
                <p style={{ fontSize: "9px", color: "#7a7d94", marginTop: "3px" }}>{a.note}</p>
              </div>
            ))}
          </div>

          {/* MPZP */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#d8d4c8" }}>
            {/* Left — parameters */}
            <div style={{ background: "#f9f7f3", padding: "7mm 8mm" }}>
              <p className="font-jetbrains" style={{ fontSize: "8px", color: "#9a7b3a", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: "4mm" }}>
                Status planistyczny
              </p>
              <p className="font-jetbrains font-bold" style={{ fontSize: "20px", color: "#1B3A6B", marginBottom: "2px" }}>MPZP B50MW</p>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#1a1a2e", marginBottom: "4mm" }}>Zabudowa mieszkaniowa wielorodzinna</p>
              <table style={{ width: "100%", fontSize: "9px", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Maks. kondygnacji nadziemnych", "5"],
                    ["Maks. wysokość zabudowy", "16,0 m"],
                    ["Wskaźnik zabudowy", "0,40"],
                    ["Teren biologicznie czynny", "min. 15%"],
                    ["Garaż podziemny", "dopuszczony"],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid #d8d4c8" }}>
                      <td style={{ padding: "3px 0", color: "#7a7d94" }}>{k}</td>
                      <td className="font-jetbrains" style={{ padding: "3px 0", color: "#1a1a2e", fontWeight: 600, textAlign: "right" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Right — what it means */}
            <div style={{ background: "#1B3A6B", padding: "7mm 8mm" }}>
              <p style={{ fontSize: "8px", color: "#9a7b3a", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: "4mm" }}>
                Co to oznacza dla inwestora
              </p>
              <p className="font-playfair" style={{ fontSize: "16px", color: "#f9f7f3", marginBottom: "4mm", lineHeight: "1.3" }}>
                Zero ryzyka planistycznego.
              </p>
              <p style={{ fontSize: "10px", color: "rgba(249,247,243,0.65)", lineHeight: "1.75", marginBottom: "5mm" }}>
                Parametry zabudowy są zapisane w miejscowym planie i nie zależą od decyzji urzędnika.
                Nie ma ryzyka odmowy, nie ma etapu negocjacji z planistami.
                Projekt rusza od razu — bez 12–18 miesięcy czekania na WZ.
              </p>
              <div style={{ borderTop: "1px solid rgba(154,123,58,0.3)", paddingTop: "4mm" }}>
                <p style={{ fontSize: "8px", color: "#9a7b3a", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>
                  Lokalizacja
                </p>
                <p style={{ fontSize: "10px", color: "rgba(249,247,243,0.7)" }}>Barczewo, ul. Słowackiego 2i (KDZ15)</p>
                <p style={{ fontSize: "8.5px", color: "rgba(249,247,243,0.4)", marginTop: "2px" }}>
                  Sąsiedztwo: istniejące budynki wielorodzinne B1 i B2 — działka wpisuje się w otaczającą zabudowę.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            STRONA 4 — ANALIZA FINANSOWA
        ══════════════════════════════════════════════════ */}
        <div className="teczka-page" style={{ padding: "16mm 20mm", background: "#fff" }}>
          <PageHeader eyebrow="Analiza finansowa" title="Szacunkowy zysk inwestora" />

          <p style={{ fontSize: "10.5px", color: "#7a7d94", lineHeight: "1.65", marginTop: "5mm", marginBottom: "8mm" }}>
            Kalkulacja dla PUM {pln(PUM)} m². Koszty pozostałe (15% bazowych) obejmują: projekt budowlany,
            obsługę prawną, marketing, nadzór. Kalkulacja nie uwzględnia VAT, CIT ani kosztów finansowania
            zewnętrznego. Prowizja PRYZMAT pobierana jest od kupujących mieszkania — inwestor nie ponosi
            kosztów sprzedaży.
          </p>

          {/* Scenarios table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <thead>
              <tr style={{ background: "#1B3A6B" }}>
                <th style={{ padding: "5mm 5mm", textAlign: "left", color: "rgba(249,247,243,0.5)", fontWeight: 600, fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Pozycja
                </th>
                {SCENARIOS.map((s) => (
                  <th key={s.name} style={{ padding: "5mm 5mm", textAlign: "right", color: "#f9f7f3", fontWeight: 700 }}>
                    {s.name}
                    <br />
                    <span style={{ fontSize: "8px", color: "#9a7b3a", fontWeight: 400 }}>{s.note}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Assumptions */}
              <tr style={{ background: "#f2efe8" }}>
                <td colSpan={4} style={{ padding: "3mm 5mm", fontSize: "7.5px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Założenia
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #d8d4c8" }}>
                <td style={{ padding: "3mm 5mm", color: "#7a7d94" }}>Cena sprzedaży (zł/m²)</td>
                {SCENARIOS.map((s) => (
                  <td key={s.name} className="font-jetbrains" style={{ padding: "3mm 5mm", textAlign: "right", color: "#1a1a2e", fontWeight: 600 }}>
                    {pln(s.cena)} zł
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: "1px solid #d8d4c8", background: "#fafaf8" }}>
                <td style={{ padding: "3mm 5mm", color: "#7a7d94" }}>Koszt budowy (zł/m² PUM)</td>
                {SCENARIOS.map((s) => (
                  <td key={s.name} className="font-jetbrains" style={{ padding: "3mm 5mm", textAlign: "right", color: "#1a1a2e", fontWeight: 600 }}>
                    {pln(s.budowa)} zł
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: "1px solid #d8d4c8" }}>
                <td style={{ padding: "3mm 5mm", color: "#7a7d94" }}>Cena działki</td>
                {SCENARIOS.map((s) => (
                  <td key={s.name} className="font-jetbrains" style={{ padding: "3mm 5mm", textAlign: "right", color: "#1a1a2e" }}>
                    {pln(s.dzialka)} zł
                  </td>
                ))}
              </tr>
              {/* Results */}
              <tr style={{ background: "#f2efe8" }}>
                <td colSpan={4} style={{ padding: "3mm 5mm", fontSize: "7.5px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Wyniki
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #d8d4c8" }}>
                <td style={{ padding: "3mm 5mm", color: "#7a7d94" }}>Przychód ze sprzedaży</td>
                {SCENARIOS.map((s) => {
                  const r = calc(s);
                  return (
                    <td key={s.name} className="font-jetbrains" style={{ padding: "3mm 5mm", textAlign: "right", color: "#1B3A6B", fontWeight: 700 }}>
                      {pln(r.przychod)} zł
                    </td>
                  );
                })}
              </tr>
              <tr style={{ borderBottom: "1px solid #d8d4c8", background: "#fafaf8" }}>
                <td style={{ padding: "3mm 5mm", color: "#7a7d94" }}>Koszt budowy</td>
                {SCENARIOS.map((s) => {
                  const r = calc(s);
                  return (
                    <td key={s.name} className="font-jetbrains" style={{ padding: "3mm 5mm", textAlign: "right", color: "#2d3250" }}>
                      {pln(r.kosztBudowy)} zł
                    </td>
                  );
                })}
              </tr>
              <tr style={{ borderBottom: "1px solid #d8d4c8" }}>
                <td style={{ padding: "3mm 5mm", color: "#7a7d94" }}>Koszty pozostałe (15%)</td>
                {SCENARIOS.map((s) => {
                  const r = calc(s);
                  return (
                    <td key={s.name} className="font-jetbrains" style={{ padding: "3mm 5mm", textAlign: "right", color: "#2d3250" }}>
                      {pln(r.inne)} zł
                    </td>
                  );
                })}
              </tr>
              <tr style={{ borderBottom: "1px solid #d8d4c8", background: "#fafaf8" }}>
                <td style={{ padding: "3mm 5mm", color: "#7a7d94" }}>Koszty łącznie</td>
                {SCENARIOS.map((s) => {
                  const r = calc(s);
                  return (
                    <td key={s.name} className="font-jetbrains" style={{ padding: "3mm 5mm", textAlign: "right", color: "#2d3250" }}>
                      {pln(r.koszty)} zł
                    </td>
                  );
                })}
              </tr>
              {/* Zysk — highlighted */}
              <tr style={{ background: "#1B3A6B" }}>
                <td style={{ padding: "4mm 5mm", color: "rgba(249,247,243,0.65)", fontWeight: 600 }}>
                  Szacowany zysk brutto
                </td>
                {SCENARIOS.map((s) => {
                  const r = calc(s);
                  return (
                    <td key={s.name} className="font-jetbrains" style={{ padding: "4mm 5mm", textAlign: "right", color: "#f9f7f3", fontWeight: 700, fontSize: "13px" }}>
                      {pln(r.zysk)} zł
                    </td>
                  );
                })}
              </tr>
              <tr style={{ background: "#1B3A6B", borderTop: "1px solid rgba(154,123,58,0.3)" }}>
                <td style={{ padding: "3mm 5mm", color: "rgba(249,247,243,0.5)", fontSize: "9px" }}>
                  Marża brutto
                </td>
                {SCENARIOS.map((s) => {
                  const r = calc(s);
                  return (
                    <td key={s.name} className="font-jetbrains" style={{ padding: "3mm 5mm", textAlign: "right", color: "#9a7b3a", fontWeight: 700 }}>
                      {pct(r.marza)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>

          {/* PRYZMAT commission note */}
          <div
            style={{
              marginTop: "6mm",
              padding: "4mm 6mm",
              background: "#f2efe8",
              borderLeft: "3px solid #9a7b3a",
              fontSize: "9px",
              color: "#7a7d94",
              lineHeight: "1.6",
            }}
          >
            <span style={{ fontWeight: 700, color: "#1B3A6B" }}>Koszt sprzedaży dla inwestora: 0 zł.</span>{" "}
            PRYZMAT pobiera prowizję 2,5% od kupujących mieszkania. Potencjalny zarobek PRYZMAT
            w scenariuszu realistycznym: {pln(PUM * 9300 * 0.025)} zł — po stronie nabywców, nie inwestora.
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            STRONA 5 — DLACZEGO PRYZMAT
        ══════════════════════════════════════════════════ */}
        <div className="teczka-page" style={{ padding: "16mm 20mm", background: "#f9f7f3" }}>
          <PageHeader eyebrow="Dlaczego PRYZMAT" title="Inwestor skupia się na zysku. Jerzy Sawczuk na wszystkim innym." />

          {/* Jerzy intro */}
          <div style={{ marginTop: "8mm", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10mm", marginBottom: "8mm" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#2d3250", lineHeight: "1.75" }}>
                Za tą ofertą stoi Jerzy Sawczuk — założyciel PRYZMAT, 11 lat wyłącznie na rynku Barczewa
                i Olsztyna. Zna lokalnych wykonawców i dostawców. Wie co budować żeby się sprzedało.
                I sprzeda to osobiście.
              </p>
            </div>
            <blockquote style={{ paddingLeft: "6mm", borderLeft: "3px solid #9a7b3a" }}>
              <p className="font-playfair" style={{ fontSize: "11px", color: "#1B3A6B", fontStyle: "italic", lineHeight: "1.75" }}>
                &ldquo;Nie ukrywam, że głównym moim zadaniem jest pozyskanie inwestora dla tej działki.
                Będzie dla mnie przyjemnością i zaszczytem, jeżeli Państwo powierzycie mi sprzedaż
                wybudowanych mieszkań.&rdquo;
              </p>
              <p style={{ fontSize: "8px", color: "#9a7b3a", marginTop: "4px", fontWeight: 700 }}>
                — Jerzy Sawczuk, fragment oryginalnej oferty
              </p>
            </blockquote>
          </div>

          {/* 3 arguments */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: "#d8d4c8" }}>
            {[
              {
                num: "I",
                stat: "11 lat",
                statLab: "wyłącznie Barczewo i Olsztyn",
                title: "Znamy kupujących zanim ogłosisz budowę.",
                body: "Przez 11 lat obsługiwaliśmy rodziny kupujące mieszkania w Barczewie i Olsztynie. Wiemy kto szuka kawalerki, kto czeka na trzypokojowe, kto ma kredyt gotowy do uruchomienia. Gdy Twój budynek stanie — lista chętnych już czeka.",
              },
              {
                num: "II",
                stat: "0 zł",
                statLab: "koszt sprzedaży dla inwestora",
                title: "Prowizja od kupujących, nie od inwestora.",
                body: "Nasz model wynagrodzenia jest przejrzysty: pobieramy prowizję od nabywców lokali. Inwestor nie ponosi kosztów sprzedaży. Zarabiamy gdy Ty zarabiasz — nasze interesy są zbieżne przez cały projekt.",
              },
              {
                num: "III",
                stat: "80",
                statLab: "mieszkań — jedna odpowiedzialność",
                title: "Jeden człowiek odpowiada za wszystko.",
                body: "Jerzy Sawczuk. Nie dział, nie rotacja, nie call center. Jeden człowiek który zna projekt od pierwszego telefonu do ostatniego aktu notarialnego. Numer bezpośredni: +48 607 677 034.",
              },
            ].map((a) => (
              <div key={a.num} style={{ background: "#f2efe8", padding: "7mm 8mm", display: "flex", flexDirection: "column", gap: "5mm" }}>
                <p className="font-jetbrains" style={{ fontSize: "8px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.12em" }}>
                  {a.num}
                </p>
                <div>
                  <p className="font-jetbrains font-bold" style={{ fontSize: "22px", color: "#1B3A6B", lineHeight: 1 }}>{a.stat}</p>
                  <p style={{ fontSize: "8px", color: "#7a7d94" }}>{a.statLab}</p>
                </div>
                <div style={{ height: "1px", background: "#9a7b3a", width: "24px" }} />
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#1a1a2e", marginBottom: "4px" }}>{a.title}</p>
                  <p style={{ fontSize: "9.5px", color: "#7a7d94", lineHeight: "1.65" }}>{a.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Closing */}
          <div style={{ marginTop: "6mm", background: "#1B3A6B", padding: "6mm 8mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "9px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "4px" }}>
                Kompletny pakiet dla inwestora
              </p>
              <p className="font-playfair" style={{ fontSize: "15px", color: "#f9f7f3" }}>
                Działka + wyłączna sprzedaż 80 mieszkań — w jednym pakiecie.
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "8mm" }}>
              <p className="font-jetbrains font-bold" style={{ fontSize: "26px", color: "#9a7b3a" }}>0 zł</p>
              <p style={{ fontSize: "8px", color: "rgba(249,247,243,0.4)" }}>koszt sprzedaży</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            STRONA 6 — BEZPIECZEŃSTWO / Q&A
        ══════════════════════════════════════════════════ */}
        <div className="teczka-page" style={{ padding: "16mm 20mm", background: "#fff" }}>
          <PageHeader eyebrow="Bezpieczeństwo inwestycji" title="Zanim zapytasz o zysk — zapytaj o ryzyko." />

          <p style={{ fontSize: "11px", color: "#7a7d94", marginTop: "5mm", marginBottom: "8mm", lineHeight: "1.65" }}>
            Każdy inwestor prywatny zadaje te same cztery pytania. Odpowiadamy wprost.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "5mm" }}>
            {[
              {
                q: '„A co jeśli mieszkania się nie sprzedają?"',
                a: "Barczewo ma niedobór mieszkań na rynku pierwotnym przy rosnącym popycie ze strony Olsztyna. PRYZMAT sprzedaje nieruchomości w tym rejonie od 11 lat — znamy każdego potencjalnego kupującego zanim pojawi się pierwsza reklama. Podpisujemy umowę na wyłączność z konkretnymi warunkami i terminami.",
                red: false,
              },
              {
                q: '„A co jeśli koszty budowy wzrosną?"',
                a: "Scenariusz konserwatywny w kalkulacji celowo zawiera wyższe koszty (5 800 zł/m²). Nawet wtedy zysk brutto przekracza 8 mln zł. Margines bezpieczeństwa jest wbudowany w projekt od początku.",
                red: false,
              },
              {
                q: '„A co jeśli nie znam się na budownictwie?"',
                a: "Nie musisz. Jerzy Sawczuk zna lokalnych wykonawców i dostawców — jest na miejscu i pilnuje interesów inwestora przez cały czas budowy. Twoja rola to akceptacja kluczowych etapów i decyzje finansowe. Resztą zajmuje się człowiek który zna ten rynek od 11 lat.",
                red: false,
              },
              {
                q: '„Dlaczego mam zaufać PRYZMAT?"',
                a: "Nie musisz wierzyć na słowo. Zadzwoń do Jerzego Sawczuka i zadaj wszystkie pytania które masz. Pierwsza rozmowa trwa 15 minut i nie zobowiązuje do niczego. Oceń sam po rozmowie. +48 607 677 034",
                red: true,
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  borderLeft: `4px solid ${item.red ? "#C0392B" : "#1B3A6B"}`,
                  paddingLeft: "6mm",
                  paddingTop: "4mm",
                  paddingBottom: "4mm",
                  background: "#f9f7f3",
                  paddingRight: "6mm",
                }}
              >
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#1B3A6B", marginBottom: "4px" }}>{item.q}</p>
                <p style={{ fontSize: "10.5px", color: "#2d3250", lineHeight: "1.65" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            STRONA 7 — DOKUMENTACJA + KONTAKT
        ══════════════════════════════════════════════════ */}
        <div className="teczka-page" style={{ padding: "0", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Left — dokumentacja */}
          <div style={{ padding: "16mm 10mm 16mm 20mm", background: "#f9f7f3" }}>
            <p className="font-jetbrains" style={{ fontSize: "8px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "3mm" }}>
              Dostępna dokumentacja
            </p>
            <h2 className="font-playfair" style={{ fontSize: "22px", color: "#1a1a2e", lineHeight: "1.2", marginBottom: "6mm" }}>
              Pełna dokumentacja<br />techniczna projektu.
            </h2>
            <p style={{ fontSize: "10px", color: "#7a7d94", lineHeight: "1.65", marginBottom: "8mm" }}>
              Po wysłaniu formularza na stronie otrzymasz dostęp do wszystkich poniższych dokumentów.
              Możesz też poprosić Jerzego o przesłanie ich bezpośrednio.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#d8d4c8" }}>
              {DOCS.map((doc, i) => (
                <div
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f9f7f3",
                    padding: "4mm 5mm",
                    display: "flex",
                    alignItems: "center",
                    gap: "3mm",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#9a7b3a",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 600, color: "#1a1a2e" }}>{doc.label}</p>
                    <p style={{ fontSize: "8px", color: "#7a7d94" }}>{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — kontakt */}
          <div style={{ padding: "16mm 20mm 16mm 10mm", background: "#1B3A6B", display: "flex", flexDirection: "column" }}>
            <p className="font-jetbrains" style={{ fontSize: "8px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "3mm" }}>
              Kontakt
            </p>
            <h2 className="font-playfair" style={{ fontSize: "22px", color: "#f9f7f3", lineHeight: "1.2", marginBottom: "6mm" }}>
              Jedna rozmowa.<br />Bez zobowiązań.
            </h2>
            <p style={{ fontSize: "10px", color: "rgba(249,247,243,0.6)", lineHeight: "1.75", marginBottom: "8mm" }}>
              Pierwsza rozmowa trwa 15 minut i odpowie na wszystkie pytania.
              Bez presji — konkretna rozmowa o konkretnych liczbach.
            </p>

            {/* Jerzy card */}
            <div
              style={{
                borderTop: "1px solid rgba(154,123,58,0.35)",
                paddingTop: "7mm",
                marginBottom: "auto",
              }}
            >
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#f9f7f3", marginBottom: "2mm" }}>Jerzy Sawczuk</p>
              <p style={{ fontSize: "9px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6mm" }}>
                Założyciel PRYZMAT · 11 lat w Barczewie i Olsztynie
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "3mm" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
                  <div style={{ width: "2px", height: "14px", background: "#9a7b3a", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "8px", color: "rgba(249,247,243,0.35)", letterSpacing: "0.06em" }}>Telefon bezpośredni</p>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#f9f7f3" }}>+48 607 677 034</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
                  <div style={{ width: "2px", height: "14px", background: "#9a7b3a", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "8px", color: "rgba(249,247,243,0.35)", letterSpacing: "0.06em" }}>E-mail</p>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#f9f7f3" }}>biuro@marzdom.pl</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
                  <div style={{ width: "2px", height: "14px", background: "#9a7b3a", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "8px", color: "rgba(249,247,243,0.35)", letterSpacing: "0.06em" }}>Strona internetowa</p>
                    <p style={{ fontSize: "11px", color: "#f9f7f3" }}>pryzmatnieruchomosci.pl/inwestycja-barczewo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: "1px solid rgba(154,123,58,0.2)", paddingTop: "5mm", marginTop: "8mm" }}>
              <p style={{ fontSize: "9px", fontWeight: 700, color: "rgba(249,247,243,0.4)", marginBottom: "2px" }}>
                PRYZMAT Biuro Nieruchomości
              </p>
              <p style={{ fontSize: "8.5px", color: "rgba(249,247,243,0.3)", lineHeight: "1.5" }}>
                Barczewko 126B, 11-010 Barczewo<br />
                Pon–Pt 9:00–20:00 · Sob 10:00–15:00 · Niedz 9:00–16:00
              </p>
              <p style={{ fontSize: "7.5px", color: "rgba(249,247,243,0.18)", marginTop: "4mm" }}>
                Materiał poufny przygotowany przez PRYZMAT Biuro Nieruchomości.
                Wszelkie dane finansowe mają charakter szacunkowy i nie stanowią oferty w rozumieniu Kodeksu Cywilnego.
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

/* ─── Helper component ─────────────────────────────────── */
function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ borderBottom: "2px solid #d8d4c8", paddingBottom: "5mm" }}>
      <p
        className="font-jetbrains"
        style={{ fontSize: "8px", color: "#9a7b3a", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "3mm" }}
      >
        {eyebrow}
      </p>
      <h2
        className="font-playfair"
        style={{ fontSize: "26px", color: "#1a1a2e", lineHeight: "1.15" }}
      >
        {title}
      </h2>
    </div>
  );
}
