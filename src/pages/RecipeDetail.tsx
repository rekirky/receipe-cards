import { useParams, Link } from 'react-router-dom'
import { usePDF } from '@react-pdf/renderer'
import { useState, useEffect } from 'react'
import { getRecipeById } from '../utils/recipeStorage'
import { useSettings } from '../contexts/SettingsContext'
import type { Recipe } from '../types'
import RecipeCardPDF from '../components/recipe/RecipeCardPDF'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const { categoryLabels, settings } = useSettings()
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getRecipeById(id)
      .then(setRecipe)
      .finally(() => setLoading(false))
  }, [id])

  const pdfDoc = recipe
    ? <RecipeCardPDF
        recipe={recipe}
        themeColour={settings.themeColour}
        categoryLabel={categoryLabels[recipe.category] ?? recipe.category}
        printerFriendly={settings.printerFriendly}
      />
    : <></>

  const [instance, updateInstance] = usePDF({ document: pdfDoc })

  useEffect(() => {
    if (recipe) {
      updateInstance(
        <RecipeCardPDF
          recipe={recipe}
          themeColour={settings.themeColour}
          categoryLabel={categoryLabels[recipe.category] ?? recipe.category}
          printerFriendly={settings.printerFriendly}
        />
      )
    }
  }, [recipe, settings.themeColour, settings.printerFriendly]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="animate-spin w-8 h-8 border-2 border-ember-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-charcoal-400 text-lg mb-4">Recipe not found.</p>
        <Link to="/" className="text-ember-400 hover:underline">
          ← Back to recipes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="text-charcoal-400 text-sm hover:text-ember-400 transition-colors mb-6 inline-block"
      >
        ← Back to all recipes
      </Link>

      {/* Header */}
      <div className="bg-charcoal-900 rounded-2xl p-8 mb-6 border border-charcoal-700">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-medium text-white px-2 py-0.5 rounded-full mb-3 bg-ember-700">
              {categoryLabels[recipe.category] ?? recipe.category}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-white tracking-widest mb-2">
              {recipe.name.toUpperCase()}
            </h1>
            <p className="text-charcoal-300 text-base italic">{recipe.tagline}</p>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex items-center gap-2">
            <Link
              to={`/recipe/${recipe.id}/edit`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm bg-charcoal-600 hover:bg-charcoal-500 text-charcoal-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </Link>
            {instance.loading ? (
              <span className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm bg-charcoal-700 text-charcoal-400 cursor-wait">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-charcoal-400 border-t-transparent rounded-full" />
                Preparing PDF...
              </span>
            ) : instance.url ? (
              <a
                href={instance.url}
                download={`${recipe.id}-recipe-card.pdf`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm bg-ember-600 hover:bg-ember-500 text-white shadow-lg shadow-ember-900/40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0-3-3m3 3 3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>
            ) : (
              <span className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm bg-charcoal-700 text-red-400">
                PDF unavailable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Ingredients */}
        <div className="md:col-span-3 bg-charcoal-700 rounded-2xl p-6 border border-charcoal-600">
          <h2 className="font-display text-2xl text-ember-400 tracking-wider mb-4">INGREDIENTS</h2>
          <p className="text-charcoal-400 text-xs uppercase tracking-widest mb-4">
            Batch yield: {recipe.yieldAmount}{recipe.yieldUnit}
          </p>
          <div className="space-y-0">
            {recipe.ingredients.map((ing, i) => (
              <div
                key={`${ing.name}-${i}`}
                className={`flex items-start justify-between py-3 ${
                  i !== recipe.ingredients.length - 1 ? 'border-b border-charcoal-600' : ''
                }`}
              >
                <div>
                  <span className="text-charcoal-100 font-medium">{ing.name}</span>
                  {ing.notes && (
                    <span className="block text-charcoal-400 text-xs italic mt-0.5">{ing.notes}</span>
                  )}
                </div>
                <span className="text-ember-400 font-mono font-bold text-sm ml-4 shrink-0">
                  {ing.amount} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Details sidebar */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-charcoal-700 rounded-2xl p-6 border border-charcoal-600">
            <h2 className="font-display text-2xl text-ember-400 tracking-wider mb-3">ABOUT</h2>
            <p className="text-charcoal-200 text-sm leading-relaxed">{recipe.description}</p>
          </div>

          {recipe.storageNotes && (
            <div className="bg-charcoal-700 rounded-2xl p-6 border border-charcoal-600">
              <h2 className="font-display text-xl text-ember-400 tracking-wider mb-3">STORAGE</h2>
              <p className="text-charcoal-200 text-sm leading-relaxed">{recipe.storageNotes}</p>
            </div>
          )}

          <div className="bg-charcoal-700 rounded-2xl p-6 border border-charcoal-600">
            <h2 className="font-display text-xl text-ember-400 tracking-wider mb-3">BATCH INFO</h2>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-400">Total ingredients</span>
              <span className="text-white font-medium">{recipe.ingredients.length}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-charcoal-400">Batch yield</span>
              <span className="text-white font-medium">{recipe.yieldAmount} {recipe.yieldUnit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
