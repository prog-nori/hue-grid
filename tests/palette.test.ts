import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hexToOklch, oklchToHex } from '../src/color/convert.ts'
import { mapToSrgb, isInSrgb } from '../src/color/gamut.ts'
import { generatePalette } from '../src/color/palette.ts'
import { parseColorInput } from '../src/color/input.ts'
import { tonePatterns } from '../src/presets/tonePatterns.ts'
import { tones } from '../src/types/color.ts'

for (const pattern of tonePatterns) {
  test(`${pattern.id}: ordered tones, unchanged anchor/hue, monotonic lightness, sRGB output`, () => {
    for (const base of [hexToOklch('#6366F1'), hexToOklch('#22C55E'), { l: 0, c: 0, h: 0 }, { l: 1, c: 0, h: 0 }, { l: 0.6, c: 1, h: 310 }]) {
      const palette = generatePalette(base, pattern)
      assert.deepEqual(palette.map((p) => p.tone), tones)
      assert.deepEqual(palette[5].requested, base)
      for (const [index, color] of palette.entries()) {
        assert.equal(color.requested.h, base.h)
        assert.equal(color.mapped.h, base.h)
        assert.equal(color.mapped.l, color.requested.l)
        assert.ok(isInSrgb(color.mapped))
        assert.match(color.hex, /^#[0-9A-F]{6}$/)
        if (index) assert.ok(palette[index - 1].requested.l >= color.requested.l)
      }
      assert.ok(Math.abs(palette[0].requested.c - base.c * 0.15) < 1e-10)
      assert.ok(Math.abs(palette[10].requested.c - base.c * 0.15) < 1e-10)
    }
  })
}

test('changing a pattern changes multiple hues while preserving both anchors', () => {
  for (const hex of ['#6366F1', '#22C55E']) {
    const base = hexToOklch(hex)
    const a = generatePalette(base, tonePatterns[0])
    const b = generatePalette(base, tonePatterns[2])
    assert.equal(a[5].hex, hex)
    assert.equal(b[5].hex, hex)
    assert.notEqual(a[2].hex, b[2].hex)
  }
})

test('mapping reduces chroma only and does not mutate input across the hue wheel', () => {
  for (let h = 0; h < 360; h += 15) {
    for (const l of [0, 0.01, 0.14, 0.5, 0.98, 1]) {
      const color = { l, c: 0.8, h }
      const mapped = mapToSrgb(color)
      assert.deepEqual(color, { l, c: 0.8, h })
      assert.ok(isInSrgb(mapped))
      assert.equal(mapped.h, h)
      assert.equal(mapped.l, l)
      assert.ok(mapped.c <= color.c)
      assert.doesNotThrow(() => oklchToHex(mapped))
    }
  }
})

test('input accepts all formats and rejects blank, nonfinite and out-of-range values', () => {
  assert.deepEqual(parseColorInput('rgb', ['99', '102', '241']), hexToOklch('#6366F1'))
  assert.deepEqual(parseColorInput('oklch', ['0.6', '0.2', '360']), { l: 0.6, c: 0.2, h: 0 })
  for (const input of [['', '0.2', '30'], ['NaN', '0.2', '30'], ['1.1', '0.2', '30'], ['0.5', '-1', '30'], ['0.5', '0.2', '361']]) {
    assert.throws(() => parseColorInput('oklch', input))
  }
  assert.throws(() => parseColorInput('rgb', ['256', '0', '0']))
  assert.throws(() => mapToSrgb({ l: NaN, c: 0, h: 0 }))
})
