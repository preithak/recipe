import Link from 'next/link'
import Image from 'next/image'

type FeaturedBlogCardProps = {
  title: string
  slug: string
  excerpt: string
  featuredImage?: {
    url?: string
    alt?: string
    sizes?: {
      card?: { url?: string }
      hero?: { url?: string }
    }
  }
  category?: { name: string } | null
  publishedAt?: string | null
}

export function FeaturedBlogCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  publishedAt,
}: FeaturedBlogCardProps) {
  const imageUrl = featuredImage?.sizes?.hero?.url || featuredImage?.sizes?.card?.url || featuredImage?.url

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="grid md:grid-cols-2 gap-0 bg-surface-low rounded-xl overflow-hidden shadow-[0_4px_40px_rgba(45,21,9,0.06)] hover:shadow-[0_8px_40px_rgba(45,21,9,0.12)] transition-shadow">
        <div className="relative aspect-[3/2] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={featuredImage?.alt || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-surface-container flex items-center justify-center">
              <span className="text-on-surface-variant text-sm">No image</span>
            </div>
          )}
        </div>
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            {category && (
              <span className="text-sm text-secondary tracking-wide uppercase">
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
          <h2 className="font-serif text-3xl text-on-surface mb-3 group-hover:text-primary transition-colors leading-snug">
            {title}
          </h2>
          <p className="text-on-surface-variant line-clamp-3 mb-4">{excerpt}</p>
          <span className="text-sm text-primary font-medium">
            Read the story →
          </span>
        </div>
      </article>
    </Link>
  )
}
