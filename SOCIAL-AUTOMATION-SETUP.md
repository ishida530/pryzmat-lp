# Blog i social media (Postfly): stan i instrukcja

Aktualizacja: 25.09.2026.

## Jak to działa

1. **Artykuł.** Agent SEO (`npm run seo-agent` albo GitHub Actions, co poniedziałek) przechodzi przez pięć kroków:
   - **Research.** Claude szuka faktów w sieci, ale tylko w zaufanych domenach (`TRUSTED_SOURCE_DOMAINS` w `scripts/seo-agent/config.ts`: gov.pl, ISAP, GUS, NBP, olsztyn.eu i inne). Źródło, którego wyszukiwarka faktycznie nie zwróciła, oraz link do wyszukiwarki zamiast dokumentu są odrzucane.
   - **Artykuł.** Każdy przepis, stawka czy liczba musi pochodzić z listy faktów i mieć link. Do tego 2–3 linki wewnętrzne. Treść nie może opisywać usług spoza listy (`SERVICES` w `lib/constants.ts`).
   - **Fact-check.** Niezależny „redaktor” sprawdza artykuł i zgłasza błędy krytyczne oraz drobne. Poprawki robione są maksymalnie dwa razy. Jeśli błędy krytyczne nadal zostają, **PR nie powstaje**. Potem jest jeszcze runda szlifu drobnych uwag (gramatyka, odmiana frazy).
   - **Twarda blokada placeholderów** w kodzie.
   - **Sekcja „Źródła”** jest składana przez kod.
2. **PR i Telegram.** Na bota pryzmatu przychodzi podgląd z przyciskami „Zatwierdź i publikuj” / „Odrzuć”. Podgląd pokazuje też uwagi redaktora i ostrzeżenia SEO. Zatwierdzenie merguje PR, a artykuł pojawia się pod `/poradnik/{slug}`.
3. **Postfly.** Pryzmat wysyła zgłoszenie do `POST /api/external/content-intake`. Postfly pisze osobny post dla FB, IG i LinkedIn, tworzy szkic i wysyła go na Telegram Postfly („Publikuj” / „Anuluj”).
4. **Nowe oferty.** `/api/sync` (cron raz dziennie o 4:00 UTC) zgłasza nowe aktywne oferty:
   - maksymalnie 3 na jeden przebieg,
   - z pominięciem rezerwacji i lokali w inwestycjach,
   - z tytułem oczyszczonym z „SPRZEDAM”, CAPS oraz numerów budynku i działki.

### Zabezpieczenia postów (w Postfly, działają dla każdej firmy)
- Każda liczba w poście musi być w danych (oferta, artykuł, opis marki). Jeśli nie ma, model dostaje jedną poprawkę. Gdy dalej się nie zgadza, post nie powstaje.
- **Gdy AI jest niedostępne, post ofertowy nie powstaje.** Postfly zwraca 503, a pryzmat ponawia przy kolejnej synchronizacji. Dla artykułu powstaje prosty post zastępczy, ale tylko na FB i LinkedIn.
- Mechanika platform:
  - FB i LinkedIn: klikalny link w ostatniej linii, z UTM (`utm_source=facebook|instagram|linkedin`).
  - IG: bez URL, zamiast niego „link w bio”.
  - Limity hashtagów, a hashtag marki zawsze zostaje.
- Obrazek artykułu to grafika z tytułem (`/api/og?title=…`). Postfly konwertuje obrazki do JPEG, bo tak wymaga Instagram.

### Styl postów
- **Zasady PRYZMAT per platforma** są w `lib/social-style.ts`. Pryzmat wysyła je z każdym zgłoszeniem jako domyślne.
- **Ustawienia konta w Postfly** („Konto → Styl pisania na platformy”) mają pierwszeństwo. Po założeniu konta PRYZMAT wklej tam teksty z `lib/social-style.ts`.

## Konto PRYZMAT w Postfly (docelowo)
Postfly jest wielofirmowy: każde konto ma własne konta social, styl i **klucze integracji API**.
1. Załóż konto PRYZMAT w Postfly. W trybie `APP_MODE=personal` rejestracja jest zamknięta po pierwszym koncie, więc przełącz na `commercial` albo załóż konto przez admina.
2. W koncie PRYZMAT:
   - podłącz FB, IG i LinkedIn Pryzmatu,
   - połącz Telegram,
   - uzupełnij „Profil konta” i „Styl pisania na platformy”,
   - w „Integracje API” utwórz klucz.
3. W Vercelu (projekt `pryzmat-lp`) ustaw `EXTERNAL_CONTENT_SECRET` = ten klucz (`pfk_…`) i zrób redeploy. Od tej chwili szkice trafiają na konto PRYZMAT.

Do tego czasu działa wspólny sekret, a szkice trafiają na pierwsze (Twoje) konto Postfly.

## Konfiguracja (jednorazowo)
- **Zmienne w Vercelu (pryzmat):** `EXTERNAL_CONTENT_SECRET` i `POSTFLY_URL` są ustawione. Resztę (Anthropic, GitHub, Telegram), webhooki i sekrety Actions ustawia skrypt `finish-setup.ps1 -BotToken <token z @BotFather>`.
- **Bot Telegram pryzmatu:** osobny od bota Postfly (jeden bot = jeden webhook).
- **Migracja `0003_listings_social_sync.sql` w Supabase:** wykonana.
- **Kredyty Anthropic:** konto musi mieć środki. Bez nich agent bloga nie ruszy, a Postfly nie napisze postów.

## Testowanie
```
npm run seo-agent:dry-run   # research, artykuł i fact-check lokalnie, bez GitHuba (wynik: seo-agent-dry-run.md)
gh workflow run seo-agent.yml --repo ishida530/pryzmat-lp   # pełny przebieg: PR, Telegram, Postfly
```

## Otwarte sprawy biznesowe (do decyzji właściciela)
- Zgoda sprzedającego na publikację oferty w social media (klauzula w umowie pośrednictwa i flaga w CRM). Oferty z klauzulą dyskrecji wykluczyć.
- Wybór pierwszego zdjęcia do posta: bez osób, dokumentów i tablic rejestracyjnych.
- Reakcja na sprzedaż, wycofanie i zmianę ceny oferty (edycja lub usunięcie posta).
- „Bezpłatna pomoc kredytowa”: jeśli porównujecie oferty banków sami, potrzebny jest wpis do rejestru KNF. Jeśli robi to partner, trzeba to tak opisywać.
- Spójność NAP: e-maile w domenie marzdom.pl a marka PRYZMAT. Sprawdzić też godziny otwarcia z wizytówką Google.
- Na stronie „100% transakcji ubezpieczonych OC”: OC pośrednika jest obowiązkowe, więc przedstawianie go jako wyróżnika to ryzyko zarzutu praktyki wprowadzającej w błąd.
- Imienny redaktor zatwierdzający artykuły (AI Act art. 50 ust. 4, E-E-A-T).
