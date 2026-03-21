import type { Metadata } from 'next'
import { getRecipes } from '@/lib/queries'
import { RecipeCard } from '@/components/recipes/RecipeCard'

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'Browse our warm collection of homemade recipes.',
}

export default async function RecipesPage() {
  const { docs: recipes } = await getRecipes({ limit: 12 })

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page header */}
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-3">
          Recipe Archive
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl">
          Time-tested recipes from our kitchen to yours, crafted with love and seasonal ingredients.
        </p>
      </div>

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
          <p className="font-serif text-2xl text-on-surface mb-2">No recipes yet</p>
          <p className="text-on-surface-variant">
            Head to the{' '}
            <a href="/admin" className="text-primary underline">
              admin panel
            </a>{' '}
            to create your first recipe.
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
