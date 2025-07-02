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
export const sortObjectArray = <T extends object>(array: T[], key: keyof T): T[] => {
  return [...array].sort((a: T, b: T) => String(a[key]).localeCompare(String(b[key])))
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
export const formatAsKebabCase = (label: string): string => kebabCase(removeWhitespace(label), false)

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
        const foundItem = (item[searchField] as Enhancement[]).find((enhancement: Enhancement) =>
          enhancement.name.includes(searchString)
        )
        if (!foundItem) return false

        return item[searchField].find((enhancement: Enhancement) => enhancement.name.includes(searchString))
      }
    })
    .toSorted(
      (a: CraftingIngredient, b: CraftingIngredient) =>
        a.effectsAdded?.[0].name.localeCompare(b.effectsAdded?.[0].name ?? '') ?? 0
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
export const deconstructHgsShard = (
  shard: string
): {
  focus: string
  essence: string
  gem: string
} => {
  const focusRegex = new RegExp(`\\b(${FOCI.join('|')})\\b`, 'i')
  const essenceRegex = new RegExp(`\\b(${ESSENCES.join('|')})\\b`, 'i')
  const gemRegex = new RegExp(`\\b(${GEMS.join('|')})\\b`, 'i')

  const focusMatch: RegExpExecArray | null = RegExp(focusRegex).exec(shard)
  const essenceMatch: RegExpExecArray | null = RegExp(essenceRegex).exec(shard)
  const gemMatch: RegExpExecArray | null = RegExp(gemRegex).exec(shard)

  return {
    focus: focusMatch ? focusMatch[0] : 'No focus found',
    essence: essenceMatch ? essenceMatch[0] : 'No essence found',
    gem: gemMatch ? gemMatch[0] : 'No gem found'
  }
}

/**
 * Deconstructs a logical-gem-shard string into its components based on specific rules.
 *
 * @function
 * @param {string} shard - Input string representing a logical-gem-shard.
 * @returns {Object|null} Parsed object containing components if valid, otherwise `null`.
 *
 * @property {string} [focusP] - Primary focus type, possibly modified to include "Energy".
 * @property {string} [focusS] - Secondary focus type (only for Tier 3 shards), possibly modified to include "Energy".
 * @property {string} essence - The type of essence within the shard.
 * @property {string} gem - The gem type within the shard.
 *
 * The function validates the structure and components of the `shard` string before parsing it into an object.
 * The components are extracted depending on the number of elements in the shard string (3 for the lower tier,
 * 4 for Tier 3). If validation fails or the string does not meet criteria, the function returns `null`.
 */
export const deconstructLgsShard = (
  shard: string
): {
  focusP: string
  focusS?: string
  essence: string
  gem: string
} | null => {
  const feg: string | null = extractParenthesesContent(shard)
  if (!feg) return null

  const elements: string[] = feg.split(' ')
  if (elements.length < 3 || elements.length > 4) {
    return null
  }

  if (elements.length === 3) {
    const [focus, essence, gem] = elements

    if (!isValidFocus(focus) || !ESSENCES.includes(essence) || !GEMS.includes(gem)) {
      return null
    }

    return {
      focusP: focus === 'Positive' || focus === 'Negative' ? focus + ' Energy' : focus,
      essence,
      gem
    }
  } else {
    // 4 elements from Tier 3
    const [focus1, focus2, essence, gem] = elements

    if (!isValidFocus(focus1) || !isValidFocus(focus2) || !ESSENCES.includes(essence) || !GEMS.includes(gem)) {
      return null
    }

    return {
      focusP: focus1 === 'Positive' || focus1 === 'Negative' ? focus1 + ' Energy' : focus1,
      focusS: focus2 === 'Positive' || focus2 === 'Negative' ? focus2 + ' Energy' : focus2,
      essence,
      gem
    }
  }
}

/**
 * Searches for and returns a raw ingredient object from the `ingredients` list that matches the given name.
 *
 * @function
 * @param {string} ingredientName - The name of the ingredient to search for.
 * @param whereToLook
 * @returns {CraftingIngredient | undefined} The ingredient object if found, or undefined if no match is found.
 */
export const findIngredientByName = (
  ingredientName: string,
  whereToLook: CraftingIngredient[]
): CraftingIngredient | undefined => {
  return whereToLook.find((ingredient: CraftingIngredient) => ingredient.name === ingredientName)
}

/**
 * Determines whether the given string contains the term "Augment".
 *
 * This function performs a case-insensitive search within the provided string
 * to check for the presence of the word "Augment". It uses a regular expression
 * to match the term as a whole word in any part of the input string.
 *
 * @param {string} name - The input string to test for the presence of "Augment".
 * @returns {boolean} Returns `true` if the term "Augment" is found in the input string, otherwise `false`.
 */
export const isAugment = (name: string): boolean => {
  return /\bAugment\b/gi.test(name)
}

/**
 * Determines whether a given name corresponds to a Legendary weapon or item.
 *
 * This function evaluates the provided name to check if it contains the term
 * "Legendary" (case-insensitive) and verifies it as an augmentable item.
 *
 * @param {string} name - The name of the item to be evaluated.
 * @returns {boolean} Returns true if the name includes "Legendary" and is augmentable; otherwise, false.
 */
export const isLgsWeaponOrAccessory = (name: string): boolean => {
  return /\bLegendary\b/gi.test(name) && !isAugment(name)
}

/**
 * Extracts content inside parentheses from a given string.
 *
 * This function searches for all substrings within parentheses in the input string,
 * removes the parentheses, and combines the extracted content into a single string
 * with spaces separating multiple matches. If no parentheses are found in the input,
 * it returns an empty string.
 *
 * @param {string} str - The input string from which to extract content inside parentheses.
 * @returns {string} A string containing the content of all matched parentheses, separated by spaces; empty string if no matches are found.
 */
export const extractParenthesesContent = (str: string): string | null => {
  const regex = /\(([^()]*)\)/gi
  const matches: RegExpMatchArray | null = str.match(regex)

  if (!matches) return null

  // Remove the parentheses and join if there were multiple matches
  return matches[0].substring(1, matches[0].length - 1)
}

// noinspection GrazieInspection
/**
 * Determines whether the provided focus is valid based on specific conditions.
 *
 * The function checks if the given `focus` parameter is either 'Positive' or 'Negative'.
 * If true, it appends ' Energy' to the `focus` and verifies its presence in the `FOCI` array.
 * If the `focus` does not match either 'Positive' or 'Negative', it directly validates its presence in the `FOCI` array.
 *
 * @param {string} focus - A string representing the focus to be validated.
 * @returns {boolean} Returns `true` if the `focus` meets the criteria and exists in the `FOCI` array, otherwise `false`.
 */
export const isValidFocus = (focus: string): boolean => {
  if (focus === 'Positive' || focus === 'Negative') {
    return FOCI.includes(focus + ' Energy')
  }
  return FOCI.includes(focus)
}
