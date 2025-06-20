import type { Enhancement, Spell } from './core.ts'
import type { Ingredient } from './ingredients.ts'

export interface CraftingIngredient extends Ingredient {
  title?: string
  ingredientType?: string
  quantity: number
  craftedIn?: string
  requirements: CraftingIngredient[]
  effectsAdded?: Enhancement[]
  effectsRemoved?: Enhancement[]
  accessoryEffectsAdded?: Enhancement[]
  accessoryEffectsRemoved?: Enhancement[]
  weaponEffectsAdded?: Enhancement[]
  weaponEffectsRemoved?: Enhancement[]
  spell?: Spell
  enhancements?: Enhancement[]
  augmentType?: 'Green Steel Epic Active'
  minimumLevel?: number
  minLevelIncrease?: {
    noMinimumLevel?: number
    minimumLevel?: number
  }
}
