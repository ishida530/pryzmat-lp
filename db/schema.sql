-- ============================================================
-- Schemat bazy Neon (Postgres) — połączone dawne migracje Supabase 0001–0003.
-- Idempotentny (if not exists) — można uruchamiać wielokrotnie.
-- Uruchamiany automatycznie przez scripts/migrate-supabase-to-neon.ts
-- albo ręcznie: Neon Console → SQL Editor → wklej → Run.
--
-- Bez RLS/policy — to był mechanizm Supabase (role anon/service_role).
-- Na Neonie aplikacja łączy się wyłącznie server-side przez DATABASE_URL.
-- ============================================================

-- ─── Oferty nieruchomości (sync z ASARI przez /api/sync) ─────────────────────
create table if not exists listings (
  -- klucz główny = ASARI listing id
  id                 integer primary key,

  -- pole do wykrywania zmian przy syncu — wartość z ASARI lastUpdated
  asari_last_updated text    not null default '',

  slug               text    not null,
  status             text    not null default 'Active',
  listing_id         text,

  type               text    not null,
  purpose            text    not null,   -- 'sprzedaz' | 'wynajem'

  title              text    not null,
  description        text    not null default '',

  location           text    not null default '—',
  geo_lat            numeric,
  geo_lng            numeric,

  price              numeric not null default 0,
  price_m2           numeric,

  area               numeric not null default 0,
  unit               text    not null default 'm²',

  rooms              integer,
  bathrooms          integer,
  floor              integer,
  total_floors       integer,

  image_url          text,
  thumbnail_url      text,
  all_photo_ids      integer[] not null default '{}',

  features           text[]    not null default '{}',

  agent              jsonb,
  nested_listings    jsonb,

  synced_at          timestamptz not null default now(),

  -- null = jeszcze nie zgłoszona do Postfly (albo zgłoszenie się nie powiodło)
  social_post_synced_at timestamptz,
  -- id oferty-rodzica (lokal w ramach inwestycji) — pomijany przy postach social
  parent_listing_id  integer
);

create index if not exists idx_listings_status  on listings (status);
create index if not exists idx_listings_type    on listings (type);
create index if not exists idx_listings_purpose on listings (purpose);
create index if not exists idx_listings_slug    on listings (slug);

-- ─── Artykuły (archiwum — blog działa z content/blog/*.mdx) ──────────────────
-- Przeniesione z Supabase, żeby nie stracić danych. scripts/export-articles-to-mdx.ts
-- czyta stąd przy eksporcie do MDX.
create table if not exists articles (
  id                bigint generated always as identity primary key,
  slug              text not null unique,
  status            text not null default 'draft', -- 'draft' | 'published'
  title             text not null,
  content           text not null,
  meta_title        text not null,
  meta_description  text not null,
  target_keyword    text not null,
  city              text not null,
  pillar            text not null,
  model_content     text not null default 'gpt-4o',
  model_meta        text not null default 'gpt-4o-mini',
  created_at        timestamptz not null default now(),
  published_at      timestamptz
);

create index if not exists idx_articles_status on articles (status);
