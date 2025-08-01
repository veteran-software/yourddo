import type { Binding, Enhancement } from './core.ts'
import type { CraftingIngredient, SetBonus } from './crafting.ts'
import type { Ingredient } from './ingredients.ts'

export interface AugmentItem extends Ingredient {
  name: string
  description?: string
  image?: string
  minimumLevel?: number
  binding?: Binding
  foundIn?: string[]
  craftedIn?: string
  effectsAdded?: Partial<Enhancement>[]
  effectsRemoved?: Partial<Enhancement>[]
  setBonus?: SetBonus[]
  requirements?: CraftingIngredient[]
}
