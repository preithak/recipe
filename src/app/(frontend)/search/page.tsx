import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { BlogCard } from '@/components/blog/BlogCard'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for recipes and blog posts.',
}

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  let recipes: Array<Record<string, unknown>> = []
  let posts: Array<Record<string, unknown>> = []

  if (query) {
    const payload = await getPayload()

    const [recipesResult, postsResult] = await Promise.all([
      payload.find({
        collection: 'recipes',
        where: {
          or: [
            { title: { like: query } },
            { description: { like: query } },
          ],
        },
        limit: 12,
      }),
      payload.find({
        collection: 'blog-posts',
        where: {
          or: [
            { title: { like: query } },
            { excerpt: { like: query } },
          ],
        },
        limit: 6,
      }),
    ])

    recipes = recipesResult.docs as Array<Record<string, unknown>>
    posts = postsResult.docs as Array<Record<string, unknown>>
  }

  const totalResults = recipes.length + posts.length

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Search form */}
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-6">Search</h1>
        <form action="/search" method="GET" className="max-w-xl">
          <div className="flex gap-3">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search recipes, blog posts..."
              className="flex-1 px-5 py-3 bg-surface-high rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {query && (
        <p className="text-on-surface-variant mb-8">
          {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Recipes */}
      {recipes.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-on-surface mb-6">Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id as string}
                title={recipe.title as string}
                slug={recipe.slug as string}
                description={recipe.description as string}
                featuredImage={recipe.featuredImage as RecipeCardImage}
                metadata={recipe.metadata as RecipeMetadata}
                category={recipe.category as { name: string } | null}
              />
            ))}
          </div>
        </section>
      )}

      {/* Blog posts */}
      {posts.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-on-surface mb-6">Blog Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard
                key={post.id as string}
                title={post.title as string}
                slug={post.slug as string}
                excerpt={post.excerpt as string}
                featuredImage={post.featuredImage as BlogCardImage}
                category={post.category as { name: string } | null}
                publishedAt={post.publishedAt as string}
              />
            ))}
          </div>
        </section>
      )}

      {/* No results */}
      {query && totalResults === 0 && (
        <div className="text-center py-20 bg-surface-low rounded-2xl">
          <p className="font-serif text-2xl text-on-surface mb-2">Nothing found</p>
          <p className="text-on-surface-variant">
            Try a different search term, or{' '}
            <a href="/recipes" className="text-primary underline">browse all recipes</a>.
          </p>
        </div>
      )}

      {/* Initial state */}
      {!query && (
        <div className="text-center py-20 bg-surface-low rounded-2xl">
          <p className="font-serif text-2xl text-on-surface mb-2">What are you looking for?</p>
          <p className="text-on-surface-variant">
            Search by recipe name, ingredient, or topic.
          </p>
        </div>
      )}
    </div>
  )
}

type RecipeCardImage = {
  url?: string
  alt?: string
  sizes?: { card?: { url?: string } }
}

type RecipeMetadata = {
  prepTime?: number | null
  cookTime?: number | null
  difficulty?: string | null
  servings?: number | null
}

type BlogCardImage = {
  url?: string
  alt?: string
  sizes?: { card?: { url?: string } }
}
