# SEO Agent — plan wdrożenia

Cel: cykliczny (1×/tydzień) worker Node/TS uruchamiany przez GitHub Actions, który
generuje eksperckie artykuły lokalne (OpenAI `gpt-4o` na treść, `gpt-4o-mini` na meta),
zapisuje je w Supabase ze `status='draft'`, i wysyła e-mail do właścicieli do weryfikacji.
Publikacja jest zawsze ręczna (zmiana `status` na `published`) — agent nigdy nie publikuje sam.

Zależności już zainstalowane: `openai@^7.5.0`, `react-markdown@^10.1.0`, `tsx@^4.23.12`
(devDep), skrypt npm `seo-agent` w [package.json](../../package.json) już dodany.

## Ustalona konfiguracja (nie zmieniać bez konsultacji)

- **Harmonogram:** 1 artykuł/tydzień, poniedziałek 6:00 UTC → cron `0 6 * * 1`.
- **Modele:** treść = `gpt-4o`, meta (title/description/slug) = `gpt-4o-mini`.
- **Okno anty-duplikacji:** 90 dni wstecz po parze (city, pillar).
- **Lokalizacje** (13, rotacja round-robin), z flagą `fullTrust`:
  - `fullTrust: true` → obowiązkowy placeholder na anegdotę: Olsztyn, Barczewo
  - `fullTrust: false` → placeholder opcjonalny, ton "eksperta regionalnego" bez
    twierdzeń o konkretnych transakcjach: Biskupiec, Dobre Miasto, Dywity, Gietrzwałd,
    Jeziorany, Jonkowo, Kolno, Olsztynek, Purda, Stawiguda, Świątki
- **Filary tematyczne** (4, rotacja naprzemienna sprzedaż/zakup ↔ najem — 50/50):
  - `sprzedaz` — wycena, przygotowanie do sprzedaży, dokumenty, podatek PCC/PIT, umowa przedwstępna
  - `najem` — obowiązki wynajmującego, wybór najemcy, rozliczenia, najem okazjonalny (usługa flagowa, link do `/zarzadzanie-najmem`)
  - `zakup` — rynek pierwotny vs wtórny, kredyt, na co uważać przy oglądaniu nieruchomości
  - `rynek_lokalny` — ceny m², specyfika gminy, formalności regionalne

## Schemat bazy danych

```sql
-- supabase/migrations/0002_articles.sql
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
```

---

## Grupa A — backend agenta (worker Node/TS)

Pliki: `scripts/seo-agent/**`, `supabase/migrations/0002_articles.sql`.
Wzorce do naśladowania w repo: [lib/supabase.ts](../../lib/supabase.ts) (lazy Proxy client,
walidacja klucza service_role), [app/api/sync/route.ts](../../app/api/sync/route.ts)
(struktura kroków, logowanie, obsługa błędów), [app/api/kontakt/route.ts](../../app/api/kontakt/route.ts)
(dokładny wzór transportera nodemailer).

### A1 — Migracja SQL
- [x] `supabase/migrations/0002_articles.sql` — dokładnie wg schematu wyżej.

### A2 — Typy i konfiguracja
- [x] `scripts/seo-agent/lib/types.ts` — `Location {name, slug, fullTrust}`, `Pillar {id, label, group: "sprzedaz-zakup" | "najem"}`, `Topic {city, pillar, targetKeyword}`, `GeneratedArticle {title, content, targetKeyword}`, `GeneratedMeta {metaTitle, metaDescription, slug}`.
- [x] `scripts/seo-agent/config.ts` — eksportuje `LOCATIONS` (13 pozycji jw.), `PILLARS` (4 pozycje jw.), `MODEL_CONTENT = "gpt-4o"`, `MODEL_META = "gpt-4o-mini"`, `DEDUP_WINDOW_DAYS = 90`, `ARTICLES_PER_RUN = 1`.

### A3 — Klient Supabase dla skryptu
- [x] `scripts/seo-agent/lib/supabase-client.ts` — analogiczny lazy-Proxy client jak `lib/supabase.ts`, czyta `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` z `process.env` (w GitHub Actions przyjdą jako Secrets → env, więc bez dotenv). Ta sama walidacja klucza `sb_publishable_`.

### A4 — Wybór tematu (dedup)
- [x] `scripts/seo-agent/lib/topic-picker.ts` — `pickNextTopic(): Promise<Topic>`:
  1. `select city, pillar, created_at from articles where created_at > now() - interval '90 days'`
  2. zbuduj set wykluczonych par `city|pillar`
  3. wybierz kolejną parę round-robin (osobne liczniki dla grupy `sprzedaz-zakup` i `najem`, naprzemiennie) pomijając wykluczone
  4. zbuduj `targetKeyword` wg wzorca `"{pillar.label} {city}"` (np. "zarządzanie najmem Olsztyn")
  5. jeśli wszystkie pary z ostatnich 90 dni są wykluczone (pełny cykl), zresetuj i zacznij od nowa — nie blokuj rundy.

