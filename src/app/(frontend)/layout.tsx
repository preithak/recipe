import React from 'react'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Header/nav will be added in Phase 3 */}
      <main className="flex-1">{children}</main>
      {/* Footer will be added in Phase 3 */}
    </>
  )
}
