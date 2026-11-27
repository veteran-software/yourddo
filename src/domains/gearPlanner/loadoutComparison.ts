import { formatAmount } from './effectAmounts'
import { objectiveEffect } from './statObjectives'
import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types'
import { enabledOwners, ownerSlots, type GearOwner } from './character'
import {
  aggregateEffectSummary,
  collectEquippedEffects,
  isSummingBonusType,
  matchesAugmentAttackForm,
  normalizeBonusType,
  normalizeEffectName,
  effectAmount,
  type GearPlannerEffectSummary
} from './effects'
import type { GearPlannerAugment, GearPlannerData, GearPlannerEffect, GearPlannerItem } from './gearPlanner.types'
import { createEmptyGearPlannerEquipment } from './planner'
import {
  gearPlannerReforgingStages,
  gearPlannerReforgingStageLabel,
  equipmentWithReforgedSets,
  gearPlannerReforgingChoiceForState,
  getEffectiveGearPlannerAugmentSlotsByItem
} from './reforging'
import { collectActiveSetEffectSources, resolveGearPlannerSetState, type GearPlannerSetState } from './sets'
import type { GearPlannerSetup } from './setups'

interface Value {
  text: string
  amount?: number
  unit?: string
  rounding?: 'round' | 'trunc'
}
type Entries = Map<string, Value>

export function statValue(effect: GearPlannerEffectSummary, signed = false): Value {
  const active = effect.groups.flatMap((g) => g.entries.filter((e) => e.isEffective).map((e) => e.effect))
  const modifiers = active.map((e) => String(e.modifier ?? '').trim())
  const units = new Set(
    modifiers.filter(Boolean).map((value) => {
      const match = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(%|\[W\]|)$/i.exec(value)
      // The equipment feed omits the percent sign on spell critical chance. Set bonuses include it.
      if (match?.[1] === '' && /^spell critical chance(?:$|:)/i.test(effect.name)) return '%'
      return match?.[1]
    })
  )
  const [unit] = units
  if (units.size === 1 && unit != null) {
    const fractional = active.filter((e) => e.calculationValue !== undefined && !Number.isInteger(e.calculationValue))
    let rounding: Value['rounding']
    if (fractional.length) rounding = fractional.every((e) => e.roundToNearest) ? 'round' : 'trunc'
    return { text: formatAmount(effect.total, unit, signed, rounding), amount: effect.total, unit, rounding }
  }
  return {
    text:
      [...new Set(modifiers.filter(Boolean))].sort((left, right) => left.localeCompare(right)).join(' · ') || 'Present'
  }
}

const catalogLabels = new WeakMap<readonly string[], ReadonlySet<string>>()
function publishedLabels(names: readonly string[] | undefined) {
  if (!names) return undefined
  let labels = catalogLabels.get(names)
  if (!labels) {
    labels = new Set(names)
    catalogLabels.set(names, labels)
  }
  return labels
}

export function loadoutSnapshot(
  setup: GearPlannerSetup,
  owner: GearOwner,
  data: GearPlannerData,
  essence: EssenceCraftingData,
  objective?: string,
  includeGear = true
) {
  const equipment = createEmptyGearPlannerEquipment()
  const gear: Entries = new Map()
  if (enabledOwners(setup.character.classes).includes(owner)) {
    for (const slot of ownerSlots[owner]) {
      const item = setup.equipment[slot]
      if (!item) continue
      equipment[slot] = item
      if (includeGear) addItemDetails(gear, slot, item, setup, essence, data)
    }
  }
  const slots = getEffectiveGearPlannerAugmentSlotsByItem(equipment, setup.reforging, data.reforging)
  const sets = resolveGearPlannerSetState(
    equipmentWithReforgedSets(equipment, setup.reforging, data.reforging),
    setup.slottedAugments,
    data.standardSets,
    setup.slottedFiligrees,
    data.filigreeSetDefinitionByName,
    slots
  )
  const effects = collectEquippedEffects(
    equipment,
    setup.slottedAugments,
    setup.slottedFiligrees,
    setup.slottedCurses,
    {
      essenceData: essence,
      essenceCrafting: setup.essenceCrafting,
      reforgingData: data.reforging,
      reforging: setup.reforging
    }
  )
  const labels = publishedLabels(data.enchantmentNames)
  const objectiveFor = (effect: GearPlannerEffect) => (labels?.has(effect.name) ? effect : objectiveEffect(effect))
  const summaries = aggregateEffectSummary(
    [...effects, ...collectActiveSetEffectSources(sets)].map((source) => {
      const effect = objectiveFor(source.effect)
      return effect === source.effect
        ? source
        : {
            ...source,
            effect,
            normalizedName: normalizeEffectName(effect.name),
            comparisonValue: effectAmount(effect)
          }
    })
  )
  const stats: Entries = new Map(summaries.map((s) => [s.name, statValue(s)]))
  const objectiveBonuses: Entries = new Map()
  const selected = objective && summaries.find((s) => s.normalizedName === objective.toLowerCase())
  if (selected)
    for (const group of selected.groups)
      objectiveBonuses.set(group.bonusType, statValue({ ...selected, total: group.effectiveValue, groups: [group] }))
  const tiers: Entries = activeSetTiers(sets)
  function augmentIsCovered(item: GearPlannerItem, augment: GearPlannerAugment) {
    if (augment.setBonus?.length || augment.clearSecondarySet) return false
    return augment.effectsAdded.every((raw) => {
      if (!matchesAugmentAttackForm(raw, item, equipment)) return true
      const effect = objectiveFor(raw)
      const bonus = normalizeBonusType(raw.bonus)
      if (isSummingBonusType(bonus)) return false
      const summary = summaries.find((entry) => entry.normalizedName === normalizeEffectName(effect.name))
      const group = summary?.groups.find(({ bonusType }) => bonusType === bonus)
      // A tie can contribute a new unit or label to the effective stat.
      return group !== undefined && group.effectiveValue > effectAmount(effect)
    })
  }
  return {
    Stats: stats,
    objectiveBonuses,
    Sets: tiers,
    Gear: gear,
    ...(includeGear ? {} : { augmentIsCovered }),
    predictsProwessStack: new Set(effects.filter((e) => e.filigreeType === 71).map((e) => e.itemId)).size > 1
  }
}

