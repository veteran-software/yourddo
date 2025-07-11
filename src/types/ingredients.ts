import type { Binding, Cost, Enhancement } from './core.ts'

export interface Ingredient {
  augmentType?: TAugmentType
  bagMaxStack?: number
  baseValue?: Cost
  binding?: Binding
  description?: string
  enhancements?: Enhancement[]
  foundIn?: string[]
  image?: string
  inventoryMaxStack?: number
  minimumLevel?: number
  name: string
  notes?: string
  type?: string
  weight?: number
}

export type TAugmentType =
  | 'Colorless'
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
