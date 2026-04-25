import { useState, useRef, useEffect } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { getAllRecipes } from '../utils/recipeStorage'
import type { CategoryDef } from '../utils/settingsStorage'
import { DEFAULT_SETTINGS } from '../utils/settingsStorage'
import type { Recipe } from '../types'

// ── Colour swatch preview ─────────────────────────────────────────────────────

function ColourSwatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-lg border border-charcoal-600" style={{ backgroundColor: hex }} />
      <span className="text-charcoal-500 text-xs">{label}</span>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-charcoal-700 rounded-2xl border border-charcoal-600 overflow-hidden">
      <div className="px-6 py-4 border-b border-charcoal-600">
        <h2 className="font-display text-2xl text-ember-400 tracking-wider">{title}</h2>
      </div>
      <div className="px-6 py-6 space-y-6">{children}</div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Admin() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="font-display text-5xl text-white tracking-widest mb-2">ADMIN</h1>
        <p className="text-charcoal-300">Manage branding, colours, and recipe categories.</p>
      </div>

      <LogoSection />
      <ColourSection />
      <PDFSection />
      <CategorySection />
    </div>
  )
}

// ── Logo ──────────────────────────────────────────────────────────────────────

function LogoSection() {
  const { settings, updateSettings } = useSettings()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500_000) {
      alert('Logo file must be under 500 KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => updateSettings({ logoBase64: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <Section title="LOGO">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-xl bg-charcoal-800 border border-charcoal-600 flex items-center justify-center overflow-hidden shrink-0">
          {settings.logoBase64 ? (
            <img src={settings.logoBase64} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <div className="w-10 h-10 bg-ember-600 rounded-lg flex items-center justify-center text-white font-display text-lg">
              RC
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-charcoal-300 text-sm">
            Upload an image to replace the default "RC" icon in the navigation bar.
            <br />
            <span className="text-charcoal-500 text-xs">PNG or SVG recommended. Max 500 KB.</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-ember-600 hover:bg-ember-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {settings.logoBase64 ? 'Replace logo' : 'Upload logo'}
            </button>
            {settings.logoBase64 && (
              <button
                onClick={() => updateSettings({ logoBase64: null })}
                className="px-4 py-2 bg-charcoal-600 hover:bg-charcoal-500 text-charcoal-300 text-sm font-medium rounded-lg transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>

      <div>
        <label className="block text-charcoal-400 text-xs uppercase tracking-widest mb-1.5 font-medium">
          Logo Link URL
        </label>
        <input
          type="url"
          placeholder="https://your-erp.example.com (leave blank to link to home)"
          value={settings.logoLinkUrl}
          onChange={(e) => updateSettings({ logoLinkUrl: e.target.value })}
          className="bg-charcoal-800 border border-charcoal-600 text-charcoal-100 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 placeholder:text-charcoal-600"
        />
        <p className="text-charcoal-500 text-xs mt-1.5">
          When set, clicking the logo opens this URL. Useful for embedding into other software and linking back.
        </p>
      </div>
    </Section>
  )
}

// ── Colours ───────────────────────────────────────────────────────────────────

function ColourSection() {
  const { settings, updateSettings } = useSettings()

  return (
    <Section title="COLOURS">
      {/* Theme colour */}
      <div>
        <label className="block text-charcoal-400 text-xs uppercase tracking-widest mb-3 font-medium">
          Theme Colour
        </label>
        <p className="text-charcoal-400 text-sm mb-4">
          The accent colour used for buttons, highlights, and active states throughout the app.
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="color"
            value={settings.themeColour}
            onChange={(e) => updateSettings({ themeColour: e.target.value })}
            className="w-14 h-10 rounded-lg border border-charcoal-600 bg-charcoal-800 cursor-pointer p-0.5"
          />
          <span className="text-charcoal-300 font-mono text-sm">{settings.themeColour}</span>
          <button
            onClick={() => updateSettings({ themeColour: DEFAULT_SETTINGS.themeColour })}
            className="px-3 py-1.5 bg-charcoal-600 hover:bg-charcoal-500 text-charcoal-300 text-xs rounded-lg transition-colors"
          >
            Reset to default
          </button>
        </div>
        {/* Live shade preview */}
        <div className="flex gap-2 mt-4">
          {([400, 500, 600, 700, 800, 900] as const).map((shade) => (
            <ColourSwatch
              key={shade}
              hex={`rgb(var(--ember-${shade}))`}
              label={String(shade)}
            />
          ))}
        </div>
      </div>

      <hr className="border-charcoal-600" />

      {/* Background colour */}
      <div>
        <label className="block text-charcoal-400 text-xs uppercase tracking-widest mb-3 font-medium">
          Background Colour
        </label>
        <p className="text-charcoal-400 text-sm mb-4">
          The page background colour.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={settings.bgColour}
            onChange={(e) => updateSettings({ bgColour: e.target.value })}
            className="w-14 h-10 rounded-lg border border-charcoal-600 bg-charcoal-800 cursor-pointer p-0.5"
          />
          <span className="text-charcoal-300 font-mono text-sm">{settings.bgColour}</span>
          <button
            onClick={() => updateSettings({ bgColour: DEFAULT_SETTINGS.bgColour })}
            className="px-3 py-1.5 bg-charcoal-600 hover:bg-charcoal-500 text-charcoal-300 text-xs rounded-lg transition-colors"
          >
            Reset to default
          </button>
        </div>
      </div>
    </Section>
  )
}

// ── PDF ───────────────────────────────────────────────────────────────────────

function PDFSection() {
  const { settings, updateSettings } = useSettings()

  return (
    <Section title="PDF OPTIONS">
      <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
        <div>
          <p className="text-charcoal-100 font-medium">Printer Friendly PDFs</p>
          <p className="text-charcoal-400 text-sm mt-0.5">
            Outputs PDFs with a white background and greyscale text — ideal for printing.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={settings.printerFriendly}
          onClick={() => updateSettings({ printerFriendly: !settings.printerFriendly })}
          className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ember-500 focus:ring-offset-2 focus:ring-offset-charcoal-700 ${
            settings.printerFriendly ? 'bg-ember-600' : 'bg-charcoal-500'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              settings.printerFriendly ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </label>
    </Section>
  )
}

// ── Categories ────────────────────────────────────────────────────────────────

function CategorySection() {
  const { settings, updateSettings } = useSettings()
  const [newId, setNewId] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    getAllRecipes().then(setRecipes).catch(console.error)
  }, [])

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function recipesUsingCategory(id: string): number {
    return recipes.filter((r) => r.category === id).length
  }

  function handleAdd() {
    const id = newId.trim() || slugify(newLabel)
    const label = newLabel.trim()
    if (!label) return
    if (settings.categories.some((c) => c.id === id)) {
      alert(`A category with id "${id}" already exists.`)
      return
    }
    updateSettings({ categories: [...settings.categories, { id, label }] })
    setNewId('')
    setNewLabel('')
  }

  function handleDelete(id: string) {
    const count = recipesUsingCategory(id)
    const msg =
      count > 0
        ? `This category is used by ${count} recipe${count > 1 ? 's' : ''}. Recipes will keep their category id but the label will show as the raw id. Delete anyway?`
        : 'Delete this category?'
    if (!window.confirm(msg)) return
    updateSettings({ categories: settings.categories.filter((c) => c.id !== id) })
  }

  function startEdit(cat: CategoryDef) {
    setEditingId(cat.id)
    setEditLabel(cat.label)
  }

  function commitEdit(id: string) {
    const label = editLabel.trim()
    if (!label) return
    updateSettings({
      categories: settings.categories.map((c) => (c.id === id ? { ...c, label } : c)),
    })
    setEditingId(null)
  }

  const inputClass =
    'bg-charcoal-800 border border-charcoal-600 text-charcoal-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500'

  return (
    <Section title="CATEGORIES">
      <p className="text-charcoal-400 text-sm -mt-2">
        Categories are used to organise recipes. Adding or renaming a category here updates it everywhere in the app.
      </p>

      {/* Existing categories */}
      <div className="space-y-2">
        {settings.categories.map((cat) => {
          const count = recipesUsingCategory(cat.id)
          const isEditing = editingId === cat.id
          return (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 bg-charcoal-800 rounded-xl border border-charcoal-600"
            >
              {isEditing ? (
                <input
                  autoFocus
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit(cat.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className={`${inputClass} flex-1`}
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <span className="text-charcoal-100 text-sm font-medium">{cat.label}</span>
                  <span className="text-charcoal-500 text-xs ml-2 font-mono">{cat.id}</span>
                  {count > 0 && (
                    <span className="text-charcoal-500 text-xs ml-2">· {count} recipe{count > 1 ? 's' : ''}</span>
                  )}
                </div>
              )}

              <div className="flex gap-1 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => commitEdit(cat.id)}
                      className="px-3 py-1.5 bg-ember-600 hover:bg-ember-500 text-white text-xs rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-charcoal-600 hover:bg-charcoal-500 text-charcoal-300 text-xs rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-charcoal-500 hover:text-charcoal-200 hover:bg-charcoal-600 rounded-lg transition-colors"
                      title="Rename"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-charcoal-500 hover:text-red-400 hover:bg-charcoal-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add new */}
      <div>
        <p className="text-charcoal-400 text-xs uppercase tracking-widest mb-3 font-medium">Add Category</p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Label (e.g. Wet Marinade)"
            value={newLabel}
            onChange={(e) => {
              setNewLabel(e.target.value)
              setNewId(slugify(e.target.value))
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className={`${inputClass} flex-1 min-w-48`}
          />
          <input
            type="text"
            placeholder="ID (auto)"
            value={newId}
            onChange={(e) => setNewId(slugify(e.target.value))}
            className={`${inputClass} w-40 font-mono`}
          />
          <button
            onClick={handleAdd}
            disabled={!newLabel.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-ember-600 hover:bg-ember-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </Section>
  )
}
