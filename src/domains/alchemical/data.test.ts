import { describe, expect, it } from 'vitest'
import { buildAlchemicalData, resolveAlchemicalPlan, type AlchemicalResources } from './data'

const ingredient = (ingredientId: number, quantity = 1) => ({ ingredientId, quantity })
function resources(): AlchemicalResources {
  const blank = { material: 'Steel', equipSlots: ['Weapon1'], acceptsSentience: false, Combat_WeaponType: 'Scimitar' }
  const raw: AlchemicalResources = {
    devices: { forge: { name: 'Forge' } },
    ingredients: [
      { id: 20, name: 'Dust', sources: [{ name: 'Raid', method: 'quest_reward', availability: 'configured' }] },
      { id: 21, name: 'Shard' },
      { id: 22, name: 'Alloy' }
    ],
    bases: [
      {
        id: 1,
        name: 'Sword',
        type: 'Weapon',
        family: 'original',
        ingredientType: 'Prototype',
        minimumLevel: 12,
        effectIds: [1, 2],
        description: 'Sword',
        baseStats: blank
      },
      {
        id: 2,
        name: 'Shield',
        type: 'Shield',
        family: 'original',
        ingredientType: 'Prototype',
        minimumLevel: 12,
        effectIds: [1, 2],
        description: 'Shield',
        baseStats: blank
      }
    ],
    components: [
      {
        id: 80,
        name: 'Shard',
        stage: 'component',
        device: 'forge',
        description: 'Form a shard',
        outputItemId: 21,
        quantity: 2,
        ingredients: [ingredient(20, 3)]
      },
      {
        id: 81,
        name: 'Alloy',
        stage: 'component',
        device: 'forge',
        description: 'Combine',
        outputItemId: 22,
        quantity: 1,
        ingredients: [ingredient(21)]
      },
      {
        id: 82,
        name: 'Exchange',
        stage: 'ingredientExchange',
        device: 'forge',
        description: 'Exchange',
        rewardTableId: 88,
        ingredients: [ingredient(21)]
      }
    ],
    rewardTables: [{ id: 88, tables: { Treasure_Array: [{ ingredientId: 20, quantity: '2d4', percentile: 100 }] } }],
    original: { effects: [], recipes: [] },
    legendary: { effects: [], recipes: [] }
  }
  raw.original.effects = [
    { id: 1, displayName: 'Alchemical (Prototype)', enchantments: [] },
    {
      id: 2,
      displayName: '+5 Enhancement Bonus',
      enchantments: [
        { name: 'Combat_EnhancementBonus', displayName: 'Enhancement Bonus', value: 5, bonusType: 'Generic' }
      ]
    },
    { id: 3, displayName: 'Attuned', enchantments: [] },
    { id: 4, displayName: 'Infused', enchantments: [] },
    { id: 5, displayName: 'Dual Infusion', enchantments: [] },
    { id: 6, displayName: 'Earth', enchantments: [] },
    { id: 7, displayName: 'Fire', enchantments: [] },
    { id: 8, displayName: 'Red Socket', slotTypes: ['Colorless', 'Red'], enchantments: [] },
    {
      id: 9,
      displayName: 'Critical Chance',
      enchantments: [
        { displayName: 'Fire Spell Critical Chance', bonusType: 'Equipment', unit: 'percent', value: 21.3 }
      ]
    },
    {
      id: 10,
      displayName: 'Universal Spell Power',
      enchantments: [
        { displayName: 'Universal Spell Power', bonusType: 'Equipment', unit: 'coefficient', value: 1.4845 }
      ]
    }
  ]
  const recipe = {
    description: 'Forge',
    device: 'forge',
    material: 'Silver',
    minimumLevel: 12,
    ingredients: [ingredient(21)],
    addEffectIds: [3],
    removeMutationIds: [1],
    keeper: { ingredientType: 'Prototype', requiredMutationIds: [1] }
  }
  raw.original.recipes = [
    { ...recipe, id: 30, name: 'Reforge weapon', stage: 'materialBinding' },
    {
      ...recipe,
      id: 31,
      name: 'Reforge shield',
      stage: 'materialBinding',
      keeper: { ...recipe.keeper, itemType: 'Shield' }
    },
    {
      ...recipe,
      id: 32,
      name: 'Fire I',
      element: 'Fire',
      stage: 'elementalBinding',
      tier: 1,
      minimumLevel: 16,
      keeper: { ...recipe.keeper, requiredMutationIds: [3] },
      removeMutationIds: [3],
      addEffectIds: [4, 7, 9]
    },
    {
      ...recipe,
      id: 33,
      name: 'Earth I',
      element: 'Earth',
      stage: 'elementalBinding',
      tier: 1,
      minimumLevel: 16,
      keeper: { ...recipe.keeper, requiredMutationIds: [3] },
      removeMutationIds: [3],
      addEffectIds: [4, 6]
    },
    {
      ...recipe,
      id: 34,
      name: 'Tier II',
      stage: 'elementalBinding',
      tier: 2,
      minimumLevel: 18,
      keeper: { ...recipe.keeper, requiredMutationIds: [4] },
      removeMutationIds: [4],
      addEffectIds: [5]
    },
    {
      ...recipe,
      id: 35,
      name: 'Fire III',
      stage: 'elementalBinding',
      tier: 3,
      minimumLevel: 20,
      ingredients: [ingredient(22)],
      keeper: { ...recipe.keeper, requiredMutationIds: [5, 7] },
      removeMutationIds: [5, 2],
      addEffectIds: [8, 10]
    }
  ]
  return raw
}

