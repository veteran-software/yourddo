import kebabCase from 'kebab-case'
import type { Enhancement } from '../types/core.ts'
import type { CraftingIngredient } from '../types/crafting.ts'
import { ESSENCES, FOCI, GEMS } from './constants.ts'

/**
 * Sorts an array of objects based on a specified key.
 *
 * @template T - The type of objects contained within the array.
 * @param {T[]} array - The array of objects to be sorted.
 * @param {keyof T} key - The key of the object based on which sorting should occur.
 * @returns {T[]} A new array with the objects sorted by the specified key in ascending order.
 */
export const sortObjectArray = <T extends object>(
  array: T[],
  key: keyof T
): T[] => {
  return [...array].sort((a: T, b: T) =>
    String(a[key]).localeCompare(String(b[key]))
  )
}

/**
 * Removes all whitespace characters from the given input string
 * and optionally replaces them with the specified replacement string.
 *
 * @param {string} input - The input string from which to remove whitespace.
 * @param {string} [replace] - Optional parameter specifying the string to replace whitespace with.
 *                              If not provided, whitespace is removed entirely.
 * @returns {string} - The resulting string with whitespace removed or replaced.
 */
export const removeWhitespace = (input: string, replace?: string): string => {
  return input.replace(/\s+/g, replace ?? '')
}

/**
 * Converts the given string to kebab-case format.
 * Kebab-case is a string format where words are lowercased
 * and separated by hyphens.
 *
 * @param {string} label - The input string to be formatted.
 * @returns {string} The input string transformed into kebab-case format.
 */
export const formatAsKebabCase = (label: string): string =>
  kebabCase(removeWhitespace(label), false)

/**
 * Filters a list of crafting ingredients by checking if the name of the first
 * requirement (treated as an enhancement) includes the specified element.
 *
 * @param {CraftingIngredient[]} ingList - The list of crafting ingredients to be filtered.
 * @param {string} element - The string element used to match against the first requirement's name in the crafting ingredients.
 * @returns {CraftingIngredient[]} A filtered list of crafting ingredients where the first requirement's name includes the specified element.
 */
export const filterSublistByElement = (
  ingList: CraftingIngredient[],
  element: string
): CraftingIngredient[] => {
  return ingList.filter((ingredient: CraftingIngredient) => {
    return (ingredient.requirements?.[0] as Enhancement).name.includes(element)
  })
}

/**
 * Filters a list of crafting ingredients based on a search string and a specified search field.
 * The filtering behavior varies depending on the type of the `searchField` property in each item.
 * If the `searchField` is a string, it checks if the string includes the search string.
 * If the `searchField` is an array of enhancements, it checks if any enhancement name includes the search string.
 *
 * @param {CraftingIngredient[]} baseList - The base list of crafting ingredients to filter.
 * @param {string} searchString - The search string to match against the specified field.
 * @param {keyof CraftingIngredient} searchField - The field of the crafting ingredient to search within.
 * @returns {CraftingIngredient[]} A sorted and filtered list of crafting ingredients matching the search criteria.
 */
export const filterForSublist = (
  baseList: CraftingIngredient[],
  searchString: string,
  searchField: keyof CraftingIngredient
): CraftingIngredient[] => {
  return baseList
    .filter((item: CraftingIngredient) => {
      if (typeof item[searchField] === 'string') {
        return item[searchField].includes(searchString)
      }

      if (Array.isArray(item[searchField])) {
        const foundItem = (item[searchField] as Enhancement[]).find(
          (enhancement: Enhancement) => enhancement.name.includes(searchString)
        )
        if (!foundItem) return false

        return item[searchField].find((enhancement: Enhancement) =>
          enhancement.name.includes(searchString)
        )
      }
    })
    .toSorted(
      (a: CraftingIngredient, b: CraftingIngredient) =>
        a.effectsAdded?.[0].name.localeCompare(
          b.effectsAdded?.[0].name ?? ''
        ) ?? 0
    )
}

/**
 * Deconstructs a shard string into its components: focus, essence, and gem.
 *
 * This function detects and extracts specific terms from the shard string based on predefined
 * categories (focus, essence, and gem). If no match is found for a particular category,
 * a default message is returned.
 *
 * @param {string} shard - The input string representing the shard to be deconstructed.
 * @returns {Object} - An object containing the extracted components:
 *   - `focus` {string}: A matched focus term or default message if no match is found.
 *   - `essence` {string}: A matched essence term or default message if no match is found.
 *   - `gem` {string}: A matched gem term or default message if no match is found.
 */
export const deconstructShard = (
  shard: string
): {
  focus: string
  essence: string
  gem: string
} => {
  const focusRegex = new RegExp(`\\b(${FOCI.join('|')})\\b`, 'i')
  const essenceRegex = new RegExp(`\\b(${ESSENCES.join('|')})\\b`, 'i')
  const gemRegex = new RegExp(`\\b(${GEMS.join('|')})\\b`, 'i')

  const focusMatch = RegExp(focusRegex).exec(shard)
  const essenceMatch = RegExp(essenceRegex).exec(shard)
  const gemMatch = RegExp(gemRegex).exec(shard)

  return {
    focus: focusMatch ? focusMatch[0] : 'No focus found',
    essence: essenceMatch ? essenceMatch[0] : 'No essence found',
    gem: gemMatch ? gemMatch[0] : 'No gem found'
  }
}
