import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Users,
  CreditCard,
  Wrench,
  FileText,
  Phone,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = createMetadata(
  "Zarządzanie najmem Barczewo i Olsztyn",
  "Zarządzamy mieszkaniem w Twoim imieniu — najemcy, płatności, awarie. Regularny przelew co miesiąc. Prowizja 2,5%. Bezpłatna konsultacja.",
  "/zarzadzanie-najmem"
);

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Zarządzanie nieruchomościami",
  name: "Zarządzanie najmem — Biuro Nieruchomości PRYZMAT",
  description:
    "Kompleksowe zarządzanie najmem nieruchomości: weryfikacja najemców, obsługa płatności, reakcja na awarie, miesięczne rozliczenia. Barczewo, Olsztyn i powiat olsztyński.",
  provider: {
    "@type": "LocalBusiness",
    name: "Biuro Nieruchomości PRYZMAT",
    url: "https://pryzmat.com.pl",
    telephone: "+48503397360",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Barczewko 126B",
      addressLocality: "Barczewo",
      postalCode: "11-010",
      addressCountry: "PL",
    },
  },
  areaServed: [
    { "@type": "City", name: "Barczewo" },
    { "@type": "City", name: "Olsztyn" },
    { "@type": "AdministrativeArea", name: "powiat olsztyński" },
  ],
  offers: {
    "@type": "Offer",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "2.5",
      priceCurrency: "PLN",
      unitText: "% miesięcznego czynszu",
    },
    availability: "https://schema.org/InStock",
  },
  url: "https://pryzmat.com.pl/zarzadzanie-najmem",
};

const steps = [
  {
    n: "01",
    title: "Bezpłatna wycena czynszu",
    desc: "Analizujemy rynek i ustalamy optymalną stawkę — maksymalizujemy Twój dochód.",
  },
  {
    n: "02",
    title: "Skuteczny marketing i weryfikacja",
    desc: "Profesjonalne zdjęcia, ogłoszenia na portalach, screening finansowy kandydatów.",
  },
  {
    n: "03",
    title: "Umowa i protokół zdawczo-odbiorczy",
    desc: "Przygotowujemy komplet dokumentów chroniących właściciela i najemcę.",
  },
  {
    n: "04",
    title: "Bieżące zarządzanie",
    desc: "Pilnujemy płatności, rozliczamy media, reagujemy na usterki w Twoim imieniu.",
  },
  {
    n: "05",
    title: "Rozliczenie i raport",
    desc: "Co miesiąc raport + przelew na Twoje konto. Zero papierologii z Twojej strony.",
  },
];

const benefits = [
  { Icon: Users, text: "Weryfikacja najemców — sprawdzamy historię i wypłacalność" },
  { Icon: CreditCard, text: "Regularne przelewy co miesiąc — czynsz trafia na czas" },
  { Icon: Wrench, text: "Obsługa awarii 24/7 — reagujemy, Ty odpoczywasz" },
  { Icon: FileText, text: "Pełna dokumentacja — umowy, protokoły, rozliczenia" },
  { Icon: ShieldCheck, text: "Ubezpieczenie OC każdej usługi zarządzania" },
  { Icon: Phone, text: "Jeden numer do wszystkiego — Ty nie rozmawiasz z najemcą" },
];

export default function ZarzadzanieNajmemPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero */}
      {/* REPLACE src with actual apartment/property photo */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <Image
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=80"
          alt="Zarządzanie najmem nieruchomości Barczewo i Olsztyn"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-dark-navy/90" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(46,110,197,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-4">
              DLA WŁAŚCICIELI MIESZKAŃ
            </p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              Zarządzanie najmem{" "}
              <span className="text-brand-blue">Barczewo i Olsztyn</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Masz mieszkanie do wynajęcia, ale nie masz czasu ani nerwów na
              zarządzanie najemcami? Zajmiemy się tym w pełni — od ogłoszenia po
              miesięczny przelew na Twoje konto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`tel:${COMPANY.phone}`}
                className="inline-flex items-center justify-center bg-brand-red text-white px-8 py-4 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                Zadzwoń po konsultację
              </a>
              <Link
                href="/kontakt?cel=zarzadzanie"
                className="inline-flex items-center justify-center bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-brand-navy transition-all"
              >
                Wyślij zapytanie
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">CO ZYSKUJESZ</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
              Kompleksowa opieka nad Twoją nieruchomością
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map(({ Icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-4 bg-brand-light-blue rounded-xl p-5 border border-blue-100"
              >
                <div className="w-10 h-10 bg-brand-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-navy" />
                </div>
                <p className="text-gray-700 text-sm font-medium leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section className="py-20 bg-brand-light-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">JAK TO DZIAŁA</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
              5 kroków do spokojnego najmu
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {steps.map(({ n, title, desc }) => (
              <div
                key={n}
                className="flex gap-5 bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="shrink-0 w-10 h-10 bg-brand-navy rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{n}</span>
                </div>
                <div>
                  <h3 className="font-bold text-brand-navy text-base mb-1">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-3">CENNIK</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy mb-6">
            Uczciwa prowizja bez ukrytych kosztów
          </h2>
          <div className="bg-brand-light-blue border border-blue-100 rounded-2xl p-8 md:p-12">
            <p className="text-6xl font-extrabold text-brand-navy mb-2">
              {COMPANY.commission}
            </p>
            <p className="text-brand-blue font-semibold mb-6">
              od miesięcznego czynszu
            </p>
            <ul className="text-left space-y-3 mb-8 max-w-sm mx-auto">
              {[
                "Brak opłat za znalezienie najemcy",
                "Brak ukrytych prowizji",
                "Bezpłatna wycena na start",
                "Rezygnacja możliwa w każdej chwili",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={`tel:${COMPANY.phone}`}
              className="inline-flex items-center gap-2 bg-brand-red text-white font-bold px-8 py-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Umów bezpłatną rozmowę
            </a>
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-brand-navy py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-4">
            Gotowy, żeby przestać martwić się o mieszkanie?
          </h2>
          <p className="text-gray-300 mb-8">
            Zadzwoń lub wyślij wiadomość — bezpłatnie omówimy Twoją sytuację.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${COMPANY.phone}`}
              className="inline-flex items-center justify-center gap-2 bg-brand-red text-white font-bold px-8 py-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {COMPANY.phoneDisplay}
            </a>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-brand-navy transition-all"
            >
              Wyślij wiadomość
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
