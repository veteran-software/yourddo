import { useMemo } from 'react'
import { objectiveEffect } from '../statObjectives'
import { normalizeBonusType, type GearPlannerEffectSource } from '../effects'
import { ownerSlots, type GearOwner } from '../character'
import type { GearPlannerData, GearPlannerEffect } from '../gearPlanner.types'

function createStatCatalog(names?: readonly string[]) {
  const catalog = new Map<string, Set<string>>()
  const canonicalNames = new Map(names?.map((name) => [name.toLowerCase(), name]))
  for (const name of canonicalNames.values()) catalog.set(name, new Set())
  const add = (effectsToAdd: readonly GearPlannerEffect[], typeOverride?: string) => {
    for (const source of effectsToAdd) {
      const e = names ? source : objectiveEffect(source)
      if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:%|\[W\])?$/i.test(String(e.modifier ?? '').trim())) continue
      const key = e.name.toLowerCase()
      if (names && !canonicalNames.has(key)) continue
      const name = canonicalNames.get(key) ?? e.name
      canonicalNames.set(key, name)
      const types = catalog.get(name) ?? new Set<string>()
      types.add(typeOverride ?? normalizeBonusType(e.bonus))
      catalog.set(name, types)
    }
  }
  return { catalog, add }
}

function addEquipmentAndAugments(
  data: GearPlannerData,
  owner: GearOwner,
  add: (effects: readonly GearPlannerEffect[]) => void
) {
  const setNames = new Set<string>()
  for (const slot of ownerSlots[owner]) {
    for (const item of data.itemsBySlot[slot]) {
      add(item.source.enchantments ?? [])
      for (const set of item.source.setBonus ?? []) setNames.add(set.name)
    }
  }
  for (const augment of data.augments) {
    add(augment.effectsAdded)
    for (const set of augment.setBonus ?? []) setNames.add(set.name)
  }
  return setNames
}

export function useStatCatalog(data: GearPlannerData, owner: GearOwner, effects: readonly GearPlannerEffectSource[]) {
  const stats = useMemo(() => {
    const { catalog, add } = createStatCatalog(data.enchantmentNames)
    for (const source of effects) add([source.effect], source.normalizedBonusType)
    const setNames = addEquipmentAndAugments(data, owner, add)
    for (const curse of data.curses) add(curse.enchantments)
    for (const f of data.filigrees) add(f.source.enchantments ?? [], 'filigree')
    for (const name of setNames) {
      const set = data.standardSets?.get(name)
      if (set) for (const tier of set.thresholds) add(tier.effects)
    }
    for (const set of data.filigreeSetDefinitions) for (const tier of set.thresholds) add(tier.effects)
    return new Map([...catalog].sort(([a], [b]) => a.localeCompare(b)))
  }, [data, owner, effects])
  const equipped = useMemo(
    () =>
      new Set(
        effects.map((s) => (data.enchantmentNames ? s.effect.name : objectiveEffect(s.effect).name).toLowerCase())
      ),
    [data.enchantmentNames, effects]
  )
  return { stats, equipped }
}
