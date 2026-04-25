import type { Recipe } from '../types'

const API = '/api/recipes'

export async function getAllRecipes(): Promise<Recipe[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Failed to load recipes')
  return res.json()
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  const res = await fetch(`${API}/${id}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error('Failed to load recipe')
  return res.json()
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const res = await fetch(`${API}/${recipe.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  })
  if (!res.ok) throw new Error('Failed to save recipe')
}

export async function createRecipe(recipe: Recipe): Promise<void> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Failed to create recipe')
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete recipe')
}
