import type { loadoutSnapshot } from './loadoutComparison'

type Stats = ReturnType<typeof loadoutSnapshot>['Stats']
export interface FocusChange {
  name: string
  delta: number
  unit: string
}

function lookup(stats: Stats, name: string) {
  const exact = stats.get(name)
  if (exact) return exact
  const lower = name.toLowerCase()
  for (const [label, entry] of stats) if (label.toLowerCase() === lower) return entry
}

export function focusChanges(names: readonly string[], before: Stats, after: Stats): FocusChange[] {
  return names.map((name) => {
    const from = lookup(before, name)
    const to = lookup(after, name)
    const comparable =
      (!from || from.amount !== undefined) &&
      (!to || to.amount !== undefined) &&
      (!from || !to || from.unit === to.unit)
    return { name, delta: comparable ? (to?.amount ?? 0) - (from?.amount ?? 0) : 0, unit: to?.unit ?? from?.unit ?? '' }
  })
}

export function compareFocus(a: FocusChange[], b: FocusChange[]) {
  // Compare gain / unchanged / loss in priority order before comparing magnitudes within a stat.
  for (let i = 0; i < a.length; i++) {
    const direction = Math.sign(b[i].delta) - Math.sign(a[i].delta)
    if (direction) return direction
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].unit !== b[i].unit) continue
    const difference = b[i].delta - a[i].delta
    if (difference) return difference
  }
  return 0
}

const signed = new Intl.NumberFormat('en-US', { signDisplay: 'always', maximumFractionDigits: 6 })
export function focusSummary(changes: FocusChange[]) {
  return changes
    .filter((entry) => entry.delta)
    .map(({ name, delta, unit }) => name + ' ' + signed.format(delta) + unit)
    .join(' · ')
}
