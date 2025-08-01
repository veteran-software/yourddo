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
  subType?: string
  weight?: number
}

export type TAugmentType =
  | 'Colorless'
  | 'Green'
  | 'Red'
  | 'Yellow'
  | 'Blue'
  | 'Orange'
  | 'Purple'
  | 'Sun'
  | 'Moon'
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
  | 'Lamordia: Melancholic (Weapon)'
  | 'Lamordia: Dolorous (Weapon)'
  | 'Lamordia: Miserable (Weapon)'
  | 'Lamordia: Woeful (Weapon)'
  | 'Lamordia: Melancholic (Accessory)'
  | 'Lamordia: Dolorous (Accessory)'
  | 'Lamordia: Miserable (Accessory)'
  | 'Lamordia: Woeful (Accessory)'
  | 'Lamordia: Melancholic (Armor)'
  | 'Lamordia: Dolorous (Armor)'
