import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('huegrid-theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch { /* Storage may be unavailable in private contexts. */ }
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    try { localStorage.setItem('huegrid-theme', theme) } catch { /* Keep the in-memory choice. */ }
  }, [theme])

  return { theme, toggleTheme: () => setTheme((value) => value === 'dark' ? 'light' : 'dark') }
}
