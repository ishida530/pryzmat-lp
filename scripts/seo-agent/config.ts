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
export const DEDUP_WINDOW_DAYS = 90;
export const ARTICLES_PER_RUN = 1;
