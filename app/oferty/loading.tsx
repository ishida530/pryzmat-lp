import { OffersSkeleton } from "@/components/sections/OffersSkeleton";

export default function LoadingOferty() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page header skeleton */}
      <div className="relative overflow-hidden py-14 lg:py-20 bg-brand-dark-navy">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-3 w-14 bg-white/20 rounded mb-3" />
          <div className="h-9 w-2/3 bg-white/20 rounded mb-3" />
          <div className="h-4 w-1/3 bg-white/20 rounded" />
        </div>
      </div>

      <OffersSkeleton />
    </div>
  );
}
