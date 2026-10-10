// Migracja jednorazowa (2026-10): Supabase → Neon.
//
//   1. Tworzy schemat w Neon (db/schema.sql — idempotentny).
//   2. Kopiuje WSZYSTKIE wiersze `listings` i `articles` z Supabase (REST API, bez supabase-js).
//      Kopia 1:1 łącznie z social_post_synced_at — bez tego pierwszy sync na Neonie uznałby
//      wszystkie aktywne oferty za "nowe" i zgłosił je ponownie do Postfly.
//   3. Weryfikuje: liczba wierszy, zestaw ID i kluczowe pola po obu stronach muszą być identyczne.
//
// Można uruchamiać wielokrotnie (upsert). Supabase jest tylko CZYTANE — nic tam nie zmieniamy.
//
// Uruchomienie (w .env.local: SUPABASE_URL, SUPABASE_SERVICE_KEY, DATABASE_URL):
//   npx tsx --env-file=.env.local scripts/migrate-supabase-to-neon.ts
//   npx tsx --env-file=.env.local scripts/migrate-supabase-to-neon.ts --verify-only
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

type Row = Record<string, unknown>;

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const VERIFY_ONLY  = process.argv.includes("--verify-only");

const TABLES = ["listings", "articles"] as const;
// Pola porównywane wiersz po wierszu w kroku weryfikacji
const VERIFY_FIELDS: Record<(typeof TABLES)[number], string[]> = {
  listings: ["slug", "status", "price", "asari_last_updated", "social_post_synced_at"],
  articles: ["slug", "status", "title", "published_at"],
};

function fail(msg: string): never {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_KEY) fail("Brak SUPABASE_URL / SUPABASE_SERVICE_KEY w env.");
if (!DATABASE_URL) fail("Brak DATABASE_URL (connection string z Neon) w env.");
if (SUPABASE_KEY.startsWith("sb_publishable_")) fail("SUPABASE_SERVICE_KEY to klucz publishable — potrzebny sb_secret_ / service_role.");
if (!new URL(DATABASE_URL).hostname.endsWith(".neon.tech")) {
  fail("DATABASE_URL nie wskazuje na Neon (*.neon.tech) — przerwano, żeby nie pisać do złej bazy.");
}

const sql = neon(DATABASE_URL);

// ─── Supabase (PostgREST) ────────────────────────────────────────────────────

async function fetchSupabase(table: string): Promise<Row[]> {
  const headers: Record<string, string> = { apikey: SUPABASE_KEY! };
  // Stary format klucza (JWT) musi iść też w Authorization, inaczej PostgREST działa jako anon
  // i RLS ukryje np. nieopublikowane artykuły.
  if (SUPABASE_KEY!.startsWith("eyJ")) headers.Authorization = `Bearer ${SUPABASE_KEY}`;

  const pageSize = 1000;
  const rows: Row[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=id.asc&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, { headers });
    if (res.status === 404) {
      const body = await res.text();
      if (body.includes("PGRST205") || body.includes("does not exist")) {
        console.log(`  · ${table}: brak tabeli w Supabase — pomijam`);
        return [];
      }
      fail(`Supabase ${table}: HTTP 404 ${body}`);
    }
    if (!res.ok) fail(`Supabase ${table}: HTTP ${res.status} ${await res.text()}`);
    const page = (await res.json()) as Row[];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

// ─── Neon ────────────────────────────────────────────────────────────────────

async function applySchema(): Promise<void> {
  const file = path.join(process.cwd(), "db", "schema.sql");
  const statements = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(line => !line.trim().startsWith("--"))
    .join("\n")
    .split(/;\s*(?:\n|$)/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const stmt of statements) await sql.query(stmt);
  console.log(`  ✓ schemat zastosowany (${statements.length} instrukcji)`);
}

async function neonColumns(table: string): Promise<string[]> {
  const rows = await sql`
    select column_name from information_schema.columns
    where table_schema = 'public' and table_name = ${table}
    order by ordinal_position
  `;
  return rows.map(r => r.column_name as string);
}

async function copyTable(table: (typeof TABLES)[number], rows: Row[]): Promise<void> {
  if (rows.length === 0) {
    console.log(`  · ${table}: 0 wierszy — nic do skopiowania`);
    return;
  }

  const target = await neonColumns(table);
  const extra  = Object.keys(rows[0]).filter(c => !target.includes(c));
  if (extra.length > 0) fail(`${table}: kolumny z Supabase, których nie ma w db/schema.sql: ${extra.join(", ")}`);

  const cols   = target.filter(c => c in rows[0]);
  const list   = cols.join(", ");
  const update = cols.filter(c => c !== "id").map(c => `${c} = excluded.${c}`).join(", ");
  // articles.id to "generated always as identity" — zachowujemy oryginalne ID
  const overriding = table === "articles" ? "overriding system value" : "";

  // Paczki po 200 wierszy — limit rozmiaru requestu HTTP Neona
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    await sql.query(
      `insert into ${table} (${list}) ${overriding}
       select ${list} from jsonb_populate_recordset(null::${table}, $1::jsonb)
       on conflict (id) do update set ${update}`,
      [JSON.stringify(chunk)]
    );
  }

  if (table === "articles") {
    await sql`select setval(pg_get_serial_sequence('articles', 'id'), coalesce((select max(id) from articles), 1))`;
  }
  console.log(`  ✓ ${table}: skopiowano ${rows.length} wierszy`);
}

