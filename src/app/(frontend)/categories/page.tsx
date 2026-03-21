import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse recipes by category.',
}

export default async function CategoriesPage() {
  const { docs: categories } = await getCategories()

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-3">Categories</h1>
        <p className="text-on-surface-variant text-lg max-w-xl">
          Find the perfect recipe by browsing our collections.
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group block p-8 bg-surface-low rounded-2xl hover:bg-surface-container transition-colors shadow-[0_4px_40px_rgba(45,21,9,0.06)] hover:shadow-[0_8px_40px_rgba(45,21,9,0.12)]"
            >
              <h2 className="font-serif text-2xl text-on-surface group-hover:text-primary transition-colors mb-2">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="text-sm text-on-surface-variant">{cat.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-low rounded-2xl">
          <p className="font-serif text-2xl text-on-surface mb-2">No categories yet</p>
          <p className="text-on-surface-variant">
            Create categories in the{' '}
            <a href="/admin" className="text-primary underline">admin panel</a>.
          </p>
        </div>
      )}
    </div>
  )
}
