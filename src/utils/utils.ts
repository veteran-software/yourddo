import type { CraftingIngredient } from '../types/crafting.ts'
import { FOCI } from './constants.ts'

export const formatIngredientName = (ingredientName: string, fecundityItem?: CraftingIngredient) => {
  let formattedName = ingredientName

  if (/\bshard\s+of(?:\s+\w+)?\s+power\b/i.test(formattedName)) {
    formattedName = ingredientName
      .replace(/\b(ethereal|material|dominion|opposition|escalation)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
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
