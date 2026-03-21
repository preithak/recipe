'use client'

import { useState } from 'react'
import Link from 'next/link'

type NavItem = {
  label: string
  url: string
}

export function MobileMenuButton({ navItems }: { navItems: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
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
          {isOpen ? (
            <>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </>
          ) : (
            <>
              <path d="M4 12h16" />
              <path d="M4 6h16" />
              <path d="M4 18h16" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-[72px] z-40 md:hidden">
          <div
            className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <nav className="relative bg-surface-low rounded-b-2xl mx-4 mt-2 p-6 shadow-[0_8px_40px_rgba(45,21,9,0.1)]">
            <div className="flex flex-col gap-4">
              {navItems.map((item, i) => (
                <Link
                  key={i}
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-serif text-on-surface hover:text-primary transition-colors py-2"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
