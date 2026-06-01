import { ListingDetailSkeleton } from "@/components/sections/ListingDetailSkeleton";

export default function LoadingListingDetail() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 animate-pulse">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-2 bg-gray-200 rounded" />
            <div className="h-4 w-52 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      <ListingDetailSkeleton />
    </div>
  );
}
