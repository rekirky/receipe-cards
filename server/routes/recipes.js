import { Router } from 'express'
import { readRecipes, writeRecipes } from '../store.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(readRecipes())
})

router.get('/:id', (req, res) => {
  const recipe = readRecipes().find((r) => r.id === req.params.id)
  if (!recipe) return res.status(404).json({ error: 'Not found' })
  res.json(recipe)
})

router.post('/', (req, res) => {
  const recipe = req.body
  if (!recipe?.id || !recipe?.name) {
    return res.status(400).json({ error: 'id and name are required' })
  }
  const recipes = readRecipes()
  if (recipes.some((r) => r.id === recipe.id)) {
    return res.status(409).json({ error: 'A recipe with this id already exists' })
  }
  recipes.push(recipe)
  writeRecipes(recipes)
  res.status(201).json(recipe)
})

router.put('/:id', (req, res) => {
  const recipe = { ...req.body, id: req.params.id }
  if (!recipe.name) return res.status(400).json({ error: 'name is required' })
  const recipes = readRecipes()
  const idx = recipes.findIndex((r) => r.id === req.params.id)
  if (idx === -1) {
    recipes.push(recipe)
  } else {
    recipes[idx] = recipe
  }
  writeRecipes(recipes)
  res.json(recipe)
})

router.delete('/:id', (req, res) => {
  const recipes = readRecipes()
  const filtered = recipes.filter((r) => r.id !== req.params.id)
  if (filtered.length === recipes.length) {
    return res.status(404).json({ error: 'Not found' })
  }
  writeRecipes(filtered)
  res.status(204).end()
})

export default router
