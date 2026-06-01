import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Offer } from "@/components/sections/OffersClient";

const BASE_URL = "https://api.asari.pro/site";

function buildHeaders(): HeadersInit {
  const userId = process.env.ASARI_USER_ID ?? "";
  const token = process.env.ASARI_TOKEN ?? "";
  return { SiteAuth: `${userId}:${token}` };
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Asari Site API: POST with multipart/form-data + SiteAuth header.
// Single retry on 429 with a short back-off — the main rate-limit guard is
// the adaptive batching in getAllListings, not this retry.
async function asariPost<T>(
  path: string,
  queryParams?: Record<string, string>,
  retries = 1
): Promise<T> {
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
    cache: "no-store",
  });

  if (res.status === 429 && retries > 0) {
    console.warn(`[ASARI] 429 rate limit on ${path}, retrying in 5s…`);
    await delay(5_000);
    return asariPost<T>(path, queryParams, retries - 1);
  }

  if (!res.ok) throw new Error(`Asari ${res.status} ${res.statusText} — ${path}`);

  const json = await res.json();
  if (!json.success) throw new Error(`Asari error — ${path}: ${JSON.stringify(json)}`);
  return json.data as T;
}

// ---------------------------------------------------------------------------
// Raw API types
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
  name: string;
  province: string;
  locality: string;
  quarter: string;
}

export interface AsariAgent {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  skypeUser?: string;
  imageId?: number | null;
}

export interface AsariUser extends AsariAgent {
  userType?: string;
  active?: boolean;
}

export interface AsariListing {
  id: number;
  section: string;
  status: string;
  listingId?: string;
  headerAdvertisement: string;
  description?: string;
  englishDescription?: string;
  price: AsariPrice;
  priceM2?: AsariPrice;
  lotArea?: number;
  totalArea?: number;
  livingArea?: number;
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
  agent?: AsariAgent;
  parentListing?: { id: number; listingId: string; name: string } | null;
  nestedListings?: Array<{ id: number; listingId: string }>;
}

// ---------------------------------------------------------------------------
// Section → Polish UI label mapping
// ---------------------------------------------------------------------------

const SECTION_MAP: Record<string, { type: string; purpose: "sprzedaz" | "wynajem" }> = {
  ApartmentSale:          { type: "Mieszkanie", purpose: "sprzedaz" },
  ApartmentRental:        { type: "Mieszkanie", purpose: "wynajem" },
  HouseSale:              { type: "Dom",        purpose: "sprzedaz" },
  HouseRental:            { type: "Dom",        purpose: "wynajem" },
  LotSale:                { type: "Działka",    purpose: "sprzedaz" },
  LotRental:              { type: "Działka",    purpose: "wynajem" },
  CommercialSpaceSale:    { type: "Lokal",      purpose: "sprzedaz" },
  CommercialSpaceRental:  { type: "Lokal",      purpose: "wynajem" },
  CommercialObjectSale:   { type: "Lokal",      purpose: "sprzedaz" },
  CommercialObjectRental: { type: "Lokal",      purpose: "wynajem" },
  WarehouseSale:          { type: "Magazyn",    purpose: "sprzedaz" },
  WarehouseRental:        { type: "Magazyn",    purpose: "wynajem" },
  Investment:             { type: "Inwestycja", purpose: "sprzedaz" },
  RoomRental:             { type: "Pokój",      purpose: "wynajem" },
};

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
// Slug helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ą/g, "a").replace(/ę/g, "e").replace(/ó/g, "o")
    .replace(/ś/g, "s").replace(/ź/g, "z").replace(/ż/g, "z")
    .replace(/ć/g, "c").replace(/ń/g, "n").replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSlug(listing: AsariListing): string {
  const { type, purpose } = SECTION_MAP[listing.section] ?? {
    type: listing.section,
    purpose: "sprzedaz" as const,
  };
  const city = listing.location?.locality ?? "";
  const purposeSlug = purpose === "sprzedaz" ? "sprzedaz" : "wynajem";
  return [slugify(type), purposeSlug, slugify(city), listing.id]
    .filter(Boolean)
    .join("-");
}

// ---------------------------------------------------------------------------
// Mapper: AsariListing → Offer
// ---------------------------------------------------------------------------

export function mapToOffer(listing: AsariListing): Offer {
  const { type, purpose } = SECTION_MAP[listing.section] ?? {
    type: listing.section,
    purpose: "sprzedaz" as const,
  };

  const city = listing.location?.locality ?? "—";
  const area = listing.lotArea ?? listing.totalArea ?? listing.livingArea ?? 0;

  const photoIds = (listing.images ?? [])
    .filter((img) => !img.isScheme)
    .map((img) => img.id);

  const imageUrl     = photoIds.length > 0 ? asariImageUrl(photoIds[0])     : undefined;
  const thumbnailUrl = photoIds.length > 0 ? asariThumbnailUrl(photoIds[0]) : undefined;

  const description = listing.description ? stripHtml(listing.description) : "";

  const features = [
    ...(listing.availableNeighborhoodList ?? []),
    ...(listing.communicationList ?? []),
  ].map((f) => FEATURE_LABELS[f] ?? f);

  return {
    id: listing.id,
    slug: buildSlug(listing),
    status: listing.status,
    listingId: listing.listingId,
    type,
    title: listing.headerAdvertisement,
    description,
    location: city,
    price: listing.price?.amount ?? 0,
    priceM2: listing.priceM2?.amount,
    area,
    unit: "m²",
    purpose,
    rooms: listing.rooms ?? undefined,
    bathrooms: listing.bathrooms ?? undefined,
    floor: listing.floor ?? undefined,
    totalFloors: listing.totalFloors ?? undefined,
    features: features.length > 0 ? features : undefined,
    imageUrl,
    thumbnailUrl,
    allPhotoIds: photoIds,
    geoLat: listing.geoLat,
    geoLng: listing.geoLng,
    agent: listing.agent
      ? {
          firstName: listing.agent.firstName,
          lastName: listing.agent.lastName,
          email: listing.agent.email,
          phoneNumber: listing.agent.phoneNumber,
          imageId: listing.agent.imageId,
        }
      : undefined,
    nestedListings: listing.nestedListings,
  };
}

