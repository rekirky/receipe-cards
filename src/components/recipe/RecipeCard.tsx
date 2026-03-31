import { Link, useNavigate } from 'react-router-dom'
import type { Recipe } from '../../types'
import { CATEGORY_LABELS } from '../../data/recipes'

interface Props {
  recipe: Recipe
}

const CATEGORY_COLOURS: Record<string, string> = {
  'dry-rub': 'bg-ember-700',
  'wet-marinade': 'bg-blue-700',
  injection: 'bg-purple-700',
  'finishing-sauce': 'bg-yellow-700',
  brine: 'bg-teal-700',
  seasoning: 'bg-green-700',
}

export default function RecipeCard({ recipe }: Props) {
  const navigate = useNavigate()
  const categoryColour = CATEGORY_COLOURS[recipe.category] ?? 'bg-charcoal-600'

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group relative block bg-charcoal-700 rounded-xl overflow-hidden border border-charcoal-600 hover:border-ember-500 transition-all hover:shadow-lg hover:shadow-ember-900/30 hover:-translate-y-0.5"
    >
      {/* Edit shortcut */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/recipe/${recipe.id}/edit`) }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-charcoal-600 hover:bg-ember-700 text-charcoal-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10"
        aria-label="Edit recipe"
        title="Edit recipe"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
      {/* Header band */}
      <div className="bg-charcoal-900 px-5 pt-5 pb-3">
        <span
          className={`inline-block text-xs font-medium text-white px-2 py-0.5 rounded-full mb-2 ${categoryColour}`}
        >
          {CATEGORY_LABELS[recipe.category] ?? recipe.category}
        </span>
        <h2 className="font-display text-2xl text-white tracking-wider leading-tight group-hover:text-ember-400 transition-colors">
          {recipe.name}
        </h2>
        <p className="text-charcoal-300 text-sm mt-1">{recipe.tagline}</p>
      </div>

      {/* Ingredient preview */}
      <div className="px-5 py-4">
        <p className="text-charcoal-400 text-xs uppercase tracking-widest mb-2 font-medium">
          Ingredients ({recipe.ingredients.length})
        </p>
        <ul className="space-y-1">
          {recipe.ingredients.slice(0, 4).map((ing) => (
            <li key={ing.name} className="flex items-center justify-between text-sm">
              <span className="text-charcoal-200">{ing.name}</span>
              <span className="text-ember-400 font-mono text-xs">
                {ing.amount}
                {ing.unit}
              </span>
            </li>
          ))}
          {recipe.ingredients.length > 4 && (
            <li className="text-charcoal-400 text-xs pt-1">
              + {recipe.ingredients.length - 4} more...
            </li>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-charcoal-600 flex items-center justify-between">
        <span className="text-charcoal-400 text-xs">
          Yield: {recipe.yieldAmount}
          {recipe.yieldUnit}
        </span>
        <span className="text-ember-400 text-xs font-medium group-hover:text-ember-300">
          View recipe →
        </span>
      </div>
    </Link>
  )
}
