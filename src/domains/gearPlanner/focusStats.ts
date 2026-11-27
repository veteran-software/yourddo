import { formatAmount } from './effectAmounts'
import {
  aggregateEffectSummary,
  effectAmount,
  normalizeBonusType,
  normalizeEffectName,
  type GearPlannerEffectSource
} from './effects'
import { objectiveEffect, skillObjective } from './statObjectives'
import type { GearPlannerCandidate } from './planner'
import { statValue, type loadoutSnapshot } from './loadoutComparison'

type Stats = ReturnType<typeof loadoutSnapshot>['Stats']
export interface FocusChange {
  name: string
  delta: number
  rounding?: 'round' | 'trunc'
  unit: string
}

function lookup(stats: Stats, name: string) {
  const exact = stats.get(name)
  if (exact) return exact
  const lower = skillObjective(name).toLowerCase()
  for (const [label, entry] of stats) if (skillObjective(label).toLowerCase() === lower) return entry
}

export function focusChanges(names: readonly string[], before: Stats, after: Stats): FocusChange[] {
  return names.map((name) => {
    const from = lookup(before, name)
    const to = lookup(after, name)
    const comparable =
      (!from || from.amount !== undefined) &&
      (!to || to.amount !== undefined) &&
      (!from || !to || from.unit === to.unit)
    return {
      name,
      rounding: to?.rounding ?? from?.rounding,
      delta: comparable ? (to?.amount ?? 0) - (from?.amount ?? 0) : 0,
      unit: to?.unit ?? from?.unit ?? ''
    }
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

export function focusSummary(changes: FocusChange[]) {
  return changes
    .filter((entry) => entry.delta)
    .map(({ name, delta, unit, rounding }) => name + ' ' + formatAmount(delta, unit, true, rounding))
    .join(' · ')
}

/** Rank the gear already in the result list by built-in effects in setup priority order. */
export function rankBrowserFocus(candidates: readonly GearPlannerCandidate[], names: readonly string[]) {
  const priorities = names.map((name, index) => ({
    name,
    position: index + 1,
    key: normalizeEffectName(objectiveEffect({ name }).name)
  }))
  const keys = new Set(priorities.map(({ key }) => key))
  if (!keys.size) return candidates.map((candidate) => ({ candidate, matches: [] }))

  const rows = candidates.map((candidate) => {
    const effects: GearPlannerEffectSource[] = []
    for (const source of candidate.item.source.enchantments ?? []) {
      if (source.displayOnly) continue
      const effect = objectiveEffect(source)
      const key = normalizeEffectName(effect.name)
      if (!keys.has(key)) continue
      effects.push({
        id: effects.length.toString(),
        category: 'equipped-item',
        effect,
        normalizedName: key,
        normalizedBonusType: normalizeBonusType(effect.bonus),
        comparisonValue: effectAmount(effect)
      })
    }
    const stats = new Map(
      aggregateEffectSummary(effects).map((entry) => [entry.normalizedName, statValue(entry, true)])
    )
    const matches = priorities.flatMap(({ name, position, key }) => {
      const value = stats.get(key)
      return value?.amount !== undefined && value.amount > 0 ? [{ name, position, ...value }] : []
    })
    return { candidate, matches, stats }
  })
  return rows.sort((a, b) => {
    for (const { key } of priorities) {
      const left = a.stats.get(key)?.amount ?? 0
      const right = b.stats.get(key)?.amount ?? 0
      const difference = Math.max(right, 0) - Math.max(left, 0)
      if (difference) return difference
    }
    return 0
  })
}
