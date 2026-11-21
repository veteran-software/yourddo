import recipesData from '../../data/nearlyComplete/recipes.json'
import type { CraftingIngredient } from '../../types/crafting'
import type { GearItem, LootEnchantment } from './types'
import type { NearlyCompleteSelection } from './upgradeState'

export type NearlyCompleteRecipe = CraftingIngredient & {
  effectsAdded: LootEnchantment[]
  effectsRemoved: LootEnchantment[]
}

export const nearlyCompleteRecipes = recipesData as NearlyCompleteRecipe[]

export const getNearlyCompletePlaceholder = (item: GearItem): string | null => {
  return item.enchantments?.find((enchantment) => enchantment.name.startsWith('Nearly Complete:'))?.name ?? null
}

export const getNearlyCompleteRecipes = (item: GearItem): NearlyCompleteRecipe[] => {
  const placeholder = getNearlyCompletePlaceholder(item)
  if (!placeholder) return []

  const tier = Number(item.minLevel) >= 30 ? 'Legendary' : 'Heroic'
  const itemRequirement = `${tier} Item with ${placeholder}`

  return nearlyCompleteRecipes.filter(
    (recipe) =>
      recipe.effectsRemoved.some((effect) => effect.name === placeholder) &&
      recipe.requirements?.some((requirement) => requirement.name === itemRequirement)
  )
}

export const toNearlyCompleteSelection = (recipe: NearlyCompleteRecipe): NearlyCompleteSelection => ({
  name: recipe.name,
  effectsAdded: recipe.effectsAdded
})
