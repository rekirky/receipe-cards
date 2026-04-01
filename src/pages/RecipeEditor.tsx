import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import type { Recipe, RecipeIngredient, WeightUnit } from '../types'
import { saveRecipe, getRecipeById, deleteRecipe, isStaticRecipe, isUserRecipe } from '../utils/recipeStorage'
import { useSettings } from '../contexts/SettingsContext'
import { UNIT_OPTIONS } from '../utils/units'


interface IngredientDraft extends RecipeIngredient {
  _key: string
}

function blankIngredient(): IngredientDraft {
  return { _key: crypto.randomUUID(), name: '', amount: 0, unit: 'g', notes: '' }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function RecipeEditor() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isNew = !id
  const { categoryLabels } = useSettings()
  const categories = Object.entries(categoryLabels)

  const existing = id ? getRecipeById(id) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [category, setCategory] = useState(existing?.category ?? Object.keys(categoryLabels)[0] ?? 'dry-rub')
  const [tagline, setTagline] = useState(existing?.tagline ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [yieldAmount, setYieldAmount] = useState<number>(existing?.yieldAmount ?? 100)
  const [yieldUnit, setYieldUnit] = useState(existing?.yieldUnit ?? 'g')
  const [storageNotes, setStorageNotes] = useState(existing?.storageNotes ?? '')
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(
    existing?.ingredients.length
      ? existing.ingredients.map((i) => ({ ...i, _key: crypto.randomUUID() }))
      : [blankIngredient()],
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Recipe name is required'
    if (!tagline.trim()) e.tagline = 'Tagline is required'
    if (ingredients.every((i) => !i.name.trim())) e.ingredients = 'Add at least one ingredient'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    const recipeId = isNew ? slugify(name) || crypto.randomUUID() : id!
    const recipe: Recipe = {
      id: recipeId,
      name: name.trim(),
      category,
      tagline: tagline.trim(),
      description: description.trim(),
      yieldAmount,
      yieldUnit,
      storageNotes: storageNotes.trim() || undefined,
      ingredients: ingredients
        .filter((i) => i.name.trim())
        .map(({ _key: _k, ...rest }) => ({
          ...rest,
          notes: rest.notes?.trim() || undefined,
        })),
    }
    saveRecipe(recipe)
    navigate(`/recipe/${recipeId}`)
  }

  function handleDelete() {
    if (!id || !window.confirm('Delete this recipe? This cannot be undone.')) return
    deleteRecipe(id)
    navigate('/')
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, blankIngredient()])
  }

  function removeIngredient(key: string) {
    setIngredients((prev) => prev.filter((i) => i._key !== key))
  }

  function updateIngredient(key: string, field: keyof IngredientDraft, value: string | number) {
    setIngredients((prev) =>
      prev.map((i) => (i._key === key ? { ...i, [field]: value } : i)),
    )
  }

  function moveIngredient(key: string, dir: -1 | 1) {
    setIngredients((prev) => {
      const idx = prev.findIndex((i) => i._key === key)
      if (idx < 0) return prev
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  const inputClass =
    'bg-charcoal-800 border border-charcoal-600 text-charcoal-100 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500'
  const labelClass = 'block text-charcoal-400 text-xs uppercase tracking-widest mb-1.5 font-medium'
  const errorClass = 'text-red-400 text-xs mt-1'

  const showStaticNotice = !isNew && isStaticRecipe(id!) && !isUserRecipe(id!)
  const canDelete = !isNew && isUserRecipe(id!)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <Link to="/" className="text-charcoal-400 text-sm hover:text-ember-400 transition-colors mb-6 inline-block">
        ← Back to recipes
      </Link>

      <h1 className="font-display text-4xl text-white tracking-widest mb-6">
        {isNew ? 'NEW RECIPE' : 'EDIT RECIPE'}
      </h1>

      {showStaticNotice && (
        <div className="mb-6 bg-charcoal-700 border border-amber-700 rounded-xl px-5 py-3">
          <p className="text-amber-400 text-sm">
            You are editing a built-in recipe. Your changes will be saved as a customised local copy.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic info */}
        <div className="bg-charcoal-700 rounded-2xl p-6 border border-charcoal-600 space-y-4">
          <h2 className="font-display text-xl text-ember-400 tracking-wider">DETAILS</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Recipe Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Texas Brisket Rub"
                className={inputClass}
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {categories.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Tagline *</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short flavour description"
              className={inputClass}
            />
            {errors.tagline && <p className={errorClass}>{errors.tagline}</p>}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Usage notes, flavour profile, pairing suggestions..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Batch Yield Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Yield Unit</label>
              <select
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
                className={inputClass}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Storage Notes</label>
            <input
              type="text"
              value={storageNotes}
              onChange={(e) => setStorageNotes(e.target.value)}
              placeholder="e.g. Store in an airtight jar for up to 6 months."
              className={inputClass}
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-charcoal-700 rounded-2xl p-6 border border-charcoal-600">
          <h2 className="font-display text-xl text-ember-400 tracking-wider mb-4">INGREDIENTS</h2>
          {errors.ingredients && <p className={`${errorClass} mb-3`}>{errors.ingredients}</p>}

          {/* Column headers */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_7rem_9rem_1fr_2.5rem] gap-2 mb-1 px-1">
            <span className={labelClass}>Ingredient Name</span>
            <span className={labelClass}>Amount</span>
            <span className={labelClass}>Unit</span>
            <span className={labelClass}>Notes (optional)</span>
            <span />
          </div>

          <div className="space-y-3 mb-4">
            {ingredients.map((ing, idx) => (
              <div key={ing._key} className="group">
                {/* Desktop: single grid row */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_7rem_9rem_1fr_2.5rem] gap-2 items-center">
                  <input
                    type="text"
                    placeholder="e.g. Smoked paprika"
                    value={ing.name}
                    onChange={(e) => updateIngredient(ing._key, 'name', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    step="any"
                    value={ing.amount || ''}
                    onChange={(e) => updateIngredient(ing._key, 'amount', parseFloat(e.target.value) || 0)}
                    className={inputClass}
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => updateIngredient(ing._key, 'unit', e.target.value as WeightUnit)}
                    className={inputClass}
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. finely ground"
                    value={ing.notes ?? ''}
                    onChange={(e) => updateIngredient(ing._key, 'notes', e.target.value)}
                    className={inputClass}
                  />
                  <div className="flex flex-col items-center gap-0.5">
                    <button onClick={() => moveIngredient(ing._key, -1)} disabled={idx === 0} className="text-charcoal-500 hover:text-charcoal-300 disabled:opacity-20 p-1" aria-label="Move up">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => removeIngredient(ing._key)} disabled={ingredients.length === 1} className="text-charcoal-500 hover:text-red-400 disabled:opacity-20 transition-colors p-1" aria-label="Remove ingredient">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <button onClick={() => moveIngredient(ing._key, 1)} disabled={idx === ingredients.length - 1} className="text-charcoal-500 hover:text-charcoal-300 disabled:opacity-20 p-1" aria-label="Move down">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </div>

                {/* Mobile: stacked layout */}
                <div className="sm:hidden bg-charcoal-800 rounded-xl p-3 space-y-2 border border-charcoal-600">
                  <div>
                    <label className={labelClass}>Ingredient Name</label>
                    <input type="text" placeholder="e.g. Smoked paprika" value={ing.name} onChange={(e) => updateIngredient(ing._key, 'name', e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>Amount</label>
                      <input type="number" placeholder="0" min="0" step="any" value={ing.amount || ''} onChange={(e) => updateIngredient(ing._key, 'amount', parseFloat(e.target.value) || 0)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Unit</label>
                      <select value={ing.unit} onChange={(e) => updateIngredient(ing._key, 'unit', e.target.value as WeightUnit)} className={inputClass}>
                        {UNIT_OPTIONS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Notes (optional)</label>
                    <input type="text" placeholder="e.g. finely ground" value={ing.notes ?? ''} onChange={(e) => updateIngredient(ing._key, 'notes', e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex gap-2">
                      <button onClick={() => moveIngredient(ing._key, -1)} disabled={idx === 0} className="text-xs text-charcoal-400 hover:text-charcoal-200 disabled:opacity-20 px-2 py-1 rounded bg-charcoal-700">↑ Up</button>
                      <button onClick={() => moveIngredient(ing._key, 1)} disabled={idx === ingredients.length - 1} className="text-xs text-charcoal-400 hover:text-charcoal-200 disabled:opacity-20 px-2 py-1 rounded bg-charcoal-700">↓ Down</button>
                    </div>
                    <button onClick={() => removeIngredient(ing._key)} disabled={ingredients.length === 1} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-20 px-2 py-1 rounded bg-charcoal-700">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addIngredient}
            className="flex items-center gap-2 text-sm text-ember-400 hover:text-ember-300 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add ingredient
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-ember-600 hover:bg-ember-500 text-white font-medium rounded-xl transition-colors"
            >
              {isNew ? 'Create Recipe' : 'Save Changes'}
            </button>
            <Link
              to={isNew ? '/' : `/recipe/${id}`}
              className="px-6 py-2.5 bg-charcoal-600 hover:bg-charcoal-500 text-charcoal-200 font-medium rounded-xl transition-colors"
            >
              Cancel
            </Link>
          </div>

          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-white hover:bg-red-900/50 border border-red-900 hover:border-red-700 rounded-xl text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete Recipe
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
