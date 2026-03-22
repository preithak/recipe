import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/queries'
import { BlogCard } from '@/components/blog/BlogCard'
import { Pagination } from '@/components/ui/Pagination'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Kitchen stories, tips & tricks from The Heirloom Editorial.',
}

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1)
  const result = await getBlogPosts({ limit: 12, page: currentPage })
  const posts = result.docs

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
        <>
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
          <Pagination
            currentPage={currentPage}
            totalPages={result.totalPages}
            basePath="/blog"
          />
        </>
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
