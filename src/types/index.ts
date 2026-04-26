export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb' | 'tsp' | 'tbsp' | 'cup' | 'ml' | 'l' | 'each' | 'unit' | 'drizzle' | 'squirt' | 'pieces'

export type RecipeCategory = string

export interface RecipeIngredient {
  name: string
  amount: number
  unit: WeightUnit
  notes?: string
}

export interface RecipeImages {
  front?: string
  back?: string
  instructions?: string
  nutritional?: string
  additional?: string
}

export const IMAGE_SLOTS: { key: keyof RecipeImages; label: string }[] = [
  { key: 'front',        label: 'Front' },
  { key: 'back',         label: 'Back' },
  { key: 'instructions', label: 'Usage / Instructions' },
  { key: 'nutritional',  label: 'Nutritional Information' },
  { key: 'additional',   label: 'Additional Image' },
]

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
  images?: RecipeImages
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
