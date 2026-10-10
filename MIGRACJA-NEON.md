# Migracja bazy: Supabase → Neon

Branch: `feat/migrate-supabase-to-neon`. Kod jest już przepięty na Neon (`lib/neon.ts`, sterownik
`@neondatabase/serverless`). Poniżej kroki do wykonania ręcznie, po kolei.

Zasada: **Supabase niczego nie traci** — skrypt tylko z niego czyta. Do kroku 7 produkcja dalej
działa na Supabase, więc w każdej chwili można przerwać bez skutków.

---

## 1. Załóż bazę Neon przez Vercel (5 min)

1. Vercel → projekt → **Storage** → **Create Database** → **Neon** (Serverless Postgres).
2. Region: **Frankfurt (eu-central-1)**. Plan: **Free**.
3. Podłącz do projektu dla środowisk **Production, Preview, Development**.
4. Vercel sam doda zmienną `DATABASE_URL` (+ kilka `PG*`/`POSTGRES_*` — nie przeszkadzają).

Sprawdź: Vercel → Settings → Environment Variables → jest `DATABASE_URL` z hostem `...-pooler.eu-central-1.aws.neon.tech`.

## 2. Ustaw `.env.local` (2 min)

Neon Console (link z Vercel → Storage → baza → *Open in Neon*) → **Connect** → *Pooled connection* → skopiuj.

W `.env.local` **dopisz** (SUPABASE_* zostaw — skrypt migracji ich potrzebuje):

```
DATABASE_URL=postgresql://...-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## 3. Skopiuj dane Supabase → Neon (2 min)

```powershell
npm install
npx tsx --env-file=.env.local scripts/migrate-supabase-to-neon.ts
```

Skrypt: tworzy tabele (`db/schema.sql`), kopiuje 1:1 `listings` i `articles` (razem z
`social_post_synced_at` — żeby Postfly nie dostał ponownie wszystkich ofert), weryfikuje.
Oczekiwany koniec:

```
✓ listings: N wierszy — identyczne (...)
✓ articles: M wierszy — identyczne (...)
✓ Migracja zweryfikowana — dane w Neon są identyczne z Supabase.
```

Jeśli pokaże `✗` — **stop**, nie idź dalej (wklej wynik do Claude).

## 4. Test lokalny (5 min)

```powershell
npm run dev
```

- http://localhost:3000/api/diag → `env.DATABASE_URL: ✓ ustawiony — Neon (eu-central-1), pooled`,
  `database.status: ✓ połączono`, `listings_total` = N ze skryptu.
- http://localhost:3000/oferty → lista ofert, wejdź w 1–2 oferty (zdjęcia, mapa, cena).

Sync testujemy dopiero na produkcji (krok 8) — lokalny sync zgłaszałby oferty do Postfly z localhosta.

## 5. Preview deploy (5 min)

```powershell
git add -A
git commit -m "feat(db): migrate from Supabase to Neon"
git push -u origin feat/migrate-supabase-to-neon
```

Vercel zbuduje Preview (build czyta oferty z Neon). Otwórz URL preview → `/oferty` i `/api/diag`.

## 6. Tuż przed przełączeniem: ponowna kopia (1 min)

Cron `/api/sync` mógł w międzyczasie zmienić dane w Supabase (codziennie 04:00 UTC). Odpal skrypt
jeszcze raz — jest idempotentny, dociąga zmiany:

```powershell
npx tsx --env-file=.env.local scripts/migrate-supabase-to-neon.ts
```

## 7. Deploy na produkcję

Merge do `main` (PR albo lokalnie):

```powershell
git checkout main
git merge --no-ff feat/migrate-supabase-to-neon
git push origin main
```

Vercel → Deployments → poczekaj na **Ready** dla produkcji.

## 8. Potwierdzenie, że produkcja działa na Neon ✅

Podmień `DOMENA` i `CRON_SECRET` (wartość z Vercel → Environment Variables):

```powershell
# a) diagnostyka — baza = Neon, dane są
curl.exe -s https://DOMENA/api/diag

# b) sync ASARI → Neon (zapis do bazy)
curl.exe -s -X POST https://DOMENA/api/sync -H "Authorization: Bearer CRON_SECRET"

# c) diagnostyka ponownie — last_sync_at świeży
curl.exe -s https://DOMENA/api/diag
```

Migracja zakończona sukcesem, gdy **wszystkie** punkty są spełnione:

| Sprawdzenie | Oczekiwane |
|---|---|
| `/api/diag` → `env.DATABASE_URL` | `✓ ustawiony — Neon (eu-central-1), pooled` |
| `/api/diag` → `database.status` | `✓ połączono` |
| `/api/diag` → `listings_total` | ≥ N z kroku 3 |
| `/api/sync` | `"ok": true`, `socialAnnounced` = 0 albo tylko faktycznie nowe oferty |
| `/api/diag` → `last_sync_at` | czas sprzed chwili (po kroku 8b) |
| `https://DOMENA/oferty` + 1 oferta | dane i zdjęcia widoczne |
| Neon Console → Monitoring | widać zapytania |
| Vercel → Logs (`/api/sync`) | brak błędów `DB read error` / `Upsert error` |

Kolejnego dnia rano sprawdź, że cron o 04:00 UTC przeszedł (Vercel → Logs) i `last_sync_at` się przesunął.

## 9. Całkowite odpięcie od Supabase (po ~7 dniach stabilnej pracy)

Po kroku 7 aplikacja już **nie łączy się z Supabase** — nie ma paczek `@supabase/*` ani klienta.
Supabase był potrzebny wyłącznie jako źródło danych dla skryptu kopiującego. Zostaje tylko posprzątać:

1. Vercel → Environment Variables → usuń `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
   (sprawdź też GitHub → repo → Settings → Secrets → Actions, czy nie ma tam `SUPABASE_*`).
2. `.env.local` → usuń `SUPABASE_*`.
3. Usuń z repo skrypt i tę instrukcję:
   ```powershell
   git rm scripts/migrate-supabase-to-neon.ts MIGRACJA-NEON.md
   git commit -m "chore: remove Supabase migration leftovers"
   git push origin main
   ```
4. (Opcjonalnie) Neon → **Branches** → *Create branch* `backup-po-migracji` — darmowy snapshot bazy.
5. Supabase → projekt → **Settings → General → Pause project**, a po kolejnym tygodniu
   **Delete project** (jeśli to jedyny projekt — można też usunąć organizację/konto).

Od tego momentu projekt nie ma żadnej zależności od Supabase.

## Rollback

Do kroku 7 — nic nie robić (produkcja wciąż na Supabase).
Po kroku 7 — Vercel → Deployments → poprzedni produkcyjny deploy → **Promote to Production**.
Stary kod czyta Supabase, który był tylko czytany, więc działa od razu (`SUPABASE_*` nie usuwaj przed krokiem 9).
Uwaga: oferty ogłoszone w Postfly w czasie pracy na Neon nie będą oznaczone w Supabase — po rollbacku
ustaw im ręcznie `social_post_synced_at` w Supabase (SQL Editor), inaczej pójdą ponownie.
