import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { RecipeCard } from '@/components/recipes/RecipeCard'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const category = result.docs[0]
  if (!category) return { title: 'Category Not Found' }
  return {
    title: category.name,
    description: category.description || `Browse ${category.name} recipes.`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload()
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    select: { slug: true },
  })
  return categories.docs.map((cat) => ({ slug: cat.slug }))
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload()

  const catResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const category = catResult.docs[0]
  if (!category) notFound()

  const recipesResult = await payload.find({
    collection: 'recipes',
    where: { category: { equals: category.id } },
    limit: 50,
    sort: '-publishedAt',
  })
  const recipes = recipesResult.docs

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-3">{category.name}</h1>
        {category.description && (
          <p className="text-on-surface-variant text-lg max-w-xl">{category.description}</p>
        )}
      </div>

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
          <p className="font-serif text-2xl text-on-surface mb-2">No recipes in {category.name} yet</p>
          <p className="text-on-surface-variant">Check back soon!</p>
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
