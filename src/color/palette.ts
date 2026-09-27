import type { OklchColor, PaletteColor } from '../types/color.ts'
import { tones } from '../types/color.ts'
import type { TonePattern } from '../presets/tonePatterns.ts'
import { oklchToHex } from './convert.ts'
import { mapToSrgb, isInSrgb } from './gamut.ts'

export function generatePalette(base: OklchColor, pattern: TonePattern): PaletteColor[] {
  return tones.map((tone) => {
    const position = Math.abs(tone - 500) / 450
    const endpoint = tone < 500 ? Math.max(base.l, pattern.lightEndpoint) : Math.min(base.l, pattern.darkEndpoint)
    const requested = tone === 500 ? { ...base } : {
      l: base.l + (endpoint - base.l) * (pattern.lightness(position) - pattern.lightness(0)),
      c: Math.max(0, base.c * (1 - (1 - pattern.edgeChromaRatio) * (pattern.chroma(position) - pattern.chroma(0)))),
      h: base.h,
    }
    const mapped = mapToSrgb(requested)
    return { tone, requested, mapped, hex: oklchToHex(mapped), adjusted: !isInSrgb(requested) }
  })
}
