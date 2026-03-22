import { getPayload } from './payload'

export async function getRecipes(options?: {
  limit?: number
  page?: number
  category?: string
  status?: 'draft' | 'published'
}) {
  const payload = await getPayload()
  const { limit = 12, page = 1, category, status = 'published' } = options || {}

  const where: Record<string, { equals: string }> = {}
  if (status) where._status = { equals: status }
  if (category) where.category = { equals: category }

  return payload.find({
    collection: 'recipes',
    limit,
    page,
    where,
    sort: '-publishedAt',
  })
}

export async function getRecipeBySlug(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'recipes',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getBlogPosts(options?: {
  limit?: number
  page?: number
  status?: 'draft' | 'published'
}) {
  const payload = await getPayload()
  const { limit = 12, page = 1, status = 'published' } = options || {}

  const where: Record<string, { equals: string }> = {}
  if (status) where._status = { equals: status }

  return payload.find({
    collection: 'blog-posts',
    limit,
    page,
    where,
    sort: '-publishedAt',
  })
}

export async function getBlogPostBySlug(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getCategories() {
  const payload = await getPayload()
  return payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'name',
  })
}
