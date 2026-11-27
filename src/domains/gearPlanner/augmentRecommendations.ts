import { gearPlannerAugmentIdentity, isCompatibleGearPlannerAugment } from './augments'
import { slotOwner } from './character'
import { formatAmount } from './effectAmounts'
import {
  aggregateEffectSummary,
  collectEquippedEffects,
  effectAmount,
  matchesAugmentAttackForm,
  normalizeBonusType,
  normalizeEffectName,
  type GearPlannerEffectSource
} from './effects'
import type {
  GearPlannerAugment,
  GearPlannerAugmentSlot,
  GearPlannerEffect,
  GearPlannerItem
} from './gearPlanner.types'
import { statValue } from './loadoutComparison'
import {
  equipGearPlannerItem,
  hasOtherGearPlannerMinorArtifact,
  setGearPlannerSlottedAugment,
  type GearPlannerEquipment
} from './planner'
import { getEffectiveGearPlannerAugmentSlots, type GearPlannerReforgingData } from './reforging'
import type { GearPlannerSetup } from './setups'
import { objectiveEffect } from './statObjectives'
import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types'

export interface AugmentSelection {
  index: number
  socket: GearPlannerAugmentSlot
  augment: GearPlannerAugment
}

export interface RecommendedAugment extends AugmentSelection {
  effects: readonly GearPlannerEffect[]
}

export const recommendationStatKey = (name: string) => normalizeEffectName(objectiveEffect({ name }).name)

function recommendationSource(raw: GearPlannerEffect, category: 'augment' | 'equipped-item', id: string) {
  const effect = objectiveEffect(raw)
  return {
    id,
    category,
    effect,
    normalizedName: normalizeEffectName(effect.name),
    normalizedBonusType: normalizeBonusType(effect.bonus),
    comparisonValue: effectAmount(effect)
  }
}

export function recommendationStats(sources: readonly GearPlannerEffectSource[]) {
  return new Map(aggregateEffectSummary(sources).map((row) => [row.normalizedName, statValue(row, true)]))
}

export function itemRecommendationSources(
  item: GearPlannerItem,
  keys: ReadonlySet<string>,
  augments: readonly RecommendedAugment[] = []
) {
  const base = item.source.enchantments ?? []
  const effects = [
    ...base.map((effect, index) => recommendationSource(effect, 'equipped-item', 'item:' + index.toString())),
    ...augments.flatMap(({ index, effects: augmentEffects }) =>
      augmentEffects.map((effect, order) =>
        recommendationSource(effect, 'augment', `augment:${index.toString()}:${order.toString()}`)
      )
    )
  ]
  return effects.filter(({ effect, normalizedName }) => !effect.displayOnly && keys.has(normalizedName))
}

export function collectRecommendationEffects(
  setup: GearPlannerSetup,
  essence: EssenceCraftingData,
  reforging: GearPlannerReforgingData
) {
  return collectEquippedEffects(setup.equipment, setup.slottedAugments, setup.slottedFiligrees, setup.slottedCurses, {
    essenceData: essence,
    essenceCrafting: setup.essenceCrafting,
    reforgingData: reforging,
    reforging: setup.reforging
  })
}

export type AugmentRecommendationSetup = Pick<
  GearPlannerSetup,
  'equipment' | 'slottedAugments' | 'maximumLevel' | 'essenceCrafting' | 'reforging'
>

function itemAugmentLevel(setup: AugmentRecommendationSetup, item: GearPlannerItem) {
  return Math.min(setup.maximumLevel, setup.essenceCrafting[item.id]?.minimumLevel ?? item.minimumLevel)
}

export function applyRecommendedAugments(
  setup: GearPlannerSetup,
  item: GearPlannerItem,
  reforging: GearPlannerReforgingData,
  augments: readonly AugmentSelection[]
): GearPlannerSetup {
  if (setup.equipment[item.slot]?.id !== item.id) return setup
  const slots = getEffectiveGearPlannerAugmentSlots(item, setup.reforging[item.id], reforging)
  const level = itemAugmentLevel(setup, item)
  let next = setup
  for (const { index, augment } of augments) {
    if (augment.minLevel > level || next.slottedAugments[item.id]?.[index]) continue
    const selection = setGearPlannerSlottedAugment(next, item.id, index, augment, slots)
    if (selection !== next) next = { ...next, ...selection }
  }
  return next
}

