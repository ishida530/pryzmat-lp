import type { Metadata } from "next";
import { HeroSection } from "@/components/barczewo/HeroSection";
import { OfertaSection } from "@/components/barczewo/OfertaSection";
import { ParametrySection } from "@/components/barczewo/ParametrySection";
import { GaleriaSection } from "@/components/barczewo/GaleriaSection";
import { KalkulatorSection } from "@/components/barczewo/KalkulatorSection";
import { PryzmatSection } from "@/components/barczewo/PryzmatSection";
import { KontaktSection } from "@/components/barczewo/KontaktSection";

export const metadata: Metadata = {
  title: { absolute: "Inwestycja Barczewo — Grunt pod 80 mieszkań | PRYZMAT Jerzy Sawczuk" },
  description:
    "Działka 4 438 m² z MPZP pod zabudowę wielorodzinną w Barczewie. Gotowa koncepcja na 80 mieszkań, 4 290 m² PUM. Biuro PRYZMAT przejmuje wyłączną sprzedaż. Kontakt: Jerzy Sawczuk +48 607 677 034",
  keywords: [
    "inwestycja Barczewo",
    "grunt pod blok Olsztyn",
    "działka wielorodzinna warmia",
    "deweloper Barczewo",
    "Jerzy Sawczuk PRYZMAT",
    "MPZP Barczewo zabudowa wielorodzinna",
    "partnerstwo inwestycyjne nieruchomości",
  ],
  openGraph: {
    title: "Inwestycja Barczewo — 80 mieszkań, MPZP, gotowa koncepcja",
    description:
      "Partnerstwo inwestycyjne. Biuro PRYZMAT sprzedaje wszystkie mieszkania. Jerzy Sawczuk +48 607 677 034",
    images: [
      {
        url: "/images/barczewo-wizka-2.jpg",
        width: 1200,
        height: 800,
        alt: "Wizualizacja inwestycji Barczewo — budynek wielorodzinny",
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
      <GaleriaSection />
      <KalkulatorSection />
      <PryzmatSection />
      <KontaktSection />
    </>
  );
}
