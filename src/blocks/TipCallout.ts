import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const TipCallout: Block = {
  slug: 'tipCallout',
  labels: {
    singular: 'Tip Callout',
    plural: 'Tip Callouts',
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'tip',
      options: [
        { label: 'Tip', value: 'tip' },
        { label: 'Note', value: 'note' },
        { label: 'Warning', value: 'warning' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      admin: { placeholder: 'e.g., Chef\'s Tip' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor(),
    },
  ],
}
