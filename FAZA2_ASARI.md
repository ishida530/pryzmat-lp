# FAZA 2 — Integracja ASARI API (żywe oferty)

Celem tej fazy jest zastąpienie placeholderowych ofert na stronie `/oferty` danymi z systemu CRM ASARI. Po wdrożeniu każda karta oferty będzie prowadziła do dedykowanej podstrony `/oferty/[slug]` z pełnym opisem, zdjęciami i formularzem zapytania.

---

## 1. Wymagania wstępne

### Dane dostępowe ASARI
Skontaktuj się z ASARI (https://asari.pl) w celu uzyskania:
- **klucza API** (`ASARI_API_KEY`)
- **ID biura / konta** (`ASARI_OFFICE_ID`)
- Potwierdzenia endpointów REST (mogą się różnić w zależności od wersji systemu)

Ustaw zmienne środowiskowe w `.env.local`:

```
ASARI_API_KEY=twoj_klucz_api
ASARI_OFFICE_ID=id_biura
ASARI_API_URL=https://api.asari.pl/v2   # sprawdź aktualny base URL u dostawcy
```

---

## 2. Klient API — `lib/asari.ts`

Utwórz plik `lib/asari.ts` z typami i funkcjami fetch:

```typescript
// lib/asari.ts

const BASE_URL = process.env.ASARI_API_URL ?? "https://api.asari.pl/v2";
const API_KEY  = process.env.ASARI_API_KEY  ?? "";

export type PropertyType = "mieszkanie" | "dom" | "dzialka" | "lokal" | "inne";
export type TransactionType = "sprzedaz" | "wynajem";

export interface AsariOffer {
  id: string;
  slug: string;               // np. "mieszkanie-3-pokojowe-olsztyn-123"
  type: PropertyType;
  transactionType: TransactionType;
  title: string;
  description: string;
  price: number;
  area: number;               // m²
  rooms?: number;
  floor?: number;
  totalFloors?: number;
  location: {
    city: string;
    district?: string;
    street?: string;
    lat?: number;
    lng?: number;
  };
  photos: string[];           // URL-e zdjęć
  isNew?: boolean;
  isPromoted?: boolean;
  createdAt: string;          // ISO 8601
  updatedAt: string;
}

export interface AsariListResponse {
  offers: AsariOffer[];
  total: number;
  page: number;
  perPage: number;
}

export interface OffersFilter {
  type?: PropertyType;
  transactionType?: TransactionType;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  page?: number;
  perPage?: number;
}

async function asariFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    // ISR: odśwież co 10 minut (możesz ustawić dłużej dla stron archiwum)
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`ASARI API error: ${res.status} ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function getOffers(filter: OffersFilter = {}): Promise<AsariListResponse> {
  const params: Record<string, string> = {
    ...(filter.type            && { type: filter.type }),
    ...(filter.transactionType && { transaction: filter.transactionType }),
    ...(filter.city            && { city: filter.city }),
    ...(filter.priceMin        && { price_min: String(filter.priceMin) }),
    ...(filter.priceMax        && { price_max: String(filter.priceMax) }),
    ...(filter.areaMin         && { area_min: String(filter.areaMin) }),
    ...(filter.areaMax         && { area_max: String(filter.areaMax) }),
    page:     String(filter.page    ?? 1),
    per_page: String(filter.perPage ?? 12),
  };
  return asariFetch<AsariListResponse>("/offers", params);
}

export async function getOffer(slug: string): Promise<AsariOffer> {
  return asariFetch<AsariOffer>(`/offers/${slug}`);
}

export async function getAllOfferSlugs(): Promise<string[]> {
  // Używane przez generateStaticParams — pobiera wszystkie slugi do SSG
  const data = await asariFetch<AsariListResponse>("/offers", { per_page: "500" });
  return data.offers.map((o) => o.slug);
}
```

> **Uwaga:** Nazwy pól i endpointów (`/offers`, `/offers/:slug`) mogą się różnić. Sprawdź aktualną dokumentację API ASARI lub skontaktuj się z pomocą techniczną.

---

## 3. Aktualizacja strony `/oferty`

### 3a. Zmień `/oferty` na server-side z filtrami URL

Usuń `OffersClient` (client-side filtering) — zastąp Server Component z filtrami opartymi na URL search params (lepszy SEO, głęboki linking).

```tsx
// app/oferty/page.tsx
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { getOffers, type OffersFilter } from "@/lib/asari";
import { OffersGrid } from "@/components/sections/OffersGrid";
import { OffersFilters } from "@/components/sections/OffersFilters";
import { OffersPagination } from "@/components/sections/OffersPagination";

// Regeneruj stronę co 10 minut (ISR)
export const revalidate = 600;

export const metadata: Metadata = createMetadata(
  "Oferty nieruchomości Barczewo i Olsztyn",
  "Aktualne oferty sprzedaży i wynajmu nieruchomości w Barczewie, Olsztynie i powiecie olsztyńskim. Mieszkania, domy, działki.",
  "/oferty"
);

interface PageProps {
  searchParams: {
    typ?: string;
    transakcja?: string;
    miasto?: string;
    strona?: string;
  };
}

export default async function OfertyPage({ searchParams }: PageProps) {
  const filter: OffersFilter = {
    type:            searchParams.typ       as OffersFilter["type"]            ?? undefined,
    transactionType: searchParams.transakcja as OffersFilter["transactionType"] ?? undefined,
    city:            searchParams.miasto,
    page:            Number(searchParams.strona ?? 1),
    perPage:         12,
  };

  const data = await getOffers(filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3">OFERTY</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white">
            Aktualne oferty nieruchomości{" "}
            <span className="text-blue-300">Barczewo i Olsztyn</span>
          </h1>
          <p className="text-gray-300 mt-3">Barczewo · Olsztyn · powiat olsztyński</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <OffersFilters currentFilter={filter} />
        <p className="text-gray-500 text-sm mb-4">
          Znaleziono <strong className="text-brand-navy">{data.total}</strong> ofert
        </p>
        <OffersGrid offers={data.offers} />
        <OffersPagination
          currentPage={data.page}
          totalPages={Math.ceil(data.total / data.perPage)}
        />
      </div>
    </div>
  );
}
```

### 3b. Nowy komponent `OffersGrid`

```tsx
// components/sections/OffersGrid.tsx
import Link from "next/link";
import Image from "next/image";
import { MapPin, Home, ArrowRight } from "lucide-react";
import type { AsariOffer } from "@/lib/asari";

function formatPrice(price: number, type: "sprzedaz" | "wynajem") {
  const formatted = new Intl.NumberFormat("pl-PL", {
    style: "currency", currency: "PLN", maximumFractionDigits: 0,
  }).format(price);
  return type === "wynajem" ? `${formatted}/mies.` : formatted;
}

export function OffersGrid({ offers }: { offers: AsariOffer[] }) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Brak ofert spełniających kryteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <Link
          key={offer.id}
          href={`/oferty/${offer.slug}`}
          className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
        >
          <div className="relative h-44">
            {offer.photos[0] ? (
              <Image
                src={offer.photos[0]}
                alt={offer.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-brand-navy/10 to-brand-blue/10 flex items-center justify-center">
                <Home className="w-10 h-10 text-brand-navy/30" />
              </div>
            )}
            <span className="absolute top-3 left-3 bg-brand-navy text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              {offer.type}
            </span>
            <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${
              offer.transactionType === "sprzedaz"
                ? "bg-brand-red text-white"
                : "bg-brand-blue text-white"
            }`}>
              {offer.transactionType === "sprzedaz" ? "Sprzedaż" : "Wynajem"}
            </span>
          </div>
          <div className="p-5">
            <h2 className="font-bold text-brand-navy text-sm leading-snug mb-2 group-hover:text-brand-blue transition-colors">
              {offer.title}
            </h2>
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
              <MapPin className="w-3 h-3" />
              {offer.location.city}
              {offer.location.district && ` · ${offer.location.district}`}
              <span className="mx-1">·</span>
              {offer.area} m²
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-extrabold text-brand-navy">
                {formatPrice(offer.price, offer.transactionType)}
              </p>
              <span className="flex items-center gap-1 text-brand-blue text-xs font-semibold">
                Szczegóły <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

### 3c. Filtry URL-based

```tsx
// components/sections/OffersFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { OffersFilter } from "@/lib/asari";

export function OffersFilters({ currentFilter }: { currentFilter: OffersFilter }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("strona"); // reset pagination on filter change
    router.push(`/oferty?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2 text-gray-500 shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filtruj:</span>
        </div>
        <div className="flex flex-wrap gap-3 flex-1">
          <select
            defaultValue={currentFilter.transactionType ?? ""}
            onChange={(e) => update("transakcja", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-700"
            aria-label="Rodzaj transakcji"
          >
            <option value="">Sprzedaż i wynajem</option>
            <option value="sprzedaz">Na sprzedaż</option>
            <option value="wynajem">Na wynajem</option>
          </select>
          <select
            defaultValue={currentFilter.type ?? ""}
            onChange={(e) => update("typ", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-700"
            aria-label="Typ nieruchomości"
          >
            <option value="">Wszystkie typy</option>
            <option value="mieszkanie">Mieszkanie</option>
            <option value="dom">Dom</option>
            <option value="dzialka">Działka</option>
            <option value="lokal">Lokal użytkowy</option>
          </select>
          <select
            defaultValue={currentFilter.city ?? ""}
            onChange={(e) => update("miasto", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-700"
            aria-label="Lokalizacja"
          >
            <option value="">Wszystkie lokalizacje</option>
            <option value="Barczewo">Barczewo</option>
            <option value="Olsztyn">Olsztyn</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

### 3d. Paginacja

```tsx
// components/sections/OffersPagination.tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function OffersPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-10">
      {currentPage > 1 && (
        <Link
          href={`/oferty?strona=${currentPage - 1}`}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" /> Poprzednia
        </Link>
      )}
      <span className="px-4 py-2 text-sm text-gray-500">
        Strona {currentPage} z {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={`/oferty?strona=${currentPage + 1}`}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Następna <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
```

---

## 4. Strona szczegółów oferty `/oferty/[slug]`

```tsx
// app/oferty/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, ArrowLeft } from "lucide-react";
import { getOffer, getAllOfferSlugs } from "@/lib/asari";
import { COMPANY } from "@/lib/constants";

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllOfferSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const offer = await getOffer(params.slug);
    return {
      title: `${offer.title} | PRYZMAT`,
      description: `${offer.title} — ${offer.area} m², ${offer.location.city}. Cena: ${offer.price.toLocaleString("pl-PL")} PLN. Biuro Nieruchomości PRYZMAT Barczewo.`,
      alternates: { canonical: `${COMPANY.website}/oferty/${params.slug}` },
    };
  } catch {
    return { title: "Oferta | PRYZMAT" };
  }
}

export default async function OfertaPage({ params }: { params: { slug: string } }) {
  let offer;
  try {
    offer = await getOffer(params.slug);
  } catch {
    notFound();
  }

  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: offer.title,
    description: offer.description,
    url: `${COMPANY.website}/oferty/${offer.slug}`,
    price: offer.price,
    priceCurrency: "PLN",
    image: offer.photos,
    address: {
      "@type": "PostalAddress",
      addressLocality: offer.location.city,
      addressCountry: "PL",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: offer.area,
      unitCode: "MTK",
    },
    offeredBy: {
      "@type": "LocalBusiness",
      name: COMPANY.name,
      telephone: COMPANY.phone,
      url: COMPANY.website,
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-brand-navy py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/oferty"
            className="flex items-center gap-2 text-gray-300 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Wróć do ofert
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Photos + description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo gallery */}
            {offer.photos.length > 0 && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                <Image
                  src={offer.photos[0]}
                  alt={offer.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <h1 className="text-2xl lg:text-3xl font-extrabold text-brand-navy">
              {offer.title}
            </h1>

            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 text-brand-blue" />
                {offer.location.city}
                {offer.location.district && ` — ${offer.location.district}`}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500 text-sm">{offer.area} m²</span>
              {offer.rooms && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500 text-sm">{offer.rooms} pokoje</span>
                </>
              )}
            </div>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">{offer.description}</p>
            </div>
          </div>

          {/* Sidebar — price + contact */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-3xl font-extrabold text-brand-navy mb-1">
                {offer.price.toLocaleString("pl-PL")} PLN
                {offer.transactionType === "wynajem" && (
                  <span className="text-base font-medium text-gray-400">/mies.</span>
                )}
              </p>
              <p className="text-gray-400 text-sm mb-6">
                {offer.transactionType === "sprzedaz" ? "Cena ofertowa" : "Czynsz miesięczny"}
              </p>

              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center justify-center gap-2 w-full bg-brand-red text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-colors mb-3"
              >
                <Phone className="w-5 h-5" />
                {COMPANY.phoneDisplay}
              </a>

              <Link
                href={`/kontakt?cel=kupno&oferta=${encodeURIComponent(offer.title)}`}
                className="flex items-center justify-center w-full bg-brand-navy text-white font-bold py-4 rounded-lg hover:bg-blue-900 transition-colors"
              >
                Wyślij zapytanie o ofertę
              </Link>

              <p className="text-center text-gray-400 text-xs mt-4">
                Bezpłatna konsultacja · bez zobowiązań
              </p>
            </div>

            <div className="bg-brand-light-blue rounded-2xl border border-blue-100 p-5 text-sm text-gray-600">
              <p className="font-semibold text-brand-navy mb-1">Biuro Nieruchomości PRYZMAT</p>
              <p>{COMPANY.address.full}</p>
              <p className="mt-1">{COMPANY.hours.weekdays}</p>
              <p>{COMPANY.hours.saturday}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Aktualizacja Sitemapa

W `next-sitemap.config.js` dodaj obsługę dynamicznych stron ofert:

```js
// next-sitemap.config.js
const { getAllOfferSlugs } = require("./lib/asari");

module.exports = {
  siteUrl: process.env.SITE_URL || "https://pryzmat.com.pl",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/api/*", "/polityka-prywatnosci", "/rodo"],
  additionalPaths: async (config) => {
    const slugs = await getAllOfferSlugs();
    return slugs.map((slug) => ({
      loc: `/oferty/${slug}`,
      changefreq: "daily",
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }));
  },
  transform: async (config, path) => {
    const priorities = {
      "/": 1.0,
      "/oferty": 0.9,
      "/zarzadzanie-najmem": 0.9,
      "/kontakt": 0.8,
      "/o-nas": 0.7,
    };
    return {
      loc: path,
      changefreq: path === "/" || path === "/oferty" ? "daily" : "weekly",
      priority: priorities[path] ?? 0.6,
      lastmod: new Date().toISOString(),
    };
  },
};
```

---

## 6. Zmienne środowiskowe — pełna lista

Utwórz plik `.env.local` (nie wersjonuj go w git):

```env
# ASARI CRM
ASARI_API_URL=https://api.asari.pl/v2
ASARI_API_KEY=<klucz_api>
ASARI_OFFICE_ID=<id_biura>

# SMTP (już skonfigurowane w route.ts)
SMTP_HOST=smtp.twojdostawca.pl
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=biuro@pryzmat.com.pl
SMTP_PASS=<haslo>
SMTP_FROM=biuro@pryzmat.com.pl
SMTP_TO=biuro@pryzmat.com.pl

# Sitemap
SITE_URL=https://pryzmat.com.pl
```

> Dodaj `.env.local` do `.gitignore` jeśli nie ma go tam jeszcze.

---

## 7. Kolejność wdrożenia

1. Uzyskaj klucze API od ASARI
2. Utwórz `lib/asari.ts` i przetestuj wywołania w `node` / REPL
3. Zamień `OffersClient` (client-side) na server-fetched `OffersGrid`
4. Wdróż `/oferty/[slug]` i sprawdź `generateStaticParams`
5. Zaktualizuj `next-sitemap.config.js` i uruchom `npm run postbuild`
6. Sprawdź Rich Results Test (schema.org) dla strony głównej i `/oferty/[slug]`

---

## 8. Co pozostaje w kolejnych fazach

| Faza | Opis |
|------|------|
| **FAZA 3** | Google Maps embed na `/kontakt`, AI chatbot widget w Hero, konfiguracja SMTP (✅ gotowe w kodzie) |
| **FAZA 4** | Google Reviews API → `aggregateRating` z prawdziwymi danymi (aktualnie statyczne 5/3) |
