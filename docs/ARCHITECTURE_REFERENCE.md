# Recipe - Architecture Reference

**Generated:** 2026-03-22
**Last Updated:** 2026-03-22
**Status:** Phases 1-7 Complete — Phase 8 (Deployment) pending

---

## SYSTEM ASSETS & CONNECTION STRINGS

### Database
```
Type: SQLite (dev) / Turso (prod, planned)
ORM: Payload CMS 3.80 (Drizzle under the hood)
Connection String: file:./payload.db (dev)
```

### Authentication
```
Provider: Payload CMS built-in (session-based)
Method: Email + Password with session cookies
Roles: admin, editor
```

### External Services
```
None configured yet.
Planned: Vercel Blob (image storage, Phase 8)
```

---

## DIRECTORY STRUCTURE

```
recipe/
├── docs/
│   ├── ARCHITECTURE_REFERENCE.md  # This document
│   ├── PLAN.md                    # 8-phase implementation plan
│   ├── DESIGN.md                  # "The Heirloom Editorial" design system
│   └── memory/                    # Maitri-memory task tracking
├── scripts/
│   ├── scrape_recipes.py          # JSON-LD recipe scraper + Payload seeder
│   └── fix_images.py              # Image download/upload helper
├── src/
│   ├── app/
│   │   ├── (frontend)/            # Public-facing pages
│   │   │   ├── layout.tsx         # Frontend layout (skip-nav, Header, Footer)
│   │   │   ├── page.tsx           # Homepage (hero, categories, recipes, blog, newsletter)
│   │   │   ├── recipes/
│   │   │   │   ├── page.tsx       # Recipe listing with filters + pagination
│   │   │   │   └── [slug]/page.tsx # Individual recipe + JSON-LD
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx       # Blog listing with pagination
│   │   │   │   └── [slug]/page.tsx # Individual blog post
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx       # Category listing
│   │   │   │   └── [slug]/page.tsx # Category with filtered recipes
│   │   │   ├── search/page.tsx    # Search across recipes + blog
│   │   │   └── api/seed/route.ts  # Dev seed endpoint
│   │   ├── (payload)/             # Payload CMS admin panel & API
│   │   │   ├── admin/
│   │   │   │   ├── [[...segments]]/page.tsx
│   │   │   │   └── importMap.js
│   │   │   ├── api/[...slug]/route.ts
│   │   │   └── layout.tsx
│   │   ├── layout.tsx             # Root layout (passthrough)
│   │   └── globals.css            # Tailwind + design tokens + a11y
│   ├── blocks/                    # Custom Lexical rich text blocks
│   │   ├── TipCallout.ts          # Tip/note/warning callout
│   │   └── ImageGallery.ts        # Captioned image grid
│   ├── collections/
│   │   ├── Users.ts               # Auth + admin/editor roles
│   │   ├── Media.ts               # Image uploads (3 auto-sizes)
│   │   ├── Categories.ts
│   │   ├── Tags.ts
│   │   ├── Recipes.ts             # Full recipe model + ISR hook
│   │   └── BlogPosts.ts           # Blog model + ISR hook
│   ├── globals/
│   │   ├── SiteSettings.ts        # Title, social, OG image
│   │   ├── Header.ts              # Logo, nav items
│   │   └── Footer.ts              # Copyright, links
│   ├── hooks/
│   │   └── revalidate.ts          # ISR afterChange hooks
│   ├── components/
│   │   ├── layout/                # Header, Footer, MobileMenuButton
│   │   ├── recipes/               # RecipeCard, RecipeFilters
│   │   ├── blog/                  # BlogCard
│   │   ├── shared/                # RichText renderer
│   │   └── ui/                    # Pagination
│   └── lib/
│       ├── payload.ts             # getPayload() singleton
│       └── queries.ts             # Reusable data-fetching helpers
├── payload.config.ts              # Payload config (collections, globals, blocks, Live Preview)
├── next.config.ts                 # Next.js config (withPayload wrapper)
├── tsconfig.json                  # @payload-config alias
└── CLAUDE.md                      # Project instructions + Stitch reference
```

---

## DEPENDENCY GRAPH

### Technology Stack

