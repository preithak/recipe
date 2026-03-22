import Link from 'next/link'
import { getPayload } from '@/lib/payload'

export async function Footer() {
  const payload = await getPayload()
  const footer = await payload.findGlobal({ slug: 'footer' })
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })

  const defaultLinks = [
    { label: 'About Us', url: '/about' },
    { label: 'Contact', url: '/contact' },
    { label: 'Privacy Policy', url: '/privacy' },
  ]

  const links = footer?.links?.length ? footer.links : defaultLinks
  const copyright = footer?.copyright || '© 2026 The Heirloom Editorial. Crafted for the modern alchemist.'
  const socialLinks = siteSettings?.socialLinks

  return (
    <footer className="bg-surface-low">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top section */}
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="max-w-xs">
            <span className="font-serif text-2xl text-on-surface">The Heirloom Editorial</span>
            <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
              Warm recipes &amp; kitchen stories, lovingly crafted for home cooks.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-10 gap-y-3">
            {links.map((link: { label: string; url: string }, i: number) => (
              <Link
                key={i}
                href={link.url}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social */}
          {socialLinks && (
            <div className="flex gap-4">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-full hover:bg-surface-container transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {socialLinks.pinterest && (
                <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="p-2 rounded-full hover:bg-surface-container transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5.15 4.85A9 9 0 1 0 21 12c0-1.2-.4-2.2-1-3"/><path d="m12 2-3 10"/></svg>
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-2 rounded-full hover:bg-surface-container transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-outline-variant/15">
          <p className="text-xs text-on-surface-variant text-center">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
