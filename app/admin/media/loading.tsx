export default function MediaLoading() {
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

      {/* Upload area skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
        <div className="h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"></div>
      </div>

      {/* Gallery skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
