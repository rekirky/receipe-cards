import { useState, useEffect } from 'react'
import type { CostingSession, SavedCosting } from '../../types'
import { listSavedCostings, saveCostingSession, deleteCostingSession, costingSummary } from '../../utils/costingStorage'
import { formatCurrency } from '../../utils/units'

interface Props {
  currentSession: CostingSession
  currentSavedId: string | null
  onLoad: (saved: SavedCosting) => void
  onSaved: (id: string, name: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CostingSessionPanel({ currentSession, currentSavedId, onLoad, onSaved }: Props) {
  const [saved, setSaved] = useState<SavedCosting[]>([])
  const [saveName, setSaveName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)

  function refresh() {
    setSaved(listSavedCostings())
  }

  useEffect(() => {
    refresh()
  }, [])

  function handleSave() {
    const name = saveName.trim() || currentSession.recipeName || `Costing ${new Date().toLocaleDateString('en-AU')}`
    const record = saveCostingSession(name, currentSession, currentSavedId ?? undefined)
    onSaved(record.id, record.name)
    setShowSaveInput(false)
    setSaveName('')
    refresh()
  }

  function handleLoad(record: SavedCosting) {
    const { totalCost } = costingSummary(currentSession)
    if (
      totalCost > 0 &&
      record.id !== currentSavedId &&
      !window.confirm('Load this costing? Your current unsaved changes will be lost.')
    ) {
      return
    }
    onLoad(record)
    refresh()
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete this saved costing?')) return
    deleteCostingSession(id)
    refresh()
  }

  const inputClass =
    'bg-charcoal-800 border border-charcoal-600 text-charcoal-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500'

  return (
    <div className="bg-charcoal-700 rounded-2xl border border-charcoal-600 overflow-hidden">
      {/* Save section */}
      <div className="px-5 py-4 border-b border-charcoal-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg text-ember-400 tracking-wider">SAVE COSTING</h3>
          {currentSavedId && (
            <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full border border-green-800">
              Saved
            </span>
          )}
        </div>

        {showSaveInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={currentSession.recipeName || 'Session name'}
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className={inputClass}
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-ember-600 hover:bg-ember-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveInput(false)}
              className="px-3 py-2 bg-charcoal-600 hover:bg-charcoal-500 text-charcoal-300 text-sm rounded-lg transition-colors shrink-0"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            {currentSavedId ? (
              <>
                <button
                  onClick={() => {
                    const record = saveCostingSession(
                      saved.find((s) => s.id === currentSavedId)?.name ?? currentSession.recipeName,
                      currentSession,
                      currentSavedId,
                    )
                    onSaved(record.id, record.name)
                    refresh()
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-ember-600 hover:bg-ember-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4-3 3m0 0-3-3m3 3V4" />
                  </svg>
                  Update
                </button>
                <button
                  onClick={() => setShowSaveInput(true)}
                  className="px-4 py-2 bg-charcoal-600 hover:bg-charcoal-500 text-charcoal-200 text-sm font-medium rounded-lg transition-colors"
                >
                  Save As New
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowSaveInput(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-ember-600 hover:bg-ember-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4-3 3m0 0-3-3m3 3V4" />
                </svg>
                Save Costing
              </button>
            )}
          </div>
        )}
      </div>

      {/* Saved list */}
      <div className="px-5 py-4">
        <h3 className="font-display text-lg text-ember-400 tracking-wider mb-3">SAVED COSTINGS</h3>

        {saved.length === 0 ? (
          <p className="text-charcoal-500 text-sm">No saved costings yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {saved.map((record) => {
              const { totalCost } = costingSummary(record.session)
              const isActive = record.id === currentSavedId
              return (
                <div
                  key={record.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isActive
                      ? 'bg-charcoal-600 border-ember-700'
                      : 'bg-charcoal-800 border-charcoal-600 hover:border-charcoal-500'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal-100 text-sm font-medium truncate">{record.name}</span>
                      {isActive && (
                        <span className="text-xs text-ember-400 shrink-0">• active</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-charcoal-400 text-xs">{formatDate(record.savedAt)}</span>
                      {totalCost > 0 && (
                        <span className="text-ember-400 text-xs font-mono">{formatCurrency(totalCost)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleLoad(record)}
                      disabled={isActive}
                      className="px-3 py-1.5 bg-charcoal-600 hover:bg-charcoal-500 disabled:opacity-40 disabled:cursor-default text-charcoal-200 text-xs rounded-lg transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 text-charcoal-500 hover:text-red-400 transition-colors rounded-lg hover:bg-charcoal-600"
                      aria-label="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
