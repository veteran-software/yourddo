import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'

/**
 * Generates a label string for a dropdown menu, based on the selected crafting ingredient's effects.
 *
 * The function processes the `selectedItem` parameter to build a display string representing the
 * enhancements and modifiers of the selected crafting ingredient. If a valid `selectedItem` is
 * provided, it extracts its `effectsAdded` array, maps over it to format each effect with its name,
 * modifier, and bonus, and concatenates them into a single string, separated by commas. If no
 * `selectedItem` is provided, a default label of "Select an Upgrade..." is returned.
 *
 * @param {CraftingIngredient | undefined} selectedItem - The currently selected crafting ingredient,
 * which may include enhancements and their modifiers.
 * @returns {string} A formatted string describing the selected enhancements and their properties, or
 * a default selection prompt if `selectedItem` is undefined.
 */
export const oneFocusDropdownLabel = (selectedItem: CraftingIngredient | undefined): string => {
  return (
    selectedItem?.effectsAdded
      ?.map((effect: Enhancement) => {
        return `${effect.name}${
          effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''
        }`
      })
      .join(', ') ?? 'Select an Upgrade...'
  )
}
