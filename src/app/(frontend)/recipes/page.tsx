import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload'
import { getCategories } from '@/lib/queries'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { RecipeFilters } from '@/components/recipes/RecipeFilters'

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'Browse our warm collection of homemade recipes.',
}

type Props = {
  searchParams: Promise<{ category?: string; difficulty?: string; time?: string }>
}

export default async function RecipesPage({ searchParams }: Props) {
  const { category = '', difficulty = '', time = '' } = await searchParams
  const payload = await getPayload()
  const { docs: categories } = await getCategories()

  // Build query filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditions: any[] = [{ _status: { equals: 'published' } }]

  // Category filter
  if (category) {
    const cat = categories.find((c) => c.slug === category)
    if (cat) {
      conditions.push({ category: { equals: cat.id } })
    }
  }

  // Difficulty filter
  if (difficulty) {
    conditions.push({ 'metadata.difficulty': { equals: difficulty } })
  }

  const result = await payload.find({
    collection: 'recipes',
    limit: 24,
    where: { and: conditions },
    sort: '-publishedAt',
  })

  // Time filter (post-query since totalTime is computed)
  let recipes = result.docs
  if (time) {
    const timeLimit = parseInt(time, 10)
    recipes = recipes.filter((r) => {
      const total = (r.metadata?.prepTime || 0) + (r.metadata?.cookTime || 0)
      if (total === 0) return timeLimit === 0
      if (timeLimit === 30) return total < 30
      if (timeLimit === 60) return total >= 30 && total <= 60
      if (timeLimit === 61) return total > 60
      return true
    })
  }

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.slug,
  }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-3">
          The Recipe Archive
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl">
          Time-tested recipes from our kitchen to yours, crafted with love and seasonal ingredients.
        </p>
      </div>

      {/* Filters */}
      <RecipeFilters
        categories={categoryOptions}
        activeCategory={category}
        activeDifficulty={difficulty}
        activeTime={time}
      />

      {/* Recipe grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div className="text-center py-20 bg-surface-low rounded-2xl">
          <p className="font-serif text-2xl text-on-surface mb-2">No recipes found</p>
          <p className="text-on-surface-variant">
            Try adjusting your filters, or{' '}
            <a href="/recipes" className="text-primary underline">
              view all recipes
            </a>.
          </p>
        </div>
      )}
    </div>
  )
}

type RecipeCardImage = {
  url?: string
  alt?: string
  sizes?: {
    card?: { url?: string }
  }
}
