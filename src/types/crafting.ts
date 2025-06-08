import type { IngredientName } from '../data/ingredients.ts'
import type { Binding, Cost, Enhancement, Spell } from './core.ts'

export interface CraftingIngredient {
  name: string
  title?: string
  ingredientType?: string
  description?: string
  quantity: number
  baseValue?: Cost
  weight?: number
  foundIn?: string
  craftedIn?: string
  requirements?: (CraftingIngredient | IngredientName)[]
  effectsAdded?: Enhancement[]
  effectsRemoved?: Enhancement[]
  spell?: Spell
  binding?: Binding
}
