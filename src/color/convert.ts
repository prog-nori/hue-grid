import type { OklchColor, RgbColor } from '../types/color.ts'

export const normalizeHue = (h: number) => ((h % 360) + 360) % 360
const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x))
const linearize = (x: number) => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
const encode = (x: number) => x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055

export function hexToRgb(value: string): RgbColor {
  let hex = value.trim().replace(/^#/, '')
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) {
    throw new Error('HEX は #RGB または #RRGGBB の形式で入力してください。')
  }
  if (hex.length === 3) hex = [...hex].map((char) => char + char).join('')
  return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) }
}

// Public-domain Oklab matrices by Björn Ottosson (2021 revision).
// https://bottosson.github.io/posts/oklab/#converting-from-linear-srgb-to-oklab
export function rgbToOklch(rgb: RgbColor): OklchColor {
  if (Object.values(rgb).some((x) => !Number.isFinite(x) || x < 0 || x > 255)) {
    throw new Error('RGB は 0〜255 の数値で入力してください。')
  }
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((x) => linearize(x / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const labB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const chroma = Math.hypot(a, labB)
  return {
    l: clamp(lightness, 0, 1),
    c: chroma < 1e-7 ? 0 : chroma,
    h: chroma < 1e-7 ? 0 : normalizeHue(Math.atan2(labB, a) * 180 / Math.PI),
  }
}

/** Unclipped linear sRGB: preserve out-of-gamut channels for gamut checking. */
export function oklchToLinearRgb({ l: lightness, c, h }: OklchColor): RgbColor {
  const a = c * Math.cos(h * Math.PI / 180)
  const b = c * Math.sin(h * Math.PI / 180)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  }
}

/** No clipping. Map into sRGB before serializing an out-of-gamut color. */
export function oklchToRgb(color: OklchColor): RgbColor {
  const rgb = oklchToLinearRgb(color)
  return { r: encode(rgb.r) * 255, g: encode(rgb.g) * 255, b: encode(rgb.b) * 255 }
}

export function rgbToHex(rgb: RgbColor): string {
  const channels = [rgb.r, rgb.g, rgb.b]
  if (channels.some((x) => !Number.isFinite(x) || x < -0.01 || x > 255.01)) {
    throw new Error('HEX 変換前に sRGB 色域へマッピングしてください。')
  }
  // Only round-off errors at the boundaries are clamped here.
  return '#' + channels.map((x) => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase()
}

export const hexToOklch = (hex: string) => rgbToOklch(hexToRgb(hex))
export const oklchToHex = (color: OklchColor) => rgbToHex(oklchToRgb(color))
export const formatOklch = ({ l, c, h }: OklchColor) => `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`
