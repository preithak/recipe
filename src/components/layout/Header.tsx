import Link from 'next/link'
import { getPayload } from '@/lib/payload'
import { MobileMenuButton } from './MobileMenuButton'

export async function Header() {
  const payload = await getPayload()
  const header = await payload.findGlobal({ slug: 'header' })

  const defaultNavItems = [
    { label: 'Home', url: '/' },
    { label: 'Recipes', url: '/recipes' },
    { label: 'Blog', url: '/blog' },
    { label: 'Categories', url: '/categories' },
  ]

  const navItems = header?.navItems?.length ? header.navItems : defaultNavItems

  return (
    <header className="sticky top-0 z-50 backdrop-blur-[20px] bg-surface/80 shadow-[0_2px_40px_rgba(45,21,9,0.06)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-start">
          <span className="font-serif text-2xl text-on-surface tracking-tight">
            The Heirloom Editorial
          </span>
          <span className="text-xs text-on-surface-variant tracking-widest uppercase">
            Homemade recipes with love
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item: { label: string; url: string }, i: number) => (
            <Link
              key={i}
              href={item.url}
              className="text-sm tracking-wide text-on-surface-variant hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search + Mobile Menu */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-on-surface-variant"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <MobileMenuButton navItems={navItems} />
        </div>
      </div>
    </header>
  )
}
