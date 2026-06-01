/**
 * GET /api/diag — diagnostyka połączeń Supabase + ASARI
 *
 * Sprawdza:
 *   1. Zmienne środowiskowe
 *   2. Połączenie z Supabase + istnienie tabeli listings
 *   3. Połączenie z ASARI API
 *
 * Wywołaj w przeglądarce: http://localhost:3000/api/diag
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, unknown> = {};

  // 1. Zmienne środowiskowe
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? "";
  const asariUserId = process.env.ASARI_USER_ID ?? "";
  const asariToken  = process.env.ASARI_TOKEN ?? "";

  result.env = {
    SUPABASE_URL:         supabaseUrl   ? "✓ ustawiony" : "✗ BRAK",
    SUPABASE_SERVICE_KEY: supabaseKey
      ? supabaseKey.startsWith("sb_publishable_")
        ? "✗ To klucz anon/publishable — potrzebny sb_secret_..."
        : supabaseKey.startsWith("sb_secret_")
        ? "✓ ustawiony (nowy format sb_secret_)"
        : supabaseKey.startsWith("eyJ")
        ? "✓ ustawiony (stary format JWT)"
        : "? nieznany format"
      : "✗ BRAK",
    ASARI_USER_ID: asariUserId ? "✓ ustawiony" : "✗ BRAK",
    ASARI_TOKEN:   asariToken  ? "✓ ustawiony" : "✗ BRAK",
  };

  // 2. Supabase — sprawdź połączenie i tabelę
  if (supabaseUrl && supabaseKey && !supabaseKey.startsWith("sb_publishable_")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

      const { count, error } = await sb
        .from("listings")
        .select("id", { count: "exact", head: true });

      if (error) {
        result.supabase = {
          status: "✗ błąd",
          error: error.message,
          hint:
            error.message.includes("does not exist")
              ? "Tabela 'listings' nie istnieje — uruchom migrację SQL (patrz niżej)"
              : error.message,
        };
      } else {
        result.supabase = {
          status: "✓ połączono",
          listingsCount: count ?? 0,
          hint: count === 0
            ? "Tabela pusta — wywołaj POST /api/sync, żeby załadować oferty z ASARI"
            : `${count} ofert w bazie`,
        };
      }
    } catch (err) {
      result.supabase = { status: "✗ wyjątek", error: String(err) };
    }
  } else {
    result.supabase = { status: "pominięto — brak lub błędny klucz Supabase" };
  }

  // 3. ASARI — sprawdź połączenie
  if (asariUserId && asariToken) {
    try {
      const url = "https://api.asari.pro/site/exportedListingIdList";
      const body = new FormData();
      body.append("_", "1");
      const res = await fetch(url, {
        method: "POST",
        headers: { SiteAuth: `${asariUserId}:${asariToken}` },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      const json = await res.json();
      result.asari = {
        status:     res.ok && json.success ? "✓ połączono" : `✗ HTTP ${res.status}`,
        listingIds: json.success ? (json.data as unknown[]).length : 0,
        error:      json.success ? undefined : json.error,
      };
    } catch (err) {
      result.asari = { status: "✗ wyjątek", error: String(err) };
    }
  } else {
    result.asari = { status: "pominięto — brak ASARI_USER_ID lub ASARI_TOKEN" };
  }

  // 4. Instrukcje setup
  result.setup = {
    krok1_migracja:
      "Wklej zawartość supabase/migrations/0001_listings.sql do Supabase → SQL Editor → Run",
    krok2_klucz:
      "Skopiuj klucz 'service_role secret' z Supabase → Settings → API i wklej do .env.local jako SUPABASE_SERVICE_KEY",
    krok3_sync:
      "Wywołaj: curl -X POST http://localhost:3000/api/sync (lub otwórz w przeglądarce)",
  };

  return NextResponse.json(result, { status: 200 });
}
