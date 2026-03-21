import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { getRecipeBySlug } from '@/lib/queries'
import { RichText } from '@/components/shared/RichText'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) return { title: 'Recipe Not Found' }

  return {
    title: recipe.title,
    description: recipe.description,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload()
  const recipes = await payload.find({
    collection: 'recipes',
    limit: 100,
    select: { slug: true },
  })
  return recipes.docs.map((recipe) => ({ slug: recipe.slug }))
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)

  if (!recipe) notFound()

  const featuredImage = recipe.featuredImage as {
    url?: string
    alt?: string
    sizes?: { hero?: { url?: string } }
  } | null
  const heroUrl = featuredImage?.sizes?.hero?.url || featuredImage?.url
  const totalTime = (recipe.metadata?.prepTime || 0) + (recipe.metadata?.cookTime || 0)

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero image */}
      {heroUrl && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
          <Image
            src={heroUrl}
            alt={featuredImage?.alt || recipe.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}

      {/* Title & metadata */}
      <header className="mb-10">
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-4 leading-tight">
          {recipe.title}
        </h1>
        <p className="text-lg text-on-surface-variant mb-6">{recipe.description}</p>

        {/* Metadata bar */}
        <div className="flex flex-wrap gap-6 py-4 px-6 bg-surface-low rounded-xl">
          {recipe.metadata?.prepTime && (
            <div className="text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wide">Prep</p>
              <p className="font-serif text-lg text-on-surface">
                {formatTime(recipe.metadata.prepTime)}
              </p>
            </div>
          )}
          {recipe.metadata?.cookTime && (
            <div className="text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wide">Cook</p>
              <p className="font-serif text-lg text-on-surface">
                {formatTime(recipe.metadata.cookTime)}
              </p>
            </div>
          )}
          {totalTime > 0 && (
            <div className="text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wide">Total</p>
              <p className="font-serif text-lg text-on-surface">{formatTime(totalTime)}</p>
            </div>
          )}
          {recipe.metadata?.servings && (
            <div className="text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wide">Servings</p>
              <p className="font-serif text-lg text-on-surface">{recipe.metadata.servings}</p>
            </div>
          )}
          {recipe.metadata?.difficulty && (
            <div className="text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wide">Difficulty</p>
              <p className="font-serif text-lg text-on-surface capitalize">
                {recipe.metadata.difficulty}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Two-column layout: ingredients + instructions */}
      <div className="grid md:grid-cols-[1fr_2fr] gap-10">
        {/* Ingredients */}
        <aside>
          <h2 className="font-serif text-2xl text-on-surface mb-4">Ingredients</h2>
          {recipe.ingredientGroups?.map((group, gi) => (
            <div key={gi} className="mb-6">
              {group.groupName && (
                <h3 className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                  {group.groupName}
                </h3>
              )}
              <ul className="space-y-2">
                {group.ingredients?.map((ing, ii) => (
                  <li
                    key={ii}
                    className="flex items-baseline gap-2 text-on-surface-variant py-1.5 border-b border-outline-variant/10"
                  >
                    {ing.quantity && (
                      <span className="font-medium text-on-surface whitespace-nowrap">
                        {ing.quantity} {ing.unit}
                      </span>
                    )}
                    <span>{ing.item}</span>
                    {ing.notes && (
                      <span className="text-xs italic text-on-surface-variant">({ing.notes})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Nutrition card */}
          {recipe.showNutrition && recipe.nutrition && (
            <div className="mt-8 p-5 bg-surface-low rounded-xl">
              <h3 className="font-serif text-lg text-on-surface mb-3">Nutrition per serving</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {recipe.nutrition.calories != null && (
                  <div>
                    <span className="text-on-surface-variant">Calories</span>
                    <p className="font-medium text-on-surface">{recipe.nutrition.calories} kcal</p>
                  </div>
                )}
                {recipe.nutrition.protein != null && (
                  <div>
                    <span className="text-on-surface-variant">Protein</span>
                    <p className="font-medium text-on-surface">{recipe.nutrition.protein}g</p>
                  </div>
                )}
                {recipe.nutrition.carbs != null && (
                  <div>
                    <span className="text-on-surface-variant">Carbs</span>
                    <p className="font-medium text-on-surface">{recipe.nutrition.carbs}g</p>
                  </div>
                )}
                {recipe.nutrition.fat != null && (
                  <div>
                    <span className="text-on-surface-variant">Fat</span>
                    <p className="font-medium text-on-surface">{recipe.nutrition.fat}g</p>
                  </div>
                )}
                {recipe.nutrition.fiber != null && (
                  <div>
                    <span className="text-on-surface-variant">Fiber</span>
                    <p className="font-medium text-on-surface">{recipe.nutrition.fiber}g</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Instructions */}
        <section>
          <h2 className="font-serif text-2xl text-on-surface mb-6">Instructions</h2>
          <ol className="space-y-8">
            {recipe.steps?.map((step, si) => {
              const stepImage = step.image as {
                url?: string
                alt?: string
                sizes?: { card?: { url?: string } }
              } | null
              const stepImgUrl = stepImage?.sizes?.card?.url || stepImage?.url

              return (
                <li key={si} className="flex gap-5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-medium">
                    {String(si + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <RichText content={step.instruction} />
                    {stepImgUrl && (
                      <div className="relative aspect-video rounded-xl overflow-hidden mt-4">
                        <Image
                          src={stepImgUrl}
                          alt={stepImage?.alt || `Step ${si + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 580px"
                        />
                      </div>
                    )}
                    {step.tip && (
                      <div className="mt-3 p-3 bg-tertiary-fixed/30 rounded-lg text-sm text-on-surface-variant">
                        <span className="font-medium text-on-surface">Tip: </span>
                        {step.tip}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      </div>

      {/* Body / story section */}
      {recipe.body && (
        <section className="mt-16 pt-10 border-t border-outline-variant/15">
          <h2 className="font-serif text-2xl text-on-surface mb-4">The Story</h2>
          <div className="prose-warm">
            <RichText content={recipe.body} />
          </div>
        </section>
      )}

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Recipe',
            name: recipe.title,
            description: recipe.description,
            image: heroUrl,
            prepTime: recipe.metadata?.prepTime
              ? `PT${recipe.metadata.prepTime}M`
              : undefined,
            cookTime: recipe.metadata?.cookTime
              ? `PT${recipe.metadata.cookTime}M`
              : undefined,
            totalTime: totalTime > 0 ? `PT${totalTime}M` : undefined,
            recipeYield: recipe.metadata?.servings
              ? `${recipe.metadata.servings} servings`
              : undefined,
            recipeCategory:
              (recipe.category as { name?: string } | null)?.name || undefined,
            recipeCuisine: recipe.metadata?.cuisine || undefined,
            recipeIngredient: recipe.ingredientGroups?.flatMap(
              (g) =>
                g.ingredients?.map(
                  (ing) =>
                    `${ing.quantity || ''} ${ing.unit || ''} ${ing.item}${ing.notes ? ` (${ing.notes})` : ''}`.trim(),
                ) || [],
            ),
            recipeInstructions: recipe.steps?.map((step, i) => ({
              '@type': 'HowToStep',
              position: i + 1,
              text:
                typeof step.instruction === 'string'
                  ? step.instruction
                  : 'See recipe for details',
            })),
            nutrition: recipe.showNutrition && recipe.nutrition
              ? {
                  '@type': 'NutritionInformation',
                  calories: recipe.nutrition.calories
                    ? `${recipe.nutrition.calories} calories`
                    : undefined,
                  proteinContent: recipe.nutrition.protein
                    ? `${recipe.nutrition.protein}g`
                    : undefined,
                  carbohydrateContent: recipe.nutrition.carbs
                    ? `${recipe.nutrition.carbs}g`
                    : undefined,
                  fatContent: recipe.nutrition.fat
                    ? `${recipe.nutrition.fat}g`
                    : undefined,
                  fiberContent: recipe.nutrition.fiber
                    ? `${recipe.nutrition.fiber}g`
                    : undefined,
                }
              : undefined,
          }),
        }}
      />
    </article>
  )
}
