const names = {
  sun: 'sun-1',
  moon: 'moon-half-right-5',
  delete: 'trash-3',
  add: 'plus',
  palette: 'colour-palette-3',
  check: 'check',
} as const

export function Icon({ name }: { name: keyof typeof names }) {
  return <i className={`lni lni-${names[name]}`} aria-hidden="true" />
}
