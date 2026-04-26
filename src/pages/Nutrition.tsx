import { useState } from 'react'
import { generateId } from '../utils/uuid'

interface NutrientRow {
  id: string
  name: string
  unit: string
  per100g: string
}

const DEFAULT_NUTRIENTS: NutrientRow[] = [
  { id: '1', name: 'Energy',         unit: 'kJ', per100g: '0' },
  { id: '2', name: 'Protein',        unit: 'g',  per100g: '0' },
  { id: '3', name: 'Fat, total',     unit: 'g',  per100g: '0' },
  { id: '4', name: '  - saturated',  unit: 'g',  per100g: '0' },
  { id: '5', name: 'Carbohydrate',   unit: 'g',  per100g: '0' },
  { id: '6', name: '  - sugars',     unit: 'g',  per100g: '0' },
  { id: '7', name: 'Sodium',         unit: 'mg', per100g: '0' },
]

function calcPerServing(per100g: string, servingSize: string): string {
  const p = parseFloat(per100g) || 0
  const s = parseFloat(servingSize) || 0
  return ((p * s) / 100).toFixed(1)
}

function buildSVG(
  servingsPerPackage: string,
  servingSize: string,
  productName: string,
  rows: NutrientRow[],
): string {
  const W = 400
  const headerHeight = 140
  const rowHeight = 22
  const footerPad = 20
  const H = headerHeight + rows.length * rowHeight + footerPad

  const lines: string[] = []

  const add = (s: string) => lines.push(s)

  // Border rect (transparent fill)
  add(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="black" stroke-width="2"/>`)

  // Title
  add(`<text x="${W / 2}" y="26" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="black" text-anchor="middle">Nutrition Information</text>`)

  // Thick divider under title
  add(`<line x1="1" y1="32" x2="${W - 1}" y2="32" stroke="black" stroke-width="3"/>`)

  // Product name (if set)
  let yHead = 48
  if (productName.trim()) {
    add(`<text x="16" y="${yHead}" font-family="Arial, sans-serif" font-size="13" fill="black">${escXml(productName)}</text>`)
    yHead += 18
  }

  add(`<text x="16" y="${yHead}" font-family="Arial, sans-serif" font-size="13" fill="black">Servings per package: <tspan font-weight="bold">${escXml(servingsPerPackage || '—')}</tspan></text>`)
  yHead += 18
  add(`<text x="16" y="${yHead}" font-family="Arial, sans-serif" font-size="13" fill="black">Serving size: <tspan font-weight="bold">${escXml(servingSize || '0')}g</tspan></text>`)
  yHead += 14

  // Thin divider
  add(`<line x1="1" y1="${yHead}" x2="${W - 1}" y2="${yHead}" stroke="black" stroke-width="1"/>`)
  yHead += 14

  // Column headers row 1
  const col1 = 16
  const col2 = 210
  const col3 = 316

  add(`<text x="${col1}" y="${yHead}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="black">Nutrient</text>`)
  add(`<text x="${col2}" y="${yHead}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="black" text-anchor="middle">Avg. Qty</text>`)
  add(`<text x="${col3}" y="${yHead}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="black" text-anchor="middle">Avg. Qty</text>`)
  yHead += 13

  // Column headers row 2
  add(`<text x="${col2}" y="${yHead}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="black" text-anchor="middle">per serving</text>`)
  add(`<text x="${col3}" y="${yHead}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="black" text-anchor="middle">per 100g</text>`)
  yHead += 6

  // Thick divider under headers
  add(`<line x1="1" y1="${yHead}" x2="${W - 1}" y2="${yHead}" stroke="black" stroke-width="3"/>`)

  // Nutrient rows
  let yRow = yHead + 16
  rows.forEach((row, i) => {
    const perServing = calcPerServing(row.per100g, servingSize)
    const per100gVal = parseFloat(row.per100g) || 0
    const isIndented = row.name.startsWith(' ')
    const nameX = isIndented ? col1 + 14 : col1
    const fontWeight = isIndented ? 'normal' : 'bold'

    add(`<text x="${nameX}" y="${yRow}" font-family="Arial, sans-serif" font-size="13" font-weight="${fontWeight}" fill="black">${escXml(row.name.trim())}</text>`)
    add(`<text x="${col2}" y="${yRow}" font-family="Arial, sans-serif" font-size="13" fill="black" text-anchor="middle">${perServing} ${escXml(row.unit)}</text>`)
    add(`<text x="${col3}" y="${yRow}" font-family="Arial, sans-serif" font-size="13" fill="black" text-anchor="middle">${per100gVal} ${escXml(row.unit)}</text>`)

    // Thin divider between rows (skip after last)
    if (i < rows.length - 1) {
      add(`<line x1="1" y1="${yRow + 5}" x2="${W - 1}" y2="${yRow + 5}" stroke="black" stroke-width="0.5"/>`)
    }

    yRow += rowHeight
  })

  // Bottom border line
  add(`<line x1="1" y1="${H - 2}" x2="${W - 1}" y2="${H - 2}" stroke="black" stroke-width="2"/>`)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="background: transparent;">
  ${lines.join('\n  ')}
</svg>`
}

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const inputClass =
  'bg-charcoal-800 border border-charcoal-600 text-charcoal-100 rounded-lg px-3 py-2 focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 w-full'
const labelClass = 'block text-charcoal-400 text-xs uppercase tracking-widest mb-1.5 font-medium'

export default function Nutrition() {
  const [productName, setProductName] = useState('')
  const [servingsPerPackage, setServingsPerPackage] = useState('1')
  const [servingSize, setServingSize] = useState('100')
  const [rows, setRows] = useState<NutrientRow[]>(DEFAULT_NUTRIENTS)

  function updateRow(id: string, field: keyof NutrientRow, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: generateId(), name: '', unit: 'g', per100g: '0' },
    ])
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  function handleExport() {
    const svg = buildSVG(servingsPerPackage, servingSize, productName, rows)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${productName.trim() ? productName.trim().replace(/\s+/g, '-').toLowerCase() + '-' : ''}nutrition-info.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white tracking-widest mb-2">NUTRITION INFO</h1>
        <p className="text-charcoal-300">Generate a transparent SVG nutrition panel for product packaging.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left: form */}
        <div className="space-y-6">
          {/* Package info */}
          <div className="bg-charcoal-700 rounded-2xl p-6 border border-charcoal-600 space-y-4">
            <h2 className="font-display text-xl text-ember-400 tracking-wider">PACKAGE DETAILS</h2>
            <div>
              <label className={labelClass}>Product Name (optional)</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Texas Brisket Rub"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Servings per package</label>
                <input
                  type="number"
                  min="1"
                  value={servingsPerPackage}
                  onChange={(e) => setServingsPerPackage(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Serving size (g)</label>
                <input
                  type="number"
                  min="1"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Nutrients */}
          <div className="bg-charcoal-700 rounded-2xl p-6 border border-charcoal-600">
            <h2 className="font-display text-xl text-ember-400 tracking-wider mb-4">NUTRIENTS</h2>

            {/* Column headers */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_5rem_6rem_6rem_2rem] gap-2 mb-1 px-1">
              <span className={labelClass}>Nutrient</span>
              <span className={labelClass}>Unit</span>
              <span className={labelClass}>Per 100g</span>
              <span className={labelClass}>Per serving</span>
              <span />
            </div>

            <div className="space-y-2">
              {rows.map((row) => {
                const perServing = calcPerServing(row.per100g, servingSize)
                return (
                  <div key={row.id} className="grid grid-cols-[1fr_5rem_6rem_6rem_2rem] gap-2 items-center">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                      placeholder="Nutrient"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={row.unit}
                      onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                      placeholder="unit"
                      className={inputClass}
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.per100g}
                      onChange={(e) => updateRow(row.id, 'per100g', e.target.value)}
                      className={inputClass}
                    />
                    <div className="text-charcoal-300 text-sm px-2 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-center tabular-nums">
                      {perServing}
                    </div>
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      className="text-charcoal-500 hover:text-red-400 disabled:opacity-20 transition-colors"
                      aria-label="Remove row"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )
              })}
            </div>

            <button
              onClick={addRow}
              className="mt-4 flex items-center gap-2 text-sm text-ember-400 hover:text-ember-300 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add nutrient
            </button>
          </div>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-ember-600 hover:bg-ember-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0-3-3m3 3 3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as SVG
          </button>
        </div>

        {/* Right: live preview */}
        <div className="space-y-3">
          <h2 className="font-display text-xl text-ember-400 tracking-wider">PREVIEW</h2>
          <div className="bg-white rounded-2xl p-4 shadow-inner overflow-auto">
            <div
              dangerouslySetInnerHTML={{
                __html: buildSVG(servingsPerPackage, servingSize, productName, rows)
                  .replace(/<\?xml[^?]*\?>/, '')
                  .replace(/style="background: transparent;"/, 'style="background: white; width: 100%; height: auto;"'),
              }}
            />
          </div>
          <p className="text-charcoal-500 text-xs">Preview shown on white. The exported SVG has a transparent background.</p>
        </div>
      </div>
    </div>
  )
}
