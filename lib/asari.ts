import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Offer } from "@/components/sections/OffersClient";

const BASE_URL = "https://api.asari.pro/site";

function buildHeaders(): HeadersInit {
  const userId = process.env.ASARI_USER_ID ?? "";
  const token = process.env.ASARI_TOKEN ?? "";
  return { SiteAuth: `${userId}:${token}` };
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)); // used by 429 retry

// Asari Site API: POST with multipart/form-data + SiteAuth header.
// Retries automatically on 429 (rate limit exceeded).
async function asariPost<T>(
  path: string,
  queryParams?: Record<string, string>,
  retries = 3
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
    console.warn(`[ASARI] 429 rate limit on ${path}, retrying in 10s… (${retries} left)`);
    await delay(10_000);
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
    slug: String(listing.id),
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
// Persistent Data Cache (Next.js unstable_cache)
//
// ASARI documentation: "The data downloaded by API should be saved to a local
// database. Web pages should display data from database prepared in that way."
//
// unstable_cache IS that local database — it persists across server restarts,
// Vercel cold starts, and dev HMR reloads. Individual listings are cached by
// their ID + lastUpdated, so only truly changed listings ever hit the API.
// React cache() deduplicates within a single render on top of that.
// ---------------------------------------------------------------------------

// Each individual listing is cached under a key that includes lastUpdated.
// When lastUpdated changes in ASARI, the key changes → fresh fetch.
// When it stays the same → Next.js serves the stored value instantly.
const fetchListingCached = (id: number, lastUpdated: string) =>
  unstable_cache(
    () => asariPost<AsariListing>("/listing", { id: String(id) }),
    [`listing-${id}-${lastUpdated}`],
    { revalidate: 600, tags: ["listings"] }
  )();

// Listing IDs list is cached for 60 s — short enough to pick up new listings
// quickly, long enough to avoid hammering the API on rapid page navigations.
const fetchListingIdsCached = unstable_cache(
  () =>
    asariPost<AsariListingRef[]>("/exportedListingIdList", {
      closedDays: "30",
      blockedDays: "30",
    }),
  ["listing-ids"],
  { revalidate: 60, tags: ["listing-ids"] }
);

export const getListingIds = cache(fetchListingIdsCached);

// getListing: used on detail pages. Cached individually by id+lastUpdated via
// fetchListingCached; React cache() deduplicates within a render.
export const getListing = cache(async (id: number): Promise<AsariListing> => {
  // Fetch the ID list first to get the current lastUpdated for this listing.
  // Both calls hit Next.js Data Cache — no extra API requests.
  const refs = await getListingIds();
  const ref  = refs.find((r) => r.id === id);
  if (ref) return fetchListingCached(ref.id, ref.lastUpdated);
  // Listing not in exported list (e.g. direct URL access) — fetch without cache key
  return asariPost<AsariListing>("/listing", { id: String(id) });
});

// getAllListings: fetches every exported listing.
// Warm cache → all resolved from Next.js Data Cache instantly, no API calls.
// Cold cache → all fired in parallel; asariPost retries 429s automatically.
export const getAllListings = cache(async (): Promise<AsariListing[]> => {
  const refs = await getListingIds();

  const settled = await Promise.allSettled(
    refs.map((ref) => fetchListingCached(ref.id, ref.lastUpdated))
  );

  const results: AsariListing[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") results.push(r.value);
    else console.error("[ASARI] listing fetch failed:", r.reason);
  }
  return results;
});

export const getUsers = cache(
  unstable_cache(
    () => asariPost<AsariUser[]>("/user/list", { active: "1", start: "0", limit: "200" }),
    ["users"],
    { revalidate: 3600, tags: ["users"] }
  )
);
