import { cache } from "react";
import type { Offer } from "@/components/sections/OffersClient";

const BASE_URL = "https://api.asari.pro/site";

function buildHeaders(): HeadersInit {
  const userId = process.env.ASARI_USER_ID ?? "";
  const token = process.env.ASARI_TOKEN ?? "";
  return { SiteAuth: `${userId}:${token}` };
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
// globalThis caches
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __asariIdsCache: { data: AsariListingRef[]; expires: number } | undefined;
  // eslint-disable-next-line no-var
  var __asariListingCache:
    | Map<number, { data: AsariListing; lastUpdated: string }>
    | undefined;
}

async function fetchListingIds(): Promise<AsariListingRef[]> {
  const now = Date.now();
  if (globalThis.__asariIdsCache && now < globalThis.__asariIdsCache.expires) {
    return globalThis.__asariIdsCache.data;
  }
  // closedDays/blockedDays include recently sold and reserved listings so we
  // can show SPRZEDANE / ZAREZERWOWANE badges on the site.
  const data = await asariPost<AsariListingRef[]>("/exportedListingIdList", {
    closedDays: "30",
    blockedDays: "30",
  });
  globalThis.__asariIdsCache = { data, expires: now + 60_000 };
  return data;
}

export const getListingIds = cache(fetchListingIds);

export const getListing = cache(
  async (id: number): Promise<AsariListing> =>
    asariPost<AsariListing>("/listing", { id: String(id) })
);

// getAllListings fetches every exported listing while respecting the 25-req/min
// ASARI rate limit (3.5 s between individual /listing calls). A per-listing
// globalThis cache keyed on lastUpdated means unchanged listings are served
// from memory — only new or updated ones hit the API.
export const getAllListings = cache(async (): Promise<AsariListing[]> => {
  const refs = await getListingIds();
  console.log(`[ASARI] exportedListingIdList returned ${refs.length} IDs:`, refs.map(r => r.id));

  if (!globalThis.__asariListingCache) {
    globalThis.__asariListingCache = new Map();
  }
  const perListingCache = globalThis.__asariListingCache;

  const results: AsariListing[] = [];
  let fetchCount = 0;

  for (const ref of refs) {
    const cached = perListingCache.get(ref.id);

    if (cached?.lastUpdated === ref.lastUpdated) {
      console.log(`[ASARI] listing ${ref.id} (${cached.data.section}) — from cache`);
      results.push(cached.data);
      continue;
    }

    if (fetchCount > 0) await delay(3_500);
    fetchCount++;

    try {
      const listing = await asariPost<AsariListing>("/listing", { id: String(ref.id) });
      console.log(`[ASARI] listing ${ref.id} (${listing.section}) — fetched OK`);
      perListingCache.set(ref.id, { data: listing, lastUpdated: ref.lastUpdated });
      results.push(listing);
    } catch (err) {
      console.error(`[ASARI] listing ${ref.id} fetch FAILED:`, err);
      if (cached) results.push(cached.data);
    }
  }

  console.log(`[ASARI] getAllListings → ${results.length} listings total`);
  return results;
});

export const getUsers = cache(async (): Promise<AsariUser[]> => {
  return asariPost<AsariUser[]>("/user/list", {
    active: "1",
    start: "0",
    limit: "200",
  });
});
