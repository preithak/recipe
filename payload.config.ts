import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'

import { TipCallout } from '@/blocks/TipCallout'
import { ImageGallery } from '@/blocks/ImageGallery'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Categories } from '@/collections/Categories'
import { Tags } from '@/collections/Tags'
import { Recipes } from '@/collections/Recipes'
import { BlogPosts } from '@/collections/BlogPosts'

import { SiteSettings } from '@/globals/SiteSettings'
import { Header } from '@/globals/Header'
import { Footer } from '@/globals/Footer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      url: ({ data, collectionConfig }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        if (collectionConfig?.slug === 'recipes') {
          return `${baseUrl}/recipes/${data?.slug || ''}`
        }
        if (collectionConfig?.slug === 'blog-posts') {
          return `${baseUrl}/blog/${data?.slug || ''}`
        }
        return baseUrl
      },
      collections: ['recipes', 'blog-posts'],
    },
  },
  collections: [Users, Media, Categories, Tags, Recipes, BlogPosts],
  globals: [SiteSettings, Header, Footer],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({
        blocks: [TipCallout, ImageGallery],
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-ME-IN-PRODUCTION',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
  }),
  sharp,
})