function augmentScoring(
  augments: readonly GearPlannerAugment[],
  names: readonly string[],
  loadoutEffects: readonly GearPlannerEffectSource[],
  bonusType?: string
) {
  const labels = new Map(names.map((name) => [recommendationStatKey(name), name]))
  const priorities = [...labels.keys()]
  const keys = new Set(priorities)
  const priorityIndex = new Map(priorities.map((key, index) => [key, index]))
  const retained: GearPlannerEffectSource[] = loadoutEffects.flatMap((source) => {
    const effect = recommendationSource(source.effect, 'equipped-item', source.id)
    return !effect.effect.displayOnly && keys.has(effect.normalizedName) ? [{ ...source, ...effect }] : []
  })
  const catalog = augments.flatMap((augment) => {
    const effects = augment.effectsAdded.filter((effect) => !effect.displayOnly)
    const matching = effects.flatMap((effect, index) => {
      const source = recommendationSource(effect, 'augment', index.toString())
      const priority = priorityIndex.get(source.normalizedName)
      return priority !== undefined && (!bonusType || source.normalizedBonusType === bonusType)
        ? [{ ...source, priority }]
        : []
    })
    return matching.some(({ comparisonValue }) => comparisonValue > 0)
      ? [{ augment, byStat: Map.groupBy(matching, (source) => source.priority) }]
      : []
  })
  const values = (sources: readonly GearPlannerEffectSource[]) => {
    const stats = recommendationStats(sources)
    return priorities.map((key) => stats.get(key))
  }
  const projected = new WeakMap<readonly GearPlannerEffectSource[], Map<string, ReturnType<typeof statValue>>>()
  function bestAugment(
    options: typeof catalog,
    baseline: readonly GearPlannerEffectSource[],
    baselineValues: ReturnType<typeof values>,
    item: GearPlannerItem,
    equipment: GearPlannerEquipment,
    current = baselineValues
  ) {
    const byStat = Map.groupBy(baseline, (source) => source.normalizedName)
    const retainedStats = priorities.map((key) => {
      const sources = byStat.get(key) ?? []
      // Only the values, units and Prowess item identities influence the stat summary.
      const signature = JSON.stringify(
        sources.map((source) => [
          source.effect.name,
          source.effect.modifier,
          source.effect.calculationValue,
          source.effect.roundToNearest,
          source.normalizedBonusType,
          source.comparisonValue,
          source.filigreeType === 71 ? [source.itemId] : undefined
        ])
      )
      return { sources, signature }
    })
    let best:
      { augment: GearPlannerAugment; sources: GearPlannerEffectSource[]; values: ReturnType<typeof values> } | undefined
    for (const { augment, byStat: additions } of options) {
      const next = baselineValues.slice()
      const sources: GearPlannerEffectSource[] = []
      for (const [index, group] of additions) {
        const eligible = group.every(({ effect }) => matchesAugmentAttackForm(effect, item, equipment))
          ? group
          : group.filter(({ effect }) => matchesAugmentAttackForm(effect, item, equipment))
        if (!eligible.length) continue
        const stat = retainedStats[index]
        let scores = projected.get(group)
        if (!scores) {
          scores = new Map()
          projected.set(group, scores)
        }
        const key = eligible === group ? stat.signature : undefined
        let score = key === undefined ? undefined : scores.get(key)
        if (!score) {
          score = statValue(aggregateEffectSummary([...stat.sources, ...eligible])[0], true)
          if (key !== undefined) scores.set(key, score)
        }
        next[index] = score
        sources.push(...eligible)
      }
      const change = firstFocusChange(best?.values ?? current, next)
      if (change && change.delta > 0) best = { augment, sources, values: next }
    }
    return best
  }
  return { catalog, keys, retained, values, bestAugment, labels: [...labels.values()] }
}

function firstFocusChange(before: readonly (ReturnType<typeof statValue> | undefined)[], after: typeof before) {
  for (const [index, next] of after.entries()) {
    const previous = before[index]
    const delta = (next?.amount ?? 0) - (previous?.amount ?? 0)
    if (delta)
      return { index, delta, unit: next?.unit ?? previous?.unit, rounding: next?.rounding ?? previous?.rounding }
  }
}

