import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { ContactPageForm } from "@/components/forms/ContactPageForm";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = createMetadata(
  "Kontakt — biuro nieruchomości Barczewo i Olsztyn",
  "Skontaktuj się z biurem nieruchomości PRYZMAT w Barczewie. Telefon, e-mail, formularz kontaktowy. Bezpłatna wycena nieruchomości.",
  "/kontakt"
);

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Kontakt — Biuro Nieruchomości PRYZMAT Barczewo i Olsztyn",
  description:
    "Formularz kontaktowy, telefon i adres biura nieruchomości PRYZMAT w Barczewie. Odpowiadamy w ciągu 2 godzin.",
  url: `${COMPANY.website}/kontakt`,
  mainEntity: {
    "@type": "LocalBusiness",
    name: COMPANY.name,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      postalCode: COMPANY.address.postalCode,
      addressCountry: "PL",
    },
  },
};

export default function KontaktPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />

      {/* Header */}
      <section className="bg-brand-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3">
            KONTAKT
          </p>
          <h1 className="text-4xl font-extrabold text-white mb-3">
            Kontakt z biurem nieruchomości{" "}
            <span className="text-blue-300">PRYZMAT</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Barczewo · Olsztyn · odpiszemy lub oddzwonimy w ciągu 2 godzin.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Suspense required for useSearchParams in ContactPageForm */}
          <Suspense fallback={
            <div className="h-96 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          }>
            <ContactPageForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