// ─── Weryfikacja ─────────────────────────────────────────────────────────────

function norm(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toISOString();
  if (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v)) return String(Number(v));
  return String(v);
}

async function verifyTable(table: (typeof TABLES)[number], source: Row[]): Promise<boolean> {
  const fields = VERIFY_FIELDS[table];
  const target = (await sql.query(`select id, ${fields.join(", ")} from ${table}`)) as Row[];

  const byId = new Map(target.map(r => [norm(r.id), r]));
  const problems: string[] = [];

  if (target.length !== source.length) {
    problems.push(`liczba wierszy: Supabase=${source.length}, Neon=${target.length}`);
  }
  for (const s of source) {
    const t = byId.get(norm(s.id));
    if (!t) {
      problems.push(`brak id=${s.id} w Neon`);
      continue;
    }
    for (const f of fields) {
      if (norm(s[f]) !== norm(t[f])) problems.push(`id=${s.id}.${f}: Supabase=${norm(s[f])} Neon=${norm(t[f])}`);
    }
  }

  if (problems.length === 0) {
    console.log(`  ✓ ${table}: ${source.length} wierszy — identyczne (${fields.join(", ")})`);
    return true;
  }
  console.error(`  ✗ ${table}: ${problems.length} różnic`);
  for (const p of problems.slice(0, 20)) console.error(`      - ${p}`);
  return false;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  console.log(`[migrate] Supabase → Neon${VERIFY_ONLY ? " (tylko weryfikacja)" : ""}\n`);

  console.log("1/4 Odczyt z Supabase");
  const source: Record<string, Row[]> = {};
  for (const t of TABLES) {
    source[t] = await fetchSupabase(t);
    console.log(`  · ${t}: ${source[t].length} wierszy`);
  }

  if (!VERIFY_ONLY) {
    console.log("\n2/4 Schemat w Neon");
    await applySchema();

    console.log("\n3/4 Kopiowanie danych");
    for (const t of TABLES) await copyTable(t, source[t]);
  }

  console.log("\n4/4 Weryfikacja");
  let ok = true;
  for (const t of TABLES) ok = (await verifyTable(t, source[t])) && ok;

  if (!ok) fail("Weryfikacja NIE przeszła — nie przełączaj produkcji, sprawdź różnice powyżej.");
  console.log("\n✓ Migracja zweryfikowana — dane w Neon są identyczne z Supabase.");
}

run().catch(err => fail(`Błąd krytyczny: ${err instanceof Error ? err.message : String(err)}`));
