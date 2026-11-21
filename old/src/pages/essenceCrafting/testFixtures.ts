import type { EssenceCraftingEntry } from './types.ts'

const recipe = (recipeId: number) => ({
  recipeId,
  level: 1,
  essence: 1,
  collectible: []
})

export const ESSENCE_CRAFTING_TEST_DATA: EssenceCraftingEntry[] = [
  {
    name: 'False Life',
    minItemLevel: 1,
    bound: recipe(101),
    unbound: recipe(102),
    prefix: [],
    suffix: ['Necklace', 'Belt'],
    extra: [],
    enchantments: []
  },
  {
    name: 'Wizardry',
    minItemLevel: 1,
    bound: recipe(201),
    unbound: recipe(202),
    prefix: ['Gloves', 'Ring'],
    suffix: [],
    extra: [],
    enchantments: []
  }
]
