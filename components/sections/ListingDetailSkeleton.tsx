export function ListingDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2">
          {/* Main image */}
          <div className="rounded-2xl bg-gray-200 h-[500px] mb-8" />

          {/* Title & price card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-3">
                <div className="h-7 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-8 w-28 bg-gray-200 rounded-full ml-4" />
            </div>

            {/* Price block */}
            <div className="bg-gray-100 rounded-xl p-6 mb-8">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-10 bg-gray-200 rounded w-48" />
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-12 bg-gray-200 rounded-lg mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>

        {/* Right column — contact CTA */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sticky top-8">
            <div className="h-6 bg-gray-200 rounded w-40 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6" />
            <div className="space-y-3 mb-8">
              <div className="h-11 bg-gray-200 rounded-lg" />
              <div className="h-11 bg-gray-200 rounded-lg" />
              <div className="h-11 bg-gray-200 rounded-lg" />
            </div>
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
