import { COMPANY } from "../../../lib/constants";
import { GeneratedArticle, Location, Topic } from "./types";

export function buildSystemPrompt(): string {
  return `Jesteś doświadczonym doradcą w ${COMPANY.name} (${COMPANY.shortName}),
biurze nieruchomości z siedzibą w ${COMPANY.address.full}, działającym na terenie
${COMPANY.areaServed.join(", ")} (region ${COMPANY.address.region}).
Piszesz artykuły eksperckie w imieniu firmy — zawsze w pierwszej osobie liczby mnogiej
("pomagamy", "widzimy", "w naszej praktyce"), tonem rzeczowego lokalnego eksperta,
nigdy jako anonimowy portal poradnikowy.

Zasady obowiązkowe:
- Zero ogólników i lania wody — każdy akapit ma konkretną, użyteczną treść dla
  właściciela/kupującego nieruchomości w tym regionie.
- Nie wolno zmyślać przepisów prawa, stawek podatków, progów kwotowych ani statystyk.
  Jeśli podajesz liczbę lub przepis, musi być ogólnie znany i bezpieczny (np. nazwa
  podatku), a nie precyzyjna, świeżo wymyślona wartość.
- Artykuł kończy się blokiem "## Najczęstsze pytania" z 3–4 pytaniami (H3) i krótkimi,
  konkretnymi odpowiedziami.
- Długość: 1200–1600 słów.
- Format: Markdown, nagłówki H2 (##) dla sekcji głównych, H3 (###) dla podsekcji.
- Artykuł zaczyna się od pojedynczego nagłówka H1 (# Tytuł) będącego tytułem artykułu — ten H1
  jest używany wyłącznie do wyciągnięcia tytułu i nie trafia do opublikowanej treści.
- Na samym końcu artykułu, jako osobny, krótki akapit, dodaj zdanie ujawniające wspomaganie AI —
  dokładnie w tej formie (może być częścią dłuższego zdania, ale ta fraza musi wystąpić dosłownie):
  "szkic wspomagany AI, zweryfikowany przez zespół ${COMPANY.shortName}". Nigdy nie pomijaj
  tego zdania — to wymóg przejrzystości, nie sugestia.`;
}

const CTA_BY_PILLAR_ID: Record<Topic["pillar"]["id"], string> = {
  sprzedaz: "/oferty",
  najem: "/zarzadzanie-najmem",
  zakup: "/oferty",
  rynek_lokalny: "/oferty",
};

export function buildArticlePrompt(topic: Topic, location: Location): string {
  const cta = CTA_BY_PILLAR_ID[topic.pillar.id];

  const trustBlock = location.fullTrust
    ? `Ta lokalizacja (${location.name}) jest objęta pełnym zaufaniem redakcyjnym.
W treści MUSI pojawić się dokładnie jeden placeholder:
[PRZYKŁAD Z NASZEJ PRAKTYKI — uzupełnij]
w miejscu, gdzie naturalnie pasowałaby krótka anegdota z konkretnej transakcji/sprawy
obsłużonej przez biuro w ${location.name}. Nie wymyślaj treści tej anegdoty za redakcję —
sam placeholder wystarczy, redakcja uzupełni go ręcznie przed publikacją.`
    : `Dla lokalizacji ${location.name} NIE wolno twierdzić, że biuro zrealizowało tu
konkretną, nazwaną transakcję — pisz tonem regionalnego eksperta, który zna specyfikę
gminy, ale nie zmyśla historii klientów. Możesz opcjonalnie wstawić placeholder:
[opcjonalnie: jeśli mieliście tu transakcję, dodajcie przykład]
w miejscu pasującym do anegdoty — ale tylko jako opcję do ręcznego uzupełnienia, nigdy
jako opisaną historię.`;

  return `Napisz artykuł SEO na temat: "${topic.targetKeyword}".

Filar tematyczny: ${topic.pillar.label} (${topic.pillar.id}).
Lokalizacja: ${location.name}.
Słowo kluczowe do naturalnego wplecenia w treść (tytuł, wstęp, przynajmniej jeden
nagłówek H2): "${topic.targetKeyword}".

${trustBlock}

Na samym końcu artykułu, po bloku FAQ, wstaw dokładnie jeden wiersz z komponentem:
<PoradnikCTA href="${cta}" slug="{slug-artykułu}" />
(zamiast "{slug-artykułu}" użyj tego samego sluga, który poda ${"`generateMeta`"} — jeśli go
jeszcze nie znasz na tym etapie, zostaw dosłownie "{slug-artykułu}", redakcja/pipeline podmieni
to automatycznie). Nie opisuj tego wezwania do działania własnym zdaniem — sam komponent
wystarczy, nie dubluj go tekstem.`;
}

export function buildMetaPrompt(article: GeneratedArticle): string {
  return `Na podstawie poniższego artykułu wygeneruj metadane SEO w formacie JSON.

Wymagania:
- metaTitle: maksymalnie 60 znaków, zawiera słowo kluczowe "${article.targetKeyword}".
- metaDescription: maksymalnie 155 znaków, zachęca do kliknięcia, zawiera słowo
  kluczowe lub jego naturalny wariant.
- slug: kebab-case, wyłącznie znaki ASCII (a-z, 0-9, myślnik), bez polskich znaków
  diakrytycznych (ą→a, ć→c, ę→e, ł→l, ń→n, ó→o, ś→s, ź→z, ż→z), krótki i czytelny.

Tytuł artykułu: "${article.title}"

Treść artykułu (Markdown):
---
${article.content}
---`;
}
