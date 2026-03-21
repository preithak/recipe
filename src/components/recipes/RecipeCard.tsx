import Link from 'next/link'
import Image from 'next/image'

type RecipeCardProps = {
  title: string
  slug: string
  description: string
  featuredImage?: {
    url?: string
    alt?: string
    sizes?: {
      card?: { url?: string }
    }
  }
  metadata?: {
    prepTime?: number | null
    cookTime?: number | null
    difficulty?: string | null
    servings?: number | null
  }
  category?: { name: string } | null
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function RecipeCard({
  title,
  slug,
  description,
  featuredImage,
  metadata,
  category,
}: RecipeCardProps) {
  const imageUrl = featuredImage?.sizes?.card?.url || featuredImage?.url
  const totalTime = (metadata?.prepTime || 0) + (metadata?.cookTime || 0)

  return (
    <Link href={`/recipes/${slug}`} className="group block">
      <article className="bg-surface-low rounded-2xl overflow-hidden shadow-[0_4px_40px_rgba(45,21,9,0.06)] hover:shadow-[0_8px_40px_rgba(45,21,9,0.12)] transition-shadow">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={featuredImage?.alt || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-surface-container flex items-center justify-center">
              <span className="text-on-surface-variant text-sm">No image</span>
            </div>
          )}
          {/* Difficulty badge */}
          {metadata?.difficulty && (
            <span className="absolute top-4 left-4 bg-tertiary-fixed text-on-surface text-xs font-medium px-3 py-1 rounded-full">
              {metadata.difficulty.charAt(0).toUpperCase() + metadata.difficulty.slice(1)}
            </span>
          )}
        </div>

        {/* Content — title slightly overlapping image per design system */}
        <div className="p-5 -mt-4 relative">
          {/* Category */}
          {category && (
            <span className="text-xs text-secondary tracking-wide uppercase">
              {category.name}
            </span>
          )}

          <h3 className="font-serif text-xl text-on-surface mt-1 mb-2 group-hover:text-primary transition-colors leading-snug">
            {title}
          </h3>

          <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
            {description}
          </p>

          {/* Metadata row */}
          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {formatTime(totalTime)}
              </span>
            )}
            {metadata?.servings && (
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {metadata.servings}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