describe('Alchemical crafting progression', () => {
  it('prefers the specific shield reforge and requires all prior mutations for the final recipe', () => {
    const data = buildAlchemicalData(resources())
    const [sword, shield] = data.bases
    expect(resolveAlchemicalPlan(data, shield, {}).choices.material.map((r) => r.id)).toEqual([31])
    expect(resolveAlchemicalPlan(data, sword, { tier1: 32 }).selected).toEqual([])
    const final = { material: 30, tier1: 32, tier2: 34, tier3: 35 }
    const plan = resolveAlchemicalPlan(data, sword, final)
    expect(plan.selected.map((r) => r.id)).toEqual([30, 32, 34, 35])
    expect(plan.minimumLevel).toBe(20)
    expect(plan.removedBaseEffects.map((e) => e.name)).toEqual(['+5 Enhancement Bonus'])
    expect(plan.effects.map((e) => e.id)).toEqual([7, 9, 8, 10])
    expect(plan.effects[1].stats[0].formattedValue).toBe('21%')
    expect(plan.effects[2].augmentTypes).toEqual(['Colorless', 'Red'])
    expect(plan.effects[3].stats[0]).toMatchObject({ stat: 'Spell Power: Universal', value: 148 })
    const changed = resolveAlchemicalPlan(data, sword, { ...final, tier1: 33 })
    expect(changed.selected.map((r) => r.id)).toEqual([30, 33, 34])
    expect(changed.minimumLevel).toBe(18)
    expect(changed.effects.map((e) => e.id)).not.toContain(9)
  })

  it('batches shared subcomponents and keeps random exchange rewards distinct from fixed costs', () => {
    const data = buildAlchemicalData(resources())
    const plan = resolveAlchemicalPlan(data, data.bases[0], { material: 30, tier1: 32, tier2: 34, tier3: 35 })
    expect(plan.costs.map((c) => [c.name, c.quantity])).toEqual([
      ['Alloy', 1],
      ['Shard', 3]
    ])
    expect(plan.materials).toEqual([{ id: 20, name: 'Dust', quantity: 6, sources: ['Raid'] }])
    expect(data.exchanges[0].rewards).toEqual([
      { table: 'Treasure_Array', name: 'Dust', quantity: '2d4', percentile: 100 }
    ])
  })

  it('rejects bad references and cyclic component recipes', () => {
    const raw = resources()
    raw.components[0].ingredients = [ingredient(22)]
    expect(() => buildAlchemicalData(raw)).toThrow('cycle in component recipe')
    raw.components[0].ingredients = [ingredient(99)]
    expect(() => buildAlchemicalData(raw)).toThrow('unknown ingredient ID 99')
  })
})
