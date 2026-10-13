import Link from 'next/link'
import Image from 'next/image'

type BlogCardProps = {
  title: string
  slug: string
  excerpt: string
  featuredImage?: {
    url?: string
    alt?: string
    sizes?: {
      card?: { url?: string }
    }
  }
  category?: { name: string } | null
  publishedAt?: string | null
}

export function BlogCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  publishedAt,
}: BlogCardProps) {
  const imageUrl = featuredImage?.sizes?.card?.url || featuredImage?.url

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="bg-surface-low rounded-xl overflow-hidden shadow-[0_4px_40px_rgba(45,21,9,0.06)] hover:shadow-[0_8px_40px_rgba(45,21,9,0.12)] transition-shadow">
        {/* Image */}
        <div className="relative aspect-[3/2] overflow-hidden">
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
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            {category && (
              <span className="text-xs text-secondary tracking-wide uppercase">
                {category.name}
              </span>
            )}
            {publishedAt && (
              <span className="text-xs text-on-surface-variant">
                {new Date(publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl text-on-surface mb-2 group-hover:text-primary transition-colors leading-snug">
            {title}
          </h3>

          <p className="text-sm text-on-surface-variant line-clamp-3">{excerpt}</p>
        </div>
      </article>
    </Link>
  )
}
