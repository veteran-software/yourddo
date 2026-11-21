import type { AugmentItem } from '../../types/augmentItem.ts'

export type CoreChoice = string | null

export interface EssenceCollectible {
  name: string
  quantity: number
}

export interface EssenceRecipe {
  recipeId: number
  level: number
  essence: number
  collectible: EssenceCollectible[]
}

export interface EssenceModifier {
  level: number
  value: number
}

export interface EssenceEnchantment {
  name: string
  bonus: string | null
  modifierDice?: string
  modifiers?: EssenceModifier[]
}

export interface EssenceCraftingEntry {
  name: string
  minItemLevel: number
  bound: EssenceRecipe
  unbound: EssenceRecipe
  prefix: string[]
  suffix: string[]
  extra: string[]
  enchantments: EssenceEnchantment[]
}

export interface ItemAugmentSlotState {
  id: string
  slotType: string // e.g., 'red', 'blue', 'colorless', 'sun', 'moon', 'lamordia: ...'
  selectedAugment: AugmentItem | null
  // Per-slot augment filters
  filters: string[]
  filterMode: 'OR' | 'AND'
}

export interface ItemState {
  slotKey: string
  prefix: CoreChoice
  suffix: CoreChoice
  extra: CoreChoice
  hasCannithMark: boolean
  augmentSlots: ItemAugmentSlotState[]
  minLevelOverride?: number | null
  // If null/undefined => inherit from master binding; otherwise true=Bound, false=Unbound
  bindingOverride?: boolean | null
}

// Utility: map UI slot keys to equipment names used in the v2 JSON.
export const SLOT_KEY_TO_DATA_TOKENS: Record<string, string[]> = {
  mainHand: ['Weapon'],
  offHand: ['Weapon'],
  artificerPetArmor: ['Armor'],
  druidPetArmor: ['Armor'],
  artificerPetWeapon: ['Weapon'],
  druidPetWeapon: ['Weapon'],
  runeArm: ['Runearm'],
  orb: ['Orb'],
  armor: ['Armor'],
  belt: ['Belt', 'Waist'],
  boots: ['Boots', 'Feet'],
  bracers: ['Bracers', 'Wrists'],
  cloak: ['Cloak'],
  gloves: ['Gloves', 'Hands', 'Hand'],
  goggles: ['Goggles', 'Eyes'],
  helmet: ['Head', 'Headgear'],
  necklace: ['Necklace', 'Neck'],
  ring1: ['Ring', 'Rings', 'Fingers'],
  ring2: ['Ring', 'Rings', 'Fingers'],
  trinket: ['Trinket'],
  shield: ['Shield']
}

export type AffixKind = 'prefix' | 'suffix' | 'extra'

export const ALL_SLOT_KEYS: { key: string; label: string }[] = [
  { key: 'mainHand', label: 'Weapon (Main Hand)' },
  { key: 'offHand', label: 'Weapon (Off Hand)' },
  { key: 'runeArm', label: 'Rune Arm' },
  { key: 'orb', label: 'Orb' },
  { key: 'armor', label: 'Armor' },
  { key: 'belt', label: 'Belt' },
  { key: 'boots', label: 'Boots' },
  { key: 'bracers', label: 'Bracers' },
  { key: 'cloak', label: 'Cloak' },
  { key: 'gloves', label: 'Gloves' },
  { key: 'goggles', label: 'Goggles' },
  { key: 'helmet', label: 'Helmet' },
  { key: 'necklace', label: 'Necklace' },
  { key: 'ring1', label: 'Ring 1' },
  { key: 'ring2', label: 'Ring 2' },
  { key: 'trinket', label: 'Trinket' },
  { key: 'shield', label: 'Shield' }
]

// Only colorized slots are eligible for the augment list.
export const AVAILABLE_AUGMENT_TYPES: { key: string; label: string }[] = [
  { key: 'red', label: 'Red' },
  { key: 'blue', label: 'Blue' },
  { key: 'yellow', label: 'Yellow' },
  { key: 'purple', label: 'Purple' },
  { key: 'orange', label: 'Orange' },
  { key: 'green', label: 'Green' },
  { key: 'colorless', label: 'Colorless' }
]

export const ALLOWED_AUGMENT_KEYS = new Set(AVAILABLE_AUGMENT_TYPES.map((t) => t.key))

// Certain augment slot colors only appear in
// certain item categories. This function expresses that availability per UI slot key.
// Notes (from the screenshot text "Found in:"):
// - Red: Weapons, Shields, or other hand-held items
// - Blue: Armor/Robes/Outfits, Shields, or other off-hand items (e.g., Orbs, Runearms)
// - Yellow: Accessory items (Ring, Neck, Boots, Belt, Gloves, Goggles, Helmet, Bracers, Cloak, Trinket)
// - Purple: Named Weapons, Shields, or other hand-held items
// - Orange: Named Weapons, Shields, or other hand-held items
// - Green: Accessory items (and named Armor/Robes/Outfits — omitted here for crafted generics)
// - Colorless: Any type of item
export const ACCESSORY_SLOT_KEYS = new Set<string>([
  'belt',
  'boots',
  'bracers',
  'cloak',
  'gloves',
  'goggles',
  'helmet',
  'necklace',
  'ring1',
  'ring2',
  'trinket'
])
