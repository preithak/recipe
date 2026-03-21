# Recipe & Blog Webapp — Implementation Plan

## Context

Build a cooking/recipe webapp ("Reciepie") where multiple editors can upload recipes and blog posts (tips & tricks) through a CMS admin panel. The public site should have a warm, cozy aesthetic (earthy tones, rustic cookbook feel). Deploying to Vercel.

---

## Approach: Next.js + Payload CMS 3.0 (Embedded)

**Why Payload CMS 3.0?** It installs directly into a Next.js app — one codebase, one deployment. You get a full admin panel (login, media library, rich text editor, CRUD for all content) out of the box. No need to build an admin UI from scratch. TypeScript end-to-end, built-in auth with roles, and Lexical rich text editor with custom blocks.

**Why not custom admin?** Building auth, CRUD UI, image uploads, rich text editing from scratch = weeks of work that Payload gives on day one.
**Why not MDX files?** No image upload UI, no formatting toolbar, every edit requires a git commit — doesn't meet the CMS requirement.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| CMS | Payload CMS 3.0 (embedded in Next.js) |
| Database (dev) | SQLite (local file) |
| Database (prod) | Turso (hosted SQLite, free tier) |
| Styling | Tailwind CSS 4 |
| Rich Text Editor | Lexical (Payload built-in) |
| Image Storage (dev) | Local filesystem |
| Image Storage (prod) | Vercel Blob |
| Auth | Payload built-in (session-based, multi-user with roles) |
| Deployment | Vercel |
| Package Manager | pnpm |

---

## Project Structure

```
reciepie/
├── payload.config.ts             # Payload master config
├── next.config.ts
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── (frontend)/           # Public-facing pages
│   │   │   ├── layout.tsx        # Public layout (header, footer, nav)
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── recipes/
│   │   │   │   ├── page.tsx      # Recipe listing grid
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx      # Blog listing
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── categories/[slug]/page.tsx
│   │   │   └── search/page.tsx
│   │   ├── (payload)/            # Payload admin panel (auto-generated routes)
│   │   │   ├── admin/[[...segments]]/page.tsx
│   │   │   └── api/[...slug]/route.ts
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css
│   ├── collections/              # Payload collection schemas
│   │   ├── Recipes.ts
│   │   ├── BlogPosts.ts
│   │   ├── Categories.ts
│   │   ├── Tags.ts
│   │   ├── Media.ts
│   │   └── Users.ts
│   ├── globals/                  # Payload globals (single docs)
│   │   ├── SiteSettings.ts
│   │   ├── Header.ts
│   │   └── Footer.ts
│   ├── blocks/                   # Custom Lexical rich text blocks
│   │   ├── TipCallout.ts
│   │   └── ImageGallery.ts
│   ├── components/
│   │   ├── ui/                   # Button, Card, Badge, SearchBar, Pagination
│   │   ├── recipes/              # RecipeCard, RecipeHeader, IngredientList, StepList
│   │   ├── blog/                 # BlogCard, BlogHeader, BlogGrid
│   │   ├── layout/               # Header, Footer, Navigation, MobileMenu
│   │   └── shared/               # RichText renderer, MediaImage
│   └── lib/
│       ├── payload.ts            # getPayload() singleton
│       ├── queries.ts            # Reusable data-fetching functions
│       └── metadata.ts           # SEO helpers
└── public/
    ├── fonts/
    └── icons/
```

---

## Data Models

### Recipes
- `title`, `slug`, `description`, `featuredImage` (upload)
- **Metadata**: `prepTime`, `cookTime`, `totalTime` (auto-calculated), `servings`, `difficulty` (Easy/Medium/Hard), `cuisine`
- **Ingredients**: array of groups → each with `groupName` + array of `{ quantity, unit, item, notes }`
- **Steps**: array of `{ instruction (richText), image (optional upload), tip (optional) }`
- **Nutrition** (optional): calories, protein, carbs, fat, fiber
- **Body**: rich text for story/additional notes
- **Taxonomy**: category (relationship), tags (relationship, hasMany)
- **Publishing**: status (draft/published), publishedAt

### Blog Posts
- `title`, `slug`, `excerpt`, `featuredImage`, `content` (rich text with custom blocks)
- `category`, `tags`, `relatedRecipes` (relationship to recipes)
- `status` (draft/published), `publishedAt`

