import type { WeightUnit } from '../types'

// Converts any WeightUnit to grams (or ml, treated equivalently)
const TO_GRAMS: Record<WeightUnit, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  ml: 1,
  l: 1000,
  tsp: 4.92892,   // ~5 ml
  tbsp: 14.7868,  // ~15 ml
  cup: 236.588,   // ~237 ml
}

export function toGrams(amount: number, unit: WeightUnit): number {
  return amount * TO_GRAMS[unit]
}

export function formatUnit(unit: WeightUnit): string {
  const labels: Record<WeightUnit, string> = {
    g: 'g',
    kg: 'kg',
    oz: 'oz',
    lb: 'lb',
    ml: 'ml',
    l: 'L',
    tsp: 'tsp',
    tbsp: 'tbsp',
    cup: 'cup',
  }
  return labels[unit]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: 'g', label: 'g (grams)' },
  { value: 'kg', label: 'kg (kilograms)' },
  { value: 'oz', label: 'oz (ounces)' },
  { value: 'lb', label: 'lb (pounds)' },
  { value: 'ml', label: 'ml (millilitres)' },
  { value: 'l', label: 'L (litres)' },
  { value: 'tsp', label: 'tsp (teaspoon)' },
  { value: 'tbsp', label: 'tbsp (tablespoon)' },
  { value: 'cup', label: 'cup' },
]
