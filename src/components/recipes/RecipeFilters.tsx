'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type FilterOption = {
  label: string
  value: string
}

type RecipeFiltersProps = {
  categories: FilterOption[]
  activeCategory: string
  activeDifficulty: string
  activeTime: string
}

export function RecipeFilters({
  categories,
  activeCategory,
  activeDifficulty,
  activeTime,
}: RecipeFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const qs = params.toString()
      router.push(qs ? `/recipes?${qs}` : '/recipes')
    },
    [router, searchParams],
  )

  const allCategories: FilterOption[] = [{ label: 'All', value: '' }, ...categories]

  return (
    <div className="bg-surface-low/80 backdrop-blur-md px-6 py-4 rounded-2xl flex flex-wrap items-center justify-between gap-6 shadow-sm mb-10">
      {/* Category pills — left side */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60">
          Category:
        </span>
        {allCategories.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateFilter('category', opt.value)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
              activeCategory === opt.value
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-high'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Difficulty & Time dropdowns — right side */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60">
            Difficulty:
          </span>
          <select
            value={activeDifficulty}
            onChange={(e) => updateFilter('difficulty', e.target.value)}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-on-surface pr-6"
          >
            <option value="">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60">
            Time:
          </span>
          <select
            value={activeTime}
            onChange={(e) => updateFilter('time', e.target.value)}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-on-surface pr-6"
          >
            <option value="">Any Time</option>
            <option value="30">&lt; 30 mins</option>
            <option value="60">30-60 mins</option>
            <option value="61">1 hour+</option>
          </select>
        </div>
      </div>
    </div>
  )
}
