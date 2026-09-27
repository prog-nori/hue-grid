import { tonePatterns } from '../presets/tonePatterns'
import type { TonePattern } from '../presets/tonePatterns'

export function TonePatternSelector({ pattern, onChange }: { pattern: TonePattern; onChange: (id: string) => void }) {
  const points = Array.from({ length: 41 }, (_, i) => `${i * 2.5},${38 - pattern.lightness(i / 40) * 34}`).join(' ')
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">共通トーンルール</h2><span className="badge">全パレットに適用</span></div>
      <div className="flex items-end gap-5">
        <div className="flex-1"><label className="field-label" htmlFor="tone-pattern">計算パターン</label>
          <select id="tone-pattern" className="field" value={pattern.id} onChange={(e) => onChange(e.target.value)}>
            {tonePatterns.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <svg viewBox="0 0 100 42" className="h-11 w-24 text-violet-500" role="img" aria-label={`${pattern.name}の補間曲線`}>
          <path d="M0 38H100 M0 21H100 M0 4H100" stroke="currentColor" strokeOpacity="0.15" />
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <p className="text-xs leading-5 text-[var(--muted)]">{pattern.description}</p>
    </section>
  )
}
