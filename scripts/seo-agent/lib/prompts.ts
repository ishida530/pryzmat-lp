import { BRAND_CONTEXT, COMPANY, SERVICES } from "../../../lib/constants";
import { GeneratedArticle, Location, ReviewIssue, SourcedFact, Topic } from "./types";

export function buildSystemPrompt(): string {
  return `Jesteś doświadczonym doradcą w ${COMPANY.name} (${COMPANY.shortName}),
biurze nieruchomości z siedzibą w ${COMPANY.address.full}, działającym na terenie
${COMPANY.areaServed.join(", ")} (region ${COMPANY.address.region}).
Piszesz artykuły eksperckie w imieniu firmy — zawsze w pierwszej osobie liczby mnogiej
("pomagamy", "widzimy", "w naszej praktyce"), tonem rzeczowego lokalnego eksperta,
nigdy jako anonimowy portal poradnikowy.

Biuro świadczy WYŁĄCZNIE te usługi: ${SERVICES.join("; ")}.
Nie opisuj czynności biura szerzej niż ta lista (także w formie "pomagamy/zajmujemy się…").
Zabronione bez wyraźnego wpisu na liście: wycena rzeczoznawcza, doradztwo podatkowe i prawne,
weryfikacja finansowa lub zdolności kredytowej kupujących, profesjonalna sesja zdjęciowa, home
staging, przejmowanie obowiązków podatkowych lub pilnowanie terminów urzędowych klienta.
Obowiązki podatkowe (PIT, PCC, deklaracje, terminy) zawsze opisuj jako obowiązek klienta, nigdy
biura. Nie przedstawiaj ubezpieczenia OC pośrednika jako wyróżnika ani jako "ubezpieczenia
transakcji" — to obowiązek ustawowy. Nie opisuj działalności poza regionem. Nie wymyślaj historii
klientów ani transakcji biura. Temat prowadź tak, żeby był użyteczny dla klienta tych usług.

Zasady obowiązkowe:
- Zero ogólników i lania wody — każdy akapit ma konkretną, użyteczną treść dla
  właściciela/kupującego nieruchomości w tym regionie.
- Każdy przepis prawa, stawka, kwota, próg, termin ustawowy, statystyka i cena MUSI pochodzić
  z dostarczonej listy zweryfikowanych faktów i mieć przy sobie link Markdown do jej źródła,
  np. "podatek wynosi 19% ([Ustawa o PIT, isap.sejm.gov.pl](https://...))". Nie wolno podawać
  takich wartości z pamięci ani linkować do stron spoza tej listy. Jeśli fakt jest potrzebny,
  a nie ma go na liście, opisz rzecz jakościowo i odeślij do źródła urzędowego lub doradcy
  (notariusz, doradca podatkowy) zamiast podawać liczbę.
- Nie formułuj indywidualnych porad prawnych ani podatkowych ("w Twoim przypadku nie zapłacisz
  podatku") — opisuj zasady ogólne i zaznacz, kiedy warto skonsultować sprawę ze specjalistą.
- Jeśli artykuł dotyka prawa lub podatków, dodaj przed blokiem FAQ jednozdaniowe zastrzeżenie,
  że tekst ma charakter informacyjny, nie stanowi porady prawnej ani podatkowej, i podaj datę
  stanu prawnego: ${new Date().toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}.
- Dane ogólnopolskie (np. GUS) opisuj jako ogólnopolskie — nie wyciągaj z nich wniosków,
  prognoz ani ocen rynku lokalnego ("rynek w Olsztynie jest bardziej wymagający", "zwiększa pulę
  kupujących w Olsztynie"), jeśli nie ma na to faktu z listy.
- Używaj tylko faktów, które dotyczą czytelnika z tematu artykułu. Pomiń fakty z listy dotyczące
  innej grupy (np. osób prawnych, obszarów rewitalizacji, budowli), zamiast je naciągać.
- Słowo kluczowe wplataj w poprawnej, odmienionej formie ("sprzedaż mieszkania w Olsztynie",
  "sprzedając mieszkanie w Olsztynie"). Nigdy nie wstawiaj frazy nieodmienionej w środek zdania
  ani nagłówka. Tekst ma być bezbłędny gramatycznie — czyta go wymagający klient.
- Artykuł kończy się blokiem "## Najczęstsze pytania" z 3–4 pytaniami (H3) i krótkimi,
  konkretnymi odpowiedziami.
- Długość: 1200–1600 słów.
- Format: Markdown, nagłówki H2 (##) dla sekcji głównych, H3 (###) dla podsekcji.
- Artykuł zaczyna się od pojedynczego nagłówka H1 (# Tytuł) będącego tytułem artykułu — ten H1
  jest używany wyłącznie do wyciągnięcia tytułu i nie trafia do opublikowanej treści.`;
  // 2026-09-25: bez zdania "szkic wspomagany AI" — każdy artykuł przechodzi przegląd i zatwierdzenie
  // człowieka (Telegram → merge), a strona pokazuje odpowiedzialność redakcyjną (podpis zespołu),
  // co wg art. 50 ust. 4 AI Act zwalnia z obowiązku oznaczania tekstu.
}

