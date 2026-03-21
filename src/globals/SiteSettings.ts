import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      required: true,
      defaultValue: 'Reciepie',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      defaultValue: 'Warm recipes & kitchen stories, lovingly crafted for home cooks.',
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Default OG Image',
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'pinterest', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'facebook', type: 'text' },
      ],
    },
  ],
}
