import type { Enhancement, Spell } from './core.ts'
import type { Ingredient } from './ingredients.ts'

export interface CraftingIngredient extends Ingredient {
  title?: string
  ingredientType?: string
  quantity: number
  craftedIn?: string
  requirements?: CraftingIngredient[]
  effectsAdded?: Enhancement[]
  effectsRemoved?: Enhancement[]
  accessoryEffectsAdded?: Enhancement[]
  accessoryEffectsRemoved?: Enhancement[]
  weaponEffectsAdded?: Enhancement[]
  weaponEffectsRemoved?: Enhancement[]
  spell?: Spell
  enhancements?: Enhancement[]
  augmentType?:
    | 'Green Steel Epic Active'
    | 'Green Steel Epic Tier 1'
    | 'Green Steel Epic Tier 2'
    | 'Green Steel Epic Tier 3'
    | 'Isle of Dread: Scale (Weapon)'
    | 'Isle of Dread: Fang (Weapon)'
    | 'Isle of Dread: Claw (Weapon)'
    | 'Isle of Dread: Horn (Weapon)'
    | 'Isle of Dread: Scale (Accessory)'
    | 'Isle of Dread: Fang (Accessory)'
    | 'Isle of Dread: Claw (Accessory)'
    | 'Isle of Dread: Horn (Accessory)'
    | 'Isle of Dread: Scale (Armor)'
    | 'Isle of Dread: Fang (Armor)'
    | 'Isle of Dread: Set Bonus'
  minimumLevel?: number
  minLevelIncrease?: {
    noMinimumLevel?: number
    minimumLevel?: number
  }
  augments?: Augment[]
  setBonus?: {
    name: string
    numPiecesEquipped?: number
    enhancements?: Enhancement[]
  }[]
}

/**
 * NULL indicates the augment slot is empty
 */
export interface Augment {
  red?: string | null
  blue?: string | null
  yellow?: string | null
  purple?: string | null
  orange?: string | null
  green?: string | null
  colorless?: string | null
  sun?: string | null
  isleOfDreadScaleWeapon?: string | null
  isleOfDreadFangWeapon?: string | null
  isleOfDreadClawWeapon?: string | null
  isleOfDreadHornWeapon?: string | null
  isleOfDreadScaleAccessory?: string | null
  isleOfDreadFangAccessory?: string | null
  isleOfDreadClawAccessory?: string | null
  isleOfDreadHornAccessory?: string | null
  isleOfDreadScaleArmor?: string | null
  isleOfDreadFangArmor?: string | null
}
