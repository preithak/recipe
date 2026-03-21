import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/queries'
import { BlogCard } from '@/components/blog/BlogCard'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Kitchen stories, tips & tricks from The Heirloom Editorial.',
}

export default async function BlogPage() {
  const { docs: posts } = await getBlogPosts({ limit: 12 })

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-3">
          From the Editorial
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl">
          Kitchen stories, seasonal tips, and the craft behind every recipe.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              featuredImage={post.featuredImage as BlogCardImage}
              category={post.category as { name: string } | null}
              publishedAt={post.publishedAt}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-low rounded-2xl">
          <p className="font-serif text-2xl text-on-surface mb-2">No posts yet</p>
          <p className="text-on-surface-variant">
            Head to the{' '}
            <a href="/admin" className="text-primary underline">
              admin panel
            </a>{' '}
            to write your first blog post.
          </p>
        </div>
      )}
    </div>
  )
}

type BlogCardImage = {
  url?: string
  alt?: string
  sizes?: {
    card?: { url?: string }
  }
}