### A5 — Prompty (E-E-A-T)
- [x] `scripts/seo-agent/lib/prompts.ts`:
  - `buildSystemPrompt()` — importuje `COMPANY` z `../../../lib/constants` (dane firmy, obszar działania, ton pierwszej osoby liczby mnogiej), zasady: brak ogólników, brak zmyślonych przepisów/liczb, blok FAQ (3–4 pytania) na końcu, 1200–1600 słów, Markdown H2/H3.
  - `buildArticlePrompt(topic: Topic, location: Location)` — jeśli `location.fullTrust`, wstaw wymóg obowiązkowego placeholdera `[PRZYKŁAD Z NASZEJ PRAKTYKI — uzupełnij]`; jeśli nie, wymóg placeholdera opcjonalnego `[opcjonalnie: jeśli mieliście tu transakcję, dodajcie przykład]` + jawny zakaz twierdzeń o konkretnych zrealizowanych transakcjach w tej lokalizacji. CTA na końcu do `/oferty` albo `/zarzadzanie-najmem` (zależnie od filaru).
  - `buildMetaPrompt(article: GeneratedArticle)` — prosi o JSON: `metaTitle` (≤60 znaków), `metaDescription` (≤155 znaków), `slug` (kebab-case, ASCII, bez polskich znaków).

### A6 — Klient OpenAI
- [x] `scripts/seo-agent/lib/openai-client.ts`:
  - `generateArticle(topic, location): Promise<GeneratedArticle>` — wywołanie `MODEL_CONTENT`, `chat.completions.create`, parsowanie tytułu z pierwszego nagłówka H1/`# `.
  - `generateMeta(article): Promise<GeneratedMeta>` — wywołanie `MODEL_META` z `response_format: { type: "json_schema", ... }` (schema: metaTitle, metaDescription, slug — wszystkie string, required).
  - Obsługa błędów API z jednym retry (backoff 2s) zanim rzuci wyjątek dalej.

### A7 — Powiadomienie e-mail
- [x] `scripts/seo-agent/lib/notify.ts` — `sendDraftNotification(article: {title, slug, city, pillar})`, transporter nodemailer 1:1 wg wzoru z `app/api/kontakt/route.ts` (te same zmienne SMTP_*), temat: `Nowy szkic SEO do weryfikacji: {title}`, treść z linkiem do rekordu (np. `Supabase → Table Editor → articles → slug: {slug}`). Fallback: jeśli SMTP nie skonfigurowany, tylko `console.warn` (nie failuj całego runu).

### A8 — Orchestrator
- [x] `scripts/seo-agent/index.ts`:
  1. `pickNextTopic()`
  2. `generateArticle()` → `generateMeta()`
  3. walidacja unikalności slug w DB (jeśli kolizja, dopisz `-2`, `-3`...)
  4. `insert` do `articles` (`status: "draft"`, `model_content`, `model_meta` z configu)
  5. `sendDraftNotification()`
  6. logi kroków do stdout (czytelne w logach GitHub Actions), `process.exit(1)` przy błędzie krytycznym żeby Actions oznaczyło run jako failed.

---

## Grupa B — front i CI

Pliki: `lib/articles-db.ts`, `app/poradnik/**`, `next-sitemap.config.js`, `.github/workflows/seo-agent.yml`.
Wzorce do naśladowania: [lib/db.ts](../../lib/db.ts) (warstwa zapytań + `unstable_cache` + tagi),
[lib/seo.ts](../../lib/seo.ts) (`createMetadata`), struktura `app/oferty` dla listy/detalu.

### B1 — Warstwa danych artykułów
- [x] `lib/articles-db.ts` — analogicznie do `lib/db.ts`:
  - `getPublishedArticles(): Promise<Article[]>` — `select * from articles where status = 'published' order by published_at desc`, owinięte `unstable_cache(..., ["articles"], { revalidate: 1800, tags: ["articles"] })`.
  - `getArticleBySlug(slug): Promise<Article | null>`.
  - `getAllArticleSlugs(): Promise<string[]>` — do `generateStaticParams`.

### B2 — Strony
- [x] `app/poradnik/page.tsx` — lista kart (tytuł, meta_description, city, pillar), `generateMetadata` przez `createMetadata(...)`.
- [x] `app/poradnik/[slug]/page.tsx` — render treści przez `react-markdown`, `generateStaticParams` z `getAllArticleSlugs`, `generateMetadata` z `meta_title`/`meta_description` artykułu, `notFound()` gdy brak/nie-published.

### B3 — Sitemap
- [x] `next-sitemap.config.js` — dodać `/poradnik` do `additionalPaths` i `priorities` (0.7), oraz dynamicznie dociągnąć opublikowane sluga artykułów (transform lub `additionalPaths` z `getAllArticleSlugs`).

### B4 — GitHub Actions
- [x] `.github/workflows/seo-agent.yml`:
  - `on.schedule.cron: "0 6 * * 1"` + `workflow_dispatch` (ręczne uruchomienie do testów)
  - `actions/checkout@v4`, `actions/setup-node@v4` (node 20), `npm ci`
  - `run: npm run seo-agent`
  - `env:` z `secrets.OPENAI_API_KEY`, `secrets.SUPABASE_URL`, `secrets.SUPABASE_SERVICE_KEY`, `secrets.SMTP_HOST`, `secrets.SMTP_PORT`, `secrets.SMTP_SECURE`, `secrets.SMTP_USER`, `secrets.SMTP_PASS`, `secrets.SMTP_FROM`, `secrets.SMTP_TO`
  - komentarz w pliku: jakie secrety trzeba dodać ręcznie w GitHub repo settings.

---

## Kryteria akceptacji całości

- [ ] `npm run build` przechodzi bez błędów typów.
- [ ] `npx tsx scripts/seo-agent/index.ts` (z lokalnym `.env.local` uzupełnionym o `OPENAI_API_KEY`) tworzy jeden rekord `articles` ze `status='draft'`.
- [ ] Ręczna zmiana `status` na `published` w Supabase powoduje pojawienie się artykułu pod `/poradnik/{slug}` po rewalidacji (do 1800s albo po redeployu).
- [ ] Draft nigdy nie jest widoczny pod `/poradnik`.
