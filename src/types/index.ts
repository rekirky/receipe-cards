export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb' | 'tsp' | 'tbsp' | 'cup' | 'ml' | 'l'

export type RecipeCategory = string

export interface RecipeIngredient {
  name: string
  amount: number
  unit: WeightUnit
  notes?: string
}

export interface Recipe {
  id: string
  name: string
  category: RecipeCategory
  tagline: string
  description: string
  ingredients: RecipeIngredient[]
  yieldAmount: number
  yieldUnit: string
  storageNotes?: string
  imageUrl?: string
}

// ── Saved Costings ───────────────────────────────────────────────────────────

export interface SavedCosting {
  id: string
  name: string
  savedAt: string
  session: CostingSession
}

// ── Costing Calculator ──────────────────────────────────────────────────────

export interface CostingIngredient {
  id: string
  name: string
  purchaseWeight: number
  purchaseUnit: WeightUnit
  purchaseCost: number
  usedAmount: number
  usedUnit: WeightUnit
}

export interface CostingSession {
  recipeName: string
  portionCount: number
  ingredients: CostingIngredient[]
}
