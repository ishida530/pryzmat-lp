/**
 * POST /api/sync  — synchronizacja ASARI → Supabase
 *
 * Wywoływany automatycznie przez Vercel Cron co 30 minut.
 * Można też wywołać ręcznie: POST /api/sync z nagłówkiem
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Algorytm smart-diff:
 *  1. Pobierz {id, lastUpdated} z ASARI (1 request)
 *  2. Porównaj z asari_last_updated w DB
 *  3. Pobierz z ASARI tylko nowe/zmienione oferty (batching 3 req / 3.5s)
 *  4. Upsert do Supabase
 *  5. Nieaktywne (usunięte z ASARI) → status = 'Cancelled'
 *  6. revalidateTag("listings") → Next.js odświeża cache stron natychmiast
 */

import { NextResponse }   from "next/server";
import { revalidateTag }  from "next/cache";
import { supabase }       from "@/lib/supabase";
import { getListingIds, fetchListingForSync, mapToOffer } from "@/lib/asari";

export const runtime    = "nodejs";
export const maxDuration = 60; // sekund — wystarczy nawet przy 30 ofertach

const CRON_SECRET  = process.env.CRON_SECRET;
const BATCH_SIZE   = 3;
const BATCH_DELAY  = 3500;
const CACHE_HIT_MS = 150;

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Auth ────────────────────────────────────────────────────────────────────

function isAuthorized(req: Request): boolean {
  if (!CRON_SECRET) return true; // brak sekretu = lokalne dev
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${CRON_SECRET}`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

async function runSync() {
  const started = Date.now();

  // 1. Lista ID z ASARI
  const refs = await getListingIds();
  const asariIds = new Set(refs.map(r => r.id));

  // 2. Co mamy w DB?
  const { data: existing, error: dbErr } = await supabase
    .from("listings")
    .select("id, asari_last_updated");

  if (dbErr) throw new Error(`DB read error: ${dbErr.message}`);

  const dbMap = new Map<number, string>(
    (existing ?? []).map(r => [r.id as number, r.asari_last_updated as string])
  );

  // 3. Kategoryzacja
  const toFetch = refs.filter(r => {
    const cached = dbMap.get(r.id);
    return cached === undefined || cached !== r.lastUpdated;
  });
  const removedIds = Array.from(dbMap.keys()).filter(id => !asariIds.has(id));

  // 4. Pobierz zmienione/nowe z ASARI (batching — nie przekracza rate limit)
  type OfferRow = ReturnType<typeof mapToOffer>;
  const fetched: OfferRow[] = [];

  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const t0      = performance.now();
    const batch   = toFetch.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(r => fetchListingForSync(r.id, r.lastUpdated))
    );

    for (const r of settled) {
      if (r.status === "fulfilled") fetched.push(mapToOffer(r.value));
      else console.error("[sync] listing fetch failed:", r.reason);
    }

    const elapsed = performance.now() - t0;
    const hasMore = i + BATCH_SIZE < toFetch.length;
    if (hasMore && elapsed > CACHE_HIT_MS) {
      await delay(Math.max(0, BATCH_DELAY - elapsed));
    }
  }

  // 5. Upsert do Supabase
  if (fetched.length > 0) {
    const rows = fetched.map(offer => {
      const ref = refs.find(r => r.id === offer.id);
      return {
        id:                 offer.id,
        asari_last_updated: ref?.lastUpdated ?? "",
        slug:               offer.slug,
        status:             offer.status,
        listing_id:         offer.listingId        ?? null,
        type:               offer.type,
        purpose:            offer.purpose,
        title:              offer.title,
        description:        offer.description,
        location:           offer.location,
        price:              offer.price,
        price_m2:           offer.priceM2          ?? null,
        area:               offer.area,
        unit:               offer.unit,
        rooms:              offer.rooms             ?? null,
        bathrooms:          offer.bathrooms         ?? null,
        floor:              offer.floor             ?? null,
        total_floors:       offer.totalFloors       ?? null,
        image_url:          offer.imageUrl          ?? null,
        thumbnail_url:      offer.thumbnailUrl      ?? null,
        all_photo_ids:      offer.allPhotoIds       ?? [],
        geo_lat:            offer.geoLat            ?? null,
        geo_lng:            offer.geoLng            ?? null,
        features:           offer.features          ?? [],
        agent:              offer.agent             ?? null,
        nested_listings:    offer.nestedListings    ?? null,
        synced_at:          new Date().toISOString(),
      };
    });

    const { error: upsertErr } = await supabase
      .from("listings")
      .upsert(rows, { onConflict: "id" });

    if (upsertErr) throw new Error(`Upsert error: ${upsertErr.message}`);
  }

  // 6. Nieaktywne oferty → Cancelled
  if (removedIds.length > 0) {
    const { error: cancelErr } = await supabase
      .from("listings")
      .update({ status: "Cancelled", synced_at: new Date().toISOString() })
      .in("id", removedIds);

    if (cancelErr) throw new Error(`Cancel error: ${cancelErr.message}`);
  }

  // 7. Odśwież cache Next.js — tylko gdy coś się zmieniło
  if (fetched.length > 0 || removedIds.length > 0) {
    revalidateTag("listings");
  }

  return {
    ok:          true,
    duration_ms: Date.now() - started,
    total:       refs.length,
    updated:     fetched.length,
    removed:     removedIds.length,
    skipped:     refs.length - toFetch.length,
  };
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[sync] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET — dla Vercel Cron (wysyła GET) i łatwego ręcznego testu w przeglądarce
export async function GET(req: Request) {
  return POST(req);
}