const CTA_BY_PILLAR_ID: Record<Topic["pillar"]["id"], string> = {
  sprzedaz: "/oferty",
  najem: "/zarzadzanie-najmem",
  zakup: "/oferty",
  rynek_lokalny: "/oferty",
};

function formatFacts(facts: SourcedFact[]): string {
  if (facts.length === 0) {
    return "(brak zweryfikowanych faktów — NIE podawaj żadnych konkretnych przepisów, stawek, kwot ani statystyk)";
  }
  return facts
    .map((f, i) => `${i + 1}. ${f.claim}\n   Źródło: [${f.sourceTitle}](${f.sourceUrl})\n   Cytat: "${f.quote}"`)
    .join("\n");
}

export function buildResearchPrompt(topic: Topic, location: Location, today: string): string {
  return `Przygotowujemy artykuł ekspercki na temat: "${topic.targetKeyword}"
(filar: ${topic.pillar.label}, lokalizacja: ${location.name}, woj. warmińsko-mazurskie). Dzisiaj jest ${today}.

Twoje zadanie to WYŁĄCZNIE research, nie pisanie artykułu. Użyj wyszukiwarki, żeby zebrać
5–12 konkretnych, aktualnych faktów, których autor może potrzebować: przepisy (ustawa + artykuł),
stawki podatków i opłat, progi kwotowe, terminy, procedury urzędowe, oficjalne statystyki, lokalne
informacje z urzędów gmin (np. plany miejscowe, podatki lokalne).

Zasady:
- Każdy fakt musi być potwierdzony stroną, którą faktycznie otworzyła wyszukiwarka w tej rozmowie.
  Podaj jej dokładny URL, tytuł i krótki dosłowny cytat potwierdzający fakt.
- Sprawdzaj aktualność: preferuj teksty jednolite ustaw i dane z bieżącego lub poprzedniego roku.
  Jeśli przepis mógł się zmienić, wyszukaj najnowszą wersję. Faktów niepewnych nie zgłaszaj.
- W każdym fakcie z liczbą podaj, jakiego okresu lub stanu prawnego dotyczy. Dla statystyk szukaj
  najnowszego opublikowanego okresu.
- W pierwszej kolejności szukaj obowiązków, terminów i zwolnień, które czytelnik tematu realnie
  musi dopełnić (deklaracje, terminy, dokumenty) — nie faktów dotyczących innych grup.
- URL musi prowadzić do konkretnego dokumentu lub strony z informacją — nigdy do wyszukiwarki,
  listy wyników ani strony głównej. Przepisy cytuj z ISAP (isap.sejm.gov.pl) lub serwisu
  ministerstwa/podatki.gov.pl. Strony samorządów (samorzad.gov.pl, BIP) tylko dla faktów o gminie
  z artykułu albo gminach powiatu olsztyńskiego — nie o innych gminach w Polsce.
- Lepiej zgłosić mniej faktów niż jeden niepewny.

Na koniec wywołaj narzędzie submit_facts z listą faktów.`;
}

export type InternalLink = { title: string; path: string };

