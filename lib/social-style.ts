// Zasady pisania postów PRYZMAT per platforma (2026-09-25) — przygotowane z copywriterem social
// media dla nieruchomości (algorytmy FB/IG/LinkedIn 2025–2026, polskie realia) i poprawione po
// przeglądzie właściciela. Wysyłane do Postfly z każdym zgłoszeniem (lib/postfly-client.ts) jako
// DOMYŚLNE: jeśli konto PRYZMAT w Postfly ma własne zasady w panelu "Konto → Styl pisania na
// platformy", to one mają pierwszeństwo — te teksty można tam po prostu wkleić. Liczby i tak pilnuje
// Postfly (odrzuca posty z liczbami spoza danych), a tytuł oferty czyści sanitizeListingTitle.
import { COMPANY } from "./constants";

export const BRAND_HASHTAG = "#pryzmatnieruchomosci";
export const SITE_LABEL = "pryzmatnieruchomosci.pl";

const COMMON = [
  "Pisz jako rzeczowy lokalny ekspert z Barczewa, działający w Olsztynie i powiecie olsztyńskim — nie jak sprzedawca.",
  "Formę zwracania się określa sekcja platformy; w obrębie posta nie mieszaj form.",
  "Ceny jako \"489 000 zł\", metraż jako \"62 m²\". Nazwy osiedli podawaj tylko wtedy, gdy są w danych.",
  "Nie podawaj numeru budynku ani lokalu, numeru działki ewidencyjnej, nazwiska właściciela ani piętra w połączeniu z adresem — lokalizacja najwyżej do poziomu ulicy/osiedla i miejscowości.",
  "Nie kopiuj tytułu oferty z CRM: \"sprzedam/wynajmę\" zamieniaj na \"na sprzedaż/do wynajęcia\" (to biuro publikuje, nie właściciel), CAPS na zwykłą pisownię.",
  "Nigdy: \"Mamy przyjemność zaprezentować\", \"OKAZJA\", \"Hit\", \"Nie przegap\", CAPS LOCK, wielokrotne wykrzykniki, obietnice rezultatu; nie przedstawiaj OC pośrednika jako wyróżnika.",
  "Hashtagi bez polskich znaków (#nieruchomosciolsztyn), bez ogólnoświatowych (#realestate) i tagów-okazji (#okazja).",
].join("\n");

const LISTING_HEADLINE =
  "<Typ> <liczba pokoi>-pokojowe na sprzedaż, <miejscowość>[, <osiedle/ulica bez numeru>] — <metraż> m², <cena> zł (tylko wartości z danych; brakującą pomiń)";

export const PLATFORM_GUIDES = {
  FACEBOOK: [
    COMMON,
    "Forma bezosobowa albo \"Państwo\".",
    "ARTYKUŁ: 400–700 znaków. Hook (do 120 znaków) z problemem i miejscowością, potem 2–3 krótkie akapity albo lista 3 punktów „co wyjaśniamy w poradniku” (tylko z tytułu i opisu), na końcu „Pełny poradnik: <URL>”. Emoji 0–2 (📌, 👉), nigdy w hooku. Hashtagi 0–3.",
    `OFERTA: 400–800 znaków. Pierwsza linia według wzoru: ${LISTING_HEADLINE}. Potem 3–5 punktów z cechami wyłącznie z danych, z emoji-znacznikami 📍📐💰🏠 (2–4 łącznie, bez 🔥🚨). Przedostatnia linia: „Kontakt: ${COMPANY.phoneDisplay}”. Ostatnia: „Szczegóły i pełna galeria: <URL>”. Hashtagi 0–3: #<typ><miejscowość> bez polskich znaków i marka.`,
  ].join("\n"),
  INSTAGRAM: [
    COMMON,
    "Forma bezosobowa albo \"Państwo\". Link w opisie nie jest klikalny — nigdy nie wklejaj URL, pisz „link w bio → pryzmatnieruchomosci.pl”.",
    "ARTYKUŁ: 500–900 znaków, krótkie linie, pierwsza linia ze słowami kluczowymi tematu i miejscowości. Daj 2–3 wnioski z opisu artykułu (📌 na początku linii), potem CTA do linku w bio, opcjonalnie „Zapisz na później”.",
    `OFERTA: 400–700 znaków. Pierwsza linia według wzoru: ${LISTING_HEADLINE}. Potem 3–4 linie cech z danych z 📍📐💰, na końcu link w bio, „Kontakt: ${COMPANY.phoneDisplay}” i zaproszenie do wiadomości prywatnej.`,
    "Hashtagi 3–5 (limit Instagrama to 5): 1–2 lokalne (miejscowość, #warmia), 1–2 tematyczne (#sprzedazmieszkania, #mieszkanienasprzedaz), marka.",
  ].join("\n"),
  LINKEDIN: [
    COMMON,
    "Posty idą z profilu osobistego właściciela biura: pisz w 1. osobie liczby pojedynczej („pracuję”, „widzę”), rejestrem biznesowym, bez emoji i bez żargonu sprzedażowego. Odbiorcy: inwestorzy, przedsiębiorcy, doradcy, zamożniejsi sprzedający.",
    "ARTYKUŁ: 900–1500 znaków. Otwórz obserwacją z praktyki albo tezą (bez zmyślonych historii klientów i liczb), potem 3–4 punkty wiedzy z opisu artykułu (lista z „→”), krótka rada eksperta, jedno merytoryczne pytanie do dyskusji. Krótkie akapity po 1–2 zdania. Ostatnia linia: „Pełny poradnik: <URL>”.",
    "Bez engagement baitu („Napisz TAK”). Hashtagi 0–3, rzeczowe (#nieruchomosci #Olsztyn).",
  ].join("\n"),
} as const;

