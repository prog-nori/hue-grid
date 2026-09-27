import type { OklchColor, PaletteColor, Tone } from '../types/color.ts'
import { tones } from '../types/color.ts'
import type { TonePattern } from '../presets/tonePatterns.ts'
import { oklchToHex } from './convert.ts'
import { mapToSrgb, isInSrgb } from './gamut.ts'

export function generatePalette(base: OklchColor, pattern: TonePattern, anchorTone: Tone = 500): PaletteColor[] {
  return tones.map((tone) => {
    // Normalize each side independently; an endpoint anchor has only one side.
    const span = tone < anchorTone ? anchorTone - tones[0] : tones[tones.length - 1] - anchorTone
    const position = tone === anchorTone ? 0 : Math.abs(tone - anchorTone) / span
    const endpoint = tone < anchorTone ? Math.max(base.l, pattern.lightEndpoint) : Math.min(base.l, pattern.darkEndpoint)
    const requested = tone === anchorTone ? { ...base } : {
      l: base.l + (endpoint - base.l) * (pattern.lightness(position) - pattern.lightness(0)),
      c: Math.max(0, base.c * (1 - (1 - pattern.edgeChromaRatio) * (pattern.chroma(position) - pattern.chroma(0)))),
      h: base.h,
    }
    const mapped = mapToSrgb(requested)
    return { tone, requested, mapped, hex: oklchToHex(mapped), adjusted: !isInSrgb(requested) }
  })
}
