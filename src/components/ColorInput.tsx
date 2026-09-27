import { useState } from 'react'
import type { FormEvent } from 'react'
import { tones } from '../types/color'
import type { OklchColor, Tone } from '../types/color'
import { inputFormats, parseColorInput } from '../color/input'
import type { InputFormat } from '../color/input'
import { hexToOklch, oklchToHex, oklchToRgb } from '../color/convert'
import { mapToSrgb, isInSrgb } from '../color/gamut'
import { Icon } from './Icon'

export function ColorInput({ onAdd }: { onAdd: (color: OklchColor, anchorTone: Tone) => void }) {
  const [anchorTone, setAnchorTone] = useState<Tone>(500)
  const [format, setFormat] = useState<InputFormat>('hex')
  const [values, setValues] = useState(['#6366F1'])
  const [error, setError] = useState('')
  let parsed: OklchColor | undefined
  try { parsed = parseColorInput(format, values) } catch { /* Validate on submission. */ }
  const preview = parsed ? oklchToHex(mapToSrgb(parsed)) : '#6366F1'

  function changeFormat(next: InputFormat, color = parsed) {
    setFormat(next)
    setError('')
    if (!color) {
      setValues(next === 'hex' ? [''] : ['', '', ''])
      return
    }
    const mapped = mapToSrgb(color)
    const rgb = oklchToRgb(mapped)
    setValues(next === 'hex' ? [oklchToHex(mapped)] : next === 'rgb'
      ? [rgb.r, rgb.g, rgb.b].map((x) => String(Math.round(x)))
      : [color.l, color.c, color.h].map((x) => String(Number(x.toFixed(6)))))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    try {
      onAdd(parseColorInput(format, values), anchorTone)
      setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : '入力内容を確認してください。') }
  }

  const fields = format === 'rgb' ? ['R', 'G', 'B'] : ['L', 'C', 'H']
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">基準色を追加</h2>
        <span className="badge">{anchorTone} の基準色</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-28 shrink-0">
          <label className="field-label" htmlFor="anchor-tone">基準トーン</label>
          <select id="anchor-tone" className="field" value={anchorTone} aria-describedby="anchor-help" onChange={(e) => setAnchorTone(Number(e.target.value) as Tone)}>
            {tones.map((tone) => <option key={tone} value={tone}>{tone}</option>)}
          </select>
        </div>
        <p id="anchor-help" className="text-xs leading-5 text-[var(--muted)]">入力色を配置する位置。<br />暗い色を基準にするなら 900 などを選べます。</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-24 shrink-0">
          <label className="field-label" htmlFor="color-format">入力形式</label>
          <select id="color-format" className="field" value={format} onChange={(e) => changeFormat(e.target.value as InputFormat)}>
            {inputFormats.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </div>
        <div className="flex min-w-48 flex-1 gap-2">
          {values.map((value, index) => (
            <div className="min-w-0 flex-1" key={`${format}-${index}`}>
              <label className="field-label" htmlFor={`color-${index}`}>{format === 'hex' ? 'カラーコード' : fields[index]}</label>
              <input id={`color-${index}`} className="field font-mono" type={format === 'hex' ? 'text' : 'number'} step="any"
                min={format === 'hex' ? undefined : 0} max={format === 'rgb' ? 255 : format === 'oklch' ? (index === 2 ? 360 : 1) : undefined}
                value={value} spellCheck={false} autoComplete="off" aria-invalid={Boolean(error)} aria-describedby="color-help color-error"
                onChange={(e) => { setValues(values.map((v, i) => i === index ? e.target.value : v)); setError('') }} />
            </div>
          ))}
        </div>
        <div className="shrink-0">
          <label className="sr-only" htmlFor="color-picker">カラーピッカーで基準色を選択</label>
          <input id="color-picker" type="color" value={preview} className="h-11 w-11 cursor-pointer rounded-xl border border-[var(--border)] bg-transparent p-1"
            onChange={(e) => changeFormat(format, hexToOklch(e.target.value))} />
        </div>
        <button type="submit" className="primary-button" aria-label="基準色からパレットを追加"><Icon name="add" />追加</button>
      </div>
      <p id="color-help" className="text-xs leading-5 text-[var(--muted)]">
        {format === 'hex' ? '#RGB または #RRGGBB で入力。' : format === 'rgb' ? 'R・G・B は 0〜255 で入力。' : 'L: 0〜1 ／ C: 0〜1 ／ H: 0〜360°。'} 色相を保った11段階のトーンを生成します。
      </p>
      {parsed && !isInSrgb(parsed) && <p className="text-xs text-amber-700 dark:text-amber-300">sRGB 色域外です。原値を保持し、表示時に彩度を調整します。HEX／RGB への切替は調整後の色を使用します。</p>}
      <p id="color-error" role="alert" className={error ? 'text-sm text-red-600 dark:text-red-400' : 'sr-only'}>{error}</p>
    </form>
  )
}
