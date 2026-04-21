import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { Ingredient } from '../../../types/ingredients.ts'

/**
 * Filters the `ingredients` map based on the provided item filters.
 *
 * @param {string[]} itemFilters - An array of item filter strings used to filter the ingredients.
 * @param {Record<string, Ingredient[]>} ingredientsMap - A map where the keys are element names and the values are arrays of CraftingIngredient objects.
 * @returns {Record<string, Ingredient[]>} A new ingredients map containing only the ingredients that match the item filters for each element.
 */
export const filterIngredientsMap = <T extends Ingredient>(
  itemFilters: string[],
  ingredientsMap: Record<string, T[]>
): Record<string, T[]> => {
  if (!itemFilters.length) return ingredientsMap

  return Object.fromEntries(
    Object.entries(ingredientsMap).map(([element, ingredients]) => [
      element,
      ingredients.filter((ingredient: T) => {
        const effects = (ingredient as CraftingIngredient).effectsAdded as Partial<Enhancement>[] | undefined
        return effects?.some((effect) => itemFilters.includes(effect.name ?? '')) ?? false
      })
    ])
  )
}

/**
 * Extracts and returns a sorted array of unique effect names from a map of ingredients.
 *
 * This function iterates through the provided ingredients map, collecting all unique
 * effect names found in the `effectsAdded` property of each ingredient. The resulting
 * effect names are returned as a sorted array in alphabetical order.
 *
 * @param {Record<string, Ingredient[]>} ingredientsMap - A mapping of ingredient keys to arrays of `CraftingIngredient` objects.
 * @returns {string[]} A sorted array of unique effect names found within the ingredients.
 */
export const parseUniqueEffects = (ingredientsMap: Record<string, Ingredient[]>): string[] => {
  const effects = new Set<string>()
  Object.values(ingredientsMap).forEach((ingredients: Ingredient[]) => {
    ingredients.forEach((ingredient: Ingredient) => {
      const ingEffects = (ingredient as CraftingIngredient).effectsAdded as Partial<Enhancement>[] | undefined
      ingEffects?.forEach((effect) => {
        if (effect.name) effects.add(effect.name)
      })
    })
  })

  return Array.from(effects).toSorted((a: string, b: string) => a.localeCompare(b))
}
