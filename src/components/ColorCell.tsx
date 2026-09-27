import { useId, useState } from 'react'
import type { PaletteColor } from '../types/color'
import { formatOklch } from '../color/convert'

export function ColorCell({ color, onCopy }: { color: PaletteColor; onCopy: (hex: string) => void }) {
  const id = useId()
  const [dismissed, setDismissed] = useState(false)
  const [position, setPosition] = useState({ left: 12, top: 12 })
  function showDetails(element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    setPosition({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - 322)),
      top: rect.top >= 170 ? rect.top - 160 : rect.bottom + 8,
    })
    setDismissed(false)
  }
  const darkText = color.mapped.l > 0.7
  return (
    <div className="group relative min-w-0 flex-1" onMouseEnter={(e) => showDetails(e.currentTarget)}>
      <button className={`swatch ${color.tone === 500 ? 'anchor-swatch' : ''}`} style={{ backgroundColor: color.hex, color: darkText ? '#17202b' : '#fff' }}
        aria-label={`トーン ${color.tone}、${color.hex} をコピー${color.adjusted ? '、色域調整済み' : ''}`} aria-describedby={id}
        onClick={() => onCopy(color.hex)} onFocus={(e) => showDetails(e.currentTarget)} onKeyDown={(e) => { if (e.key === 'Escape') setDismissed(true) }}>
        <span className="text-xs font-semibold opacity-90">{color.tone}</span>
        <span className="font-mono text-[10px] tracking-tight">{color.hex}</span>
        {color.adjusted && <span className="absolute right-2 top-2 size-1 rounded-full bg-current" aria-hidden="true" />}
      </button>
      <div id={id} role="tooltip" style={position} className={`color-tooltip ${dismissed ? 'hidden' : 'invisible group-hover:visible group-focus-within:visible'}`}>
        <strong>トーン {color.tone}{color.tone === 500 ? ' · 基準色' : ''}</strong>
        <span>{color.hex}</span><span>{formatOklch(color.mapped)}</span>
        {color.adjusted && <><span className="text-amber-300">彩度を調整して sRGB に収めています</span><span>原値: {formatOklch(color.requested)}</span></>}
        <span className="text-slate-400">クリックで HEX をコピー</span>
      </div>
    </div>
  )
}
