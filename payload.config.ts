import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Categories } from '@/collections/Categories'
import { Tags } from '@/collections/Tags'
import { Recipes } from '@/collections/Recipes'
import { BlogPosts } from '@/collections/BlogPosts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Tags, Recipes, BlogPosts],
  editor: lexicalEditor(),
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
