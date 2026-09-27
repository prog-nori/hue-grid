import { oklchToLinearRgb } from './convert.ts'
import type { OklchColor } from '../types/color.ts'

export function isInSrgb(color: OklchColor): boolean {
  return Object.values(oklchToLinearRgb(color)).every((x) => Number.isFinite(x) && x >= -1e-7 && x <= 1 + 1e-7)
}

/** Reduce only chroma; lightness and hue are invariant. This is not CSS local-MINDE. */
export function mapToSrgb(color: OklchColor): OklchColor {
  if (![color.l, color.c, color.h].every(Number.isFinite) || color.l < 0 || color.l > 1 || color.c < 0) {
    throw new Error('有効な OKLCH 値を指定してください。')
  }
  if (isInSrgb(color)) return { ...color }
  let low = 0
  let high = color.c
  for (let i = 0; i < 48; i++) {
    const mid = (low + high) / 2
    if (isInSrgb({ ...color, c: mid })) low = mid
    else high = mid
  }
  return { ...color, c: low }
}
