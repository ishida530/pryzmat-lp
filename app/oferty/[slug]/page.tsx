import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Home,
  DoorOpen,
  Droplet,
  CheckCircle2,
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Layers,
} from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { getListingIds, getListing, mapToOffer } from "@/lib/asari";
import { ListingDetailSkeleton } from "@/components/sections/ListingDetailSkeleton";
import { ImageGallery } from "@/components/sections/ImageGallery";
import { ListingMap } from "@/components/sections/ListingMap";
import { AgentCard } from "@/components/sections/AgentCard";

export const revalidate = 600;

interface OfferDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: OfferDetailPageProps): Promise<Metadata> {
  try {
    const listing = await getListing(Number(params.slug));
    const offer = mapToOffer(listing);
    const priceLabel =
      offer.price > 0
        ? offer.purpose === "sprzedaz"
          ? `Cena: ${offer.price.toLocaleString("pl-PL")} zł.`
          : `Czynsz: ${offer.price.toLocaleString("pl-PL")} zł/mies.`
        : "Cena do negocjacji.";
    return createMetadata(
      offer.title,
      `${offer.title} — ${offer.area} m² w ${offer.location}. ${priceLabel}`,
      `/oferty/${params.slug}`
    );
  } catch {
    return createMetadata(
      "Oferta nie znaleziona",
      "Szukana oferta nieruchomości nie istnieje.",
      `/oferty/${params.slug}`
    );
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(price);
}

async function ListingDetailContent({ slug }: { slug: string }) {
  let listing;
  try {
    listing = await getListing(Number(slug));
  } catch {
    notFound();
  }

  const offer = mapToOffer(listing);

  const allRefs = await getListingIds();
  const similarRefs = allRefs
    .filter((r) => r.id !== listing.id)
    .slice(0, 3);
  const similarSettled = await Promise.allSettled(similarRefs.map((r) => getListing(r.id)));
  const similarOffers = similarSettled
    .filter(
      (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getListing>>> =>
        r.status === "fulfilled"
    )
    .map((r) => mapToOffer(r.value));

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/oferty" className="text-brand-blue hover:underline">
              Oferty
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate">{offer.title}</span>
          </div>
        </div>
      </div>

      {/* Status banner for sold/reserved */}
      {offer.status === "Closed" && (
        <div className="bg-gray-700 text-white text-center py-2 text-sm font-bold tracking-wide">
          Ta nieruchomość została sprzedana
        </div>
      )}
      {offer.status === "Pending" && (
        <div className="bg-amber-600 text-white text-center py-2 text-sm font-bold tracking-wide">
          Ta nieruchomość jest zarezerwowana
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-2">

            {/* Gallery */}
            <ImageGallery photoIds={offer.allPhotoIds} alt={offer.title} />

            {/* Title, price, metrics, description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
                    {offer.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <MapPin className="w-5 h-5 text-brand-blue" />
                    <span className="text-lg">{offer.location}</span>
                  </div>
                  {offer.listingId && (
                    <p className="text-xs text-gray-400 mt-1">Nr oferty: {offer.listingId}</p>
                  )}
                </div>
                <span
                  className={`inline-block text-sm font-bold px-4 py-2 rounded-full shrink-0 ml-4 ${
                    offer.status === "Closed"
                      ? "bg-gray-200 text-gray-600"
                      : offer.status === "Pending"
                      ? "bg-amber-100 text-amber-700"
                      : offer.purpose === "sprzedaz"
                      ? "bg-brand-red/10 text-brand-red"
                      : "bg-brand-blue/10 text-brand-blue"
                  }`}
                >
                  {offer.status === "Closed"
                    ? "Sprzedana"
                    : offer.status === "Pending"
                    ? "Zarezerwowana"
                    : offer.purpose === "sprzedaz"
                    ? "Na sprzedaż"
                    : "Na wynajem"}
                </span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-brand-navy/5 to-brand-blue/5 rounded-xl p-6 mb-8 border border-brand-navy/10">
                <p className="text-gray-600 text-sm font-medium mb-2">
                  {offer.purpose === "sprzedaz" ? "Cena" : "Czynsz miesięczny"}
                </p>
                <p className="text-4xl font-extrabold text-brand-navy">
                  {offer.price > 0 ? (
                    <>
                      {formatPrice(offer.price)}
                      {offer.purpose === "wynajem" && (
                        <span className="text-lg font-semibold text-gray-600">/mies.</span>
                      )}
                    </>
                  ) : (
                    <span className="text-2xl text-gray-500">Cena do negocjacji</span>
                  )}
                </p>
                {offer.priceM2 && offer.priceM2 > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatPrice(offer.priceM2)} / m²
                  </p>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-100">
                <div className="text-center">
                  <div className="bg-brand-navy/10 rounded-lg p-3 mb-2 flex items-center justify-center h-12">
                    <Home className="w-5 h-5 text-brand-navy" />
                  </div>
                  <p className="text-2xl font-bold text-brand-navy">{offer.area}</p>
                  <p className="text-xs text-gray-500 mt-1">{offer.unit}</p>
                </div>

                {offer.rooms && (
                  <div className="text-center">
                    <div className="bg-brand-blue/10 rounded-lg p-3 mb-2 flex items-center justify-center h-12">
                      <DoorOpen className="w-5 h-5 text-brand-blue" />
                    </div>
                    <p className="text-2xl font-bold text-brand-blue">{offer.rooms}</p>
                    <p className="text-xs text-gray-500 mt-1">pokoi</p>
                  </div>
                )}

                {offer.bathrooms && (
                  <div className="text-center">
                    <div className="bg-brand-blue/10 rounded-lg p-3 mb-2 flex items-center justify-center h-12">
                      <Droplet className="w-5 h-5 text-brand-blue" />
                    </div>
                    <p className="text-2xl font-bold text-brand-blue">{offer.bathrooms}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {offer.bathrooms === 1 ? "łazienka" : "łazienki"}
                    </p>
                  </div>
                )}

                {offer.floor != null && offer.totalFloors != null ? (
                  <div className="text-center">
                    <div className="bg-brand-navy/10 rounded-lg p-3 mb-2 flex items-center justify-center h-12">
                      <Layers className="w-5 h-5 text-brand-navy" />
                    </div>
                    <p className="text-xl font-bold text-brand-navy">
                      {offer.floor}/{offer.totalFloors}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">piętro</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-brand-navy/10 rounded-lg p-3 mb-2 flex items-center justify-center h-12">
                      <span className="text-lg font-bold text-brand-navy">
                        {offer.type.charAt(0)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-brand-navy">{offer.type}</p>
                    <p className="text-xs text-gray-500 mt-1">nieruchomość</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {offer.description && (
                <div>
                  <h2 className="text-xl font-bold text-brand-navy mb-3">Opis</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {offer.description}
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
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

            {/* Map */}
            {offer.geoLat && offer.geoLng && (
              <ListingMap lat={offer.geoLat} lng={offer.geoLng} title={offer.title} />
            )}

            {/* Nested listings (investments) */}
            {offer.nestedListings && offer.nestedListings.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
                <h2 className="text-xl font-bold text-brand-navy mb-4">
                  Lokale w tej inwestycji ({offer.nestedListings.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {offer.nestedListings.map((nested) => (
                    <Link
                      key={nested.id}
                      href={`/oferty/${nested.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-brand-blue/5 rounded-lg transition-colors group"
                    >
                      <span className="text-sm font-medium text-brand-navy group-hover:text-brand-blue transition-colors">
                        Lokal nr {nested.listingId || nested.id}
                      </span>
                      <span className="text-brand-blue text-xs font-semibold">
                        Zobacz →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-0">
              {/* Contact CTA */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-brand-navy mb-2">Zainteresowany?</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Skontaktuj się z nami, aby uzyskać więcej informacji o tej nieruchomości.
                </p>

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

              {/* Agent card */}
              {offer.agent && <AgentCard agent={offer.agent} />}
            </div>
          </div>
        </div>

        {/* Similar offers */}
        {similarOffers.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-brand-navy mb-8">Podobne oferty</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarOffers.map((s) => (
                <Link
                  key={s.id}
                  href={`/oferty/${s.slug}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
                >
                  <div className="h-40 bg-gradient-to-br from-brand-navy/10 to-brand-blue/10 flex items-center justify-center relative overflow-hidden">
                    {s.thumbnailUrl ? (
                      <>
                        <Image
                          src={s.thumbnailUrl}
                          alt={s.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/15 via-transparent to-brand-navy/10 pointer-events-none" />
                      </>
                    ) : (
                      <Home className="w-10 h-10 text-brand-navy/30" />
                    )}
                    <span className="absolute top-3 left-3 bg-brand-navy text-white text-[11px] font-bold px-2.5 py-1 rounded-full z-10">
                      {s.type}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-brand-navy text-sm leading-snug mb-2 group-hover:text-brand-blue transition-colors">
                      {s.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                      <MapPin className="w-3 h-3" />
                      {s.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-extrabold text-brand-navy">
                        {s.price > 0 ? formatPrice(s.price) : "Do negocjacji"}
                      </p>
                      <span className="text-xs text-gray-500">
                        {s.area} {s.unit}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
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
    </>
  );
}

export default function OfferDetailPage({ params }: OfferDetailPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<ListingDetailSkeleton />}>
        <ListingDetailContent slug={params.slug} />
      </Suspense>
    </div>
  );
}
