import { arctangent, linear } from '../color/curves.ts'
import type { Curve } from '../color/curves.ts'

export interface TonePattern {
  id: string
  name: string
  description: string
  lightness: Curve
  chroma: Curve
  lightEndpoint: number
  darkEndpoint: number
  edgeChromaRatio: number
}

const endpoints = { lightEndpoint: 0.98, darkEndpoint: 0.14, edgeChromaRatio: 0.15 }
export const tonePatterns: TonePattern[] = [
  { id: 'linear', name: 'リニア', description: '明度と彩度を一定の割合で変化させる、素直な階調。', lightness: linear, chroma: linear, ...endpoints },
  { id: 'balanced', name: 'バランス', description: 'なめらかな S 字カーブで、穏やかさと色の強さを両立。', lightness: arctangent(2), chroma: arctangent(2), ...endpoints },
  { id: 'contrast', name: 'ハイコントラスト', description: '変化にメリハリをつけた S 字カーブで、階調の差を強調。', lightness: arctangent(5), chroma: arctangent(5), ...endpoints },
]
