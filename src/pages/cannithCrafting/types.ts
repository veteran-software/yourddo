import cannithPhase1 from '../../data/cannithCrafting/cannithEnhancements.phase1.json'
import type { AugmentItem } from '../../types/augmentItem.ts'

export type CoreChoice = string | null

// ----- Strict types for Cannith Phase 1 dataset -----
export interface Phase1CollectibleRow {
  name: string
  qty: number
}

export interface Phase1Materials {
  level?: number | null
  essence?: number | null
  purified?: number | null
  collectible?: Phase1CollectibleRow[] | null
}

export interface Phase1EnchantmentMeta {
  name?: string
  bonus?: string
}

export type Phase1MinLevelIncrease =
  | number
  | {
      noMinimumLevel?: number
      minimumLevel?: number
    }
  | null

export type TAffix = string[] | string | null

export interface CannithPhase1Entry {
  name: string
  enchantments?: Phase1EnchantmentMeta[]
  bound?: Phase1Materials | null
  unbound?: Phase1Materials | null
  prefixTitle?: string | null
  suffixTitle?: string | null
  // Although normalized to arrays, keep a tolerant type for safety
  prefix?: TAffix
  suffix?: TAffix
  extra?: TAffix
  group?: string | null
  minLevelIncrease?: Phase1MinLevelIncrease
  stat?: (number | string)[]
}

export const DATASET = cannithPhase1 as unknown as CannithPhase1Entry[]

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

// Utility: map UI slot keys to dataset item tokens used in the phase1 JSON
export const SLOT_KEY_TO_DATA_TOKENS: Record<string, string[]> = {
  mainHand: ['Weapon (Melee)', 'Weapon (Ranged)', 'Weapon'],
  offHand: ['Weapon (Melee)', 'Weapon (Ranged)', 'Weapon', 'Off-hand Weapon'],
  runeArm: ['Runearm', 'Rune Arm'],
  orb: ['Orb'],
  armor: ['Armor'],
  belt: ['Belt'],
  boots: ['Boots'],
  bracers: ['Bracers'],
  cloak: ['Cloak'],
  gloves: ['Gloves'],
  goggles: ['Goggles'],
  helmet: ['Helm', 'Helmet', 'Head'],
  necklace: ['Necklace', 'Neck'],
  ring1: ['Ring'],
  ring2: ['Ring'],
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
  { key: 'helmet', label: 'Head' },
  { key: 'necklace', label: 'Neck' },
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
