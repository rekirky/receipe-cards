import type { CostingIngredient } from '../types'
import { toGrams } from './units'

export function calcLineCost(ing: CostingIngredient): number {
  const purchaseG = toGrams(ing.purchaseWeight, ing.purchaseUnit)
  const usedG = toGrams(ing.usedAmount, ing.usedUnit)
  if (!purchaseG || !ing.purchaseCost) return 0
  return (usedG / purchaseG) * ing.purchaseCost
}

export function calcTotalCost(ingredients: CostingIngredient[]): number {
  return ingredients.reduce((sum, ing) => sum + calcLineCost(ing), 0)
}