function activeSetTiers(sets: GearPlannerSetState) {
  const tiers: Entries = new Map()
  for (const set of sets.sets)
    for (const tier of set.thresholds)
      if (tier.isActive) tiers.set(`${set.name} · ${String(tier.threshold)}-piece`, { text: 'Active' })
  return tiers
}

function addItemDetails(
  gear: Entries,
  slot: string,
  item: GearPlannerItem,
  setup: GearPlannerSetup,
  essence: EssenceCraftingData,
  data: GearPlannerData
) {
  gear.set(slot, { text: item.source.name })
  const add = (label: string, text: string) => gear.set(slot + ' · ' + label, { text })
  const id = item.id
  for (const craft of item.crafts ?? []) add(craft.system, craft.label)
  for (const [i, aug] of Object.entries(setup.slottedAugments[id] ?? {}))
    add('Augment ' + String(Number(i) + 1), aug.name)
  for (const [i, fil] of Object.entries(setup.slottedFiligrees[id] ?? {}))
    add('Filigree ' + String(Number(i) + 1), fil.name)
  if (setup.unlockedFiligreeSlots[id]) add('Unlocked sockets', String(setup.unlockedFiligreeSlots[id]))
  if (setup.slottedCurses[id]) add('Curse', setup.slottedCurses[id].name)
  addCraftedAttributes(setup, id, add, essence)
  for (const stage of gearPlannerReforgingStages) {
    const state = setup.reforging[id]?.[stage]
    if (state)
      add(
        gearPlannerReforgingStageLabel[stage],
        gearPlannerReforgingChoiceForState(item, stage, state, data.reforging)?.label ?? 'Active'
      )
  }
}

function addCraftedAttributes(
  setup: GearPlannerSetup,
  id: string,
  add: (label: string, text: string) => Entries,
  essence: EssenceCraftingData
) {
  const crafted = setup.essenceCrafting[id]
  if (crafted) {
    add('ML', String(crafted.minimumLevel))
    if (crafted.material) add('Material', crafted.material)
    for (const position of ['prefix', 'suffix', 'extra'] as const) {
      const choice = crafted[`${position}Id`]
      if (choice) add(position, essence.indexes.enhancementById.get(choice)?.displayName ?? choice)
    }
  }
}

export function comparisonRows(before: Entries, after: Entries) {
  return [...new Set([...before.keys(), ...after.keys()])]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((label) => {
      const a = before.get(label),
        b = after.get(label)
      const changed = a?.text !== b?.text || a?.amount !== b?.amount
      let delta = changed ? 'Changed' : '—'
      if (!a) delta = 'Gained'
      else if (!b) delta = 'Lost'
      let direction = changed ? 'changed' : 'same'
      if (!a) direction = 'gain'
      else if (!b) direction = 'loss'
      if (
        changed &&
        (a == null || a.amount != null) &&
        (b == null || b.amount != null) &&
        (!a || !b || a.unit === b.unit)
      ) {
        const difference = (b?.amount ?? 0) - (a?.amount ?? 0)
        delta = formatAmount(difference, b?.unit ?? a?.unit, true, b?.rounding ?? a?.rounding)
        if (difference > 0) direction = 'gain'
        else if (difference < 0) direction = 'loss'
      }
      return { label, before: a?.text ?? '—', after: b?.text ?? '—', delta, direction, changed }
    })
}
