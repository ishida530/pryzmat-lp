-- ============================================================
-- Tabela artykułów SEO — generowane przez agenta (scripts/seo-agent)
-- Zawsze wstawiane ze status='draft'; publikacja jest zawsze ręczna.
-- ============================================================

create table if not exists articles (
  id                bigint generated always as identity primary key,
  slug              text not null unique,
  status            text not null default 'draft', -- 'draft' | 'published'
  title             text not null,
  content           text not null,              -- Markdown
  meta_title        text not null,
  meta_description  text not null,
  target_keyword    text not null,
  city              text not null,
  pillar            text not null,               -- 'sprzedaz' | 'najem' | 'zakup' | 'rynek_lokalny'
  model_content     text not null default 'gpt-4o',
  model_meta        text not null default 'gpt-4o-mini',
  created_at        timestamptz not null default now(),
  published_at      timestamptz
);

create index if not exists idx_articles_status on articles (status);
create index if not exists idx_articles_city    on articles (city);
create index if not exists idx_articles_pillar  on articles (pillar);

alter table articles enable row level security;

create policy "articles_public_read_published"
  on articles for select
  using (status = 'published');

-- Zapis tylko przez service_role (agent i ewentualny przyszły panel admina) —
-- service_role omija RLS, brak dodatkowej polityki insert/update.
