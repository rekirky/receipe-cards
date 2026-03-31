import type { CostingSession, SavedCosting } from '../types'
import { calcLineCost } from './costing'
import { formatCurrency } from './units'

const KEY = 'rcards-costings-v1'

function load(): Record<string, SavedCosting> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, SavedCosting>) : {}
  } catch {
    return {}
  }
}

function persist(map: Record<string, SavedCosting>): void {
  localStorage.setItem(KEY, JSON.stringify(map))
}

export function listSavedCostings(): SavedCosting[] {
  return Object.values(load()).sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export function saveCostingSession(
  name: string,
  session: CostingSession,
  existingId?: string,
): SavedCosting {
  const map = load()
  const id = existingId ?? crypto.randomUUID()
  const record: SavedCosting = { id, name, savedAt: new Date().toISOString(), session }
  map[id] = record
  persist(map)
  return record
}

export function loadCostingSession(id: string): SavedCosting | undefined {
  return load()[id]
}

export function deleteCostingSession(id: string): void {
  const map = load()
  delete map[id]
  persist(map)
}

export function exportCostingAsCSV(session: CostingSession): void {
  const rows: string[][] = [
    ['Recipe / Dish', session.recipeName],
    ['Portions', String(session.portionCount)],
    ['Date', new Date().toLocaleDateString('en-AU')],
    [],
    ['Ingredient', 'Pack Size', 'Pack Unit', 'Pack Cost ($)', 'Used Amount', 'Used Unit', 'Line Cost ($)'],
    ...session.ingredients.map((ing) => [
      ing.name,
      String(ing.purchaseWeight),
      ing.purchaseUnit,
      ing.purchaseCost.toFixed(2),
      String(ing.usedAmount),
      ing.usedUnit,
      calcLineCost(ing).toFixed(4),
    ]),
    [],
    ['Total Batch Cost', '', '', '', '', '', session.ingredients.reduce((s, i) => s + calcLineCost(i), 0).toFixed(4)],
    ['Cost Per Portion', '', '', '', '', '', (session.ingredients.reduce((s, i) => s + calcLineCost(i), 0) / session.portionCount).toFixed(4)],
  ]

  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `costing-${(session.recipeName || 'unnamed').replace(/[^a-z0-9]/gi, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Returns a formatted summary string for display purposes
export function costingSummary(session: CostingSession): {
  totalCost: number
  costPerPortion: number
} {
  const totalCost = session.ingredients.reduce((s, i) => s + calcLineCost(i), 0)
  return {
    totalCost,
    costPerPortion: session.portionCount > 0 ? totalCost / session.portionCount : 0,
  }
}

export { formatCurrency }
