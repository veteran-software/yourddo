import { titleCase } from 'title-case'
import type { CraftingIngredient } from '../types/crafting.ts'
import { FOCI } from './constants.ts'

/**
 * Formats the name of an ingredient based on specific patterns and conditions.
 *
 * @param {string} ingredientName - The original name of the ingredient.
 * @param {CraftingIngredient} [fecundityItem] - An optional crafting ingredient object that replaces the name if specific conditions are met.
 * @returns {string} - The formatted ingredient name.
 */
export const formatIngredientName = (ingredientName: string, fecundityItem?: CraftingIngredient): string => {
  let formattedName = ingredientName

  if (/\bshard\s+of(?:\s+\w+)?\s+power\b/i.test(formattedName)) {
    formattedName = ingredientName
      .replace(/\b(ethereal|material|dominion|escalation)\b/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\//g, '')
      .trim()

    if (!formattedName.includes('Concordant')) {
      formattedName = formattedName.replace(/\b(opposition)\b/gi, '')
    }
  }

  if (fecundityItem && /\bgreen\s+steel\s+(accessory|weapon)\b/i.test(ingredientName)) {
    formattedName = fecundityItem.name
  }

  const regex = new RegExp(`\\b(${FOCI.join('|')})\\s+(Weapon|Accessory)\\b`, 'gi')
  if (regex.test(formattedName)) {
    formattedName = `Green Steel ${formattedName}`
  }

  return formattedName
}

export const isVowel = (letter: string): boolean => {
  return /^[aeiou]$/i.test(letter)
}

export const elementColor = (element: string): string => {
  return element.toLowerCase().replace(' energy', '')
}

export const camelCaseToTitleCase = (str: string): string => {
  const spaced: string = str.replace(/([a-z])([A-Z])/g, '$1 $2')

  return titleCase(spaced.toLowerCase())
}
