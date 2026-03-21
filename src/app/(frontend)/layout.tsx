import type { Metadata } from 'next'
import { Noto_Serif, Inter } from 'next/font/google'
import '../globals.css'

const notoSerif = Noto_Serif({
  variable: '--font-noto-serif',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Reciepie — Warm Recipes & Kitchen Stories',
    template: '%s | Reciepie',
  },
  description:
    'A warm collection of recipes and kitchen stories, lovingly crafted for home cooks.',
}

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        {/* Header/nav will be added in Phase 3 */}
        <main className="flex-1">{children}</main>
        {/* Footer will be added in Phase 3 */}
      </body>
    </html>
  )
}
