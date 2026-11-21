import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types'
import { enabledOwners, ownerSlots, type GearOwner } from './character'
import { aggregateEffectSummary, collectEquippedEffects, type GearPlannerEffectSummary } from './effects'
import type { GearPlannerData } from './gearPlanner.types'
import { createEmptyGearPlannerEquipment } from './planner'
import {
  gearPlannerReforgingStages,
  gearPlannerReforgingStageLabel,
  gearPlannerReforgingChoiceForState,
  getEffectiveGearPlannerAugmentSlotsByItem
} from './reforging'
import { collectActiveSetEffectSources, resolveGearPlannerSetState } from './sets'
import type { GearPlannerSetup } from './setups'

interface Value {
  text: string
  amount?: number
  unit?: string
}
type Entries = Map<string, Value>
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 })

function statValue(effect: GearPlannerEffectSummary): Value {
  const modifiers = effect.groups.flatMap((g) =>
    g.entries.filter((e) => e.isEffective).map((e) => String(e.effect.modifier ?? '').trim())
  )
  const units = new Set(
    modifiers.filter(Boolean).map((value) => {
      const match = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(%|\[W\]|)$/i.exec(value)
      // The equipment feed omits the percent sign on spell critical chance. Set bonuses include it.
      if (match?.[1] === '' && /^spell critical chance(?:$|:)/i.test(effect.name)) return '%'
      return match?.[1]
    })
  )
  const [unit] = units
  if (units.size === 1 && unit != null) return { text: number.format(effect.total) + unit, amount: effect.total, unit }
  return { text: [...new Set(modifiers.filter(Boolean))].sort().join(' · ') || 'Present' }
}

export function loadoutSnapshot(
  setup: GearPlannerSetup,
  owner: GearOwner,
  data: GearPlannerData,
  essence: EssenceCraftingData
) {
  const equipment = createEmptyGearPlannerEquipment()
  const gear: Entries = new Map()
  if (enabledOwners(setup.character.classes).includes(owner)) {
    for (const slot of ownerSlots[owner]) {
      const item = setup.equipment[slot]
      if (!item) continue
      equipment[slot] = item
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
      const crafted = setup.essenceCrafting[id]
      if (crafted) {
        add('Minimum level', String(crafted.minimumLevel))
        if (crafted.material) add('Material', crafted.material)
        for (const position of ['prefix', 'suffix', 'extra'] as const) {
          const choice = crafted[`${position}Id`]
          if (choice) add(position, essence.indexes.enhancementById.get(choice)?.displayName ?? choice)
        }
      }
      for (const stage of gearPlannerReforgingStages) {
        const state = setup.reforging[id]?.[stage]
        if (state)
          add(
            gearPlannerReforgingStageLabel[stage],
            gearPlannerReforgingChoiceForState(item, stage, state, data.reforging)?.label ?? 'Active'
          )
      }
    }
  }
  const slots = getEffectiveGearPlannerAugmentSlotsByItem(equipment, setup.reforging, data.reforging)
  const sets = resolveGearPlannerSetState(
    equipment,
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
    essence,
    setup.essenceCrafting,
    data.reforging,
    setup.reforging
  )
  const stats: Entries = new Map(
    aggregateEffectSummary([...effects, ...collectActiveSetEffectSources(sets)]).map((s) => [s.name, statValue(s)])
  )
  const tiers: Entries = new Map()
  for (const set of sets.sets)
    for (const tier of set.thresholds)
      if (tier.isActive) tiers.set(`${set.name} · ${String(tier.threshold)}-piece`, { text: 'Active' })
  return {
    Stats: stats,
    Sets: tiers,
    Gear: gear,
    predictsProwessStack: new Set(effects.filter((e) => e.filigreeType === 71).map((e) => e.itemId)).size > 1
  }
}

export function comparisonRows(before: Entries, after: Entries) {
  return [...new Set([...before.keys(), ...after.keys()])]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((label) => {
      const a = before.get(label),
        b = after.get(label)
      const changed = a?.text !== b?.text
      let delta = changed ? 'Changed' : '—'
      if (!a) delta = 'Gained'
      else if (!b) delta = 'Lost'
      if (
        changed &&
        (a == null || a.amount != null) &&
        (b == null || b.amount != null) &&
        (!a || !b || a.unit === b.unit)
      ) {
        const difference = (b?.amount ?? 0) - (a?.amount ?? 0)
        delta = (difference > 0 ? '+' : '') + number.format(difference) + (b?.unit ?? a?.unit ?? '')
      }
      const direction = !changed
        ? 'same'
        : !a || delta.startsWith('+')
          ? 'gain'
          : !b || delta.startsWith('-')
            ? 'loss'
            : 'changed'
      return { label, before: a?.text ?? '—', after: b?.text ?? '—', delta, direction, changed }
    })
}
