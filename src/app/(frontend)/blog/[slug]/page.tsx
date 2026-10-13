import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { getBlogPostBySlug } from '@/lib/queries'
import { RichText } from '@/components/shared/RichText'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload()
  const posts = await payload.find({
    collection: 'blog-posts',
    limit: 100,
    select: { slug: true },
  })
  return posts.docs.map((post) => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) notFound()

  const featuredImage = post.featuredImage as {
    url?: string
    alt?: string
    sizes?: { hero?: { url?: string } }
  } | null
  const heroUrl = featuredImage?.sizes?.hero?.url || featuredImage?.url

  const relatedRecipes = post.relatedRecipes as Array<{
    id: string
    title: string
    slug: string
  }> | null

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        {post.category && (
          <span className="text-sm text-secondary tracking-wide uppercase">
            {(post.category as { name: string }).name}
          </span>
        )}
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface mt-2 mb-4 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-on-surface-variant">{post.excerpt}</p>
        {post.publishedAt && (
          <p className="text-sm text-on-surface-variant mt-4">
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </header>

      {/* Hero image */}
      {heroUrl && (
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-10">
          <Image
            src={heroUrl}
            alt={featuredImage?.alt || post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose-warm">
        <RichText content={post.content} />
      </div>

      {/* Related recipes */}
      {relatedRecipes && relatedRecipes.length > 0 && (
        <section className="mt-16 pt-10 border-t border-outline-variant/15">
          <h2 className="font-serif text-2xl text-on-surface mb-4">Related Recipes</h2>
          <div className="flex flex-wrap gap-3">
            {relatedRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="px-4 py-2 bg-secondary-container text-on-surface rounded-full text-sm hover:bg-secondary/20 transition-colors"
              >
                {recipe.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
