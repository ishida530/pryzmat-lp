-- ============================================================
-- Tabela ofert nieruchomości — lokalna baza danych ASARI
-- Schemat odpowiada typowi Offer z OffersClient.tsx
-- ============================================================

create table if not exists listings (
  -- klucz główny = ASARI listing id
  id                integer primary key,

  -- pole do wykrywania zmian przy syncu — wartość z ASARI lastUpdated
  asari_last_updated text    not null default '',

  -- pola identyfikacyjne
  slug              text    not null,
  status            text    not null default 'Active',
  listing_id        text,

  -- klasyfikacja
  type              text    not null,
  purpose           text    not null,   -- 'sprzedaz' | 'wynajem'

  -- treść
  title             text    not null,
  description       text    not null default '',

  -- lokalizacja
  location          text    not null default '—',
  geo_lat           numeric,
  geo_lng           numeric,

  -- cena
  price             numeric not null default 0,
  price_m2          numeric,

  -- powierzchnia
  area              numeric not null default 0,
  unit              text    not null default 'm²',

  -- parametry mieszkania/domu
  rooms             integer,
  bathrooms         integer,
  floor             integer,
  total_floors      integer,

  -- media
  image_url         text,
  thumbnail_url     text,
  all_photo_ids     integer[] not null default '{}',

  -- cechy i infrastruktura
  features          text[]    not null default '{}',

  -- agent (JSONB — struktura pasuje do Offer["agent"])
  agent             jsonb,

  -- powiązane lokale (dla inwestycji)
  nested_listings   jsonb,

  -- metadane syncu
  synced_at         timestamptz not null default now()
);

-- Indeksy dla szybkiego filtrowania w OffersClient
create index if not exists idx_listings_status  on listings (status);
create index if not exists idx_listings_type    on listings (type);
create index if not exists idx_listings_purpose on listings (purpose);

-- ============================================================
-- Row Level Security — publiczny odczyt, zapis tylko service_role
-- ============================================================
alter table listings enable row level security;

-- Każdy może czytać (strona publiczna)
create policy "listings_public_read"
  on listings for select
  using (true);

-- Zapis tylko przez service_role key (używany przez /api/sync)
-- service_role omija RLS automatycznie — brak dodatkowej polityki zapisu
