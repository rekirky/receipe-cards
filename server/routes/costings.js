import { Router } from 'express'
import { readCostings, writeCostings } from '../store.js'
import { randomUUID } from 'crypto'

const router = Router()

router.get('/', (_req, res) => {
  const costings = readCostings()
  const list = Object.values(costings).sort((a, b) =>
    b.savedAt.localeCompare(a.savedAt),
  )
  res.json(list)
})

router.get('/:id', (req, res) => {
  const costing = readCostings()[req.params.id]
  if (!costing) return res.status(404).json({ error: 'Not found' })
  res.json(costing)
})

router.post('/', (req, res) => {
  const { id = randomUUID(), name, session } = req.body ?? {}
  if (!name || !session) {
    return res.status(400).json({ error: 'name and session are required' })
  }
  const savedAt = new Date().toISOString()
  const record = { id, name, savedAt, session }
  const costings = readCostings()
  costings[id] = record
  writeCostings(costings)
  res.status(201).json(record)
})

router.put('/:id', (req, res) => {
  const { name, session } = req.body ?? {}
  if (!name || !session) {
    return res.status(400).json({ error: 'name and session are required' })
  }
  const costings = readCostings()
  const existing = costings[req.params.id]
  const record = {
    id: req.params.id,
    name,
    savedAt: existing?.savedAt ?? new Date().toISOString(),
    session,
  }
  costings[req.params.id] = record
  writeCostings(costings)
  res.json(record)
})

router.delete('/:id', (req, res) => {
  const costings = readCostings()
  if (!costings[req.params.id]) {
    return res.status(404).json({ error: 'Not found' })
  }
  delete costings[req.params.id]
  writeCostings(costings)
  res.status(204).end()
})

export default router
