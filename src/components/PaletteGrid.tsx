import { useMemo } from 'react'
import type { PaletteRecord } from '../types/color'
import type { TonePattern } from '../presets/tonePatterns'
import { generatePalette } from '../color/palette'
import { PaletteRow } from './PaletteRow'
import { Icon } from './Icon'

export function PaletteGrid({ records, pattern, onDelete, onCopy }: {
  records: PaletteRecord[]; pattern: TonePattern; onDelete: (id: string) => void; onCopy: (hex: string) => void
}) {
  const palettes = useMemo(() => records.map((record) => ({ record, colors: generatePalette(record.baseColor, pattern, record.anchorTone) })), [records, pattern])
  if (!records.length) return <div className="panel flex flex-col items-center px-6 py-20 text-center"><span className="mb-4 text-3xl text-violet-500"><Icon name="palette" /></span><h3 className="font-semibold">最初の基準色を追加しましょう</h3><p className="mt-2 text-sm text-[var(--muted)]">ひとつの色から、11段階のトーンが広がります。</p></div>
  return <div className="palette-scroll panel overflow-x-auto" tabIndex={0} role="region" aria-label="カラーパレット一覧。狭い画面では横にスクロールできます">
    <div className="min-w-[880px] divide-y divide-[var(--border)]">{palettes.map(({ record, colors }, index) => <PaletteRow key={record.id} record={record} colors={colors} index={index} onDelete={onDelete} onCopy={onCopy} />)}</div>
  </div>
}
