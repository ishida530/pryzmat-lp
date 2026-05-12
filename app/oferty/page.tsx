// FAZA 2: Connect to ASARI API for live offer data — see FAZA2_ASARI.md

import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import Image from "next/image";
import { OffersClient, type Offer } from "@/components/sections/OffersClient";

export const metadata: Metadata = createMetadata(
  "Oferty nieruchomości Barczewo i Olsztyn",
  "Aktualne oferty sprzedaży i wynajmu nieruchomości w Barczewie, Olsztynie i powiecie olsztyńskim. Mieszkania, domy, działki.",
  "/oferty"
);

// FAZA 2: Replace with real offers fetched from ASARI API
const PLACEHOLDER_OFFERS: Offer[] = [
  {
    id: 1,
    type: "Dom",
    title: "Dom 5-pokojowy w spokojnej okolicy",
    location: "Barczewo",
    price: 450000,
    area: 120,
    unit: "m²",
    purpose: "sprzedaz",
  },
  {
    id: 2,
    type: "Mieszkanie",
    title: "Przestronne mieszkanie 3-pokojowe",
    location: "Olsztyn",
    price: 320000,
    area: 65,
    unit: "m²",
    purpose: "sprzedaz",
  },
  {
    id: 3,
    type: "Działka",
    title: "Działka budowlana z widokiem",
    location: "Barczewo",
    price: 180000,
    area: 800,
    unit: "m²",
    purpose: "sprzedaz",
  },
  {
    id: 4,
    type: "Dom",
    title: "Dom z ogrodem i garażem",
    location: "Olsztyn",
    price: 580000,
    area: 150,
    unit: "m²",
    purpose: "sprzedaz",
  },
  {
    id: 5,
    type: "Mieszkanie",
    title: "Mieszkanie blisko centrum",
    location: "Olsztyn",
    price: 2800,
    area: 58,
    unit: "m²",
    purpose: "wynajem",
  },
  {
    id: 6,
    type: "Działka",
    title: "Atrakcyjna działka pod zabudowę",
    location: "Barczewo",
    price: 95000,
    area: 1200,
    unit: "m²",
    purpose: "sprzedaz",
  },
];

export default function OfertyPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page header */}
      {/* REPLACE src with actual property/neighborhood photo */}
      <div className="relative overflow-hidden py-14 lg:py-20">
        <Image
          src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1920&q=80"
          alt="Oferty nieruchomości Barczewo i Olsztyn"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-dark-navy/88" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3">
            OFERTY
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white">
            Aktualne oferty nieruchomości{" "}
            <span className="text-blue-300">Barczewo i Olsztyn</span>
          </h1>
          <p className="text-gray-300 mt-3 text-base">
            Barczewo · Olsztyn · powiat olsztyński
          </p>
        </div>
      </div>

      {/* FAZA 2: Replace OffersClient with server-side filtered data from ASARI API */}
      <OffersClient offers={PLACEHOLDER_OFFERS} />

    </div>
  );
}
