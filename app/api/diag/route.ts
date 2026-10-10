/**
 * GET /api/diag — diagnostyka połączeń Neon (Postgres) + ASARI
 *
 * Sprawdza:
 *   1. Zmienne środowiskowe
 *   2. Połączenie z bazą Neon + istnienie tabeli listings
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
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const asariUserId = process.env.ASARI_USER_ID ?? "";
  const asariToken  = process.env.ASARI_TOKEN ?? "";

  let dbHost = "";
  try {
    dbHost = databaseUrl ? new URL(databaseUrl).hostname : "";
  } catch {
    dbHost = "";
  }

  // Endpoint jest publiczny — pokazujemy tylko dostawcę i region, nie pełny host.
  // Neon: ep-xxx-pooler[.c-N].<region>.aws.neon.tech
  const isNeon   = dbHost.endsWith(".neon.tech");
  const region   = dbHost.match(/\.([a-z]{2}-[a-z]+-\d)\./)?.[1] ?? "?";
  const provider = isNeon ? `Neon (${region})` : "inny host (nie Neon)";

  result.env = {
    DATABASE_URL: databaseUrl
      ? dbHost
        ? `✓ ustawiony — ${provider}${dbHost.includes("-pooler") ? ", pooled" : ""}`
        : "✗ niepoprawny format URL"
      : "✗ BRAK",
    ASARI_USER_ID: asariUserId ? "✓ ustawiony" : "✗ BRAK",
    ASARI_TOKEN:   asariToken  ? "✓ ustawiony" : "✗ BRAK",
  };

  // 2. Neon — sprawdź połączenie i tabelę
  if (dbHost) {
    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(databaseUrl, { fetchOptions: { cache: "no-store" } });

      const [info] = await sql`
        select
          current_database()                                    as database,
          split_part(version(), ' ', 2)                         as postgres_version,
          (select count(*)::int from listings)                  as listings_total,
          (select count(*)::int from listings
             where status in ('Active', 'Pending', 'Closed'))   as listings_visible,
          (select count(*)::int from listings
             where social_post_synced_at is not null)           as listings_social_synced,
          (select max(synced_at) from listings)                 as last_sync_at,
          (select count(*)::int from articles)                  as articles_total
      `;

      result.database = {
        status:   "✓ połączono",
        provider,
        ...info,
        hint: info.listings_total === 0
          ? "Tabela pusta — wywołaj POST /api/sync, żeby załadować oferty z ASARI"
          : `${info.listings_total} ofert w bazie`,
      };
    } catch (err) {
      const message = String(err);
      result.database = {
        status: "✗ błąd",
        error:  message,
        hint:   message.includes("does not exist")
          ? "Brak tabel — uruchom db/schema.sql (Neon → SQL Editor) albo skrypt migracji"
          : undefined,
      };
    }
  } else {
    result.database = { status: "pominięto — brak lub błędny DATABASE_URL" };
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
    krok1_baza:
      "Neon → Dashboard → Connect → skopiuj connection string (pooled) do .env.local jako DATABASE_URL",
    krok2_schemat:
      "Neon → SQL Editor → wklej db/schema.sql → Run (tworzy tabele)",
    krok3_sync:
      "Wywołaj: curl -X POST http://localhost:3000/api/sync (lub otwórz w przeglądarce)",
  };

  return NextResponse.json(result, { status: 200 });
}
