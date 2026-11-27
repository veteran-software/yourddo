import { compareFocus, focusChanges, type FocusChange } from './focusStats'
import {
  applyRecommendedAugments,
  collectRecommendationEffects,
  createAugmentRecommender,
  type RecommendedAugment
} from './augmentRecommendations'
import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types'
import { characterAllowsItem, ownerSlots, slotOwner } from './character'
import type { GearPlannerData, GearPlannerItem, GearPlannerSlot } from './gearPlanner.types'
import { comparisonRows, loadoutSnapshot } from './loadoutComparison'
import { equipGearPlannerItemInSelection } from './planner'
import type { GearPlannerSetup } from './setups'

type Changes = ReturnType<typeof comparisonRows>
type Snapshot = ReturnType<typeof loadoutSnapshot>
export interface SlotReplacement {
  item: GearPlannerItem
  augments: readonly RecommendedAugment[]
  gains: Changes
  losses: Changes
  gainedSets: string[]
  lostSets: string[]
  displaced: string[]
  retention: number
  comparable: boolean
  group: 'Straight upgrade' | 'Closest replacement' | 'Worth a trade-off'
  focus: FocusChange[]
  improvements: Map<string, number>
}

// Measure only the contribution that disappears when this slot is emptied.
// For example, losing +12 with an overlapping +11 costs one point.
function incumbentContributions(before: Snapshot, empty: Snapshot) {
  return comparisonRows(empty.Stats, before.Stats).filter((row) => row.changed)
}

function retainedShare(contributions: Changes, before: Snapshot, empty: Snapshot, after: Snapshot) {
  if (!contributions.length) return 0
  let retained = 0
  for (const { label } of contributions) {
    const previous = before.Stats.get(label)
    const current = after.Stats.get(label)
    if (previous?.text === current?.text) {
      retained++
      continue
    }
    const floor = empty.Stats.get(label)?.amount ?? 0
    if (
      previous?.amount === undefined ||
      current?.amount === undefined ||
      current.unit !== previous.unit ||
      previous.amount === floor
    )
      continue
    retained += Math.max(0, Math.min(1, (current.amount - floor) / (previous.amount - floor)))
  }
  return retained / contributions.length
}

export function* findSlotReplacements(
  setup: GearPlannerSetup,
  slot: GearPlannerSlot,
  data: GearPlannerData,
  essence: EssenceCraftingData,
  priority: string | null = null
) {
  const owner = slotOwner(slot)
  const snapshot = (next: GearPlannerSetup) => loadoutSnapshot(next, owner, data, essence)
  const before = snapshot(setup)
  const empty = snapshot({ ...setup, ...equipGearPlannerItemInSelection(setup, slot, null) })
  const contributions = incumbentContributions(before, empty)
  const focuses = setup.character.focusStats ?? []
  const goals = priority ? [priority, ...focuses] : focuses
  const recommend = createAugmentRecommender(
    setup,
    data.reforging,
    data.augments,
    goals,
    collectRecommendationEffects(setup, essence, data.reforging)
  )
  function evaluate(item: GearPlannerItem): SlotReplacement | undefined {
    if (
      item.minimumLevel < setup.minimumLevel ||
      Math.max(item.minimumLevel, item.absoluteMinimumLevel ?? 0) > setup.maximumLevel ||
      !characterAllowsItem(setup.character, item)
    )
      return
    const next = equipGearPlannerItemInSelection(setup, slot, item)
    if (next === setup) return
    const augments = recommend(item)
    const after = snapshot(applyRecommendedAugments({ ...setup, ...next }, item, data.reforging, augments))
    const changes = comparisonRows(before.Stats, after.Stats).filter((row) => row.changed)
    // A new numeric penalty can appear as an added row. Use its signed delta.
    const isGain = (row: Changes[number]) => row.delta.startsWith('+') || row.delta === 'Gained'
    const gains = changes.filter(isGain)
    // A changed nonnumeric effect needs review even when its name survives the swap.
    const losses = changes.filter((row) => !isGain(row))
    const gainedSets = [...after.Sets.keys()].filter((key) => !before.Sets.has(key))
    const lostSets = [...before.Sets.keys()].filter((key) => !after.Sets.has(key))
    const displaced = ownerSlots[owner].flatMap((key) =>
      key !== slot && setup.equipment[key] && !next.equipment[key] ? [setup.equipment[key].source.name] : []
    )
    const retention = retainedShare(contributions, before, empty, after)
    const better = gains.length > 0 || gainedSets.length > 0
    const downside = losses.length > 0 || lostSets.length > 0 || displaced.length > 0
    if (!better && !retention) return
    const group: SlotReplacement['group'] =
      better && !downside
        ? 'Straight upgrade'
        : retention > 0 && !lostSets.length && !displaced.length
          ? 'Closest replacement'
          : 'Worth a trade-off'
    if (!better && group !== 'Closest replacement') return
    const improvements = new Map<string, number>()
    for (const { label } of gains) {
      const value = after.Stats.get(label)?.amount
      if (value !== undefined) improvements.set(label, value - (before.Stats.get(label)?.amount ?? 0))
    }
    return {
      item,
      augments,
      gains,
      losses,
      gainedSets,
      lostSets,
      displaced,
      retention,
      comparable: contributions.length > 0,
      group,
      focus: focusChanges(setup.character.focusStats ?? [], before.Stats, after.Stats),
      improvements
    }
  }
  for (const item of data.itemsBySlot[slot]) yield evaluate(item)
}

export function shortlistReplacements(results: SlotReplacement[], priority: string | null) {
  // Rank variants with identical stat gains by magnitude within that stat profile.
  const profiles = Map.groupBy(results, (row) => JSON.stringify([...row.improvements.keys()]))
  const variantRank = new Map<SlotReplacement, number>()
  for (const variants of profiles.values()) {
    variants.sort((a, b) => {
      for (const [stat, amount] of a.improvements) {
        const difference = (b.improvements.get(stat) ?? 0) - amount
        if (difference) return difference
      }
      return 0
    })
    variants.forEach((row, index) => variantRank.set(row, index))
  }
  const ranked = results
    .filter((row) => !priority || row.improvements.has(priority))
    .toSorted(
      (a, b) =>
        (priority ? (b.improvements.get(priority) ?? 0) - (a.improvements.get(priority) ?? 0) : 0) ||
        compareFocus(a.focus, b.focus) ||
        a.displaced.length - b.displaced.length ||
        a.lostSets.length - b.lostSets.length ||
        Number(b.group === 'Straight upgrade') - Number(a.group === 'Straight upgrade') ||
        b.retention - a.retention ||
        a.losses.length - b.losses.length ||
        b.gainedSets.length - a.gainedSets.length ||
        b.gains.length - a.gains.length ||
        (variantRank.get(a) ?? 0) - (variantRank.get(b) ?? 0) ||
        a.item.source.name.localeCompare(b.item.source.name)
    )
  if (priority || ranked[0]?.focus.length) return ranked.slice(0, 5)
  const groups = new Set<string>()
  const leaders = ranked.filter((row) => {
    if (groups.has(row.group)) return false
    groups.add(row.group)
    return true
  })
  return [...leaders, ...ranked.filter((row) => !leaders.includes(row))].slice(0, 5)
}
