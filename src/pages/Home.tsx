import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecipes } from '../data/recipes'
import RecipeCard from '../components/recipe/RecipeCard'
import { useSettings } from '../contexts/SettingsContext'
import type { Recipe } from '../types'

const ALL = 'all'

export default function Home() {
  const { categoryLabels } = useSettings()
  const [filter, setFilter] = useState(ALL)
  const [recipes, setRecipes] = useState<Recipe[]>([])

  // Reload from storage on every mount (catches adds/edits from other pages)
  useEffect(() => {
    setRecipes(getAllRecipes())
  }, [])

  const categories = [...new Set(recipes.map((r) => r.category))]
  const filtered = filter === ALL ? recipes : recipes.filter((r) => r.category === filter)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-5xl text-white tracking-widest mb-2">
            RECIPES
          </h1>
          <p className="text-charcoal-300 text-lg">Browse and download your various recipes.</p>
        </div>
        <Link
          to="/recipe/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-ember-600 hover:bg-ember-500 text-white font-medium rounded-xl transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Recipe
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter(ALL)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === ALL
              ? 'bg-ember-600 text-white'
              : 'bg-charcoal-700 text-charcoal-300 hover:bg-charcoal-600 hover:text-white'
          }`}
        >
          All ({recipes.length})
        </button>
        {categories.map((cat) => {
          const count = recipes.filter((r) => r.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-ember-600 text-white'
                  : 'bg-charcoal-700 text-charcoal-300 hover:bg-charcoal-600 hover:text-white'
              }`}
            >
              {categoryLabels[cat] ?? cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-charcoal-400">No recipes in this category yet.</div>
      )}
    </div>
  )
}
