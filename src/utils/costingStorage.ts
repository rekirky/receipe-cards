import type { CostingSession, SavedCosting } from '../types'
import { calcLineCost } from './costing'
import { formatCurrency } from './units'

const API = '/api/costings'

export async function listSavedCostings(): Promise<SavedCosting[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Failed to load costings')
  return res.json()
}

export async function saveCostingSession(
  name: string,
  session: CostingSession,
  existingId?: string,
): Promise<SavedCosting> {
  const id = existingId
  const method = id ? 'PUT' : 'POST'
  const url = id ? `${API}/${id}` : API
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, session }),
  })
  if (!res.ok) throw new Error('Failed to save costing')
  return res.json()
}

export async function loadCostingSession(id: string): Promise<SavedCosting | undefined> {
  const res = await fetch(`${API}/${id}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error('Failed to load costing')
  return res.json()
}

export async function deleteCostingSession(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete costing')
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
