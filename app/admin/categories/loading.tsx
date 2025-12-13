export default function CategoriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-9 w-32 bg-gray-200 rounded"></div>
        <div className="h-5 w-48 bg-gray-200 rounded mt-2"></div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-8 w-12 bg-gray-200 rounded mt-1"></div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-1"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
              ))}
              <div className="h-10 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-200">
              {/* Table header */}
              <div className="bg-gray-50 px-6 py-3 flex gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
                ))}
              </div>
              {/* Table rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-4 border-t border-gray-200">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
