# Blog + social media (Postfly): podsumowanie wdrożenia i instrukcja uruchomienia

Podsumowanie sesji z 23.09.2026 (EPIC 1–4). Po jej zakończeniu build i typecheck przeszły w obu repo: `postfly` i `pryzmat`.

## Co zostało zrobione

### Postfly
- Nowy endpoint `POST /api/external/content-intake`. Przyjmuje artykuł albo ofertę i przez Claude generuje treść posta oraz hashtagi osobno dla każdej platformy.
- Tworzy posty jako szkice (**DRAFT**) i wysyła podgląd na Telegram z przyciskami **Publikuj / Anuluj** (używa istniejącego bota).

### Pryzmat
- **SEO-agent** pisze artykuły przez Claude (`lib/anthropic-client.ts`, `scripts/seo-agent/lib/claude-client.ts`) zamiast GPT-4o.
- Zamiast zapisywać artykuł w Supabase, tworzy branch, plik `content/blog/{slug}.mdx` i Pull Request.
- **Bot Telegram** (`lib/telegram.ts`, wzorowany na code94) pokazuje podgląd artykułu z przyciskami **Zatwierdź / Odrzuć**.
- **Zatwierdzenie** merguje PR, artykuł pojawia się pod `/poradnik/{slug}` i od razu idzie wywołanie do Postfly (`lib/postfly-client.ts`).
- **`/api/sync` (Asari)**:
  - odróżnia nową ofertę od zmienionej,
  - pomija dzieci inwestycji,
  - zgłasza nowe aktywne oferty do Postfly i ponawia próbę przy błędzie.
  - Wymaga migracji `supabase/migrations/0003_listings_social_sync.sql`.

### Świadomie odłożone na później
- Przypomnienie na Telegramie o szkicach niezatwierdzonych dłużej niż X godzin.
- LinkedIn jako strona firmowa (na razie tylko profil osobisty i tylko dla bloga).
- TikTok (poza zakresem).

---

## Krok 0: bez tego reszta nie zadziała

Podłącz konta social w Postfly (strona na Facebooku, Instagram Business, profil LinkedIn) i przejdź **Meta App Review**. Dopóki go nie ma, Postfly publikuje tylko na kontach testowych.

---

## Zmienne środowiskowe

### `postfly/.env` (Vercel + lokalnie)

| Zmienna | Skąd wziąć |
|---|---|
| `EXTERNAL_CONTENT_SECRET` | Wygeneruj sam (`openssl rand -hex 32`). Musi być **identyczny** jak w pryzmacie. |
| `ANTHROPIC_API_KEY` | Prawdopodobnie już ustawiony. |
| `BLOB_READ_WRITE_TOKEN` | Prawdopodobnie już ustawiony (Vercel Blob). |

### `pryzmat/.env.local` (i Vercel)

| Zmienna | Skąd wziąć |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `TELEGRAM_BOT_TOKEN` | Nowy bot przez @BotFather albo istniejący, jeśli oba zatwierdzenia mają iść przez jednego bota. |
| `TELEGRAM_CHAT_ID` | Twój numeryczny chat id, np. z @userinfobot. |
| `TELEGRAM_WEBHOOK_SECRET` | Wygeneruj sam. Ten sam ciąg podajesz w `setWebhook`. |
| `GITHUB_TOKEN` | Fine-grained PAT tylko do repo `ishida530/pryzmat-lp`, z uprawnieniami Contents (R/W) i Pull requests (R/W). |
| `GITHUB_WEBHOOK_SECRET` | Wygeneruj sam. Ten sam ciąg wpisujesz w GitHub → Settings → Webhooks. |
| `GITHUB_REPO_OWNER` | `ishida530` |
| `GITHUB_REPO_NAME` | `pryzmat-lp` |
| `POSTFLY_URL` | Adres wdrożenia Postfly, bez `/` na końcu. |
| `EXTERNAL_CONTENT_SECRET` | **Identyczny** jak w Postfly. |

### Sekrety GitHub Actions (repo pryzmatu → Settings → Secrets → Actions)
- `ANTHROPIC_API_KEY`
- `GITHUB_TOKEN_PAT`: ten sam PAT co wyżej. Workflow celowo używa PAT-a, a nie wbudowanego `GITHUB_TOKEN`; uzasadnienie jest w komentarzu w `.github/workflows/seo-agent.yml`.

### Webhooki (jednorazowo, ręcznie)
- **GitHub → Settings → Webhooks → Add**
  - Payload URL: `https://www.pryzmatnieruchomosci.pl/api/telegram/pr-notify`
  - Content type: `application/json`
  - Secret: `GITHUB_WEBHOOK_SECRET`
  - Events: tylko **Pull requests**
- **Telegram `setWebhook`**:
  ```
  curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://www.pryzmatnieruchomosci.pl/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
  ```

---

## Jak przetestować

### 1. Postfly (Docker musi być uruchomiony)
```
npm run docker:up
npx prisma db push        # albo migrate deploy; doda pola sourceKind/sourceRef
npx vitest run tests/api/external-content-intake.test.ts   # oczekiwane 7/7 zaliczonych
```

### 2. Pryzmat: build i typy
```
npm install
npm run build
```

### 3. Przeniesienie artykułów z Supabase do MDX (jednorazowo, po uzupełnieniu `.env.local`)
```
npm run export-articles
```
Sprawdź wygenerowane pliki w `content/blog/`, potem zrób commit i push **bezpośrednio na main**. To import istniejących artykułów, więc nie idzie przez PR.

### 4. Cały flow bloga
```
npm run seo-agent   # albo workflow_dispatch w GitHub Actions
```
Oczekiwany przebieg:
1. Powstaje PR `blog/{slug}`.
2. Na Telegram przychodzi podgląd z przyciskami.
3. Klikasz **Zatwierdź**, PR się merguje i przychodzi „✅ Opublikowano”.
4. W logach Vercela pryzmatu widać wywołanie do Postfly.
5. W Postfly (panel albo Telegram) pojawia się nowy szkic posta.

### 5. Flow nowej oferty
Dodaj nową ofertę w Asari albo poczekaj, aż się pojawi. Potem poczekaj do 30 minut na `/api/sync` albo uruchom go ręcznie:
```
POST /api/sync
Authorization: Bearer <CRON_SECRET>
```
W Postfly lub na Telegramie powinien pojawić się szkic ze zdjęciem, ceną i linkiem.

### 6. Brak duplikatów
Uruchom `/api/sync` drugi raz z rzędu. Drugie zgłoszenie tej samej oferty **nie** powinno przyjść.

---

## Historia
- **26–27.08.2026**: pierwsza wersja SEO-agenta (GPT-4o, zapis do tabeli `articles` w Supabase, migracja `0002_articles.sql`, plan w `scripts/seo-agent/TASKS.md`).
- **23.09.2026**: przejście na Claude i wzorzec code94 (MDX + PR + zatwierdzanie na Telegramie) oraz integracja z Postfly dla bloga i ofert z Asari.
