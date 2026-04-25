import { Router } from 'express'
import { readSettings, writeSettings } from '../store.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(readSettings())
})

router.put('/', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid settings payload' })
  }
  writeSettings(req.body)
  res.json(req.body)
})

export default router
