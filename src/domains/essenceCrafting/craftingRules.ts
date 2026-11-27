import { colorAugmentTypes, getCompatibleAugmentTypes } from '../../shared/augments/compatibility'
import type { EssenceMinimumLevelRecipe, EssenceRecipeRequirement, EssenceRules } from './essenceCrafting.types'

export const magicItemEssence = { id: 'ingredient-31521a5f8f653171', displayName: 'Magic Item Essence' }
export const cannithMark = { id: 'ingredient-45014922216e977e', displayName: 'Mark of House Cannith' }
export const purifiedFragment = {
  id: 'ingredient-bf65f20dd98a2c78',
  displayName: 'Purified Eberron Dragonshard Fragment'
}
export const augmentTypes = colorAugmentTypes.map((displayName) => ({ id: displayName.toLowerCase(), displayName }))

const requirement = (ingredientId: string, quantity: number): EssenceRecipeRequirement => ({
  kind: 'ingredient',
  ingredientId,
  quantity
})

const jewelry = ['colorless', 'yellow', 'green']
const offHand = ['colorless', 'red', 'blue', 'purple', 'orange']

export const essenceRules: EssenceRules = {
  supportedItemLevels: { minimum: 1, maximum: 36 },
  maximumCraftingLevel: 500,
  extraAffix: {
    position: 'extra',
    markRequirement: requirement(cannithMark.id, 1),
    consumedWhen: 'extra-enhancement-applied'
  },
  augmentSlotTypes: augmentTypes.map((color) => ({
    ...color,
    acceptsAugmentTypeIds: getCompatibleAugmentTypes(color.displayName).map((name) => name.toLowerCase())
  })),
  augmentSlotPlacements: Object.entries({
    armor: ['colorless', 'blue'],
    belt: jewelry,
    boots: jewelry,
    bracers: jewelry,
    cloak: jewelry,
    gloves: jewelry,
    goggles: jewelry,
    head: jewelry,
    necklace: jewelry,
    orb: offHand,
    ring: jewelry,
    'rune-arm': offHand,
    shield: offHand,
    trinket: jewelry,
    weapon: ['colorless', 'red', 'purple', 'orange']
  }).map(([itemCategoryId, augmentSlotTypeIds]) => ({ itemCategoryId, augmentSlotTypeIds }))
}

export function minimumLevelRecipes(itemLevel: number) {
  const levelLabel = String(itemLevel).padStart(2, '0')
  const bound: EssenceMinimumLevelRecipe = {
    id: 'recipe-minimum-level-bound-' + levelLabel,
    kind: 'minimum-level-shard',
    binding: 'bound',
    itemLevel,
    craftingLevel: itemLevel === 1 ? 1 : itemLevel * 10,
    requirements: [requirement(magicItemEssence.id, itemLevel * 10)]
  }
  const unboundCraftingLevel = Math.max(150, (itemLevel + 5) * 10)
  const fragments = [21, 26, 31].filter((level) => itemLevel >= level).length * 5
  const unbound: EssenceMinimumLevelRecipe = {
    id: 'recipe-minimum-level-unbound-' + levelLabel,
    kind: 'minimum-level-shard',
    binding: 'unbound',
    itemLevel,
    craftingLevel: unboundCraftingLevel,
    requirements: [
      requirement(magicItemEssence.id, unboundCraftingLevel * 2),
      ...(fragments ? [requirement(purifiedFragment.id, fragments)] : [])
    ]
  }
  return { bound, unbound }
}
