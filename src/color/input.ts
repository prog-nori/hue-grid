import { hexToOklch, normalizeHue, rgbToOklch } from './convert.ts'
import type { OklchColor } from '../types/color.ts'

export const inputFormats = [
  { id: 'hex', label: 'HEX' },
  { id: 'rgb', label: 'RGB' },
  { id: 'oklch', label: 'OKLCH' },
] as const
export type InputFormat = (typeof inputFormats)[number]['id']

export function parseColorInput(format: InputFormat, values: string[]): OklchColor {
  if (format === 'hex') return hexToOklch(values[0])
  if (values.length !== 3 || values.some((v) => !v.trim() || !Number.isFinite(Number(v)))) {
    throw new Error('すべての項目に数値を入力してください。')
  }
  const [a, b, c] = values.map(Number)
  if (format === 'rgb') return rgbToOklch({ r: a, g: b, b: c })
  if (a < 0 || a > 1 || b < 0 || b > 1 || c < 0 || c > 360) {
    throw new Error('L は 0〜1、C は 0〜1、H は 0〜360 の範囲で入力してください。')
  }
  return { l: a, c: b, h: normalizeHue(c) }
}
