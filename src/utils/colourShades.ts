// Converts a hex colour to a full Tailwind-compatible shade palette.
// Values are returned as bare "R G B" triples (no rgb() wrapper)
// because Tailwind's CSS variable pattern is: rgb(var(--x) / <alpha-value>)

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [h * 360, s * 100, l * 100]
}

function hslToRgbTriple(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const hue2rgb = (p2: number, q2: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t
      if (t < 1 / 2) return q2
      if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6
      return p2
    }
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return `${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)}`
}

export function hexToRgbTriple(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r} ${g} ${b}`
}

// Treat the picked colour as shade 600 and derive the full palette via HSL
const SHADE_LIGHTNESS: Record<number, number> = {
  50: 95, 100: 90, 200: 82, 300: 72, 400: 60,
  500: 50, 600: 42, 700: 34, 800: 27, 900: 22,
}

export function generateEmberShades(hex: string): Record<string, string> {
  const [h, s] = hexToHsl(hex)
  return Object.fromEntries(
    Object.entries(SHADE_LIGHTNESS).map(([shade, lightness]) => [
      shade,
      hslToRgbTriple(h, s, Math.max(5, Math.min(95, lightness))),
    ]),
  )
}

export function applyThemeToDom(themeHex: string, bgHex: string): void {
  const shades = generateEmberShades(themeHex)
  for (const [shade, triple] of Object.entries(shades)) {
    document.documentElement.style.setProperty(`--ember-${shade}`, triple)
  }
  document.documentElement.style.setProperty('--bg-colour', hexToRgbTriple(bgHex))
}
