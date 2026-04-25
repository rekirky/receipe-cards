import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import recipesRouter from './routes/recipes.js'
import settingsRouter from './routes/settings.js'
import costingsRouter from './routes/costings.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json({ limit: '4mb' }))

app.use('/api/recipes', recipesRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/costings', costingsRouter)

// Serve the built frontend
const distDir = join(__dirname, '../dist')
app.use(express.static(distDir, {
  maxAge: '1y',
  immutable: true,
  // Don't cache entry point
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  },
}))

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(distDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Recipe Cards server running on http://localhost:${PORT}`)
})
