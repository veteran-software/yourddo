import { expect, it } from 'vitest'
import type { AlchemicalBase, AlchemicalData, AlchemicalEffect, AlchemicalRecipe } from '../alchemical/data'
import { alchemicalRecipeHref } from './alchemicalCrafting'
import { gearCraftGroups } from './crafting'
import { collectEquippedEffects } from './effects'
import { getGearPlannerMaxFiligreeSlots } from './filigrees'
import { normalizeGearPlannerSources } from './normalize'
import { createGearPlannerExport, importGearPlannerState } from './plannerStorage'
import {
  activeGearPlannerSetup,
  createDefaultGearPlannerState,
  equipGearPlannerSetupItem,
  setGearPlannerSetupAugment,
  setGearPlannerSetupCraft
} from './setups'

function enhancement(value: number): AlchemicalEffect {
  return {
    id: value,
    name: '+' + String(value) + ' Enhancement Bonus',
    description: '',
    augmentTypes: [],
    stats: [{ stat: 'Enhancement Bonus', bonusType: 'Generic', value, formattedValue: String(value) }]
  }
}
const red: AlchemicalEffect = {
  id: 9,
  name: 'Red Augment Slot',
  description: '',
  augmentTypes: ['Colorless', 'Red'],
  stats: []
}
const base: AlchemicalBase = {
  id: 1,
  name: 'Alchemical Dagger',
  description: '',
  family: 'original',
  type: 'Weapon',
  weaponType: 'Dagger',
  acceptsSentience: false,
  minimumLevel: 12,
  material: 'Steel',
  ingredientType: 'Weapon',
  equipSlots: ['Weapon1', 'Weapon2'],
  costs: [],
  sources: ['The Master Artificer'],
  effects: [enhancement(5)],
  effectIds: [5, 10]
}
function recipe(
  id: number,
  stage: AlchemicalRecipe['stage'],
  required: number,
  options: Partial<AlchemicalRecipe> = {}
): AlchemicalRecipe {
  return {
    id,
    stage,
    family: 'original',
    name: 'Recipe ' + String(id),
    description: '',
    device: 'forge',
    effects: [],
    costs: [],
    discrepancies: [],
    keeper: { ingredientType: 'Weapon', requiredMutationIds: [required] },
    addEffectIds: [id],
    removeMutationIds: [],
    ...options
  }
}
const catalog: AlchemicalData = {
  bases: [base],
  components: [],
  exchanges: [],
  recipes: [
    recipe(11, 'material', 10, { material: 'Silver' }),
    recipe(12, 'material', 10, { material: 'Flametouched Iron' }),
    recipe(21, 'tier1', 11, { minimumLevel: 16 }),
    recipe(22, 'tier1', 12, { minimumLevel: 16 }),
    recipe(31, 'tier2', 21, { minimumLevel: 18 }),
    recipe(41, 'tier3', 31, {
      minimumLevel: 20,
      addEffectIds: [41, 6, 9],
      removeMutationIds: [5],
      effects: [enhancement(6), red]
    })
  ]
}

it('merges missing bases with equipment by published name and retains the stable gear identity and hand rules', () => {
  const shield = {
    ...base,
    id: 2,
    name: 'Alchemical Light Shield',
    type: 'Shield',
    weaponType: 'Shield',
    equipSlots: ['Weapon2']
  }
  const greatsword = {
    ...base,
    id: 3,
    name: 'Alchemical Greatsword',
    weaponType: 'Greatsword',
    equipSlots: ['Weapon1']
  }
  const source = {
    name: 'Alchemical Great Sword',
    pageTitle: 'Alchemical Great Sword',
    minLevel: 12,
    type: 'Great Sword'
  }
  const existing = [{ fileName: 'greatSword.json', records: [source] }]
  const original = normalizeGearPlannerSources(existing, []).items[0]
  const data = normalizeGearPlannerSources(existing, [], new Set(), undefined, {
    ...catalog,
    bases: [base, shield, greatsword]
  })
  expect(data.items.map((i) => [i.source.name, i.slot]).sort()).toEqual(
    [
      [base.name, 'Main Hand'],
      [base.name, 'Off Hand'],
      [shield.name, 'Off Hand'],
      [source.name, 'Main Hand']
    ].sort()
  )
  expect(data.items.find((i) => i.alchemical?.base === greatsword)?.id).toBe(original.id)
  expect(data.items.find((i) => i.alchemical?.base === shield)?.sourceFile).toBe('smallShield.json')
})

it('reconstructs stages in order, applies the resulting level, stats and socket, and clears invalid descendants', () => {
  const aug = { name: 'Ruby', augmentType: 'Red', minLevel: 1, effectsAdded: [], source: {} }
  const data = normalizeGearPlannerSources([], [aug], new Set(), undefined, catalog)
  const item = data.itemsBySlot['Main Hand'][0]
  let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), item.slot, item)
  const current = () => {
    const equipped = activeGearPlannerSetup(state).equipment['Main Hand']
    if (!equipped) throw new Error('missing weapon')
    return equipped
  }
  const select = (stage: string, id: string | null) => {
    state = setGearPlannerSetupCraft(state, item.slot, item.id, 'alchemical-' + stage, id, data.crafting)
  }
  expect(
    gearCraftGroups(current(), data.crafting)
      .filter((g) => g.system.startsWith('alchemical-'))
      .map((g) => g.system)
  ).toEqual(['alchemical-material'])
  select('tier3', '41')
  expect(current().crafts).toBeUndefined()
  select('material', '11')
  select('tier1', '21')
  select('tier2', '31')
  select('tier3', '41')
  expect(current().minimumLevel).toBe(20)
  expect(current().source.material).toBe('Silver')
  expect(getGearPlannerMaxFiligreeSlots(current())).toBe(0)
  expect(
    collectEquippedEffects(activeGearPlannerSetup(state).equipment)
      .filter((e) => e.effect.name === 'Attack Rolls')
      .map((e) => e.effect.modifier)
  ).toEqual([6])
  state = setGearPlannerSetupAugment(state, item.id, 0, aug)
  const saved = createGearPlannerExport(state)
  const encoded = {
    ...saved,
    setups: saved.setups.map((s) => ({ ...s, selectedCrafts: s.selectedCrafts?.toReversed() }))
  }
  const restored = importGearPlannerState(JSON.stringify(encoded), data)
  expect(restored.issues).toEqual([])
  state = restored.state
  expect(activeGearPlannerSetup(state).slottedAugments[item.id][0].name).toBe('Ruby')
  expect(alchemicalRecipeHref(current())).toBe('/alchemical?base=1&recipes=11,21,31,41')
  select('material', '12')
  expect(current().minimumLevel).toBe(12)
  expect(current().source.augments).toHaveLength(0)
  expect(activeGearPlannerSetup(state).slottedAugments[item.id]).toBeUndefined()
  expect(
    collectEquippedEffects(activeGearPlannerSetup(state).equipment)
      .filter((e) => e.effect.name === 'Attack Rolls')
      .map((e) => e.effect.modifier)
  ).toEqual([5])
  expect(alchemicalRecipeHref(current())).toBe('/alchemical?base=1&recipes=12')
  select('material', null)
  expect(current().source.material).toBe('Steel')
})
