import { cache } from "react";
import type { Offer } from "@/components/sections/OffersClient";

const BASE_URL = "https://api.asari.pro/site";

function buildHeaders(): HeadersInit {
  const userId = process.env.ASARI_USER_ID ?? "";
  const token = process.env.ASARI_TOKEN ?? "";
  return { SiteAuth: `${userId}:${token}` };
}

// Asari Site API: POST with multipart/form-data + SiteAuth header.
// A dummy field ensures fetch generates a proper multipart boundary.
// Response format: { success: boolean, data: T }
async function asariPost<T>(path: string, queryParams?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (queryParams) {
    for (const [k, v] of Object.entries(queryParams)) url.searchParams.set(k, v);
  }

  const body = new FormData();
  body.append("_", "1");

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: buildHeaders(),
    body,
    // Next.js ISR caches the full page — no fetch-level cache needed for POST
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Asari ${res.status} ${res.statusText} — ${path}`);

  const json = await res.json();
  if (!json.success) throw new Error(`Asari error — ${path}: ${JSON.stringify(json)}`);
  return json.data as T;
}

// ---------------------------------------------------------------------------
// Raw API types (based on real API responses)
// ---------------------------------------------------------------------------

export interface AsariListingRef {
  id: number;
  lastUpdated: string;
}

export interface AsariPrice {
  amount: number;
  currency: string;
}

export interface AsariImage {
  id: number;
  description: string | null;
  isScheme: boolean;
}

export interface AsariLocation {
  id: number;
  name: string;       // full path, e.g. "/Warmińsko-Mazurskie/Olsztyński/Barczewo/Mokiny"
  province: string;
  locality: string;   // the city/village name we actually display
  quarter: string;
}

export interface AsariListing {
  id: number;
  section: string;
  status: string;
  headerAdvertisement: string;
  description?: string;
  englishDescription?: string;
  price: AsariPrice;
  priceM2?: AsariPrice;
  lotArea?: number;     // plots / land
  totalArea?: number;   // apartments, houses (gross)
  livingArea?: number;  // apartments (net)
  location?: AsariLocation;
  geoLat?: number;
  geoLng?: number;
  country?: { id: number; name: string; code: string };
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  images?: AsariImage[];
  availableNeighborhoodList?: string[];
  communicationList?: string[];
  agent?: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    imageId?: number | null;
  };
  parentListing?: number | null;
  listingId?: string;
}

// ---------------------------------------------------------------------------
// Section → Polish UI label mapping
// ---------------------------------------------------------------------------

const SECTION_MAP: Record<string, { type: string; purpose: "sprzedaz" | "wynajem" }> = {
  ApartmentSale:    { type: "Mieszkanie", purpose: "sprzedaz" },
  ApartmentRental:  { type: "Mieszkanie", purpose: "wynajem" },
  HouseSale:        { type: "Dom",        purpose: "sprzedaz" },
  HouseRental:      { type: "Dom",        purpose: "wynajem" },
  LotSale:          { type: "Działka",    purpose: "sprzedaz" },
  LotRental:        { type: "Działka",    purpose: "wynajem" },
  CommercialSale:   { type: "Lokal",      purpose: "sprzedaz" },
  CommercialRental: { type: "Lokal",      purpose: "wynajem" },
};

// English feature labels returned by Asari → Polish display
const FEATURE_LABELS: Record<string, string> = {
  Playground:   "Plac zabaw",
  Restaurant:   "Restauracja",
  Forest:       "Las w pobliżu",
  Nursery:      "Żłobek",
  Kindergarten: "Przedszkole",
  Shop:         "Sklep",
  Church:       "Kościół",
  Lake:         "Jezioro w pobliżu",
  Park:         "Park",
  School:       "Szkoła",
  Pharmacy:     "Apteka",
  Bus:          "Komunikacja autobusowa",
  Train:        "Kolej",
  Tram:         "Tramwaj",
};

// ---------------------------------------------------------------------------
// Image URL helpers
// ---------------------------------------------------------------------------

export function asariImageUrl(imageId: number): string {
  return `https://img.asariweb.pl/normal/${imageId}`;
}

export function asariThumbnailUrl(imageId: number): string {
  return `https://img.asariweb.pl/thumbnail/${imageId}`;
}

// Strips HTML tags and decodes common entities from Asari descriptions
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Mapper: AsariListing → Offer (UI type used by OffersClient)
// ---------------------------------------------------------------------------

export function mapToOffer(listing: AsariListing): Offer {
  const { type, purpose } = SECTION_MAP[listing.section] ?? {
    type: listing.section,
    purpose: "sprzedaz" as const,
  };

  const city = listing.location?.locality ?? "—";

  // Area field differs by section
  const area = listing.lotArea ?? listing.totalArea ?? listing.livingArea ?? 0;

  // Exclude floor-plan images (isScheme = true)
  const photoIds = (listing.images ?? [])
    .filter((img) => !img.isScheme)
    .map((img) => img.id);
  const imageUrl = photoIds.length > 0 ? asariImageUrl(photoIds[0]) : undefined;

  const description = listing.description ? stripHtml(listing.description) : "";

  const features = [
    ...(listing.availableNeighborhoodList ?? []),
    ...(listing.communicationList ?? []),
  ].map((f) => FEATURE_LABELS[f] ?? f);

  return {
    id: listing.id,
    slug: String(listing.id),
    type,
    title: listing.headerAdvertisement,
    description,
    location: city,
    price: listing.price.amount,
    area,
    unit: "m²",
    purpose,
    rooms: listing.rooms ?? undefined,
    bathrooms: listing.bathrooms ?? undefined,
    features: features.length > 0 ? features : undefined,
    imageUrl,
  };
}

// ---------------------------------------------------------------------------
// Public API — wrapped with React cache() to deduplicate per-request calls.
// This prevents 429 rate-limit errors when multiple components call the same
// function during a single render (e.g. getListing + getAllListings on detail page).
//
// getListingIds also uses a module-level 60-second cache so that rapid
// back-to-back page navigations (including generateStaticParams calls in dev)
// don't hit the API repeatedly and trigger 429.
// ---------------------------------------------------------------------------

// globalThis persists across HMR hot-reloads in Next.js dev mode.
// In production the module is long-lived anyway so a plain variable works too.
declare global {
  // eslint-disable-next-line no-var
  var __asariIdsCache: { data: AsariListingRef[]; expires: number } | undefined;
}

async function fetchListingIds(): Promise<AsariListingRef[]> {
  const now = Date.now();
  if (globalThis.__asariIdsCache && now < globalThis.__asariIdsCache.expires) {
    return globalThis.__asariIdsCache.data;
  }
  const data = await asariPost<AsariListingRef[]>("/exportedListingIdList");
  globalThis.__asariIdsCache = { data, expires: now + 60_000 };
  return data;
}

export const getListingIds = cache(fetchListingIds);

export const getListing = cache(
  async (id: number): Promise<AsariListing> =>
    asariPost<AsariListing>("/listing", { id: String(id) })
);

export const getAllListings = cache(async (): Promise<AsariListing[]> => {
  const refs = await getListingIds();
  const BATCH = 5;
  const results: AsariListing[] = [];

  for (let i = 0; i < refs.length; i += BATCH) {
    const batch = refs.slice(i, i + BATCH);
    const settled = await Promise.allSettled(batch.map((r) => getListing(r.id)));
    for (const r of settled) {
      if (r.status === "fulfilled") results.push(r.value);
    }
  }

  return results;
});
