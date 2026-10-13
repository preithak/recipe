import Link from 'next/link'
import { getRecipes, getBlogPosts, getCategories } from '@/lib/queries'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { BlogCard } from '@/components/blog/BlogCard'
import { NewsletterSection } from '@/components/shared/NewsletterSection'

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const defaultIcon = (
  <svg {...svgProps}>
    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1.5 2.1-.5 6.5c2.5-.5 4-.5 4-.5s-1 2.5-4 4.5c0 0 1 1 3 1.5-2 1-5.5 1.5-8.5 4.5z" />
    <path d="M11 20a7 7 0 0 1-4-2" />
  </svg>
)

const categoryIcons: Record<string, React.ReactNode> = {
  breakfast: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  lunch: (
    <svg {...svgProps}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  ),
  dinner: (
    <svg {...svgProps}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
    </svg>
  ),
  desserts: (
    <svg {...svgProps}>
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20" />
      <path d="M7 8v3" />
      <path d="M12 8v3" />
      <path d="M17 8v3" />
      <path d="M7 4h.01" />
      <path d="M12 4h.01" />
      <path d="M17 4h.01" />
    </svg>
  ),
  snacks: (
    <svg {...svgProps}>
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  ),
}

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
          <h1 className="font-serif text-5xl md:text-[3.5rem] md:leading-[1.15] text-on-surface mb-6 leading-tight">
            Homemade recipes<br className="hidden md:block" /> with love
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg mx-auto mb-8">
            A warm collection of time-tested recipes and kitchen stories,
            crafted for home cooks who believe in the magic of a shared meal.
          </p>
          <Link
            href="/recipes"
            className="btn-primary inline-flex items-center gap-2"
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
                href={`/recipes?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-6 bg-surface-low rounded-xl hover:bg-surface-container transition-colors text-center"
              >
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed/40 flex items-center justify-center text-primary-dark">
                  {categoryIcons[cat.slug] || defaultIcon}
                </div>
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
                  staffPick={(recipe as Record<string, unknown>).staffPick as boolean}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-xl">
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
          <div className="text-center py-16 bg-surface-low rounded-xl">
            <p className="font-serif text-xl text-on-surface mb-2">Stories coming soon</p>
            <p className="text-on-surface-variant text-sm">
              Kitchen tales and seasonal tips are on the way.
            </p>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <NewsletterSection />
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
