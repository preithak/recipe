import type { CollectionConfig } from 'payload'

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'difficulty', 'status', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  versions: {
    drafts: true,
  },
  fields: [
    // --- Main content ---
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    // --- Metadata ---
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'prepTime',
              type: 'number',
              label: 'Prep Time (min)',
              min: 0,
            },
            {
              name: 'cookTime',
              type: 'number',
              label: 'Cook Time (min)',
              min: 0,
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'servings',
              type: 'number',
              label: 'Servings',
              min: 1,
            },
            {
              name: 'difficulty',
              type: 'select',
              options: [
                { label: 'Easy', value: 'easy' },
                { label: 'Medium', value: 'medium' },
                { label: 'Hard', value: 'hard' },
              ],
            },
          ],
        },
        {
          name: 'cuisine',
          type: 'text',
          label: 'Cuisine',
        },
      ],
    },
    // --- Ingredients (grouped) ---
    {
      name: 'ingredientGroups',
      type: 'array',
      label: 'Ingredient Groups',
      fields: [
        {
          name: 'groupName',
          type: 'text',
          label: 'Group Name',
          admin: {
            placeholder: 'e.g., For the sauce, For the dough',
          },
        },
        {
          name: 'ingredients',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'quantity',
                  type: 'text',
                  admin: { width: '20%' },
                },
                {
                  name: 'unit',
                  type: 'text',
                  admin: { width: '20%' },
                },
                {
                  name: 'item',
                  type: 'text',
                  required: true,
                  admin: { width: '40%' },
                },
                {
                  name: 'notes',
                  type: 'text',
                  admin: { width: '20%', placeholder: 'e.g., finely chopped' },
                },
              ],
            },
          ],
        },
      ],
    },
    // --- Steps ---
    {
      name: 'steps',
      type: 'array',
      label: 'Instructions',
      fields: [
        {
          name: 'instruction',
          type: 'richText',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'tip',
          type: 'text',
          label: 'Pro Tip',
        },
      ],
    },
    // --- Nutrition ---
    {
      name: 'nutrition',
      type: 'group',
      label: 'Nutrition (per serving)',
      admin: {
        condition: (_, siblingData) => siblingData?.showNutrition,
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'calories', type: 'number', label: 'Calories' },
            { name: 'protein', type: 'number', label: 'Protein (g)' },
            { name: 'carbs', type: 'number', label: 'Carbs (g)' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'fat', type: 'number', label: 'Fat (g)' },
            { name: 'fiber', type: 'number', label: 'Fiber (g)' },
          ],
        },
      ],
    },
    {
      name: 'showNutrition',
      type: 'checkbox',
      label: 'Include Nutrition Info',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    // --- Body (rich text for story/notes) ---
    {
      name: 'body',
      type: 'richText',
      label: 'Story / Additional Notes',
    },
    // --- Taxonomy ---
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    // --- Publishing ---
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
