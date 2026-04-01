import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { applyStoredSettings } from './utils/settingsStorage'

// Apply saved theme/bg colours synchronously before React mounts to avoid a flash
applyStoredSettings()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
