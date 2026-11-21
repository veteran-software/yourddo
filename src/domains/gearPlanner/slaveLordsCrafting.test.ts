import { expect, it } from 'vitest'
import type { SlaveLordsData, SlaveLordsOption } from '../slaveLords/data'
import { prepareGearPlannerCandidates, filterGearPlannerCandidates } from './planner'
import { gearCraftGroups } from './crafting'
import { collectEquippedEffects } from './effects'
import { normalizeGearPlannerSources } from './normalize'
import { createGearPlannerExport, importGearPlannerState } from './plannerStorage'
import { getEffectiveGearPlannerAugmentSlots } from './reforging'
import {
  activeGearPlannerSetup,
  createDefaultGearPlannerState,
  equipGearPlannerSetupItem,
  setGearPlannerSetupAugment,
  setGearPlannerSetupCraft
} from './setups'
import { slaveLordsSetDefinitions } from './slaveLordsCrafting'
import { candidateSetDetails } from './finding'

const stat = (name: string, value: number, bonusType: string) => ({
  stat: name,
  value,
  formattedValue: String(value),
  bonusType
})
const option = (
  id: number,
  category: SlaveLordsOption['category'],
  name: string,
  extra: Partial<SlaveLordsOption> = {}
): SlaveLordsOption => ({
  id,
  category,
  name,
  effects: [],
  slotBonuses: [],
  costs: [],
  discrepancies: [],
  description: '',
  augmentTypes: [],
  ...extra
})
const endurance = "Slaver's Endurance"
const setChoice = option(4, 'set', endurance, { setId: 44 })
const catalog: SlaveLordsData = {
  bases: [
    {
      id: 1,
      name: 'Chains',
      tier: 'heroic',
      minimumLevel: 8,
      kind: 'craftingBlank',
      description: '',
      equipSlots: ['Waist', 'Neck'],
      options: [
        option(2, 'prefix', "Slaver's Strength", { effects: [stat('Strength', 5, 'Enhancement')] }),
        option(3, 'augment', 'Blue socket', { augmentTypes: ['Colorless', 'Blue'] }),
        setChoice,
        option(5, 'mythic', 'Mythic', {
          slotBonuses: [
            { equipSlots: ['Waist'], effects: [stat('Melee Power', 1, 'Mythic')] },
            { equipSlots: ['Neck'], effects: [stat('Physical Resistance Rating', 1, 'Mythic')] }
          ]
        }),
        option(6, 'augment', 'Yellow socket', { augmentTypes: ['Colorless', 'Yellow'] })
      ]
    },
    {
      id: 7,
      name: 'Legendary Mutilator of Minds',
      tier: 'legendary',
      minimumLevel: 28,
      kind: 'setEquipment',
      description: '',
      equipSlots: ['Weapon2'],
      options: [setChoice]
    }
  ],
  sets: [
    {
      id: 44,
      name: endurance,
      tier: 'heroic',
      thresholds: [{ pieces: 3, effects: [stat('Resistance', 1, 'Artifact')] }]
    }
  ]
}
function gearData() {
  return normalizeGearPlannerSources(
    [
      { fileName: 'necklace.json', records: [{ name: 'Chains', type: 'Necklace', minLevel: 8 }] },
      {
        fileName: 'orb.json',
        records: [{ name: 'Mutilator of Minds', pageTitle: 'Legendary Mutilator of Minds', type: 'Orb', minLevel: 28 }]
      }
    ],
    [{ name: 'Sapphire', augmentType: 'Blue', minLevel: 1, effectsAdded: [], source: {} }],
    new Set(),
    catalog
  )
}

it('matches named loot by title and level, equips blanks in either slot and resolves slot-specific Mythic boosts', () => {
  const data = gearData()
  const [orb] = data.itemsBySlot['Off Hand']
  expect(orb.slaveLordsBase?.id).toBe(7)
  expect(candidateSetDetails(orb, data).sets).toEqual([endurance])
  expect(gearCraftGroups(orb, data.crafting).some((g) => g.system === 'slave-lords-prefix')).toBe(false)
  for (const [position, statName] of [
    ['Waist', 'Melee Power'],
    ['Neck', 'Physical Resistance Rating']
  ] as const) {
    const [item] = data.itemsBySlot[position]
    const mythic = gearCraftGroups(item, data.crafting).filter((g) => g.system === 'mythic')
    expect(mythic).toHaveLength(1)
    expect(mythic[0].choices[0]).toMatchObject({ id: '1', effects: [{ name: statName, modifier: 1, bonus: 'Mythic' }] })
  }
  expect(slaveLordsSetDefinitions(catalog)[0].thresholds).toEqual([
    { threshold: 3, effects: [{ name: 'Resistance', modifier: 1, bonus: 'Artifact' }] }
  ])
})

it('restores a crafted socket and its augment, migrates the old set name and clears incompatible augments on changes', () => {
  const data = gearData()
  const [item] = data.itemsBySlot.Waist
  let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), item.slot, item)
  const select = (system: string, id: string | null) => {
    state = setGearPlannerSetupCraft(state, item.slot, item.id, system, id, data.crafting)
  }
  const equipment = () => activeGearPlannerSetup(state).equipment
  const slots = () => {
    const waist = equipment().Waist
    if (!waist) throw new Error('Expected an equipped waist item')
    return getEffectiveGearPlannerAugmentSlots(waist, undefined, data.reforging).map((s) => s.augmentType)
  }
  select('slave-lords-prefix', '2')
  select('slave-lords', endurance)
  select('slave-lords-augment', '3')
  state = setGearPlannerSetupAugment(state, item.id, 0, data.augments[0], data.reforging)
  const saved = JSON.stringify(createGearPlannerExport(state)).replace("Slaver's Endurance", "Slave's Endurance")
  const restored = importGearPlannerState(saved, data)
  expect(restored.issues).toEqual([])
  state = restored.state
  expect(slots()).toEqual(['Blue'])
  expect(activeGearPlannerSetup(state).slottedAugments[item.id][0].name).toBe('Sapphire')
  expect(equipment().Waist?.crafts?.find((c) => c.system === 'slave-lords')?.setName).toBe(endurance)
  expect(collectEquippedEffects(equipment()).map((e) => e.effect)).toEqual([
    { name: 'Strength', bonus: 'Enhancement', modifier: 5 }
  ])
  select('slave-lords-augment', '6')
  expect(slots()).toEqual(['Yellow'])
  expect(activeGearPlannerSetup(state).slottedAugments[item.id]).toBeUndefined()
  select('slave-lords-augment', null)
  expect(slots()).toEqual([])
})

it('finds eligible blanks by craftable stat and bonus type without equipping the upgrade', () => {
  const data = gearData()
  const candidates = prepareGearPlannerCandidates(data.items, data)
  const matches = filterGearPlannerCandidates(candidates, {
    search: 'Strength',
    exactEffect: true,
    type: null,
    setName: null,
    bonusType: 'enhancement',
    minimumLevel: 1,
    maximumLevel: 32
  })
  expect(matches.map(({ item }) => item.slot).sort()).toEqual(['Neck', 'Waist'])
  expect(matches[0].effects).toContainEqual({
    name: 'Strength',
    modifier: 5,
    bonus: 'Enhancement',
    craft: "Slave Lords prefix · Slaver's Strength"
  })
  expect(matches[0].item.crafts).toBeUndefined()
})
