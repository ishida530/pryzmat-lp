const foundingYear = 2015;

export const COMPANY = {
  name: "Biuro Nieruchomości PRYZMAT",
  shortName: "PRYZMAT",
  tagline: "Biuro Nieruchomości",
  address: {
    street: "Barczewko 126B",
    city: "Barczewo",
    postalCode: "11-010",
    region: "warmińsko-mazurskie",
    country: "PL",
    full: "Barczewko 126B, 11-010 Barczewo",
    geoLat: 53.8267,
    geoLng: 20.6898,
  },
  phone: "+48503397360",
  phoneDisplay: "+48 503 397 360",
  email: "biuro@marzdom.pl",
  formEmail: "kontakt@marzdom.pl",
  website: "https://www.pryzmatnieruchomosci.pl",
  hours: {
    weekdays: "Pon–Pt: 9:00–20:00",
    saturday: "Sob: 10:00–15:00",
    sunday: "Niedz: 9:00-16:00",
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=100063543072260",
  },
  areaServed: ["Barczewo", "Olsztyn", "powiat olsztyński"],
  foundingYear,
  yearsActive: new Date().getFullYear() - foundingYear,
  commission: "2,5%",
  stats: [
    { value: `${new Date().getFullYear() - foundingYear} lat`, label: "doświadczenia na lokalnym rynku" },
    { value: "100%", label: "transakcji ubezpieczonych OC" },
    { value: "2,5%", label: "prowizja uczciwa i przejrzysta" },
    { value: "0 zł", label: "pomoc kredytowa dla klientów" },
  ],
};

export type CompanyData = typeof COMPANY;

// Jedyne źródło prawdy o tym, czym zajmuje się biuro — dla treści generowanych przez AI (agent SEO,
// fact-check, posty social w Postfly). Treść ma trzymać się tych usług i regionu; wszystko spoza
// tej listy (np. "wyceny rzeczoznawcze", "inwestycje za granicą") fact-check traktuje jako błąd.
export const SERVICES = [
  "pośrednictwo w sprzedaży nieruchomości (mieszkania, domy) — od analizy cen i marketingu po transakcję notarialną",
  "pośrednictwo w kupnie nieruchomości",
  "wynajem mieszkań — pozyskanie i weryfikacja najemców, umowy najmu chroniące właściciela",
  "zarządzanie najmem — najemcy, płatności, awarie i naprawy, miesięczne rozliczenia",
  "obrót działkami budowlanymi, rolnymi i inwestycyjnymi",
  "bezpłatna pomoc kredytowa — porównanie ofert banków",
  "przygotowanie dokumentów do transakcji (umowy przedwstępne, księgi wieczyste, zaświadczenia)",
];

export const BRAND_CONTEXT = [
  `${COMPANY.name} — rodzinne biuro nieruchomości z ${COMPANY.address.city} (od ${foundingYear} r.),`,
  `działające w: ${COMPANY.areaServed.join(", ")} (woj. ${COMPANY.address.region}).`,
  `Usługi: ${SERVICES.join("; ")}.`,
  // OC pośrednika jest obowiązkowe (art. 181 ugn) i nie ubezpiecza transakcji — nie może być
  // pokazywane jako wyróżnik (art. 7 pkt 10 upnpr), więc AI dostaje neutralne sformułowanie.
  "Biuro działa z obowiązkowym ubezpieczeniem OC pośrednika w obrocie nieruchomościami (nie przedstawiaj tego jako wyróżnika).",
  `Kontakt: ${COMPANY.phoneDisplay}, ${COMPANY.website}.`,
  "Ton: profesjonalny, rzeczowy, lokalny ekspert z Barczewa; bez przesady i bez obietnic rezultatu.",
].join(" ");
