import { useState } from 'react'
import { ColorInput } from './components/ColorInput'
import { TonePatternSelector } from './components/TonePatternSelector'
import { PaletteGrid } from './components/PaletteGrid'
import { Icon } from './components/Icon'
import { useTheme } from './hooks/useTheme'
import { tonePatterns } from './presets/tonePatterns'
import { hexToOklch } from './color/convert'
import type { OklchColor, PaletteRecord, Tone } from './types/color'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [records, setRecords] = useState<PaletteRecord[]>(() => ['#6366F1', '#0EA5E9', '#22C55E'].map((hex, i) => ({ id: `sample-${i}`, baseColor: hexToOklch(hex), anchorTone: 500 })))
  const [patternId, setPatternId] = useState('balanced')
  const [notice, setNotice] = useState('')
  const pattern = tonePatterns.find((item) => item.id === patternId) ?? tonePatterns[1]

  function addColor(baseColor: OklchColor, anchorTone: Tone) {
    setRecords((current) => [...current, { id: crypto.randomUUID(), baseColor, anchorTone }])
    setNotice('パレットを追加しました。')
  }
  function deleteColor(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id))
    setNotice('パレットを削除しました。')
  }
  async function copyColor(hex: string) {
    try { await navigator.clipboard.writeText(hex); setNotice(`${hex} をコピーしました。`) }
    catch { setNotice(`コピーできませんでした。カラーコード: ${hex}`) }
  }

  return (
    <div className="min-h-svh">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-10 lg:px-14">
          <a href="./" className="flex items-center gap-3 rounded-lg" aria-label="HueGrid ホーム"><span className="flex size-10 items-center justify-center rounded-xl bg-black text-base font-bold tracking-tighter text-white">HG</span><span className="text-xl font-bold tracking-tight">HueGrid</span></a>
          <div className="flex items-center gap-4"><span className="hidden text-xs text-[var(--muted)] sm:block">色の体系を、ひとつのルールで。</span><button className="icon-button" aria-label={theme === 'dark' ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え'} onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button></div>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-14 lg:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-3 text-xs font-semibold tracking-widest text-violet-600 dark:text-violet-400">OKLCH パレットスタジオ</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">色相はそのまま。階調は自由に。</h1><p className="mt-4 text-sm leading-7 text-[var(--muted)]">複数の基準色に、ひとつのトーンルールを。<br className="sm:hidden" /> デザインシステムの色を、並べて設計しましょう。</p></div>
          <span className="badge"><span className="size-1.5 rounded-full bg-emerald-500" />ブラウザ内で処理</span>
        </div>
        <div className="panel mb-10 grid lg:grid-cols-[1.45fr_1fr]">
          <div className="p-6 sm:p-7"><ColorInput onAdd={addColor} /></div>
          <div className="border-t border-[var(--border)] p-6 sm:p-7 lg:border-t-0 lg:border-l"><TonePatternSelector pattern={pattern} onChange={(id) => { setPatternId(id); setNotice('すべてのパレットにトーンルールを適用しました。') }} /></div>
        </div>
        <section aria-labelledby="palettes-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div className="flex items-center gap-3"><h2 id="palettes-heading" className="text-lg font-semibold">カラーパレット</h2><span className="badge">{records.length} 色相</span><span className="text-xs text-[var(--muted)]">11 トーン</span></div><p className="text-xs text-[var(--muted)]">セルを選んで詳細を確認 · クリックで HEX をコピー</p></div>
          <PaletteGrid records={records} pattern={pattern} onDelete={deleteColor} onCopy={copyColor} />
          <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs leading-6 text-[var(--muted)]"><p>枠付きのセルが各行の基準色 · 左から明るい色 → 暗い色</p><p>セル右上の点は、sRGB に収めるための彩度調整を示します。</p></div>
        </section>
        <div role="status" aria-live="polite" className="mt-6 min-h-6 text-sm text-violet-700 dark:text-violet-300">{notice}</div>
        <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted)]"><p>HueGrid · 色の設計に、共通のものさしを。</p><p>パレットはこの画面内で保持されます。再読み込みで初期状態に戻ります。</p></footer>
      </main>
    </div>
  )
}

export default App
