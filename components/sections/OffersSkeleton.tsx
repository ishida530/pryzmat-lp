export function OffersSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Filter bar skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="h-9 w-36 bg-gray-200 rounded-lg" />
            <div className="h-9 w-32 bg-gray-200 rounded-lg" />
            <div className="h-9 w-40 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-9 w-32 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="mb-4 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse"
          >
            <div className="h-44 bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
