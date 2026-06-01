"use client";

import { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Search, MapPin, Home, ArrowRight, X, Loader2 } from "lucide-react";

export interface Offer {
  id: number;
  slug: string;
  status: string;
  listingId?: string;
  type: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  price: number;
  priceM2?: number;
  area: number;
  unit: string;
  purpose: "sprzedaz" | "wynajem";
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  features?: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  allPhotoIds: number[];
  geoLat?: number;
  geoLng?: number;
  agent?: {
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    imageId?: number | null;
  };
  nestedListings?: Array<{ id: number; listingId: string }>;
}

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

export function OffersClient({ offers }: { offers: Offer[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState("Wszystkie");
  const [selectedPurpose, setSelectedPurpose] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  function navigateTo(slug: string) {
    setPendingSlug(slug);
    startTransition(() => {
      router.push(`/oferty/${slug}`);
    });
  }

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(offers.map((o) => o.type))).sort();
    return ["Wszystkie", ...types];
  }, [offers]);

  const locationOptions = useMemo(() => {
    const cities = Array.from(
      new Set(offers.map((o) => o.location).filter((l) => l !== "—"))
    ).sort();
    return [
      { value: "all", label: "Wszystkie lokalizacje" },
      ...cities.map((c) => ({ value: c, label: c })),
    ];
  }, [offers]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return offers.filter((o) => {
      if (selectedType !== "Wszystkie" && o.type !== selectedType) return false;
      if (selectedPurpose !== "all" && o.purpose !== selectedPurpose) return false;
      if (selectedLocation !== "all" && o.location !== selectedLocation) return false;
      if (q && !o.title.toLowerCase().includes(q) && !o.location.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [offers, selectedType, selectedPurpose, selectedLocation, searchQuery]);

  const hasActiveFilters =
    selectedType !== "Wszystkie" ||
    selectedPurpose !== "all" ||
    selectedLocation !== "all" ||
    searchQuery !== "";

  function resetFilters() {
    setSelectedType("Wszystkie");
    setSelectedPurpose("all");
    setSelectedLocation("all");
    setSearchQuery("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        {/* Search row */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po nazwie lub lokalizacji…"
            className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-700 placeholder:text-gray-400"
            aria-label="Szukaj oferty"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Wyczyść wyszukiwanie"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
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
                <option key={o.value} value={o.value}>{o.label}</option>
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
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-gray-500 hover:text-brand-navy text-sm font-medium shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Resetuj
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          {offers.length === 0 ? (
            "Brak ofert w bazie danych"
          ) : (
            <>
              Znaleziono{" "}
              <strong className="text-brand-navy">{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "ofertę" : filtered.length < 5 ? "oferty" : "ofert"}
              {hasActiveFilters && (
                <span className="text-gray-400"> (z {offers.length} wszystkich)</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Offer cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          {offers.length === 0 ? (
            <>
              <p className="text-gray-500 font-medium">Brak aktywnych ofert</p>
              <p className="text-gray-400 text-sm mt-1">
                Skontaktuj się z nami —{" "}
                <Link href="/kontakt" className="text-brand-blue hover:underline">
                  pomożemy znaleźć nieruchomość
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-500 font-medium">
                Brak ofert spełniających kryteria
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Zmień filtry lub{" "}
                <button onClick={resetFilters} className="text-brand-blue hover:underline">
                  pokaż wszystkie
                </button>
                .
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((offer) => {
            const isThisPending = isPending && pendingSlug === offer.slug;
            return (
            <Link
              key={offer.id}
              href={`/oferty/${offer.slug}`}
              onClick={(e) => {
                // Let browser handle Ctrl/Cmd/Shift+click and middle-click natively
                if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
                e.preventDefault();
                navigateTo(offer.slug);
              }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
            >
              {/* Image */}
              <div className="h-44 bg-gradient-to-br from-brand-navy/10 to-brand-blue/10 flex items-center justify-center relative overflow-hidden">
                {offer.thumbnailUrl ? (
                  <>
                    <Image
                      src={offer.thumbnailUrl}
                      alt={offer.title}
                      fill
                      className={`object-cover transition-transform duration-300 ${offer.status === "Active" ? "group-hover:scale-110" : ""} ${isThisPending ? "scale-110 brightness-75" : ""}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/15 via-transparent to-brand-navy/10 pointer-events-none" />
                  </>
                ) : (
                  <Home className="w-10 h-10 text-brand-navy/30" />
                )}

                {/* Loading overlay — visible only on the clicked card, auto-clears when transition ends */}
                {isThisPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/40 backdrop-blur-[1px]">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                {/* Sold / Reserved overlay */}
                {offer.status === "Closed" && (
                  <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                    <span className="bg-gray-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-full tracking-widest uppercase">
                      Sprzedane
                    </span>
                  </div>
                )}
                {offer.status === "Pending" && (
                  <div className="absolute inset-0 bg-amber-900/40 flex items-center justify-center">
                    <span className="bg-amber-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full tracking-widest uppercase">
                      Zarezerwowane
                    </span>
                  </div>
                )}

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
            );
          })}
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
