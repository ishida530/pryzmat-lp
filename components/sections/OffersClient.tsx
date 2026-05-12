"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SlidersHorizontal, Search, MapPin, Home, ArrowRight } from "lucide-react";

export interface Offer {
  id: number;
  type: string;
  title: string;
  location: string;
  price: number;
  area: number;
  unit: string;
  purpose: "sprzedaz" | "wynajem";
}

const typeOptions = ["Wszystkie", "Mieszkanie", "Dom", "Działka"];
const purposeOptions = [
  { value: "all", label: "Sprzedaż i wynajem" },
  { value: "sprzedaz", label: "Na sprzedaż" },
  { value: "wynajem", label: "Na wynajem" },
];
const locationOptions = [
  { value: "all", label: "Wszystkie lokalizacje" },
  { value: "Barczewo", label: "Barczewo" },
  { value: "Olsztyn", label: "Olsztyn" },
  { value: "Powiat olsztyński", label: "Powiat olsztyński" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function OffersClient({ offers }: { offers: Offer[] }) {
  const [selectedType, setSelectedType] = useState("Wszystkie");
  const [selectedPurpose, setSelectedPurpose] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      if (selectedType !== "Wszystkie" && o.type !== selectedType) return false;
      if (selectedPurpose !== "all" && o.purpose !== selectedPurpose) return false;
      if (selectedLocation !== "all" && o.location !== selectedLocation) return false;
      return true;
    });
  }, [offers, selectedType, selectedPurpose, selectedLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-gray-500 shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filtruj:</span>
          </div>
          <div className="flex flex-wrap gap-3 flex-1">
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-700"
              aria-label="Typ nieruchomości"
            >
              {typeOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-700"
              aria-label="Lokalizacja"
            >
              {locationOptions.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setSelectedType("Wszystkie");
              setSelectedPurpose("all");
              setSelectedLocation("all");
            }}
            className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
            Resetuj filtry
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          Znaleziono{" "}
          <strong className="text-brand-navy">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "ofertę" : filtered.length < 5 ? "oferty" : "ofert"}
        </p>
      </div>

      {/* Offer cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            Brak ofert spełniających kryteria
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Zmień filtry lub{" "}
            <Link href="/kontakt" className="text-brand-blue hover:underline">
              napisz do nas
            </Link>{" "}
            — znajdziemy coś dla Ciebie.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((offer) => (
            <Link
              key={offer.id}
              href={`/kontakt?cel=kupno&oferta=${encodeURIComponent(offer.title)}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
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
                    Zapytaj <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CTA footer */}
      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm bg-white border border-gray-100 rounded-xl py-4 px-6">
          Nie widzisz oferty, której szukasz?{" "}
          <Link href="/kontakt" className="text-brand-blue font-semibold hover:underline">
            Skontaktuj się z nami
          </Link>{" "}
          — pomożemy znaleźć dokładnie to, czego potrzebujesz.
        </p>
      </div>
    </div>
  );
}
