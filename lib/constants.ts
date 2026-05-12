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
  },
  phone: "+48503397360",
  phoneDisplay: "+48 503 397 360",
  email: "biuro@pryzmat.com.pl", // REPLACE with actual email
  website: "https://pryzmat.com.pl", // REPLACE with actual domain
  hours: {
    weekdays: "Pon–Pt: 9:00–17:00",
    saturday: "Sob: 10:00–14:00",
    sunday: "Niedz: zamknięte",
  },
  social: {
    facebook: "https://facebook.com/pryzmatnieruchomosci", // REPLACE with actual URL
  },
  areaServed: ["Barczewo", "Olsztyn", "powiat olsztyński"],
  yearsActive: 11,
  commission: "2,5%",
  stats: [
    { value: "11 lat", label: "doświadczenia na lokalnym rynku" },
    { value: "100%", label: "transakcji ubezpieczonych OC" },
    { value: "2,5%", label: "prowizja uczciwa i przejrzysta" },
    { value: "0 zł", label: "pomoc kredytowa dla klientów" },
  ],
} as const;

export type CompanyData = typeof COMPANY;
