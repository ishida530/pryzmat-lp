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
    slug: "dom-5-pokojowy-barczewo",
    type: "Dom",
    title: "Dom 5-pokojowy w spokojnej okolicy",
    description: "Piękny dom w tradycyjnym stylu, idealny dla rodziny. Nieruchomość znajduje się w cichej okolicy z dostępem do szkół i sklepów.",
    location: "Barczewo",
    address: "Ul. Lesna 45, 11-010 Barczewo",
    price: 450000,
    area: 120,
    unit: "m²",
    rooms: 5,
    bathrooms: 2,
    purpose: "sprzedaz",
    features: ["Ogród", "Garaż", "Piwnica", "Taras", "Kocioł gazowy"],
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 2,
    slug: "mieszkanie-3-pokojowe-olsztyn",
    type: "Mieszkanie",
    title: "Przestronne mieszkanie 3-pokojowe",
    description: "Nowoczesne mieszkanie na trzecim piętrze z widokiem na miasto. Pełna aranżacja, gotowe do zamieszkania.",
    location: "Olsztyn",
    address: "Ul. Mickiewicza 12/34, 10-001 Olsztyn",
    price: 320000,
    area: 65,
    unit: "m²",
    rooms: 3,
    bathrooms: 1,
    purpose: "sprzedaz",
    features: ["Balkon", "Miejsce postojowe", "Interkom", "Nowe okna"],
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 3,
    slug: "dzialka-budowlana-barczewo",
    type: "Działka",
    title: "Działka budowlana z widokiem",
    description: "Uzbrojona działka w doskonałej lokalizacji. Dostęp do mediów, idealna do budowy domu jednorodzinnego.",
    location: "Barczewo",
    address: "Ul. Polna, 11-010 Barczewo",
    price: 180000,
    area: 800,
    unit: "m²",
    purpose: "sprzedaz",
    features: ["Dostęp do drogi", "Media na terenie", "Prąd", "Woda", "Kanalizacja"],
    imageUrl: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 4,
    slug: "dom-z-ogrodem-olsztyn",
    type: "Dom",
    title: "Dom z ogrodem i garażem",
    description: "Komfortowy dom w zielonej części miasta. Doskonała inwestycja dla rodziny poszukującej spokoju.",
    location: "Olsztyn",
    address: "Ul. Sosnowa 78, 10-250 Olsztyn",
    price: 580000,
    area: 150,
    unit: "m²",
    rooms: 6,
    bathrooms: 2,
    purpose: "sprzedaz",
    features: ["Ogród 500m²", "Garaż 2-stanowiskowy", "Gaz", "Kocioł kondensacyjny"],
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 5,
    slug: "mieszkanie-wynajem-olsztyn",
    type: "Mieszkanie",
    title: "Mieszkanie blisko centrum",
    description: "Komfortowe mieszkanie do wynajęcia w centrum Olsztyna. Nowe, umeblowane, ze wszystkimi sprzętami.",
    location: "Olsztyn",
    address: "Ul. Wiejska 23/5, 10-001 Olsztyn",
    price: 2800,
    area: 58,
    unit: "m²",
    rooms: 2,
    bathrooms: 1,
    purpose: "wynajem",
    features: ["Umeblowane", "Kuchnia", "WiFi", "Pralka", "Klimatyzacja"],
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 6,
    slug: "dzialka-zabudowe-barczewo",
    type: "Działka",
    title: "Atrakcyjna działka pod zabudowę",
    description: "Rozległa działka w pięknej okolicy. Bliski kontakt z naturą, brak sąsiedztwa, wygodny dojazd do miasta.",
    location: "Barczewo",
    address: "Powiat olsztyński - gmina Barczewo",
    price: 95000,
    area: 1200,
    unit: "m²",
    purpose: "sprzedaz",
    features: ["Las w pobliżu", "Cisza i spokój", "Droga dojazdowa", "Doskonała lokalizacja"],
    imageUrl: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1920&q=80",
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
        <div className="absolute inset-0 bg-brand-dark-navy/90" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(46,110,197,0.18) 0%, transparent 70%)",
          }}
        />
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
