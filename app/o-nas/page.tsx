import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import Link from "next/link";
import { Award, Users, MapPin, Phone } from "lucide-react";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = createMetadata(
  "O nas — rodzinne biuro nieruchomości Barczewo i Olsztyn",
  `Poznaj biuro nieruchomości PRYZMAT w Barczewie. Rodzinna firma z ${COMPANY.yearsActive}-letnim doświadczeniem na rynku Olsztyna i Warmii.`,
  "/o-nas"
);

const aboutPageSchema = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "O nas — Biuro Nieruchomości PRYZMAT Barczewo i Olsztyn",
    description: `Rodzinne biuro nieruchomości z ${COMPANY.yearsActive}-letnim doświadczeniem w Barczewie i Olsztynie. Sprzedaż, wynajem i zarządzanie nieruchomościami.`,
    url: `${COMPANY.website}/o-nas`,
    mainEntity: {
      "@type": "LocalBusiness",
      name: COMPANY.name,
      foundingDate: String(COMPANY.foundingYear),
      url: COMPANY.website,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jerzy",
    jobTitle: "Założyciel i agent nieruchomości",
    worksFor: {
      "@type": "Organization",
      name: COMPANY.name,
      url: COMPANY.website,
    },
    knowsAbout: [
      "nieruchomości Barczewo",
      "nieruchomości Olsztyn",
      "zarządzanie najmem",
      "wycena nieruchomości",
    ],
    areaServed: "Barczewo, Olsztyn, powiat olsztyński",
  },
];

const values = [
  {
    Icon: Award,
    title: "Profesjonalizm z ludzką twarzą",
    desc: "Każda transakcja jest dla nas ważna — niezależnie od wartości nieruchomości. Traktujemy klientów jak partnera, nie numer.",
  },
  {
    Icon: MapPin,
    title: "Głęboka znajomość lokalnego rynku",
    desc: "Znamy Barczewo, Olsztyn i okolice jak własną kieszeń. Wiemy, które lokalizacje rosną na wartości i gdzie warto inwestować.",
  },
  {
    Icon: Users,
    title: "Rodzinna atmosfera",
    desc: "Jesteśmy małą, zgraną ekipą. Każdy klient ma swój dedykowany kontakt — nie trafi na infolinię z konsultantem.",
  },
];

const teamMembers = [
  {
    name: "Jerzy",
    role: "Założyciel i agent nieruchomości",
    bio: "Ponad 11 lat na rynku nieruchomości Warmii i Mazur. Specjalista od wycen i negocjacji. Zna każdy zakamarek Barczewa i Olsztyna.",
    photoPlaceholder: true,
  },
  // REPLACE with actual team members
];

export default function ONasPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      {/* Header */}
      <section className="bg-brand-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-4">
            O NAS
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Rodzinne biuro nieruchomości{" "}
            <span className="text-blue-300">Barczewo i Olsztyn</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-xl">
            {COMPANY.yearsActive} lat obsługi klientów na terenie Barczewa,
            Olsztyna i całego powiatu olsztyńskiego.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-navy/10 to-brand-blue/15 border border-blue-100 flex items-center justify-center">
              <div className="text-center px-8">
                <div className="w-20 h-20 bg-brand-navy/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-brand-navy/50" />
                </div>
                <p className="text-brand-navy/70 font-semibold text-sm">
                  Biuro Nieruchomości PRYZMAT
                </p>
                <p className="text-brand-navy/50 text-xs mt-1">
                  Barczewo · Olsztyn · Warmia
                </p>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-brand-navy">
                Nasza historia
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Biuro Nieruchomości PRYZMAT powstało w Barczewie ponad{" "}
                <strong>{COMPANY.yearsActive} lat temu</strong> z prostego
                przekonania: lokalny rynek zasługuje na rzetelne, uczciwe i
                profesjonalne biuro nieruchomości, które dobrze zna okolicę.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Przez lata obsłużyliśmy setki klientów — od pierwszych
                kupujących po doświadczonych inwestorów. Specjalizujemy się
                w rynku Barczewa, Olsztyna i powiatu olsztyńskiego. Znamy
                tutejsze ceny, trendy i specyfikę warmińskich miejscowości
                lepiej niż ktokolwiek inny.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Jako małe biuro możemy sobie pozwolić na coś, czego duże
                sieciówki nie oferują — <strong>osobiste podejście</strong>.
                Każdy klient dostaje bezpośredni kontakt do agenta, który
                poprowadzi go przez cały proces.
              </p>
              <div className="pt-2">
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="inline-flex items-center gap-2 bg-brand-red text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Zadzwoń i porozmawiajmy
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-brand-light-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">NASZE WARTOŚCI</p>
            <h2 className="text-3xl font-extrabold text-brand-navy">
              Dlaczego klienci wybierają PRYZMAT
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-xl p-7 border border-blue-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-brand-navy/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand-navy" />
                </div>
                <h3 className="font-bold text-brand-navy text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">NASZ ZESPÓŁ</p>
            <h2 className="text-3xl font-extrabold text-brand-navy">
              Poznaj ludzi za PRYZMAT
            </h2>
          </div>
          <div className="flex justify-center">
            {teamMembers.map(({ name, role, bio }) => (
              <div key={name} className="max-w-sm text-center">
                <div className="w-32 h-32 rounded-full bg-brand-light-blue border-4 border-brand-blue/20 flex items-center justify-center mx-auto mb-5">
                  {/* REPLACE with actual team member photo */}
                  <Users className="w-12 h-12 text-brand-navy/40" />
                </div>
                <h3 className="font-extrabold text-brand-navy text-xl mb-1">{name}</h3>
                <p className="text-brand-blue text-sm font-semibold mb-4">{role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-4">
            Chcesz współpracować z PRYZMAT?
          </h2>
          <p className="text-gray-300 mb-8">
            Zadzwoń lub odwiedź nas w biurze w Barczewie — bezpłatnie
            porozmawiamy o Twoich potrzebach.
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 bg-brand-red text-white font-bold px-8 py-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Skontaktuj się z nami
          </Link>
        </div>
      </section>

    </div>
  );
}
