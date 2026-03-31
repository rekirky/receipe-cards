import type { Recipe } from '../types'
import { recipes as staticRecipes } from '../data/recipes'

const RECIPES_KEY = 'rcards-recipes-v1'
const DELETED_KEY = 'rcards-recipes-deleted-v1'

function loadUserRecipes(): Record<string, Recipe> {
  try {
    const raw = localStorage.getItem(RECIPES_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Recipe>) : {}
  } catch {
    return {}
  }
}

function loadDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function persistUserRecipes(map: Record<string, Recipe>): void {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(map))
}

function persistDeletedIds(ids: string[]): void {
  localStorage.setItem(DELETED_KEY, JSON.stringify(ids))
}

export function getAllRecipes(): Recipe[] {
  const userMap = loadUserRecipes()
  const deletedIds = new Set(loadDeletedIds())
  const userRecipes = Object.values(userMap)
  const userIds = new Set(Object.keys(userMap))
  const defaults = staticRecipes.filter((r) => !userIds.has(r.id) && !deletedIds.has(r.id))
  return [...userRecipes, ...defaults]
}

export function getRecipeById(id: string): Recipe | undefined {
  const userMap = loadUserRecipes()
  if (userMap[id]) return userMap[id]
  return staticRecipes.find((r) => r.id === id)
}

export function saveRecipe(recipe: Recipe): void {
  const map = loadUserRecipes()
  map[recipe.id] = recipe
  persistUserRecipes(map)
}

export function deleteRecipe(id: string): void {
  const map = loadUserRecipes()
  delete map[id]
  persistUserRecipes(map)
  // If it was a static recipe, tombstone it so it stays hidden
  if (staticRecipes.some((r) => r.id === id)) {
    const deleted = loadDeletedIds()
    if (!deleted.includes(id)) {
      persistDeletedIds([...deleted, id])
    }
  }
}

export function isStaticRecipe(id: string): boolean {
  return staticRecipes.some((r) => r.id === id)
}

export function isUserRecipe(id: string): boolean {
  return !!loadUserRecipes()[id]
}
