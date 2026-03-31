import { useReducer, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import type { CostingIngredient, CostingSession, SavedCosting } from '../types'
import IngredientCostRow from '../components/costing/IngredientCostRow'
import CostingSessionPanel from '../components/costing/CostingSessionPanel'
import CostingPdfDocument from '../components/costing/CostingPdfDocument'
import { calcLineCost, calcTotalCost } from '../utils/costing'
import { formatCurrency } from '../utils/units'
import { exportCostingAsCSV } from '../utils/costingStorage'

// ── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_PORTIONS'; count: number }
  | { type: 'ADD_INGREDIENT' }
  | { type: 'UPDATE_INGREDIENT'; id: string; ingredient: CostingIngredient }
  | { type: 'REMOVE_INGREDIENT'; id: string }
  | { type: 'LOAD_SESSION'; session: CostingSession }
  | { type: 'CLEAR' }

function newIngredient(): CostingIngredient {
  return {
    id: crypto.randomUUID(),
    name: '',
    purchaseWeight: 0,
    purchaseUnit: 'kg',
    purchaseCost: 0,
    usedAmount: 0,
    usedUnit: 'g',
  }
}

function reducer(state: CostingSession, action: Action): CostingSession {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, recipeName: action.name }
    case 'SET_PORTIONS':
      return { ...state, portionCount: action.count }
    case 'ADD_INGREDIENT':
      return { ...state, ingredients: [...state.ingredients, newIngredient()] }
    case 'UPDATE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.map((i) =>
          i.id === action.id ? action.ingredient : i,
        ),
      }
    case 'REMOVE_INGREDIENT':
      return { ...state, ingredients: state.ingredients.filter((i) => i.id !== action.id) }
    case 'LOAD_SESSION':
      return action.session
    case 'CLEAR':
      return initialState()
  }
}