### Media
- Upload collection with auto-generated sizes: thumbnail (300px), card (600px), hero (1200px)
- `alt` (required), `caption`

### Categories & Tags
- `name`, `slug`, optional `description` and `image` (categories only)

### Users (Multi-editor)
- Payload built-in auth enabled
- Fields: `name`, `role` (admin | editor)
- **Admin**: full access to everything
- **Editor**: can create/edit recipes and blog posts, upload media, but cannot manage users or site settings
- Access control defined per-collection in Payload config

---

## Design Direction: Warm & Cozy

- **Color palette**: Cream/off-white backgrounds, warm browns, terracotta/rust accents, sage green highlights
- **Typography**: Serif font for headings (e.g., Playfair Display or Lora), clean sans-serif for body (e.g., Inter or Source Sans)
- **Visual touches**: Subtle paper/linen texture backgrounds, rounded corners, warm shadows, photography-forward layouts
- **Cards**: Soft shadows, slightly rounded, warm border tones
- **Icons**: Hand-drawn or organic style where appropriate

---

## Implementation Phases

### Phase 1: Foundation
1. Initialize project with `pnpx create-payload-app@latest`
2. Configure Tailwind CSS with warm/cozy color palette and custom fonts
3. Set up `.env` and `.env.example`
4. Configure `payload.config.ts` with SQLite adapter
5. Create Users collection with roles (admin/editor) and access control
6. Verify admin panel works at `/admin`
7. Init git repo

### Phase 2: Content Modeling
8. Create Categories, Tags, Media collections
9. Create Recipes collection (ingredients, steps, nutrition, metadata)
10. Create BlogPosts collection with rich text and relationships
11. Create Globals (SiteSettings, Header, Footer)
12. Seed 2-3 sample recipes and 1-2 blog posts via admin

### Phase 3: Public Layout & Navigation
13. Root layout with fonts (Playfair Display + Inter), warm color CSS variables
14. Public layout with Header, Footer, responsive Navigation
15. Mobile menu
16. `lib/payload.ts` and `lib/queries.ts` helpers

### Phase 4: Recipe Pages
17. Recipe listing page — grid of RecipeCards with category filter
18. Individual recipe page — hero image, metadata bar, ingredient checklist, numbered steps, nutrition card
19. JSON-LD structured data (schema.org/Recipe) for SEO
20. Print-friendly view
21. `generateStaticParams()` + `generateMetadata()`

### Phase 5: Blog Pages
22. Blog listing page — grid of BlogCards
23. Individual blog post page with RichText renderer
24. Related recipes section
25. Static generation + metadata

### Phase 6: Homepage & Discovery
26. Homepage — hero, featured recipes, latest posts, category cards
27. Category filter page
28. Search page (Payload `where` queries via server action)
29. Pagination on listing pages

### Phase 7: Rich Text Blocks & Polish
30. Custom Lexical blocks: TipCallout, ImageGallery
31. Payload Live Preview config
32. ISR revalidation via Payload `afterChange` hooks
33. Responsive design pass (mobile, tablet, desktop)
34. Accessibility pass

### Phase 8: Deployment
35. Set up Turso database (free tier)
36. Configure `@payloadcms/storage-vercel-blob` plugin
37. Deploy to Vercel, set env vars
38. Configure custom domain
39. Create admin + editor accounts in production

---

## Verification

1. **Local dev**: `pnpm dev` → admin panel at `/admin`, create a recipe with photos, verify it renders on public site at `/recipes/[slug]`
2. **Multi-user**: Create an editor account, log in, verify they can add recipes but not manage users
3. **Image uploads**: Upload images in admin, verify thumbnails auto-generated, images render on public pages via `next/image`
4. **Rich text**: Create a blog post with custom blocks (TipCallout), verify it renders correctly on the public page
5. **Search**: Search for a recipe by name, verify results appear
6. **SEO**: Check recipe page source for JSON-LD structured data and OpenGraph meta tags
7. **Print**: Click print on a recipe page, verify clean printable layout
8. **Deploy**: Push to Vercel, verify production site loads, admin panel works, image uploads persist to Vercel Blob
9. **ISR**: Edit a recipe in admin, verify the public page updates without full redeploy

---

## Cost (Monthly)

| Service | Free Tier |
|---|---|
| Vercel hosting | $0 |
| Turso database | $0 (9GB) |
| Vercel Blob (images) | ~$0 (first 1GB) |
| **Total** | **~$0/month** to start |
