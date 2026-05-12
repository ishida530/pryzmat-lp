import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Home, DoorOpen, Droplet, CheckCircle2, ArrowLeft, Phone, Mail, MessageSquare } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { PLACEHOLDER_OFFERS } from "../page";

interface OfferDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: OfferDetailPageProps): Promise<Metadata> {
  const offer = PLACEHOLDER_OFFERS.find((o) => o.slug === params.slug);

  if (!offer) {
    return createMetadata(
      "Oferta nie znaleziona",
      "Szukana oferta nieruchomości nie istnieje.",
      `/oferty/${params.slug}`
    );
  }

  const description = `${offer.title} - ${offer.area}m² w ${offer.location}. ${offer.purpose === "sprzedaz" ? `Cena: ${offer.price.toLocaleString("pl-PL")} zł.` : `Czynsz: ${offer.price.toLocaleString("pl-PL")} zł/mies.`}`;

  return createMetadata(
    offer.title,
    description,
    `/oferty/${offer.slug}`
  );
}

export async function generateStaticParams() {
  return PLACEHOLDER_OFFERS.map((offer) => ({
    slug: offer.slug,
  }));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function OfferDetailPage({ params }: OfferDetailPageProps) {
  const offer = PLACEHOLDER_OFFERS.find((o) => o.slug === params.slug);

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oferta nie znaleziona
          </h1>
          <p className="text-gray-500 mb-6">
            Szukana oferta nieruchomości nie istnieje lub została usunięta.
          </p>
          <Link
            href="/oferty"
            className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do ofert
          </Link>
        </div>
      </div>
    );
  }

  const otherOffers = PLACEHOLDER_OFFERS.filter((o) => o.id !== offer.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/oferty" className="text-brand-blue hover:underline">
              Oferty
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{offer.title}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main image and details */}
          <div className="lg:col-span-2">
            {/* Main image */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg mb-8 bg-gray-200 h-[500px]">
              {offer.imageUrl ? (
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-navy/10 to-brand-blue/10 flex items-center justify-center">
                  <Home className="w-20 h-20 text-brand-navy/20" />
                </div>
              )}
            </div>

            {/* Title and basic info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
                    {offer.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 text-brand-blue" />
                    <span className="text-lg">{offer.location}</span>
                  </div>
                  {offer.address && (
                    <p className="text-gray-500 text-sm">{offer.address}</p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-sm font-bold px-4 py-2 rounded-full mb-2 ${
                      offer.purpose === "sprzedaz"
                        ? "bg-brand-red/10 text-brand-red"
                        : "bg-brand-blue/10 text-brand-blue"
                    }`}
                  >
                    {offer.purpose === "sprzedaz" ? "Na sprzedaż" : "Na wynajem"}
                  </span>
                </div>
              </div>

              {/* Price section */}
              <div className="bg-gradient-to-r from-brand-navy/5 to-brand-blue/5 rounded-xl p-6 mb-8 border border-brand-navy/10">
                <p className="text-gray-600 text-sm font-medium mb-2">
                  {offer.purpose === "sprzedaz" ? "Cena" : "Czynsz miesięczny"}
                </p>
                <p className="text-4xl font-extrabold text-brand-navy">
                  {formatPrice(offer.price)}
                  {offer.purpose === "wynajem" && (
                    <span className="text-lg font-semibold text-gray-600">
                      /mies.
                    </span>
                  )}
                </p>
              </div>

              {/* Key features grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-100">
                <div className="text-center">
                  <div className="bg-brand-navy/10 rounded-lg p-3 mb-2 flex items-center justify-center h-12">
                    <Home className="w-5 h-5 text-brand-navy" />
                  </div>
                  <p className="text-2xl font-bold text-brand-navy">
                    {offer.area}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{offer.unit}</p>
                </div>

                {offer.rooms && (
                  <div className="text-center">
                    <div className="bg-brand-blue/10 rounded-lg p-3 mb-2 flex items-center justify-center h-12">
                      <DoorOpen className="w-5 h-5 text-brand-blue" />
                    </div>
                    <p className="text-2xl font-bold text-brand-blue">
                      {offer.rooms}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">pokoi</p>
                  </div>
                )}

                {offer.bathrooms && (
                  <div className="text-center">
                    <div className="bg-brand-blue/10 rounded-lg p-3 mb-2 flex items-center justify-center h-12">
                      <Droplet className="w-5 h-5 text-brand-blue" />
                    </div>
                    <p className="text-2xl font-bold text-brand-blue">
                      {offer.bathrooms}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {offer.bathrooms === 1 ? "łazienka" : "łazienki"}
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <div className="bg-brand-navy/10 rounded-lg p-3 mb-2 flex items-center justify-center h-12">
                    <span className="text-lg font-bold text-brand-navy">
                      {offer.type.charAt(0)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-brand-navy">
                    {offer.type}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">nieruchomość</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-brand-navy mb-3">
                  Opis
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {offer.description}
                </p>
              </div>
            </div>

            {/* Features list */}
            {offer.features && offer.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
                <h2 className="text-xl font-bold text-brand-navy mb-6">
                  Cechy nieruchomości
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {offer.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-brand-blue/5 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5 text-brand-blue flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Contact CTA */}
          <div className="lg:col-span-1">
            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sticky top-8 mb-8">
              <h2 className="text-xl font-bold text-brand-navy mb-2">
                Zainteresowany?
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Skontaktuj się z nami, aby uzyskać więcej informacji o tej
                nieruchomości.
              </p>

              {/* Contact buttons */}
              <div className="space-y-3 mb-8">
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="w-full flex items-center justify-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Zadzwoń
                </a>
                <a
                  href={`mailto:${COMPANY.email}?subject=Zapytanie%20o%20ofertę:%20${encodeURIComponent(offer.title)}`}
                  className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>
                <Link
                  href={`/kontakt?oferta=${encodeURIComponent(offer.title)}`}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-brand-navy px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Formularz
                </Link>
              </div>

              {/* Info card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-2">
                  📍 {COMPANY.name.toUpperCase()}
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {COMPANY.address.street}
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  {COMPANY.address.postalCode} {COMPANY.address.city}
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Tel:</span> {COMPANY.phoneDisplay}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Email:</span> {COMPANY.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar offers section */}
        {otherOffers.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-brand-navy mb-8">
              Podobne oferty
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherOffers.map((similarOffer) => (
                <Link
                  key={similarOffer.id}
                  href={`/oferty/${similarOffer.slug}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
                >
                  <div className="h-40 bg-gradient-to-br from-brand-navy/10 to-brand-blue/10 flex items-center justify-center relative overflow-hidden">
                    {similarOffer.imageUrl ? (
                      <img
                        src={similarOffer.imageUrl}
                        alt={similarOffer.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Home className="w-10 h-10 text-brand-navy/30" />
                    )}
                    <span className="absolute top-3 left-3 bg-brand-navy text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {similarOffer.type}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-brand-navy text-sm leading-snug mb-2 group-hover:text-brand-blue transition-colors">
                      {similarOffer.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                      <MapPin className="w-3 h-3" />
                      {similarOffer.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-extrabold text-brand-navy">
                        {formatPrice(similarOffer.price)}
                      </p>
                      <span className="text-xs text-gray-500">
                        {similarOffer.area} {similarOffer.unit}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="mt-12 text-center">
          <Link
            href="/oferty"
            className="inline-flex items-center gap-2 text-brand-blue hover:underline font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do wszystkich ofert
          </Link>
        </div>
      </div>
    </div>
  );
}