function initialState(): CostingSession {
  return { recipeName: '', portionCount: 1, ingredients: [newIngredient()] }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Costing() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null)
  const [currentSavedName, setCurrentSavedName] = useState<string | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const totalCost = calcTotalCost(state.ingredients)
  const costPerPortion = state.portionCount > 0 ? totalCost / state.portionCount : 0

  const filledIngredients = state.ingredients.filter(
    (i) => i.name && i.purchaseWeight > 0 && i.purchaseCost > 0 && i.usedAmount > 0,
  )

  function handleLoad(saved: SavedCosting) {
    dispatch({ type: 'LOAD_SESSION', session: saved.session })
    setCurrentSavedId(saved.id)
    setCurrentSavedName(saved.name)
  }

  function handleSaved(id: string, name: string) {
    setCurrentSavedId(id)
    setCurrentSavedName(name)
  }

  async function handleExportPDF() {
    setPdfLoading(true)
    try {
      const blob = await pdf(<CostingPdfDocument session={state} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `costing-${(state.recipeName || 'unnamed').replace(/[^a-z0-9]/gi, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-5xl text-white tracking-widest mb-2">MENU COSTING</h1>
          <p className="text-charcoal-300">Calculate ingredient costs per batch and per portion.</p>
        </div>
        <button
          onClick={() => setShowPanel((v) => !v)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
            showPanel
              ? 'bg-ember-700 text-white'
              : 'bg-charcoal-700 border border-charcoal-600 text-charcoal-200 hover:bg-charcoal-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4-3 3m0 0-3-3m3 3V4" />
          </svg>
          {showPanel ? 'Hide' : 'Save / Load'}
          {currentSavedName && !showPanel && (
            <span className="ml-1 text-ember-400">· {currentSavedName}</span>
          )}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main costing area */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Current session indicator */}
          {currentSavedName && (
            <div className="flex items-center gap-2 px-4 py-2 bg-charcoal-700 border border-charcoal-600 rounded-xl">
              <span className="w-2 h-2 bg-green-400 rounded-full shrink-0" />
              <span className="text-charcoal-300 text-sm">
                Loaded: <span className="text-white font-medium">{currentSavedName}</span>
              </span>
            </div>
          )}

          {/* Recipe meta */}
          <div className="bg-charcoal-700 rounded-2xl p-6 border border-charcoal-600 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-charcoal-400 text-xs uppercase tracking-widest mb-2 font-medium">
                Recipe / Dish Name
              </label>
              <input
                type="text"
                placeholder="e.g. Smoked Brisket"
                value={state.recipeName}
                onChange={(e) => dispatch({ type: 'SET_NAME', name: e.target.value })}
                className="bg-charcoal-800 border border-charcoal-600 text-charcoal-100 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-charcoal-400 text-xs uppercase tracking-widest mb-2 font-medium">
                Number of Portions
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={state.portionCount}
                onChange={(e) =>
                  dispatch({ type: 'SET_PORTIONS', count: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="bg-charcoal-800 border border-charcoal-600 text-charcoal-100 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500"
              />
            </div>
          </div>

          {/* Ingredients table */}
          <div className="bg-charcoal-700 rounded-2xl border border-charcoal-600 overflow-x-auto">
            <div className="px-6 pt-5 pb-3 border-b border-charcoal-600">
              <h2 className="font-display text-2xl text-ember-400 tracking-wider">INGREDIENTS</h2>
              <p className="text-charcoal-400 text-xs mt-1">
                Enter the pack size you purchased, what you paid, and how much this recipe uses.
              </p>
            </div>

            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="text-charcoal-400 text-xs uppercase tracking-widest">
                  <th className="py-3 px-2 text-center w-8">#</th>
                  <th className="py-3 px-2 text-left">Ingredient</th>
                  <th className="py-3 px-2 text-left">Pack Size</th>
                  <th className="py-3 px-2 text-left">Unit</th>
                  <th className="py-3 px-2 text-left">Pack Cost</th>
                  <th className="py-3 px-2 text-left">Used in Recipe</th>
                  <th className="py-3 px-2 text-left">Unit</th>
                  <th className="py-3 px-2 text-right">Line Cost</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {state.ingredients.map((ing, i) => (
                  <IngredientCostRow
                    key={ing.id}
                    ingredient={ing}
                    index={i}
                    onChange={(updated) =>
                      dispatch({ type: 'UPDATE_INGREDIENT', id: ing.id, ingredient: updated })
                    }
                    onRemove={() => dispatch({ type: 'REMOVE_INGREDIENT', id: ing.id })}
                  />
                ))}
              </tbody>
            </table>

            <div className="px-6 py-4 border-t border-charcoal-600">
              <button
                onClick={() => dispatch({ type: 'ADD_INGREDIENT' })}
                className="flex items-center gap-2 text-sm text-ember-400 hover:text-ember-300 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add ingredient
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SummaryCard
              label="Ingredients costed"
              value={`${filledIngredients.length} / ${state.ingredients.length}`}
              sub="fully filled rows"
              muted={filledIngredients.length === 0}
            />
            <SummaryCard
              label="Total batch cost"
              value={formatCurrency(totalCost)}
              sub={`across ${state.portionCount} portion${state.portionCount !== 1 ? 's' : ''}`}
              highlight
              muted={totalCost === 0}
            />
            <SummaryCard
              label="Cost per portion"
              value={formatCurrency(costPerPortion)}
              sub="ingredient cost only"
              highlight
              muted={costPerPortion === 0}
            />
          </div>

          {/* Cost breakdown */}
          {filledIngredients.length > 0 && (
            <div className="bg-charcoal-700 rounded-2xl border border-charcoal-600 overflow-hidden">
              <div className="px-6 pt-5 pb-3 border-b border-charcoal-600">
                <h2 className="font-display text-2xl text-ember-400 tracking-wider">COST BREAKDOWN</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-charcoal-400 text-xs uppercase tracking-widest">
                    <th className="py-3 px-6 text-left">Ingredient</th>
                    <th className="py-3 px-6 text-right">Cost</th>
                    <th className="py-3 px-6 text-right">% of Batch</th>
                  </tr>
                </thead>
                <tbody>
                  {filledIngredients
                    .map((ing) => ({ ing, cost: calcLineCost(ing) }))
                    .sort((a, b) => b.cost - a.cost)
                    .map(({ ing, cost }) => (
                      <tr key={ing.id} className="border-t border-charcoal-600">
                        <td className="py-3 px-6 text-charcoal-200 text-sm">{ing.name}</td>
                        <td className="py-3 px-6 text-right font-mono text-sm text-ember-400 font-bold">
                          {formatCurrency(cost)}
                        </td>
                        <td className="py-3 px-6 text-right text-sm text-charcoal-300">
                          {totalCost > 0 ? ((cost / totalCost) * 100).toFixed(1) : '0.0'}%
                          <div className="mt-1 h-1.5 bg-charcoal-600 rounded-full overflow-hidden w-24 ml-auto">
                            <div
                              className="h-full bg-ember-600 rounded-full"
                              style={{ width: `${totalCost > 0 ? (cost / totalCost) * 100 : 0}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Action bar */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportPDF}
              disabled={pdfLoading || filledIngredients.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-ember-600 hover:bg-ember-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
            >
              {pdfLoading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0-3-3m3 3 3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Export PDF
            </button>

            <button
              onClick={() => exportCostingAsCSV(state)}
              disabled={filledIngredients.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-charcoal-600 hover:bg-charcoal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-charcoal-600 hover:bg-charcoal-500 text-charcoal-200 rounded-xl text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear all data and start a new costing sheet?')) {
                  dispatch({ type: 'CLEAR' })
                  setCurrentSavedId(null)
                  setCurrentSavedName(null)
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-charcoal-700 hover:bg-charcoal-600 text-charcoal-300 hover:text-white rounded-xl text-sm font-medium transition-colors border border-charcoal-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              New sheet
            </button>
          </div>
        </div>

        {/* Save/Load panel */}
        {showPanel && (
          <div className="xl:w-80 shrink-0">
            <CostingSessionPanel
              currentSession={state}
              currentSavedId={currentSavedId}
              onLoad={handleLoad}
              onSaved={handleSaved}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  highlight = false,
  muted = false,
}: {
  label: string
  value: string
  sub: string
  highlight?: boolean
  muted?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-6 border ${
        highlight ? 'bg-charcoal-700 border-ember-700' : 'bg-charcoal-700 border-charcoal-600'
      }`}
    >
      <p className="text-charcoal-400 text-xs uppercase tracking-widest mb-1 font-medium">{label}</p>
      <p
        className={`font-display text-3xl tracking-wider ${
          muted ? 'text-charcoal-500' : highlight ? 'text-ember-400' : 'text-white'
        }`}
      >
        {value}
      </p>
      <p className="text-charcoal-500 text-xs mt-1">{sub}</p>
    </div>
  )
}
