import { useMemo } from 'react'
import { objectiveEffect } from '../statObjectives'
import { normalizeBonusType, type GearPlannerEffectSource } from '../effects'
import { ownerSlots, type GearOwner } from '../character'
import type { GearPlannerData, GearPlannerEffect } from '../gearPlanner.types'
import { standardGearPlannerSetDefinitionByName } from '../standardSetDefinitions'

export function useStatCatalog(data: GearPlannerData, owner: GearOwner, effects: readonly GearPlannerEffectSource[]) {
  const stats = useMemo(() => {
    const catalog = new Map<string, Set<string>>()
    const canonicalNames = new Map<string, string>()
    const add = (effectsToAdd: readonly GearPlannerEffect[], typeOverride?: string) => {
      for (const source of effectsToAdd) {
        const e = objectiveEffect(source)
        if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:%|\[W\])?$/i.test(String(e.modifier ?? '').trim())) continue
        const key = e.name.toLowerCase()
        const name = canonicalNames.get(key) ?? e.name
        canonicalNames.set(key, name)
        const types = catalog.get(name) ?? new Set<string>()
        types.add(typeOverride ?? normalizeBonusType(e.bonus))
        catalog.set(name, types)
      }
    }
    for (const source of effects) add([source.effect], source.normalizedBonusType)
    for (const slot of ownerSlots[owner]) for (const item of data.itemsBySlot[slot]) add(item.source.enchantments ?? [])
    for (const augment of data.augments) add(augment.effectsAdded)
    for (const f of data.filigrees) add(f.source.enchantments ?? [], 'filigree')
    for (const set of [
      ...(data.standardSets ?? standardGearPlannerSetDefinitionByName).values(),
      ...data.filigreeSetDefinitions
    ])
      for (const tier of set.thresholds) add(tier.effects)
    return new Map([...catalog].sort(([a], [b]) => a.localeCompare(b)))
  }, [data, owner, effects])
  const equipped = useMemo(() => new Set(effects.map((s) => objectiveEffect(s.effect).name.toLowerCase())), [effects])
  return { stats, equipped }
}