export function buildArticlePrompt(
  topic: Topic,
  location: Location,
  facts: SourcedFact[],
  internalLinks: InternalLink[]
): string {
  const cta = CTA_BY_PILLAR_ID[topic.pillar.id];
  const linkList = internalLinks.map((l) => `- [${l.title}](${l.path})`).join("\n");

  // 2026-09-25 (przegląd prezesa): bez placeholderów "[PRZYKŁAD… — uzupełnij]" — zatwierdzenie
  // idzie z Telegrama, gdzie nie ma jak ich uzupełnić, więc trafiłyby na stronę. index.ts ma
  // twardą blokadę na każdy pozostały placeholder.
  const trustBlock = `Nie opisuj konkretnych transakcji ani klientów biura i nie wstawiaj żadnych
placeholderów w nawiasach kwadratowych. Pisz tonem regionalnego eksperta, który zna specyfikę
${location.name} i okolic — konkret ma wynikać z procedur, faktów z listy i praktycznych wskazówek.`;

  return `Napisz artykuł SEO na temat: "${topic.targetKeyword}".

Filar tematyczny: ${topic.pillar.label} (${topic.pillar.id}).
Lokalizacja: ${location.name}.
Słowo kluczowe do naturalnego wplecenia w treść (tytuł, wstęp, przynajmniej jeden
nagłówek H2): "${topic.targetKeyword}".

${trustBlock}

Zweryfikowane fakty (jedyne dozwolone źródło przepisów, stawek, kwot i statystyk; linkuj źródło
przy każdym użyciu, inne zewnętrzne linki są zabronione — linki wewnętrzne do
${COMPANY.website} są dozwolone):
${formatFacts(facts)}

Linkowanie wewnętrzne (SEO + ruch na stronie): w treści umieść 2–3 naturalne linki Markdown do
stron z poniższej listy — tylko tam, gdzie realnie pomagają czytelnikowi (np. przy wzmiance o
zarządzaniu najmem link do tej usługi, przy temacie pokrewnym link do innego artykułu). Używaj
dokładnie tych ścieżek, nie wymyślaj innych:
${linkList}

Pisz tak, żeby artykuł był naprawdę wartościowy: konkretne kroki, listy kontrolne, typowe błędy
i jak ich uniknąć, lokalny kontekst — czytelnik ma dostać odpowiedź lepszą niż w ogólnym portalu.

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

export function buildFactCheckSystemPrompt(): string {
  return `Jesteś niezależnym redaktorem merytorycznym ${COMPANY.shortName}. Sprawdzasz artykuł
przed publikacją pod kątem rzetelności. Nie jesteś autorem i nie bronisz tekstu — twoim zadaniem
jest znaleźć wszystko, co mogłoby narazić biuro na zarzut publikowania nieprawdy lub porad
wprowadzających w błąd.`;
}

export function buildFactCheckPrompt(article: string, facts: SourcedFact[], today: string): string {
  return `Dzisiaj jest ${today}. Sprawdź poniższy artykuł biura nieruchomości.

Opis biura (jedyne dozwolone usługi i region): ${BRAND_CONTEXT}

Lista zweryfikowanych faktów, na których autor miał się opierać:
${formatFacts(facts)}

Zgłoś jako "blocker":
- każdy przepis, stawkę, kwotę, próg, termin, statystykę lub cenę, której NIE ma na liście faktów
  albo która jest z nią sprzeczna, albo przy której brakuje linku do źródła;
- twierdzenie, które jest nieaktualne lub fałszywe (możesz to sprawdzić wyszukiwarką);
- indywidualną poradę prawną/podatkową albo obietnicę rezultatu ("sprzedamy w 30 dni",
  "nie zapłacisz podatku");
- zmyśloną historię klienta lub transakcji oraz każdy placeholder w nawiasach kwadratowych;
- link zewnętrzny do strony spoza listy faktów albo link do wyszukiwarki/listy wyników zamiast
  konkretnego dokumentu, źródło z samorządu spoza powiatu olsztyńskiego;
- czynność biura nieobecna na liście usług (także w formie "pomagamy/zajmujemy się…"), sugestię,
  że biuro przejmuje obowiązki podatkowe lub terminy klienta, OC przedstawione jako wyróżnik,
  treść nieadekwatna do działalności biura (np. inny region, temat niezwiązany z nieruchomościami);
- wniosek, prognozę lub ocenę rynku lokalnego (Olsztyn, Barczewo, gmina) wyciągniętą z danych
  ogólnopolskich albo niepopartą faktem z listy;
- statystykę, dla której u tego samego źródła jest już nowszy opublikowany okres;
- fakt dotyczący innej grupy niż czytelnik tematu, podany tak, jakby dotyczył czytelnika.
Zgłoś jako "minor": nieprecyzyjne sformułowania, brak zastrzeżenia przy temacie prawnym,
uproszczenia mogące zmylić czytelnika, każdy błąd gramatyczny, fleksyjny lub ortograficzny oraz
nienaturalnie (nieodmienione) wstawioną frazę kluczową — podważają wiarygodność biura.

Nie oceniaj stylu ani optymalizacji SEO poza powyższym. Dla każdego problemu podaj dosłowny
fragment, opis i konkretną poprawkę. Jeśli artykuł jest rzetelny, zgłoś pustą listę. Wynik
przekaż narzędziem submit_review.

Artykuł:
---
${article}
---`;
}

export function buildRevisionPrompt(article: string, issues: ReviewIssue[], facts: SourcedFact[]): string {
  const list = issues
    .map((i, n) => `${n + 1}. [${i.severity}] "${i.excerpt}"\n   Problem: ${i.problem}\n   Poprawka: ${i.fix}`)
    .join("\n");
  return `Redaktor merytoryczny zgłosił problemy w artykule. Popraw WSZYSTKIE, zmieniając tylko
wskazane fragmenty (resztę zostaw bez zmian). Jeśli fakt nie ma potwierdzenia na liście, usuń
konkretną wartość i opisz rzecz jakościowo. Zwróć CAŁY poprawiony artykuł w Markdown, zaczynając
od "# Tytuł", z zachowaniem komponentu <PoradnikCTA ... />.

Zgłoszone problemy:
${list}

Zweryfikowane fakty:
${formatFacts(facts)}

Artykuł:
---
${article}
---`;
}
