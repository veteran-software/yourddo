import type { CraftingIngredient } from '../../types/crafting.ts'

export const filterItemsBySuffix = (items: CraftingIngredient[], suffix: string): CraftingIngredient[] => {
  return items.filter((item) => item.name.endsWith(suffix))
}
