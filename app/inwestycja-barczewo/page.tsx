import type { Metadata } from "next";
import { HeroSection } from "@/components/barczewo/HeroSection";
import { OfertaSection } from "@/components/barczewo/OfertaSection";
import { ParametrySection } from "@/components/barczewo/ParametrySection";
import { BezpieczenstwoSection } from "@/components/barczewo/BezpieczenstwoSection";
import { GaleriaSection } from "@/components/barczewo/GaleriaSection";
import { KalkulatorSection } from "@/components/barczewo/KalkulatorSection";
import { PryzmatSection } from "@/components/barczewo/PryzmatSection";
import { KontaktSection } from "@/components/barczewo/KontaktSection";

export const metadata: Metadata = {
  title: {
    absolute:
      "Inwestycja Barczewo — Kup działkę, postaw blok, PRYZMAT sprzeda mieszkania | Jerzy Sawczuk",
  },
  description:
    "Działka 4438 m² z MPZP w Barczewie, 15 min od Olsztyna. Gotowa koncepcja na 80 mieszkań. " +
    "Jerzy Sawczuk koordynuje budowę i sprzedaje wszystkie lokale. " +
    "Zero kosztów sprzedaży dla inwestora. Tel: +48 607 677 034",
  keywords: [
    "inwestycja nieruchomości Barczewo",
    "grunt pod blok Olsztyn",
    "działka wielorodzinna warmia",
    "inwestor prywatny nieruchomości",
    "projekt deweloperski Barczewo",
    "Jerzy Sawczuk PRYZMAT",
    "zakup działki blok mieszkalny",
    "lokata kapitału nieruchomości Olsztyn",
  ],
  openGraph: {
    title: "Inwestycja Barczewo — 80 mieszkań, PRYZMAT sprzedaje wszystko",
    description:
      "Wyłóż kapitał. Jerzy Sawczuk koordynuje budowę i sprzedaje 80 mieszkań. " +
      "Zero kosztów sprzedaży. Zadzwoń: +48 607 677 034",
    images: [
      {
        url: "/images/barczewo-wizka-2.jpg",
        width: 1200,
        height: 800,
        alt: "Wizualizacja inwestycji Barczewo — budynek 80 mieszkań",
      },
    ],
    type: "website",
    locale: "pl_PL",
  },
  robots: { index: true, follow: true },
};

export default function InwestycjaBarczewoPage() {
  return (
    <>
      <HeroSection />
      <OfertaSection />
      <ParametrySection />
      <BezpieczenstwoSection />
      <GaleriaSection />
      <KalkulatorSection />
      <PryzmatSection />
      <KontaktSection />

      {/* Floating CTA — mobile only */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-3 flex gap-3 md:hidden shadow-lg"
        style={{ background: "#fff", borderTop: "1px solid #d8d4c8" }}
      >
        <a
          href="tel:+48607677034"
          className="flex-1 text-center font-bold py-3 rounded-lg text-sm"
          style={{ background: "#1B3A6B", color: "#fff" }}
        >
          Zadzwoń do Jerzego
        </a>
        <a
          href="#kontakt"
          className="flex-1 text-center font-bold py-3 rounded-lg text-sm"
          style={{ border: "2px solid #1B3A6B", color: "#1B3A6B" }}
        >
          Formularz
        </a>
      </div>
      <div className="h-20 md:hidden" />
    </>
  );
}
