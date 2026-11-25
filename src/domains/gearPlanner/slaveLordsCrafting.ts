import type { SlaveLordsBase, SlaveLordsCategory, SlaveLordsData, SlaveLordsStat } from '../slaveLords/data'
import type { CraftChoice, CraftGroup } from './crafting'
import type { GearPlannerEffect, GearPlannerSlot } from './gearPlanner.types'

const categories: readonly SlaveLordsCategory[] = ['prefix', 'suffix', 'extra', 'bonus', 'set', 'augment', 'mythic']

const blankSlots: Readonly<Record<string, GearPlannerSlot>> = {
  Finger1: 'First Finger',
  Finger2: 'Second Finger',
  Trinket: 'Trinket',
  Neck: 'Neck',
  Waist: 'Waist',
  Feet: 'Feet',
  Wrists: 'Wrists'
}

export const slaveLordsBlankSlots = (base: SlaveLordsBase | undefined) =>
  base?.kind === 'craftingBlank' ? base.equipSlots.flatMap((slot) => blankSlots[slot] ?? []) : []

function gearEffect(stat: SlaveLordsStat): GearPlannerEffect {
  return {
    name: stat.stat,
    bonus: stat.bonusType,
    calculationValue: stat.calculationValue,
    modifier: stat.formattedValue.endsWith('%') ? stat.formattedValue : stat.value
  }
}

export const slaveLordsSetDefinitions = (catalog: SlaveLordsData) =>
  catalog.sets.map(({ name, thresholds }) => ({
    name,
    thresholds: thresholds.map(({ pieces, effects }) => ({ threshold: pieces, effects: effects.map(gearEffect) }))
  }))

export function slaveLordsCraftGroups(base: SlaveLordsBase, slot: GearPlannerSlot, data: SlaveLordsData): CraftGroup[] {
  const groups = new Map<SlaveLordsCategory, CraftChoice[]>()
  for (const option of base.options) {
    let choice: CraftChoice = { id: String(option.id), label: option.name, effects: option.effects.map(gearEffect) }
    if (option.category === 'set') {
      const set = data.sets.find(({ id }) => id === option.setId)
      if (!set) continue
      choice = { id: set.name, label: set.name, setName: set.name }
    } else if (option.category === 'augment') {
      const color = option.augmentTypes.at(-1)
      if (!color) continue
      choice = { id: String(option.id), label: option.name, augmentSlot: { augmentType: color, name: option.name } }
    } else if (option.category === 'mythic') {
      const match = option.slotBonuses.find((bonus) => bonus.equipSlots.some((name) => blankSlots[name] === slot))
      const amount = match?.effects[0]?.value
      if (!match || amount === undefined) continue
      choice = { id: String(amount), label: '+' + String(amount), effects: match.effects.map(gearEffect) }
    }
    const choices = groups.get(option.category) ?? []
    choices.push(choice)
    groups.set(option.category, choices)
  }
  return categories.flatMap((category) => {
    const choices = groups.get(category)
    if (!choices) return []
    return [
      {
        system: category === 'mythic' ? 'mythic' : category === 'set' ? 'slave-lords' : 'slave-lords-' + category,
        label: category === 'mythic' ? 'Mythic Boost' : 'Slave Lords ' + category,
        choices: choices.sort((a, b) => a.label.localeCompare(b.label))
      }
    ]
  })
}
