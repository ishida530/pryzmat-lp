import { Location, Pillar } from "./lib/types";

// fullTrust: true → obowiązkowy placeholder na anegdotę z praktyki biura.
// fullTrust: false → placeholder opcjonalny, ton "eksperta regionalnego"
// bez twierdzeń o konkretnych zrealizowanych transakcjach w tej lokalizacji.
export const LOCATIONS: Location[] = [
  { name: "Olsztyn", slug: "olsztyn", fullTrust: true },
  { name: "Barczewo", slug: "barczewo", fullTrust: true },
  { name: "Biskupiec", slug: "biskupiec", fullTrust: false },
  { name: "Dobre Miasto", slug: "dobre-miasto", fullTrust: false },
  { name: "Dywity", slug: "dywity", fullTrust: false },
  { name: "Gietrzwałd", slug: "gietrzwald", fullTrust: false },
  { name: "Jeziorany", slug: "jeziorany", fullTrust: false },
  { name: "Jonkowo", slug: "jonkowo", fullTrust: false },
  { name: "Kolno", slug: "kolno", fullTrust: false },
  { name: "Olsztynek", slug: "olsztynek", fullTrust: false },
  { name: "Purda", slug: "purda", fullTrust: false },
  { name: "Stawiguda", slug: "stawiguda", fullTrust: false },
  { name: "Świątki", slug: "swiatki", fullTrust: false },
];

// Rotacja naprzemienna 50/50 między grupą "sprzedaz-zakup" i "najem" — patrz topic-picker.ts.
export const PILLARS: Pillar[] = [
  {
    id: "sprzedaz",
    label: "sprzedaż nieruchomości",
    group: "sprzedaz-zakup",
  },
  {
    id: "najem",
    label: "zarządzanie najmem",
    group: "najem",
  },
  {
    id: "zakup",
    label: "zakup nieruchomości",
    group: "sprzedaz-zakup",
  },
  {
    id: "rynek_lokalny",
    label: "rynek nieruchomości",
    group: "najem",
  },
];

// Claude zamiast GPT-4o/mini (2026-09-23) — Sonnet do treści (jakość ma znaczenie, artykuł
// czytają realni klienci), Haiku do metadanych (ustrukturyzowany, prosty task JSON).
export const MODEL_CONTENT = "claude-sonnet-5";
export const MODEL_META = "claude-haiku-4-5-20251001";
// Weryfikacja faktów (2026-09-25): research i fact-check szukają WYŁĄCZNIE w tych domenach
// (subdomeny wliczone — "gov.pl" obejmuje isap.sejm.gov.pl, podatki.gov.pl, stat.gov.pl,
// biznes.gov.pl, knf.gov.pl, uokik.gov.pl, geoportal.gov.pl itd.). Każdy przepis, stawka, kwota
// i statystyka w artykule musi mieć źródło z tej listy — inaczej fact-check blokuje PR.
// Dopisuj tylko źródła urzędowe lub instytucjonalne, nigdy portale/blogi poradnikowe.
export const TRUSTED_SOURCE_DOMAINS = [
  "gov.pl", // administracja rządowa, ISAP (Dz.U.), GUS, KNF, UOKiK, KAS, geoportal
  "nbp.pl", // stopy procentowe, raporty o cenach nieruchomości
  "europa.eu", // prawo UE (EUR-Lex), dyrektywy
  "krn.org.pl", // Krajowa Rada Notarialna — taksa notarialna, procedury
  "zbp.pl", // Związek Banków Polskich — raporty AMRON-SARFiN
  "amron.pl", // ceny transakcyjne (ZBP)
  "bik.pl", // Biuro Informacji Kredytowej — raporty kredytowe
  "olsztyn.eu", // Urząd Miasta Olsztyn — MPZP, podatki lokalne, inwestycje
  "barczewo.pl", // Urząd Miejski w Barczewie
  "warmia.mazury.pl", // Urząd Marszałkowski — plany regionalne
];
export const MAX_RESEARCH_SEARCHES = 8;
export const MAX_FACT_CHECK_SEARCHES = 5;

export const DEDUP_WINDOW_DAYS = 90;
export const ARTICLES_PER_RUN = 1;
