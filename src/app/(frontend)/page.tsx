import Link from 'next/link'
import { getRecipes, getBlogPosts, getCategories } from '@/lib/queries'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { BlogCard } from '@/components/blog/BlogCard'

export default async function HomePage() {
  const [recipesResult, postsResult, categoriesResult] = await Promise.all([
    getRecipes({ limit: 4 }),
    getBlogPosts({ limit: 3 }),
    getCategories(),
  ])

  const recipes = recipesResult.docs
  const posts = postsResult.docs
  const categories = categoriesResult.docs

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-surface-low py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-secondary tracking-widest uppercase mb-4">
            The Heirloom Editorial
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-on-surface mb-6 leading-tight">
            Homemade recipes<br className="hidden md:block" /> with love
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg mx-auto mb-8">
            A warm collection of time-tested recipes and kitchen stories,
            crafted for home cooks who believe in the magic of a shared meal.
          </p>
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Explore Recipes
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Browse by Category */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl text-on-surface mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-6 bg-surface-low rounded-2xl hover:bg-surface-container transition-colors text-center"
              >
                <span className="font-serif text-lg text-on-surface group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Recipes */}
      <section className="bg-surface-low py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-serif text-3xl text-on-surface">Featured Recipes</h2>
            <Link
              href="/recipes"
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              View all →
            </Link>
          </div>

          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  slug={recipe.slug}
                  description={recipe.description}
                  featuredImage={recipe.featuredImage as RecipeCardImage}
                  metadata={recipe.metadata}
                  category={recipe.category as { name: string } | null}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-2xl">
              <p className="font-serif text-xl text-on-surface mb-2">No recipes yet</p>
              <p className="text-on-surface-variant text-sm">
                Create your first recipe in the{' '}
                <a href="/admin" className="text-primary underline">admin panel</a>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* From the Editorial (Blog) */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-serif text-3xl text-on-surface">From the Editorial</h2>
          <Link
            href="/blog"
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            Read more →
          </Link>
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
          <div className="text-center py-16 bg-surface-low rounded-2xl">
            <p className="font-serif text-xl text-on-surface mb-2">Stories coming soon</p>
            <p className="text-on-surface-variant text-sm">
              Kitchen tales and seasonal tips are on the way.
            </p>
          </div>
        )}
      </section>

      {/* Newsletter / Join Our Table */}
      <section className="bg-surface-container py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl text-on-surface mb-3">Join Our Table</h2>
          <p className="text-on-surface-variant mb-6">
            Get seasonal recipes and kitchen stories delivered to your inbox.
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 bg-surface-high rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-dark transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

type RecipeCardImage = {
  url?: string
  alt?: string
  sizes?: { card?: { url?: string } }
}

type BlogCardImage = {
  url?: string
  alt?: string
  sizes?: { card?: { url?: string } }
}
