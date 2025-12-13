interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export default function Pagination({ currentPage, totalPages, basePath = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter(page => {
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <a
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-4 py-2 border rounded-md hover:bg-gray-50 transition"
        >
          上一页
        </a>
      )}

      {showPages.map((page, index) => {
        if (index > 0 && showPages[index - 1] !== page - 1) {
          return (
            <span key={`ellipsis-${page}`} className="px-2">
              ...
            </span>
          );
        }

        return (
          <a
            key={page}
            href={`${basePath}?page=${page}`}
            className={`px-4 py-2 border rounded-md transition ${
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            {page}
          </a>
        );
      })}

      {currentPage < totalPages && (
        <a
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-4 py-2 border rounded-md hover:bg-gray-50 transition"
        >
          下一页
        </a>
      )}
    </div>
  );
}
