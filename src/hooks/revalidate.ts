import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateRecipe: CollectionAfterChangeHook = ({ doc }) => {
  revalidatePath(`/recipes/${doc.slug}`)
  revalidatePath('/recipes')
  revalidatePath('/')
  return doc
}

export const revalidateBlogPost: CollectionAfterChangeHook = ({ doc }) => {
  revalidatePath(`/blog/${doc.slug}`)
  revalidatePath('/blog')
  revalidatePath('/')
  return doc
}