// ---------------------------------------------------------------------------
// Persistent Data Cache  (Next.js unstable_cache)
//
// ASARI docs: "The data downloaded by API should be saved to a local database.
// Web pages should display data from database prepared in that way."
// unstable_cache IS that local database — survives server restarts and Vercel
// cold starts. All definitions MUST be at module level (never inside a function
// call) to avoid the DYNAMIC_SERVER_USAGE error.
//
// Arguments passed to an unstable_cache function are automatically part of the
// cache key. Passing (id, lastUpdated) means a listing is re-fetched only when
// ASARI updates it (lastUpdated changes) — otherwise served from cache instantly.
// React cache() deduplicates the same call within a single render on top.
// ---------------------------------------------------------------------------

// IDs list: revalidated every 5 min — real-estate listings don't change every 60 s.
const _fetchListingIds = unstable_cache(
  () =>
    asariPost<AsariListingRef[]>("/exportedListingIdList", {
      closedDays: "30",
      blockedDays: "30",
    }),
  ["asari-listing-ids"],
  { revalidate: 300, tags: ["listing-ids"] }
);

// Individual listing: (id, lastUpdated) both go into the cache key.
// Changed listing in ASARI → different lastUpdated → automatic cache miss.
const _fetchListing = unstable_cache(
  async (id: number, _lastUpdated: string) =>
    asariPost<AsariListing>("/listing", { id: String(id) }),
  ["asari-listing"],
  { revalidate: 600, tags: ["listings"] }
);

// Users / agents list.
const _fetchUsers = unstable_cache(
  () => asariPost<AsariUser[]>("/user/list", { active: "1", start: "0", limit: "200" }),
  ["asari-users"],
  { revalidate: 3600, tags: ["users"] }
);

export const getListingIds = cache(_fetchListingIds);

export const getListing = cache(async (id: number): Promise<AsariListing> => {
  const refs = await getListingIds();
  const ref  = refs.find((r) => r.id === id);
  // Use lastUpdated-keyed cache when possible; fall back for unlisted IDs.
  if (ref) return _fetchListing(ref.id, ref.lastUpdated);
  return asariPost<AsariListing>("/listing", { id: String(id) });
});

// ASARI rate limit: 25 req/min, recommended 3-4 s between requests.
// Firing all listings in parallel causes immediate 429s (observed: 9/12 fail).
//
// Strategy: process in batches of BATCH_SIZE. After each batch check how long it
// took — cache hits resolve in <CACHE_HIT_MS, so no delay is needed. Only real
// network calls are slow and need the inter-batch pause to stay under the quota.
//
// Result:
//   Warm cache  → each batch ~5-20 ms  → no delay → total <100 ms
//   Cold cache  → each batch ~1400 ms  → remainder of BATCH_DELAY added → no 429s
const BATCH_SIZE    = 3;    // concurrent requests per batch (observed safe burst)
const BATCH_DELAY   = 3500; // ms between batches on network calls (ASARI: 3-4 s)
const CACHE_HIT_MS  = 150;  // batch faster than this = all cache hits, skip delay

export const getAllListings = cache(async (): Promise<AsariListing[]> => {
  const refs = await getListingIds();
  const results: AsariListing[] = [];

  for (let i = 0; i < refs.length; i += BATCH_SIZE) {
    const t0 = performance.now();

    const settled = await Promise.allSettled(
      refs.slice(i, i + BATCH_SIZE).map((r) => _fetchListing(r.id, r.lastUpdated))
    );
    for (const r of settled) {
      if (r.status === "fulfilled") results.push(r.value);
      else console.error("[ASARI] listing fetch failed:", r.reason);
    }

    const batchMs = performance.now() - t0;
    const hasMore = i + BATCH_SIZE < refs.length;

    // Only throttle after real network calls; cache hits are nearly instant.
    if (hasMore && batchMs > CACHE_HIT_MS) {
      await delay(Math.max(0, BATCH_DELAY - batchMs));
    }
  }

  return results;
});

export const getUsers = cache(_fetchUsers);

// Dla /api/sync — bezpośredni dostęp do _fetchListing(id, lastUpdated)
// bez pośredniego wywołania getListingIds(). Sync sam zarządza kluczami.
export async function fetchListingForSync(
  id: number,
  lastUpdated: string
): Promise<AsariListing> {
  return _fetchListing(id, lastUpdated);
}
