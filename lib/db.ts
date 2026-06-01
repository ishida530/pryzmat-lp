import { unstable_cache } from "next/cache";
import { supabase } from "./supabase";
import type { Offer } from "@/components/sections/OffersClient";

// ─── Typ wiersza z bazy ──────────────────────────────────────────────────────

interface DbListing {
  id: number;
  slug: string;
  status: string;
  listing_id: string | null;
  type: string;
  purpose: string;
  title: string;
  description: string;
  location: string;
  price: number;
  price_m2: number | null;
  area: number;
  unit: string;
  rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  total_floors: number | null;
  image_url: string | null;
  thumbnail_url: string | null;
  all_photo_ids: number[];
  geo_lat: number | null;
  geo_lng: number | null;
  features: string[];
  agent: Offer["agent"] | null;
  nested_listings: Offer["nestedListings"] | null;
}

function toOffer(row: DbListing): Offer {
  return {
    id:             row.id,
    slug:           row.slug,
    status:         row.status,
    listingId:      row.listing_id    ?? undefined,
    type:           row.type,
    purpose:        row.purpose as "sprzedaz" | "wynajem",
    title:          row.title,
    description:    row.description,
    location:       row.location,
    price:          Number(row.price),
    priceM2:        row.price_m2      != null ? Number(row.price_m2) : undefined,
    area:           Number(row.area),
    unit:           row.unit,
    rooms:          row.rooms         ?? undefined,
    bathrooms:      row.bathrooms     ?? undefined,
    floor:          row.floor         ?? undefined,
    totalFloors:    row.total_floors  ?? undefined,
    imageUrl:       row.image_url     ?? undefined,
    thumbnailUrl:   row.thumbnail_url ?? undefined,
    allPhotoIds:    row.all_photo_ids ?? [],
    geoLat:         row.geo_lat       ?? undefined,
    geoLng:         row.geo_lng       ?? undefined,
    features:       row.features?.length > 0 ? row.features : undefined,
    agent:          row.agent         ?? undefined,
    nestedListings: row.nested_listings ?? undefined,
  };
}

// ─── Zapytania do Supabase (owinięte w unstable_cache) ───────────────────────
//
// Tag "listings" — /api/sync wywołuje revalidateTag("listings") po każdej
// zmianie danych. Strony natychmiast dostają odświeżone dane bez czekania
// na revalidate: N. TTL 1800s to tylko siatka bezpieczeństwa.

const _queryAllListings = unstable_cache(
  async (): Promise<DbListing[]> => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .in("status", ["Active", "Pending", "Closed"])
      .order("id", { ascending: false });
    if (error) throw new Error(`[db] getAllListings: ${error.message}`);
    return (data ?? []) as DbListing[];
  },
  ["db-all-listings"],
  { revalidate: 1800, tags: ["listings"] }
);

const _queryListing = unstable_cache(
  async (id: number): Promise<DbListing | null> => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`[db] getListing ${id}: ${error.message}`);
    return (data as DbListing | null);
  },
  ["db-listing"],
  { revalidate: 1800, tags: ["listings"] }
);

const _queryListingBySlug = unstable_cache(
  async (slug: string): Promise<DbListing | null> => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`[db] getListingBySlug ${slug}: ${error.message}`);
    return (data as DbListing | null);
  },
  ["db-listing-by-slug"],
  { revalidate: 1800, tags: ["listings"] }
);

const _querySimilarListings = unstable_cache(
  async (excludeId: number, limit: number): Promise<DbListing[]> => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .neq("id", excludeId)
      .order("id", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`[db] getSimilarListings: ${error.message}`);
    return (data ?? []) as DbListing[];
  },
  ["db-similar-listings"],
  { revalidate: 1800, tags: ["listings"] }
);

// ─── Publiczne API dla stron ─────────────────────────────────────────────────

export async function getAllListings(): Promise<Offer[]> {
  const rows = await _queryAllListings();
  return rows.map(toOffer);
}

export async function getListing(id: number): Promise<Offer | null> {
  const row = await _queryListing(id);
  return row ? toOffer(row) : null;
}

export async function getListingBySlug(slug: string): Promise<Offer | null> {
  const row = await _queryListingBySlug(slug);
  if (row) return toOffer(row);
  // Backward compat: old URLs used the numeric ASARI ID as slug
  const numericId = /^\d+$/.test(slug) ? Number(slug) : NaN;
  if (!isNaN(numericId)) return getListing(numericId);
  return null;
}

export async function getSimilarListings(excludeId: number, limit = 3): Promise<Offer[]> {
  const rows = await _querySimilarListings(excludeId, limit);
  return rows.map(toOffer);
}

// Listę slugów dla generateStaticParams — lekkie zapytanie tylko o ID
export async function getAllListingIds(): Promise<number[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("id");
  if (error) throw new Error(`[db] getAllListingIds: ${error.message}`);
  return (data ?? []).map((r: { id: number }) => r.id);
}
