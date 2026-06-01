import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import Image from "next/image";
import { OffersClient } from "@/components/sections/OffersClient";
import { getAllListings, mapToOffer } from "@/lib/asari";

export const revalidate = 600;

export const metadata: Metadata = createMetadata(
  "Oferty nieruchomości Barczewo i Olsztyn",
  "Aktualne oferty sprzedaży i wynajmu nieruchomości w Barczewie, Olsztynie i powiecie olsztyńskim. Mieszkania, domy, działki.",
  "/oferty"
);

export default async function OfertyPage() {
  const listings = await getAllListings();
  const offers = listings.map(mapToOffer);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page header */}
      {/* REPLACE src with actual property/neighborhood photo */}
      <div className="relative overflow-hidden py-14 lg:py-20">
        <Image
          src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1920&q=80"
          alt="Oferty nieruchomości Barczewo i Olsztyn"
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3">
            OFERTY
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white">
            Aktualne oferty nieruchomości{" "}
            <span className="text-blue-300">Barczewo i Olsztyn</span>
          </h1>
          <p className="text-gray-300 mt-3 text-base">
            Barczewo · Olsztyn · powiat olsztyński
          </p>
        </div>
      </div>

      <OffersClient offers={offers} />

    </div>
  );
}
