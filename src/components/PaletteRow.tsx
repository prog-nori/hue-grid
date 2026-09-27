import type { PaletteColor, PaletteRecord } from '../types/color'
import { formatOklch, oklchToHex } from '../color/convert'
import { mapToSrgb, isInSrgb } from '../color/gamut'
import { ColorCell } from './ColorCell'
import { Icon } from './Icon'

export function PaletteRow({ record, colors, index, onDelete, onCopy }: {
  record: PaletteRecord; colors: PaletteColor[]; index: number; onDelete: (id: string) => void; onCopy: (hex: string) => void
}) {
  const hex = oklchToHex(mapToSrgb(record.baseColor))
  return (
    <article className="palette-row" aria-label={`パレット ${index + 1} ${hex}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="size-10 shrink-0 rounded-xl border border-black/10" style={{ backgroundColor: hex }} aria-hidden="true" />
          <div><h3 className="font-mono text-sm font-semibold">{hex}<span className="ml-3 font-sans text-xs font-normal text-[var(--muted)]">基準色 500</span></h3>
            <p className="mt-1 font-mono text-[11px] text-[var(--muted)]">{formatOklch(record.baseColor)}</p>
            {!isInSrgb(record.baseColor) && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">表示色は色域調整済み</p>}
          </div>
        </div>
        <button className="icon-button hover:!bg-red-500/10 hover:!text-red-600" aria-label={`パレット ${index + 1} ${hex} を削除`} onClick={() => onDelete(record.id)}><Icon name="delete" /></button>
      </div>
      <div className="flex gap-1.5">{colors.map((color) => <ColorCell key={color.tone} color={color} onCopy={onCopy} />)}</div>
    </article>
  )
}