// Tytuły ofert w ASARI to często "SPRZEDAM DZIAŁKĘ - GADY" albo "mieszkanie - Mickiewicza 52 -
// Barczewo": pierwsza osoba właściciela, CAPS, numer budynku (pozwala ominąć biuro przez KW/
// geoportal i narusza prywatność właściciela). Postfly dostaje wersję oczyszczoną.
//
// Regexy przez new RegExp: tsconfig celuje w ES5, który nie przepuszcza flagi "u" w literałach,
// a klasy Unicode (\p{L}) są potrzebne dla polskich liter — \b w JS nie widzi granicy po "Ę".
const PARCEL_NUMBER = new RegExp("\\b(?:działk\\p{Ll}*\\s+)?nr\\.?\\s*\\d+(?:\\/\\d+)?", "giu");
const STREET_NUMBER = new RegExp(
  "\\b(\\p{Lu}\\p{Ll}+(?:\\s\\p{Lu}\\p{Ll}+)?)\\s+\\d+[A-Za-z]?(?:\\/\\d+)?\\b(?!\\s*(?:-?\\s*pok|m\\b|m²|m2|zł))",
  "gu"
);
const NON_LETTERS = new RegExp("[^\\p{L}]", "gu");
const SPRZEDAM = new RegExp("(?<!\\p{L})sprzedam(?!\\p{L})", "giu");
const WYNAJME = new RegExp("(?<!\\p{L})wynajm[ęe](?!\\p{L})", "giu");

// Usuwa numer działki/lokalu ("nr 134/2") i numer budynku po nazwie ulicy ("Mickiewicza 52" →
// "Mickiewicza"); nie rusza "Jaroty 3 pokoje" ani "Olsztyn 62 m²". Dla tytułu i opisu oferty.
export function stripAddressNumbers(text: string): string {
  return text
    .replace(PARCEL_NUMBER, (m) => (/^działk/i.test(m) ? m.split(/\s+/)[0] : ""))
    .replace(STREET_NUMBER, "$1");
}

export function sanitizeListingTitle(title: string): string {
  // CAPS LOCK → małe litery, zanim cokolwiek podmienimy (inaczej "na sprzedaż" psuje detekcję).
  const letters = title.replace(NON_LETTERS, "");
  let t = letters && letters === letters.toUpperCase() ? title.toLocaleLowerCase("pl-PL") : title;
  t = stripAddressNumbers(t)
    .replace(SPRZEDAM, "na sprzedaż")
    .replace(WYNAJME, "do wynajęcia")
    .replace(/\s*[-–—]\s*/g, " – ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return t.charAt(0).toLocaleUpperCase("pl-PL") + t.slice(1);
}
