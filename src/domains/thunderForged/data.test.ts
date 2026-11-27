import { describe, expect, it } from 'vitest'
import { buildThunderData, resolveThunderPlan } from './data'
import { exportThunderPlan, importThunderPlan, linkedThunderPlan, thunderPlanPath } from './sharing'
import { emptyGearCraftingData, gearCraftGroups } from '../gearPlanner/crafting'
import { collectEquippedEffects } from '../gearPlanner/effects'
import { normalizeGearPlannerSources } from '../gearPlanner/normalize'
import { createGearPlannerExport, importGearPlannerState } from '../gearPlanner/plannerStorage'
import { activeGearPlannerSetup, createDefaultGearPlannerState, setGearPlannerSetupCraft } from '../gearPlanner/setups'
import { addThunderBases } from '../gearPlanner/thunderForgedCrafting'

const tier1 = 'thunder-forged-tier1'
const tier2 = 'thunder-forged-tier2'
const tier3 = 'thunder-forged-tier3'
const orange = { effectId: 10, name: 'Orange Augment Slot', types: ['Colorless', 'Red', 'Yellow', 'Orange'] }
const green = {
  id: 12,
  displayName: 'Green Augment Slot',
  hidden: true,
  slotTypes: ['Colorless', 'Yellow', 'Blue', 'Green']
}
const cost = (quantity: number) => [{ ingredientId: 5, quantity }]
const forgeRecipe = (outputItemId: number) => ({
  id: 100 + outputItemId,
  stage: 'baseItem',
  device: 'magmaForge',
  outputItemId,
  ingredients: cost(20)
})
function base(id: number, name: string, itemType: string, type: string, slot: string, effects: number[]) {
  return {
    id,
    name,
    itemType,
    type,
    minimumLevel: type === 'Armor' ? 26 : 22,
    baseStats: { equipSlots: [slot] },
    iconLayers: [],
    effects: effects.map((effectId) => ({ effectId })),
    augmentSlots: type === 'Armor' ? [] : [orange]
  }
}
function upgrade(
  id: number,
  name: string,
  stage: string,
  baseId: number,
  from: number,
  removeMutationIds: number[],
  addEffectIds: number[]
) {
  return {
    id,
    name,
    stage,
    device: 'magmaForge',
    category: 'upgrade',
    description: name,
    ingredients: cost(10),
    keeper: { itemIds: [baseId], requiredMutationIds: [from] },
    removeMutationIds,
    addEffectIds
  }
}
const thunderForged = buildThunderData(
  {
    bases: [
      base(1, 'Thunder-Forged Alloy Quarterstaff', 'Quarterstaff', 'Weapon', 'Weapon1', [20, 30]),
      base(2, 'Thunder-Forged Orb', 'Orb', 'Shield', 'Weapon2', [20, 30]),
      base(3, 'Shadowscale Robe', 'Cloth', 'Armor', 'Armor', [24])
    ],
    effects: [
      { id: 20, displayName: 'Thunder-Forged (Tier 0)' },
      { id: 21, displayName: 'Thunder-Forged (Tier 1)' },
      { id: 22, displayName: 'Thunder-Forged (Tier 2)' },
      { id: 23, displayName: 'Thunder-Forged (Tier 3)', hidden: true },
      { id: 24, displayName: 'Flawed Armor' },
      { id: 25, displayName: 'Required Level: 24', hidden: true },
      { id: 26, displayName: 'Required Level: 26', hidden: true },
      { id: 27, displayName: 'Required Level: 28', hidden: true },
      { id: 30, displayName: 'Returning' },
      { id: 31, displayName: 'Blinding Fear', description: 'Apply fear on hit.' },
      {
        id: 32,
        displayName: 'Cold damage',
        enchantments: [{ displayName: 'Spell Power: Cold', value: 144, bonusType: 'Equipment' }]
      },
      { id: 33, displayName: 'Eternal Scorching Light' },
      { id: 34, displayName: 'Shadow Caster' },
      green,
      { id: 13, displayName: 'Red Augment Slot', hidden: true, slotTypes: ['Colorless', 'Red'] },
      { id: 14, displayName: 'Colorless Augment Slot', hidden: true, slotTypes: ['Colorless'] }
    ],
    ingredients: [{ id: 5, name: 'Thunder-Forged Dwarven Ingot' }],
    recipes: [
      ...[1, 2, 3].map(forgeRecipe),
      upgrade(41, 'Blinding Fear', 'tier1', 1, 20, [20], [21, 25, 31]),
      upgrade(42, 'Green Augment Slot', 'tier2', 1, 21, [21, 25], [22, 26, 12, 13, 32]),
      {
        ...upgrade(43, 'Eternal Scorching Light', 'tier3', 1, 22, [22, 26], [23, 27, 14, 33]),
        resultSpell: { spellId: 80 },
        bindKeeper: true
      },
      upgrade(44, 'Orb-only choice', 'tier1', 2, 20, [20], [21, 25]),
      upgrade(45, 'Flawless Shadow Caster Armor', 'flawlessArmor', 3, 24, [24], [27, 12, 34])
    ],
    spells: [{ id: 80, name: 'Red Dragon Breath', charges: 3 }],
    icons: []
  },
  'Magma Forge'
)

