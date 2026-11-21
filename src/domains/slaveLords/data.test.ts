import { describe, expect, it } from 'vitest'
import { buildSlaveLordsData, type SlaveLordsResources } from './data'

const resources = (): SlaveLordsResources => {
  const tier: SlaveLordsResources['heroic'] = {
    options: [
      { id: 10, name: 'Lore', category: 'suffix', recipeId: 100, applicationRecipeIds: [101], effectIds: [201] },
      { id: 11, name: 'Mythic', category: 'mythic', applicationRecipeIds: [102], effectIds: [202] },
      { id: 12, name: 'Blue socket', category: 'augment', applicationRecipeIds: [103], effectIds: [203] },
      { id: 13, name: 'Might', category: 'set', setId: 4, applicationRecipeIds: [104, 105] }
    ],
    recipes: [
      { id: 100, description: 'Trade-in', ingredients: [{ ingredientId: 1, quantity: 50 }] },
      {
        id: 101,
        description: '27% critical chance',
        ingredients: [{ ingredientId: 10, quantity: 1 }],
        keeper: { itemType: 'Jewelry', requiredMutationIds: [70] },
        knownDiscrepancies: [{ stated: 27, resolved: 21, unit: 'percent' }]
      },
      {
        id: 102,
        description: 'Apply Mythic bonus',
        ingredients: [{ ingredientId: 2, quantity: 1 }],
        keeper: { itemType: 'Jewelry', ingredientType: 'SlaveLordsCrafting' }
      },
      {
        id: 103,
        description: 'Apply socket',
        ingredients: [{ ingredientId: 3, quantity: 1 }],
        keeper: { itemType: 'Jewelry', requiredMutationIds: [72] }
      },
      {
        id: 104,
        description: 'Apply set',
        ingredients: [{ ingredientId: 3, quantity: 1 }],
        keeper: { itemId: 6, requiredMutationIds: [73] }
      },
      {
        id: 105,
        description: 'Apply set',
        ingredients: [{ ingredientId: 3, quantity: 1 }],
        keeper: { itemId: 7, requiredMutationIds: [73] }
      }
    ],
    effects: [
      {
        id: 201,
        displayName: 'Lore',
        description: '21% critical chance',
        enchantments: [
          { displayName: 'Fire Spell Critical Chance', bonusType: 'Equipment', unit: 'percent', value: 21.268 }
        ]
      },
      {
        id: 202,
        displayName: 'Mythic slot',
        enchantments: [{ name: 'Effect_U32MythicBonusDriver', bonusType: 'Unique', value: 1 }],
        slotBonuses: [{ equipSlots: ['Wrists'], stats: ['Physical Resistance Rating'], bonusType: 'Mythic', value: 1 }]
      },
      { id: 203, displayName: 'Blue Augment Slot', slotTypes: ['Colorless', 'Blue'], enchantments: [] },
      {
        id: 204,
        displayName: 'Set bonus',
        enchantments: [{ displayName: 'Melee Power', bonusType: 'Artifact', unit: 'coefficient', value: 0.03 }]
      }
    ]
  }
  const base = {
    kind: 'craftingBlank',
    type: 'Jewelry',
    description: 'Craftable item',
    minimumLevel: 8,
    baseStats: { equipSlots: ['Wrists'] },
    craftingSlots: [{ id: 70 }, { id: 72 }, { id: 73 }]
  }
  return {
    bases: [
      { ...base, id: 6, name: 'Blank', tier: 'heroic', ingredientType: 'SlaveLordsCrafting' },
      { ...base, id: 7, name: 'Named item', tier: 'heroic', kind: 'setEquipment', craftingSlots: [{ id: 73 }] }
    ],
    ingredients: [
      { id: 1, name: 'Links', sources: [{ method: 'quest_reward', name: 'Quest', availability: 'unverified' }] },
      { id: 2, name: 'Idol' },
      { id: 3, name: 'Stone' }
    ],
    sets: [{ id: 4, name: 'Might', tier: 'heroic', thresholds: [{ pieces: 3, effectId: 204 }] }],
    heroic: tier,
    legendary: { ...tier, options: tier.options.filter((option) => !option.setId) }
  }
}

describe('Slave Lords crafting catalog', () => {
  it('uses the keeper item, ingredient type and required mutations to select application recipes', () => {
    const [blank, named] = buildSlaveLordsData(resources()).bases
    expect(blank.options).toHaveLength(4)
    expect(named.options.map((option) => option.name)).toEqual(['Might'])
    const mythic = blank.options.find((option) => option.category === 'mythic')
    expect(mythic?.name).toBe('Mythic +1')
    expect(mythic?.effects).toEqual([])
    expect(mythic?.slotBonuses).toEqual([
      {
        equipSlots: ['Wrists'],
        effects: [{ stat: 'Physical Resistance Rating', bonusType: 'Mythic', value: 1, formattedValue: '1' }]
      }
    ])
    expect(mythic?.costs[0].name).toBe('Idol')
    expect(blank.options.find((option) => option.category === 'augment')?.augmentTypes).toEqual(['Colorless', 'Blue'])
  })

  it('resolves trade-in costs, actual bonuses, discrepancies and piece thresholds within the tier', () => {
    const { bases, sets } = buildSlaveLordsData(resources())
    const option = bases[0].options.find((choice) => choice.name === 'Lore')
    expect(option).toMatchObject({
      description: '21% critical chance',
      costs: [{ id: 1, name: 'Links', quantity: 50, sources: ['Quest (unverified)'] }],
      effects: [{ stat: 'Spell Critical Chance: Fire', value: 21, formattedValue: '21%', bonusType: 'Equipment' }],
      discrepancies: ['Stated 27%, actual 21%.']
    })
    expect(sets[0].thresholds[0]).toEqual({
      pieces: 3,
      effects: [{ stat: 'Melee Power', bonusType: 'Artifact', value: 3, formattedValue: '3' }]
    })
  })

  it('reports a broken recipe reference', () => {
    const raw = resources()
    raw.heroic.options[0].applicationRecipeIds = [999]
    expect(() => buildSlaveLordsData(raw)).toThrow('Unknown Slave Lords heroic recipes ID 999')
  })
})
