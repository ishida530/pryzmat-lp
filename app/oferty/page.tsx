// FAZA 2: Connect to ASARI API for live offer data

import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { SlidersHorizontal, Search, MapPin, Home, ArrowRight } from "lucide-react";

export const metadata: Metadata = createMetadata(
  "Oferty nieruchomości Barczewo i Olsztyn",
  "Aktualne oferty sprzedaży i wynajmu nieruchomości w Barczewie, Olsztynie i powiecie olsztyńskim. Mieszkania, domy, działki.",
  "/oferty"
);

// FAZA 2: Replace with real offers from ASARI API
const PLACEHOLDER_OFFERS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  type: i % 3 === 0 ? "Dom" : i % 3 === 1 ? "Mieszkanie" : "Działka",
  title: [
    "Dom 5-pokojowy w spokojnej okolicy",
    "Przestronne mieszkanie 3-pokojowe",
    "Działka budowlana z widokiem",
    "Dom z ogrodem i garażem",
    "Mieszkanie blisko centrum",
    "Atrakcyjna działka pod zabudowę",
  ][i],
  location: i % 2 === 0 ? "Barczewo" : "Olsztyn",
  price: [450000, 320000, 180000, 580000, 280000, 95000][i],
  area: [120, 65, 800, 150, 58, 1200][i],
  unit: i === 2 || i === 5 ? "m²" : "m²",
  purpose: i < 4 ? "sprzedaz" : "wynajem",
}));

const typeOptions = ["Wszystkie", "Mieszkanie", "Dom", "Działka"];
const purposeOptions = [
  { value: "all", label: "Sprzedaż i wynajem" },
  { value: "sprzedaz", label: "Na sprzedaż" },
  { value: "wynajem", label: "Na wynajem" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function OfertyPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page header */}
      <div className="bg-brand-navy py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3">
            OFERTY
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white">
            Aktualne oferty nieruchomości
          </h1>
          <p className="text-gray-300 mt-3 text-base">
            Barczewo · Olsztyn · powiat olsztyński
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Filters — FAZA 2: Wire to API query params */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-gray-500 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filtruj:</span>
            </div>
            <div className="flex flex-wrap gap-3 flex-1">
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-700"
                aria-label="Rodzaj transakcji"
              >
                {purposeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-700"
                aria-label="Typ nieruchomości"
              >
                {typeOptions.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-700"
                aria-label="Lokalizacja"
              >
                <option>Wszystkie lokalizacje</option>
                <option>Barczewo</option>
                <option>Olsztyn</option>
                <option>Powiat olsztyński</option>
              </select>
            </div>
            <button className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors shrink-0">
              <Search className="w-4 h-4" />
              Szukaj
            </button>
          </div>
        </div>

        {/* FAZA 2: Replace with dynamic offers from ASARI API */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            Znaleziono{" "}
            <strong className="text-brand-navy">{PLACEHOLDER_OFFERS.length}</strong>{" "}
            ofert
          </p>
        </div>

        {/* Offer cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLACEHOLDER_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
            >
              {/* Image placeholder */}
              <div className="h-44 bg-gradient-to-br from-brand-navy/10 to-brand-blue/10 flex items-center justify-center relative">
                <Home className="w-10 h-10 text-brand-navy/30" />
                <span className="absolute top-3 left-3 bg-brand-navy text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {offer.type}
                </span>
                <span
                  className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    offer.purpose === "sprzedaz"
                      ? "bg-brand-red text-white"
                      : "bg-brand-blue text-white"
                  }`}
                >
                  {offer.purpose === "sprzedaz" ? "Sprzedaż" : "Wynajem"}
                </span>
              </div>

              <div className="p-5">
                <h2 className="font-bold text-brand-navy text-sm leading-snug mb-2 group-hover:text-brand-blue transition-colors">
                  {offer.title}
                </h2>
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                  <MapPin className="w-3 h-3" />
                  {offer.location}
                  <span className="mx-1">·</span>
                  {offer.area} {offer.unit}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-extrabold text-brand-navy">
                    {formatPrice(offer.price)}
                    {offer.purpose === "wynajem" && (
                      <span className="text-sm font-medium text-gray-400">
                        /mies.
                      </span>
                    )}
                  </p>
                  <span className="flex items-center gap-1 text-brand-blue text-xs font-semibold">
                    Szczegóły <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAZA 2: Add pagination here */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm bg-white border border-gray-100 rounded-xl py-4 px-6">
            Nie widzisz oferty, której szukasz?{" "}
            <a href="/kontakt" className="text-brand-blue font-semibold hover:underline">
              Skontaktuj się z nami
            </a>{" "}
            — pomożemy znaleźć dokładnie to, czego potrzebujesz.
          </p>
        </div>

      </div>
    </div>
  );
}
