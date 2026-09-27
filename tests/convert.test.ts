import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hexToOklch, hexToRgb, oklchToHex, rgbToOklch } from '../src/color/convert.ts'

test('primary red matches the published Oklab reference', () => {
  const red = hexToOklch('#ff0000')
  assert.ok(Math.abs(red.l - 0.62795536) < 1e-7)
  assert.ok(Math.abs(red.c - 0.25768331) < 1e-7)
  assert.ok(Math.abs(red.h - 29.233885) < 1e-5)
})

test('sRGB samples round-trip through OKLCH without losing a channel', () => {
  for (const hex of ['#000000', '#FFFFFF', '#808080', '#FF0000', '#00FF00', '#0000FF', '#6366F1', '#22C55E']) {
    assert.equal(oklchToHex(hexToOklch(hex)), hex)
  }
})

test('achromatic input has stable zero chroma and hue', () => {
  for (const hex of ['#000', '#888', '#fff']) {
    const color = hexToOklch(hex)
    assert.equal(color.c, 0)
    assert.equal(color.h, 0)
  }
})

test('HEX parsing supports shorthand and rejects invalid input', () => {
  assert.deepEqual(hexToRgb(' #f0a '), { r: 255, g: 0, b: 170 })
  for (const hex of ['', '#12', '#gggggg', '#12345678']) assert.throws(() => hexToRgb(hex))
  assert.throws(() => rgbToOklch({ r: NaN, g: 0, b: 0 }))
  assert.throws(() => rgbToOklch({ r: 256, g: 0, b: 0 }))
})
