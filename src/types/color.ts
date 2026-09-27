export interface OklchColor {
  l: number
  c: number
  h: number
}

/** Encoded sRGB channels in the range 0–255. */
export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface PaletteRecord {
  id: string
  baseColor: OklchColor
}

export const tones = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type Tone = (typeof tones)[number]

export interface PaletteColor {
  tone: Tone
  requested: OklchColor
  mapped: OklchColor
  hex: string
  adjusted: boolean
}
