import type { Enhancement, Spell } from './core.ts'
import type { Ingredient } from './ingredients.ts'

export interface CraftingIngredient extends Ingredient {
  accessoryEffectsAdded?: Enhancement[]
  accessoryEffectsRemoved?: Enhancement[]
  augments?: Augment[]
  craftedIn?: string
  effectsAdded?: Enhancement[]
  effectsRemoved?: Enhancement[]
  ingredientType?: string
  minLevelIncrease?: {
    noMinimumLevel?: number
    minimumLevel?: number
  }
  quantity?: number
  requirements?: CraftingIngredient[]
  runeArmBlast?: Spell
  setBonus?: SetBonus[]
  spell?: Spell
  title?: string
  weaponEffectsAdded?: Enhancement[]
  weaponEffectsRemoved?: Enhancement[]
}

export interface SetBonus {
  enhancements?: Enhancement[]
  name: string
  numPiecesEquipped?: number
}

/**
 * NULL indicates the augment slot is empty
 */
export interface Augment {
  blue?: string | null
  colorless?: string | null
  green?: string | null
  isleOfDreadClawAccessory?: string | null
  isleOfDreadClawWeapon?: string | null
  isleOfDreadFangAccessory?: string | null
  isleOfDreadFangArmor?: string | null
  isleOfDreadFangWeapon?: string | null
  isleOfDreadHornAccessory?: string | null
  isleOfDreadHornWeapon?: string | null
  isleOfDreadScaleAccessory?: string | null
  isleOfDreadScaleArmor?: string | null
  isleOfDreadScaleWeapon?: string | null
  isleOfDreadSetBonus?: string | null
  orange?: string | null
  purple?: string | null
  red?: string | null
  sun?: string | null
  yellow?: string | null
}
