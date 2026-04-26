import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const DATA_DIR = process.env.DATA_DIR || '/data'

const SEED_RECIPES = [
  {
    id: 'classic-bbq-rub',
    name: 'Classic BBQ Rub',
    category: 'dry-rub',
    tagline: 'The all-rounder — great on everything off the pit',
    description:
      'Our house dry rub. Bold, smoky, and balanced with just enough heat. Use generously on brisket, ribs, or pork shoulder 30–60 minutes before the smoke.',
    ingredients: [
      { name: 'Brown Sugar', amount: 60, unit: 'g' },
      { name: 'Smoked Paprika', amount: 40, unit: 'g', notes: 'use hot smoked for more bite' },
      { name: 'Kosher Salt', amount: 30, unit: 'g' },
      { name: 'Black Pepper', amount: 20, unit: 'g', notes: 'coarsely cracked' },
      { name: 'Garlic Powder', amount: 20, unit: 'g' },
      { name: 'Onion Powder', amount: 15, unit: 'g' },
      { name: 'Ground Cumin', amount: 10, unit: 'g' },
      { name: 'Cayenne Pepper', amount: 5, unit: 'g' },
    ],
    yieldAmount: 200,
    yieldUnit: 'g',
    storageNotes: 'Store in an airtight jar for up to 6 months.',
  },
  {
    id: 'texas-brisket-rub',
    name: 'Texas Brisket Rub',
    category: 'dry-rub',
    tagline: 'Salt & pepper done right — the Central Texas way',
    description:
      'Simple but perfect. A coarse salt-and-pepper rub in the Central Texas tradition, with a touch of garlic. Lets the smoke and beef do the talking.',
    ingredients: [
      { name: 'Kosher Salt', amount: 50, unit: 'g' },
      { name: 'Black Pepper', amount: 50, unit: 'g', notes: '16-mesh coarse grind' },
      { name: 'Garlic Powder', amount: 10, unit: 'g' },
    ],
    yieldAmount: 110,
    yieldUnit: 'g',
    storageNotes: 'Store in an airtight jar for up to 12 months.',
  },
  {
    id: 'phat-smoke-signature',
    name: 'Phat Smoke Signature Blend',
    category: 'seasoning',
    tagline: 'Our secret weapon — fire up the flavour',
    description:
      'The blend that started it all. Complex layers of sweet, heat, and smoke that work as a rub, a table seasoning, or mixed into butter for a finishing baste.',
    ingredients: [
      { name: 'Smoked Paprika', amount: 50, unit: 'g' },
      { name: 'Brown Sugar', amount: 40, unit: 'g' },
      { name: 'Kosher Salt', amount: 30, unit: 'g' },
      { name: 'Black Pepper', amount: 20, unit: 'g', notes: 'coarsely cracked' },
      { name: 'Garlic Powder', amount: 20, unit: 'g' },
      { name: 'Onion Powder', amount: 15, unit: 'g' },
      { name: 'Ground Mustard', amount: 10, unit: 'g' },
      { name: 'Ground Cumin', amount: 10, unit: 'g' },
      { name: 'Cayenne Pepper', amount: 8, unit: 'g' },
      { name: 'Ground Coriander', amount: 5, unit: 'g' },
      { name: 'Dried Thyme', amount: 5, unit: 'g' },
      { name: 'Celery Salt', amount: 5, unit: 'g' },
    ],
    yieldAmount: 218,
    yieldUnit: 'g',
    storageNotes: 'Store in an airtight jar for up to 6 months.',
  },
  {
    id: 'carolina-gold-rub',
    name: 'Carolina Gold Rub',
    category: 'dry-rub',
    tagline: 'Tangy mustard base with golden heat',
    description:
      'Inspired by the mustard-based BBQ tradition of the South Carolina Midlands. Pairs beautifully with pulled pork. Apply as a dry rub or mix into yellow mustard as a slather.',
    ingredients: [
      { name: 'Ground Mustard', amount: 40, unit: 'g' },
      { name: 'Turmeric', amount: 10, unit: 'g', notes: 'for colour and earthiness' },
      { name: 'Brown Sugar', amount: 30, unit: 'g' },
      { name: 'Kosher Salt', amount: 25, unit: 'g' },
      { name: 'Black Pepper', amount: 15, unit: 'g' },
      { name: 'Garlic Powder', amount: 15, unit: 'g' },
      { name: 'Onion Powder', amount: 10, unit: 'g' },
      { name: 'Cayenne Pepper', amount: 5, unit: 'g' },
    ],
    yieldAmount: 150,
    yieldUnit: 'g',
    storageNotes: 'Store in an airtight jar for up to 6 months.',
  },
  {
    id: 'smoky-chipotle-rub',
    name: 'Smoky Chipotle Rub',
    category: 'dry-rub',
    tagline: 'Deep smoke meets slow-burn heat',
    description:
      'Chipotle chilli powder brings earthy, smoky depth while ancho adds mild fruit. Outstanding on chicken thighs, ribs, and corn on the cob.',
    ingredients: [
      { name: 'Chipotle Chilli Powder', amount: 30, unit: 'g' },
      { name: 'Ancho Chilli Powder', amount: 20, unit: 'g' },
      { name: 'Smoked Paprika', amount: 25, unit: 'g' },
      { name: 'Brown Sugar', amount: 25, unit: 'g' },
      { name: 'Kosher Salt', amount: 25, unit: 'g' },
      { name: 'Garlic Powder', amount: 15, unit: 'g' },
      { name: 'Onion Powder', amount: 10, unit: 'g' },
      { name: 'Ground Cumin', amount: 10, unit: 'g' },
      { name: 'Black Pepper', amount: 10, unit: 'g' },
    ],
    yieldAmount: 170,
    yieldUnit: 'g',
    storageNotes: 'Store in an airtight jar for up to 6 months.',
  },
]

const DEFAULT_SETTINGS = {
  logoBase64: null,
  logoLinkUrl: '',
  categories: [
    { id: 'dry-rub', label: 'Dry Rub' },
    { id: 'wet-marinade', label: 'Wet Marinade' },
    { id: 'injection', label: 'Injection' },
    { id: 'finishing-sauce', label: 'Finishing Sauce' },
    { id: 'brine', label: 'Brine' },
    { id: 'seasoning', label: 'Seasoning' },
  ],
  pdfIncludeImages: {
    front: true,
    back: true,
    instructions: true,
    nutritional: true,
    additional: true,
  },
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

function readJson(file, defaultValue) {
  ensureDir()
  const path = join(DATA_DIR, file)
  if (!existsSync(path)) return defaultValue
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return defaultValue
  }
}

function writeJson(file, data) {
  ensureDir()
  const path = join(DATA_DIR, file)
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
}

// ── Recipes ──────────────────────────────────────────────────────────────────

export function readRecipes() {
  const data = readJson('recipes.json', null)
  if (data === null) {
    writeJson('recipes.json', SEED_RECIPES)
    return SEED_RECIPES
  }
  return data
}

export function writeRecipes(recipes) {
  writeJson('recipes.json', recipes)
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function readSettings() {
  const stored = readJson('settings.json', null)
  if (stored === null) return DEFAULT_SETTINGS
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    pdfIncludeImages: { ...DEFAULT_SETTINGS.pdfIncludeImages, ...(stored.pdfIncludeImages ?? {}) },
  }
}

export function writeSettings(settings) {
  writeJson('settings.json', settings)
}

// ── Costings ─────────────────────────────────────────────────────────────────

export function readCostings() {
  return readJson('costings.json', {})
}

export function writeCostings(costings) {
  writeJson('costings.json', costings)
}