export function recommendSocketAugment(
  augments: readonly GearPlannerAugment[],
  item: GearPlannerItem,
  slotIndex: number,
  setup: Pick<GearPlannerSetup, 'character' | 'equipment'>,
  effects: readonly GearPlannerEffectSource[],
  selected: GearPlannerAugment | null
) {
  const names = setup.character.focusStats ?? []
  if (!names.length) return { detail: 'Set Focus Stats in Character Setup to get augment recommendations.' }
  const { catalog, retained, values, bestAugment, labels } = augmentScoring(augments, names, effects)
  const isSocket = (source: GearPlannerEffectSource) =>
    source.itemId === item.id && source.augmentSlotIndex === slotIndex
  const baseline = retained.filter((source) => !isSocket(source))
  const baselineValues = values(baseline)
  const current = values(retained)
  const best = bestAugment(catalog, baseline, baselineValues, item, setup.equipment, current)
  const selectedId = selected && gearPlannerAugmentIdentity(selected)
  const canKeep = selectedId && catalog.some(({ augment }) => gearPlannerAugmentIdentity(augment) === selectedId)
  const change = best
    ? firstFocusChange(current, best.values)
    : canKeep
      ? firstFocusChange(baselineValues, current)
      : undefined
  if (change && change.delta > 0) {
    const gain = formatAmount(change.delta, change.unit, true, change.rounding) + ' ' + labels[change.index]
    if (best) return { value: gearPlannerAugmentIdentity(best.augment), detail: `${gain} for your loadout` }
    if (selectedId) return { value: selectedId, detail: `Keep equipped · ${gain} for your loadout` }
  }
  return { detail: 'No Focus Stat gains among these results.' }
}

export function createAugmentRecommender(
  setup: AugmentRecommendationSetup,
  reforging: GearPlannerReforgingData,
  augments: readonly GearPlannerAugment[],
  names: readonly string[],
  loadoutEffects: readonly GearPlannerEffectSource[],
  bonusType?: string
) {
  if (!names.length) return (_item: GearPlannerItem): RecommendedAugment[] => []
  const { catalog, keys, retained, values, bestAugment } = augmentScoring(augments, names, loadoutEffects, bonusType)
  const compatible = new Map<string, { options: typeof catalog; levels: Map<number, typeof catalog> }>()

  const socketOptions = (socket: GearPlannerAugmentSlot, level: number) => {
    const key = JSON.stringify([socket.augmentType, socket.slotTypes])
    let socketIndex = compatible.get(key)
    if (!socketIndex) {
      socketIndex = {
        options: catalog.filter(({ augment }) => isCompatibleGearPlannerAugment(socket, augment)),
        levels: new Map()
      }
      compatible.set(key, socketIndex)
    }
    const cached = socketIndex.levels.get(level)
    if (cached) return cached
    const options = socketIndex.options.filter(({ augment }) => augment.minLevel <= level)
    socketIndex.levels.set(level, options)
    return options
  }

  return (item: GearPlannerItem): RecommendedAugment[] => {
    if (!catalog.length) return []
    const slots = getEffectiveGearPlannerAugmentSlots(item, setup.reforging[item.id], reforging)
    const level = itemAugmentLevel(setup, item)
    const open = slots
      .map((socket, index) => ({ socket, index, options: socketOptions(socket, level) }))
      .filter(({ index, options }) => !setup.slottedAugments[item.id]?.[index] && options.length > 0)
      .sort((a, b) => a.options.length - b.options.length)
    if (!open.length || hasOtherGearPlannerMinorArtifact(setup.equipment, item.slot, item)) return []
    const equipment = equipGearPlannerItem(setup.equipment, item.slot, item)
    if (equipment[item.slot]?.id !== item.id) return []
    const owner = slotOwner(item.slot)
    const equippedIds = new Set(
      Object.values(equipment).flatMap((gear) => (gear && slotOwner(gear.slot) === owner ? [gear.id] : []))
    )
    const baseline = retained.filter(({ itemId }) => itemId && equippedIds.has(itemId))
    if (setup.equipment[item.slot]?.id !== item.id) baseline.push(...itemRecommendationSources(item, keys))
    const recommendations: RecommendedAugment[] = []
    let current = values(baseline)

    for (const { index, socket, options } of open) {
      const best = bestAugment(options, baseline, current, item, equipment)
      if (!best) continue
      baseline.push(...best.sources)
      current = best.values
      recommendations.push({
        index,
        socket,
        augment: best.augment,
        effects: best.augment.effectsAdded.filter(
          (effect) => !effect.displayOnly && matchesAugmentAttackForm(effect, item, equipment)
        )
      })
    }
    return recommendations.sort((a, b) => a.index - b.index)
  }
}
