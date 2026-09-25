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
import { notifyPostflyContentIntake } from "@/lib/postfly-client";
import { COMPANY } from "@/lib/constants";
import { sanitizeListingTitle, stripAddressNumbers } from "@/lib/social-style";

export const runtime    = "nodejs";
export const maxDuration = 60; // sekund — wystarczy nawet przy 30 ofertach

const CRON_SECRET  = process.env.CRON_SECRET;
const BATCH_SIZE   = 3;
const BATCH_DELAY  = 3500;
const CACHE_HIT_MS = 150;
const MAX_SOCIAL_ANNOUNCEMENTS_PER_RUN = 3;

function isReserved(title: string | null, description: string | null): boolean {
  return /rezerwacj|zarezerwowan/i.test(`${title ?? ""} ${(description ?? "").slice(0, 300)}`);
}

// Ustrukturyzowane parametry z bazy (nie z luźnego opisu CRM) — model dostaje je wprost, a
// strażnik liczb w Postfly akceptuje tylko liczby obecne w danych, więc to one mogą trafić do posta.
function listingFacts(listing: { area: number | null; rooms: number | null; floor: number | null }): string {
  return [
    listing.area ? `Powierzchnia: ${String(listing.area).replace(".", ",")} m²` : null,
    listing.rooms ? `Pokoje: ${listing.rooms}` : null,
    listing.floor !== null && listing.floor !== undefined ? `Piętro: ${listing.floor === 0 ? "parter" : listing.floor}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

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
  // Oferty-dzieci w ramach inwestycji (pole `parentListing` w surowym ASARI) — Offer/mapToOffer
  // go nie przenosi (niepotrzebne na stronie), więc zbieramy osobno, tylko do reguły "pomiń
  // dziecko inwestycji" przy zgłaszaniu nowych ofert do Postfly (krok 6b).
  const parentListingById = new Map<number, number | null>();

  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const t0      = performance.now();
    const batch   = toFetch.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(r => fetchListingForSync(r.id, r.lastUpdated))
    );

    for (const r of settled) {
      if (r.status === "fulfilled") {
        fetched.push(mapToOffer(r.value));
        parentListingById.set(r.value.id, r.value.parentListing?.id ?? null);
      } else {
        console.error("[sync] listing fetch failed:", r.reason);
      }
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
        parent_listing_id:  parentListingById.get(offer.id) ?? null,
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

  // 6b. Zgłoś do Postfly oferty, które czekają na ogłoszenie social media.
  //
  // Zapytanie NIEZALEŻNE od `toFetch`/`fetched` z kroku 4 celowo — dzięki temu obejmuje też
  // ofertę, której poprzednie zgłoszenie do Postfly się nie powiodło (sieć/5xx), NAWET jeśli jej
  // dane w ASARI się od tamtej pory nie zmieniły (a więc krok 4 by ją pominął jako "skipped").
  // social_post_synced_at ustawiane wyłącznie po sukcesie — więc "nowa" i "wcześniej nieudana"
  // trafiają do tego samego zapytania i tej samej pętli retry, bez osobnego rozróżniania.
  const { data: socialCandidates, error: socialCandidatesErr } = await supabase
    .from("listings")
    .select("id, slug, title, description, image_url, price, location, type, parent_listing_id, area, rooms, floor")
    .eq("status", "Active")
    .is("social_post_synced_at", null);

  if (socialCandidatesErr) {
    console.error("[sync] Odczyt kandydatów do zgłoszenia social nie powiódł się:", socialCandidatesErr.message);
  }

  let socialAnnounced = 0;
  let socialFailed = 0;

  for (const listing of socialCandidates ?? []) {
    if (listing.parent_listing_id) continue; // dziecko inwestycji — pomiń, post idzie tylko dla rodzica
    // Oferta w ASARI bywa "Active" z dopiskiem REZERWACJA w opisie — ogłaszanie jej jako nowej
    // byłoby nietrafne. Zostaje nieoznaczona, więc po zdjęciu rezerwacji pójdzie normalnie.
    if (isReserved(listing.title, listing.description)) continue;
    // Bezpiecznik: nigdy więcej niż kilka szkiców naraz (np. po imporcie całego katalogu) —
    // reszta pójdzie przy kolejnych syncach.
    if (socialAnnounced + socialFailed >= MAX_SOCIAL_ANNOUNCEMENTS_PER_RUN) break;

    const result = await notifyPostflyContentIntake({
      type: "listing",
      sourceRef: `asari-${listing.id}`,
      title: sanitizeListingTitle(listing.title),
      excerpt: [listingFacts(listing), stripAddressNumbers(listing.description ?? "")].filter(Boolean).join("\n\n"),
      url: `${COMPANY.website}/oferty/${listing.slug}`,
      imageUrl: listing.image_url ?? `${COMPANY.website}/opengraph-image`,
      price: listing.price ?? undefined,
      location: listing.location ?? undefined,
      category: listing.type,
    });

    if (result.ok) {
      socialAnnounced++;
      const { error: markErr } = await supabase
        .from("listings")
        .update({ social_post_synced_at: new Date().toISOString() })
        .eq("id", listing.id);
      if (markErr) console.error(`[sync] Nie udało się zapisać social_post_synced_at dla ${listing.id}:`, markErr.message);
    } else {
      socialFailed++;
      console.error(`[sync] content-intake nie powiodło się dla oferty ${listing.id}: ${result.error} — spróbuję ponownie przy następnym syncu.`);
    }
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
    socialAnnounced,
    socialFailed,
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