```
Frontend:
├── Next.js 16.2.1 (App Router)
├── React 19.2.4
├── Tailwind CSS 4.2.2
└── Noto Serif + Inter (Google Fonts)

Backend (embedded CMS):
├── Payload CMS 3.80.0
├── @payloadcms/next 3.80.0
├── @payloadcms/db-sqlite 3.80.0
├── @payloadcms/richtext-lexical 3.80.0
├── graphql 16.13.1
└── sharp 0.34.5

Database:
└── SQLite (via Payload's Drizzle adapter)
```

---

## DATABASE SCHEMA

### Core Entities (Payload Collections)

| Collection | Description |
|-----------|-------------|
| users | Auth-enabled users with admin/editor roles |
| media | Image uploads with thumbnail (300px), card (600px), hero (1200px) sizes |
| categories | Recipe/blog categories with slug, description, image |
| tags | Simple name + slug taxonomy |
| recipes | Full recipe: ingredients (grouped), steps, nutrition, metadata, rich text body |
| blog-posts | Blog articles with rich text, related recipes |

### Access Control

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| users | Own profile / Admin: all | Admin only | Own / Admin | Admin only |
| media | Public | Authenticated | Authenticated | Admin only |
| categories | Public | Authenticated | Authenticated | Admin only |
| tags | Public | Authenticated | Authenticated | Admin only |
| recipes | Public | Authenticated | Authenticated | Admin only |
| blog-posts | Public | Authenticated | Authenticated | Admin only |

---

## API ENDPOINTS

### Payload REST API (auto-generated)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List users (auth required) |
| GET | `/api/recipes` | List recipes |
| GET | `/api/recipes/:id` | Get single recipe |
| GET | `/api/blog-posts` | List blog posts |
| GET | `/api/blog-posts/:id` | Get single blog post |
| GET | `/api/categories` | List categories |
| GET | `/api/tags` | List tags |
| GET | `/api/media` | List media |
| POST | `/api/users/login` | Login |
| POST | `/api/users/logout` | Logout |

### Admin Panel
| Path | Description |
|------|-------------|
| `/admin` | Payload CMS admin dashboard |

---

## ENVIRONMENT VARIABLES

```bash
# From .env.example
DATABASE_URI=file:./payload.db
PAYLOAD_SECRET=your-secret-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## QUICK COMMANDS

```bash
# Development
pnpm dev                    # Start dev server (port 3000)
pnpm build                  # Production build
pnpm start                  # Start production server

# Payload
pnpm generate:types         # Generate TypeScript types from collections

# Lint
pnpm lint                   # Run ESLint
```

---

## KEY BOUNDARIES

| Component | Responsibility | Never Does |
|-----------|----------------|------------|
| `(payload)/` route group | Admin panel, REST API, auth | Public page rendering |
| `(frontend)/` route group | Public pages, SEO | Admin/auth UI |
| `collections/*.ts` | Schema definition, access control | UI rendering |
| `payload.config.ts` | CMS configuration | Business logic |

---

## DESIGN SYSTEM

Theme: **"The Heirloom Editorial"** — warm, editorial, cookbook feel.

| Token | Value | Usage |
|-------|-------|-------|
| `--surface` | #fff8f6 | Base background |
| `--primary` | #c17547 | Terracotta accents, CTAs |
| `--secondary` | #7a8b6f | Sage green, secondary actions |
| `--tertiary` | #d4a853 | Warm gold highlights |
| `--on-surface` | #2d1509 | Primary text |
| Font (headings) | Noto Serif | Editorial voice |
| Font (body) | Inter | Functional voice |

Full design system: see `DESIGN.md`

---

## RELATED DOCUMENTATION

| Document | Path | Purpose |
|----------|------|---------|
| Implementation Plan | `PLAN.md` | 8-phase, 39-step build plan |
| Design System | `DESIGN.md` | Complete "Heirloom Editorial" design spec |
| Project Instructions | `CLAUDE.md` | Claude session instructions |
| Memory Files | `docs/memory/` | Session continuity tracking |

---

## Document Maintenance

This document should be updated when:
- New services or components are added
- Database schema changes
- API endpoints are added or modified
- Infrastructure changes

**Last Updated:** 2026-03-22
**Version:** 1.0
