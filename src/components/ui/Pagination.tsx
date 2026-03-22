import Link from 'next/link'

type PaginationProps = {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string>
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  function buildUrl(page: number): string {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  // Show max 7 page numbers
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-12">
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Previous page"
        >
          ←
        </Link>
      )}

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-on-surface-variant">…</span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Next page"
        >
          →
        </Link>
      )}
    </nav>
  )
}
