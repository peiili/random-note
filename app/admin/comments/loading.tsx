export default function CommentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-9 w-32 bg-gray-200 rounded"></div>
        <div className="h-5 w-48 bg-gray-200 rounded mt-2"></div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-8 w-12 bg-gray-200 rounded mt-1"></div>
          </div>
        ))}
      </div>

      {/* Comments list skeleton */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-gray-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Comment content */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                {/* Meta info */}
                <div className="flex gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                {/* Article link */}
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
              {/* Status and actions */}
              <div className="flex flex-col items-end gap-3">
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="flex gap-2">
                  <div className="h-7 w-16 bg-gray-200 rounded"></div>
                  <div className="h-7 w-16 bg-gray-200 rounded"></div>
                  <div className="h-7 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
