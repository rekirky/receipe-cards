import type { CostingIngredient } from '../../types'
import { UNIT_OPTIONS, formatCurrency } from '../../utils/units'
import { calcLineCost } from '../../utils/costing'

interface Props {
  ingredient: CostingIngredient
  index: number
  onChange: (updated: CostingIngredient) => void
  onRemove: () => void
}

export default function IngredientCostRow({ ingredient, index, onChange, onRemove }: Props) {
  const lineCost = calcLineCost(ingredient)

  const update = (field: keyof CostingIngredient, value: string | number) => {
    onChange({ ...ingredient, [field]: value })
  }

  const inputClass =
    'bg-charcoal-800 border border-charcoal-600 text-charcoal-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500'
  const selectClass =
    'bg-charcoal-800 border border-charcoal-600 text-charcoal-100 text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500'

  return (
    <tr className="border-b border-charcoal-700">
      {/* # */}
      <td className="py-3 px-2 text-charcoal-500 text-sm text-center w-8">{index + 1}</td>

      {/* Name */}
      <td className="py-3 px-2 min-w-[140px]">
        <input
          type="text"
          placeholder="Ingredient name"
          value={ingredient.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputClass}
        />
      </td>

      {/* Purchase weight */}
      <td className="py-3 px-2 w-32">
        <input
          type="number"
          placeholder="0"
          min="0"
          step="any"
          value={ingredient.purchaseWeight || ''}
          onChange={(e) => update('purchaseWeight', parseFloat(e.target.value) || 0)}
          className={inputClass}
        />
      </td>

      {/* Purchase unit */}
      <td className="py-3 px-2 w-28">
        <select
          value={ingredient.purchaseUnit}
          onChange={(e) => update('purchaseUnit', e.target.value)}
          className={selectClass}
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </td>

      {/* Purchase cost */}
      <td className="py-3 px-2 w-28">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm">
            $
          </span>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={ingredient.purchaseCost || ''}
            onChange={(e) => update('purchaseCost', parseFloat(e.target.value) || 0)}
            className={`${inputClass} pl-6`}
          />
        </div>
      </td>

      {/* Used amount */}
      <td className="py-3 px-2 w-28">
        <input
          type="number"
          placeholder="0"
          min="0"
          step="any"
          value={ingredient.usedAmount || ''}
          onChange={(e) => update('usedAmount', parseFloat(e.target.value) || 0)}
          className={inputClass}
        />
      </td>

      {/* Used unit */}
      <td className="py-3 px-2 w-28">
        <select
          value={ingredient.usedUnit}
          onChange={(e) => update('usedUnit', e.target.value)}
          className={selectClass}
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </td>

      {/* Line cost */}
      <td className="py-3 px-3 w-24 text-right">
        <span
          className={`font-mono text-sm font-bold ${lineCost > 0 ? 'text-ember-400' : 'text-charcoal-500'}`}
        >
          {lineCost > 0 ? formatCurrency(lineCost) : '—'}
        </span>
      </td>

      {/* Remove */}
      <td className="py-3 px-2 w-10">
        <button
          onClick={onRemove}
          className="text-charcoal-500 hover:text-red-400 transition-colors p-1"
          aria-label="Remove ingredient"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </td>
    </tr>
  )
}