describe('Thunder-Forged crafting', () => {
  it('applies only eligible mutations, keeps cumulative effects, and totals the selected recipes', () => {
    const staff = thunderForged.bases.get(1)
    const robe = thunderForged.bases.get(3)
    if (!staff || !robe) throw new Error('Expected a Quarterstaff and Shadowscale Robe')
    const plan = resolveThunderPlan(staff, { tier1: 41, tier2: 42, tier3: 43 })
    expect(plan.minimumLevel).toBe(28)
    expect(plan.sockets.map((s) => s.augmentType)).toEqual(['Orange', 'Green', 'Red', 'Colorless'])
    expect(plan.upgrades.flatMap(({ effects }) => effects.map(({ name }) => name))).toEqual([
      'Blinding Fear',
      'Spell Power: Cold',
      'Eternal Scorching Light',
      'Cast Red Dragon Breath (3 charges)'
    ])
    expect(plan.costs).toEqual([{ id: 5, name: 'Thunder-Forged Dwarven Ingot', quantity: 50 }])
    expect(resolveThunderPlan(staff, { tier1: 44, tier2: 42 }).selected).toEqual([])
    expect(resolveThunderPlan(staff, { tier2: 42 }).choices.tier2).toBeUndefined()
    const armor = resolveThunderPlan(robe, { flawlessArmor: 45 })
    expect(armor.minimumLevel).toBe(28)
    expect(armor.baseEffects).toEqual([])
    expect(armor.sockets.map((s) => s.augmentType)).toEqual(['Green'])
  })

  it('round-trips standalone links and JSON, rejecting conflicting tier choices', () => {
    const ids = [41, 42, 43]
    const expected = { baseId: 1, recipes: { tier1: 41, tier2: 42, tier3: 43 } }
    expect(linkedThunderPlan(thunderForged, new URL(thunderPlanPath(1, ids), 'https://test.example').search)).toEqual(
      expected
    )
    expect(importThunderPlan(exportThunderPlan(1, ids), thunderForged)).toEqual(expected)
    expect(() => importThunderPlan(exportThunderPlan(1, [41, 43]), thunderForged)).toThrow(/unavailable/)
  })

  it('updates equipment effects and restores upgrades from Gear Planner exports in tier order', () => {
    const catalog = normalizeGearPlannerSources(addThunderBases([], thunderForged), [])
    catalog.crafting = { ...emptyGearCraftingData, thunderForged }
    const staff = catalog.itemsBySlot['Main Hand'][0]
    const state = createDefaultGearPlannerState()
    activeGearPlannerSetup(state).equipment['Main Hand'] = staff
    const choose = (
      current: ReturnType<typeof createDefaultGearPlannerState>,
      system: string,
      choiceId: string | null
    ) => setGearPlannerSetupCraft(current, 'Main Hand', staff.id, system, choiceId, catalog.crafting)
    expect(gearCraftGroups(staff, catalog.crafting).map(({ system }) => system)).toContain(tier1)
    const upgraded = choose(choose(choose(state, tier1, '41'), tier2, '42'), tier3, '43')
    const save = createGearPlannerExport(upgraded)
    const reversed = [...(save.setups[0].selectedCrafts ?? [])].reverse()
    const result = importGearPlannerState(
      JSON.stringify({
        ...save,
        setups: [{ ...save.setups[0], selectedCrafts: reversed }]
      }),
      catalog
    )
    const loaded = activeGearPlannerSetup(result.state)
    expect(loaded.equipment['Main Hand']?.minimumLevel).toBe(28)
    expect(loaded.equipment['Main Hand']?.source.augments?.map(({ augmentType }) => augmentType)).toEqual([
      'Orange',
      'Green',
      'Red',
      'Colorless'
    ])
    expect(collectEquippedEffects(loaded.equipment).map(({ effect }) => effect.name)).toContain('Spell Power: Cold')
    const cleared = activeGearPlannerSetup(choose(result.state, tier1, null))
    expect(cleared.equipment['Main Hand']?.minimumLevel).toBe(22)
    expect(cleared.equipment['Main Hand']?.crafts).toEqual([])
    expect(cleared.equipment['Main Hand']?.source.augments?.map(({ augmentType }) => augmentType)).toEqual(['Orange'])
  })
})
