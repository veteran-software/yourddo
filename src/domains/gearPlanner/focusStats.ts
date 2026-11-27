import { formatAmount } from './effectAmounts'
import {
  itemRecommendationSources,
  type AugmentSelection,
  type RecommendedAugment,
  recommendationStatKey,
  recommendationStats
} from './augmentRecommendations'
import { skillObjective } from './statObjectives'
import type { GearPlannerCandidate } from './planner'
import type { GearPlannerItem } from './gearPlanner.types'
import type { loadoutSnapshot } from './loadoutComparison'

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
  for (let i = 0; i < a.length; i++) {
    const direction = Math.sign(b[i].delta) - Math.sign(a[i].delta)
    if (direction) return direction
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

const emptyRecommendations: readonly AugmentSelection[] = []

export function createBrowserFocusRanker(
  names: readonly string[],
  recommend: (item: GearPlannerItem) => readonly RecommendedAugment[]
) {
  const priorities = names.map((name, index) => ({
    name,
    position: index + 1,
    key: recommendationStatKey(name)
  }))
  const keys = new Set(priorities.map(({ key }) => key))
  function score(item: GearPlannerItem) {
    const recommended = recommend(item)
    const stats = recommendationStats(itemRecommendationSources(item, keys, recommended))
    const augments: readonly AugmentSelection[] = recommended
    const matches = priorities.flatMap(({ name, position, key }) => {
      const value = stats.get(key)
      return value?.amount !== undefined && value.amount > 0 ? [{ name, position, ...value }] : []
    })
    return { matches, augments, amounts: priorities.map(({ key }) => Math.max(stats.get(key)?.amount ?? 0, 0)) }
  }
  const scores = new WeakMap<GearPlannerItem, ReturnType<typeof score>>()
  function rank(candidates: readonly GearPlannerCandidate[], focusFirst: boolean) {
    if (!focusFirst || !keys.size)
      return candidates.map((candidate) => ({ candidate, matches: [], augments: emptyRecommendations }))

    return candidates
      .map((candidate) => {
        let result = scores.get(candidate.item)
        if (!result) {
          result = score(candidate.item)
          scores.set(candidate.item, result)
        }
        return { candidate, ...result }
      })
      .sort((a, b) => {
        for (const [index, amount] of a.amounts.entries()) {
          const difference = b.amounts[index] - amount
          if (difference) return difference
        }
        return 0
      })
  }
  return { rank, score, scores }
}

export type BrowserFocusScore = ReturnType<ReturnType<typeof createBrowserFocusRanker>['score']>
