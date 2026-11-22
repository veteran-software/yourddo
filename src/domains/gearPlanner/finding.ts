import { emptyGearCraftingData, gearCraftGroups } from './crafting'
import {
  normalizeBonusType,
  normalizeEffectName,
  previewPotentialEffectConflict,
  type GearPlannerEffectSource
} from './effects'
import type { GearPlannerData, GearPlannerEffect, GearPlannerItem, GearPlannerSetIndex } from './gearPlanner.types'
import { slaveLordsMarker } from './slaveLords'

export type GearFindTarget =
  { kind: 'effect'; name: string; bonusType?: string } | { kind: 'item' | 'filigree'; name: string }

export function matchesGearEffect(
  effect: GearPlannerEffect,
  query: string,
  bonusType: string | null | undefined,
  exact: boolean
) {
  const name = normalizeEffectName(effect.name)
  return (
    (exact ? name === query : name.includes(query)) && (!bonusType || normalizeBonusType(effect.bonus) === bonusType)
  )
}

function indexedSets(index: GearPlannerSetIndex | undefined, name: string, level: number) {
  const entries = index?.get(name) ?? []
  const exact = entries.some((e) => e.minimumLevel === level)
  return entries
    .filter((e) => e.minimumLevel === 0 || (exact ? e.minimumLevel === level : Math.abs(e.minimumLevel - level) <= 1))
    .map((e) => e.setName)
}

export function candidateSetDetails(
  item: GearPlannerItem,
  data?: Partial<Pick<GearPlannerData, 'crafting' | 'setIndex'>>
) {
  const { name, setBonus, enchantments } = item.source
  const gem = name.includes('Gem of Many Facets')
  const craftGroups =
    gem || item.slaveLordsBase || enchantments?.some((e) => e.name === 'Lost Purpose' || e.name === slaveLordsMarker)
      ? gearCraftGroups(item, data?.crafting ?? emptyGearCraftingData).flatMap((group) => {
          const sets = group.choices.flatMap((choice) => (choice.setName ? [choice.setName] : []))
          return sets.length ? [{ label: group.label, sets }] : []
        })
      : []
  const choices = craftGroups.flatMap((group) => group.sets)
  // The Gem's rolls already correct the four mislabeled Legendary desert sets.
  if (gem) return { sets: [...new Set(choices)], craftGroups }
  // The name/level index combines variants such as Sphere of Souls. Each item's own set identifies its variant.
  const memberships = setBonus?.length
    ? setBonus.map((s) => s.name)
    : indexedSets(data?.setIndex, name, item.minimumLevel)
  return { sets: [...new Set([...memberships, ...choices])], craftGroups }
}

export function createCandidateComparison(sources: readonly GearPlannerEffectSource[]) {
  const byName = Map.groupBy(sources, (source) => source.normalizedName)
  const cache = new WeakMap<GearPlannerItem, boolean>()
  function compareEffect(item: GearPlannerItem, effect: GearPlannerEffect) {
    const matches = byName.get(normalizeEffectName(effect.name))
    // Replacing a slot also removes the augments and upgrades on that slot.
    return (
      matches &&
      previewPotentialEffectConflict(
        effect,
        matches.filter((source) => source.slot !== item.slot)
      )
    )
  }
  function isConflicting(item: GearPlannerItem) {
    if (!sources.length) return false
    const cached = cache.get(item)
    if (cached !== undefined) return cached
    const conflict =
      item.source.enchantments?.some((effect) => {
        const result = compareEffect(item, effect)
        return result?.isConflict === true && !result.isUpgrade
      }) ?? false
    cache.set(item, conflict)
    return conflict
  }
  return { compareEffect, isConflicting }
}

export const statFamily = /^(Spell DC|Spell Power|Spell Critical Chance|Skill|Tactical DC): (.+)$/
