import type { CraftingIngredient, SetBonus } from '../../../types/crafting.ts'

/**
 * Transforms an array of crafting ingredients into a unique and sorted list of set bonuses.
 *
 * This function processes a provided array of crafting ingredients, extracts all
 * potential set bonuses, removes duplicates based on their names, and sorts the
 * resulting list by the name of the first enhancement in each set bonus, if available.
 *
 * @param {CraftingIngredient[]} data - The array of crafting ingredients, each of which may contain an optional set bonus.
 * @returns {SetBonus[]} A sorted array of unique set bonuses retrieved from the crafting ingredients.
 */
export const effects = (data: CraftingIngredient[]): SetBonus[] => {
  const allSetBonuses: SetBonus[] = data.flatMap((item: CraftingIngredient) => (item.setBonus ?? []) as SetBonus[])

  const uniqueSetBonuses = new Map(allSetBonuses.map((bonus: SetBonus) => [bonus.name, bonus]))

  return Array.from(uniqueSetBonuses.values()).sort((a: SetBonus, b: SetBonus) => {
    const aEnhName: string = a.enhancements?.[0]?.name ?? ''
    const bEnhName: string = b.enhancements?.[0]?.name ?? ''

    return aEnhName.localeCompare(bEnhName)
  })
}
