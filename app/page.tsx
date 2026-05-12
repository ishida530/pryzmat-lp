import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Services } from "@/components/sections/Services";
import { Stats } from "@/components/sections/Stats";
import { NajemCTA } from "@/components/sections/NajemCTA";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { About } from "@/components/sections/About";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Biuro Nieruchomości Barczewo i Olsztyn | PRYZMAT",
  description:
    "Biuro nieruchomości PRYZMAT — sprzedaż, wynajem i zarządzanie w Barczewie i Olsztynie. 11 lat doświadczenia, prowizja 2,5%, bezpłatna wycena.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Biuro Nieruchomości PRYZMAT — Barczewo, Olsztyn" }],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "RealEstateAgent"],
  name: COMPANY.name,
  description: `Rodzinne biuro nieruchomości z ${COMPANY.yearsActive}-letnim doświadczeniem w Barczewie i Olsztynie. Sprzedaż, wynajem i zarządzanie nieruchomościami.`,
  image: `${COMPANY.website}/opengraph-image`,
  logo: `${COMPANY.website}/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY.address.street,
    addressLocality: COMPANY.address.city,
    postalCode: COMPANY.address.postalCode,
    addressRegion: COMPANY.address.region,
    addressCountry: COMPANY.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 53.8267,
    longitude: 20.6898,
  },
  telephone: COMPANY.phone,
  email: COMPANY.email,
  url: COMPANY.website,
  sameAs: [COMPANY.social.facebook],
  areaServed: [
    { "@type": "City", name: "Barczewo" },
    { "@type": "City", name: "Olsztyn" },
    { "@type": "AdministrativeArea", name: "powiat olsztyński" },
  ],
  priceRange: COMPANY.commission,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "3",
    bestRating: "5",
    worstRating: "1",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "14:00",
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <Hero />
      <TrustBar />
      <Services />
      <Stats />
      <AnimateIn animation="fade-in" threshold={0.08}>
        <NajemCTA />
      </AnimateIn>
      <About />
      <Testimonials />
      <Contact />
    </>
  );
}
