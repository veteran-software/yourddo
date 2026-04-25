import type { SetBonus } from '../../types/crafting.ts'
import type { EnchantmentConflict } from './conflictResolver.ts'

export interface SetBonusIndexEntry {
  name: string
  minLevel: number
}

export type SlotKey =
  | 'Armor'
  | 'Head'
  | 'Hands'
  | 'Cloak'
  | 'Waist'
  | 'Feet'
  | 'Wrists'
  | 'Eyes'
  | 'Neck'
  | 'First Finger'
  | 'Second Finger'
  | 'Trinket'
  | 'Main Hand'
  | 'Off Hand'
  | 'Quiver'
  | 'Iron Defender Armor'
  | 'Iron Defender Weapon'
  | 'Wolf Companion Armor'
  | 'Wolf Companion Weapon'
  | 'Augment'
  | 'Filigree'

export type SetBonusIndex = Record<string, SetBonusIndexEntry[] | undefined>

export const GearSlot = {
  Armor: 'Armor',
  Head: 'Head',
  Hands: 'Hands',
  Cloak: 'Cloak',
  Waist: 'Waist',
  Feet: 'Feet',
  Wrists: 'Wrists',
  Eyes: 'Eyes',
  Neck: 'Neck',
  FirstFinger: 'First Finger',
  SecondFinger: 'Second Finger',
  Trinket: 'Trinket',
  MainHand: 'Main Hand',
  OffHand: 'Off Hand',
  Quiver: 'Quiver',
  ArtificerPetArmor: 'Iron Defender Armor',
  ArtificerPetWeapon: 'Iron Defender Weapon',
  DruidPetArmor: 'Wolf Companion Armor',
  DruidPetWeapon: 'Wolf Companion Weapon',
  Augment: 'Augment',
  Filigree: 'Filigree'
} as const
export type GearSlot = (typeof GearSlot)[keyof typeof GearSlot]

export const GEAR_SLOTS: GearSlot[] = [
  GearSlot.Eyes,
  GearSlot.Head,
  GearSlot.Neck,
  GearSlot.Trinket,
  GearSlot.Armor,
  GearSlot.Cloak,
  GearSlot.Wrists,
  GearSlot.Waist,
  GearSlot.FirstFinger,
  GearSlot.Feet,
  GearSlot.Hands,
  GearSlot.SecondFinger,
  GearSlot.MainHand,
  GearSlot.OffHand,
  GearSlot.Quiver
]

export const ARTIFICER_PET_SLOTS: GearSlot[] = [GearSlot.ArtificerPetArmor, GearSlot.ArtificerPetWeapon]
export const DRUID_PET_SLOTS: GearSlot[] = [GearSlot.DruidPetArmor, GearSlot.DruidPetWeapon]

export const isPetSlot = (slot: string | null): boolean => {
  if (!slot) return false
  return (ARTIFICER_PET_SLOTS as string[]).includes(slot) || (DRUID_PET_SLOTS as string[]).includes(slot)
}

export interface LootEnchantment {
  name: string
  statModified?: string
  modifier?: string | number
  bonus?: string | number
  stats?: (number | string)[]
  notes?: string
}

export interface LootBinding {
  type: string
  to: string
  from: string
}

export interface LootBaseValue {
  platinum?: string
  gold?: string
  silver?: string
  copper?: string
}

export interface LootDropLocation {
  sourceType: string
  questWildernessChain?: string
  whichChestPerson?: string
  difficulty?: string
  vendorTable?: {
    vendorsRaw: string
  }
  isCraftOnly?: boolean
  vipMonths?: string
  adventurePack?: string
  [key: string]: string | number | boolean | undefined | object
}

export interface GearAugmentSlot {
  augmentType: string
  name?: string // For specific named slots like Dino Bone
}

export interface GearAugment {
  name: string
  augmentType: string
  minLevel: number
  binding?: LootBinding
  description?: string
  foundIn?: string[]
  image?: string
  weight?: number
  update?: number
  effectsAdded?: LootEnchantment[]
  setBonus?: SetBonus[]
}

export interface LootItem {
  pageTitle: string
  name: string
  type: string
  description: string
  minLevel: string | number
  absoluteMinLevel: string | undefined
  binding?: LootBinding
  restriction: string
  material: string
  hardness: string
  durability: string
  weight: string
  baseValue?: LootBaseValue
  artifactType?: string
  capacity?: string
  maxStackSize?: string
  dropLocations: LootDropLocation[]
  update: string
  details: string
  upgradeable: string
  upgradedFrom: string
  icon: string
  image: string
  enchantments?: LootEnchantment[]
  augments?: GearAugmentSlot[]
  essenceSlots?: string[]
  setBonus?: SetBonus[]
}

export interface GearItem extends LootItem {
  id: string // Unique identifier for the gear planner
  slot: GearSlot
  augmentType?: string
  minimumLevel?: number
  effectsAdded?: LootEnchantment[]
  grouping?: string
  isEssenceCrafted?: boolean
  essenceSlots?: string[]
  normalizedName?: string
  normalizedEnchantments?: string[]
}

export interface Curse {
  name: string
  enchantments?: LootEnchantment[]
  type: string
}

export interface UpgradeEntry {
  name: string
  effectsRemoved: LootEnchantment[]
  effectsAdded: LootEnchantment[]
}

export interface UpgradeSelectorProps {
  item: GearItem
  slot: GearSlot
  active: boolean
  onToggle: (active: boolean) => void
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

export interface SlottedProperties {
  slots: Record<string, GearItem | null>
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedCurses: Record<string, Curse | null>
  slottedFiligrees: Record<string, (GearItem | null)[]>
  unlockedFiligreeSlots: Record<string, number>
  slottedGemSetBonuses: Record<string, (string | null)[]>
  slottedEssenceEnchantments: Record<string, Record<string, string | null>>
  slottedNearlyFinished: Record<string, LootEnchantment | null>
  slottedRitualTable: Record<string, LootEnchantment | null>
  slottedLostPurpose: Record<string, LootEnchantment | null>
  slottedFountainOfNecroticMight: Record<string, boolean>
  slottedStormreaverUpgrade: Record<string, boolean>
  slottedZhentarimAttuned: Record<string, boolean>
}

export interface EntityGearState extends SlottedProperties {
  equipped: GearItem[]
  conflicts: Record<string, EnchantmentConflict[]>
}

export type PetState = SlottedProperties

export interface GearSetup extends SlottedProperties {
  id: string
  name: string
  minLevel: number
  maxLevel: number
  classes: (string | null)[]
  weaponFilters: string[] // Selected weapon types (e.g., 'Dagger', 'Long Sword')
  armorFilters: string[] // Selected armor types (e.g., 'Cloth Armor', 'Heavy Armor')
  shieldFilters: string[] // Selected shield types (e.g., 'Buckler', 'Tower Shield')
  allowMetalWithDruid: boolean // Override for Druid metal restriction
  slots: Record<GearSlot, GearItem | null>
  artificerPet: PetState
  druidPet: PetState
}

export const GEAR_CLASSES = [
  'Alchemist',
  'Artificer',
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Favored Soul',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard'
]

export const WEAPON_TYPES: Record<string, string[]> = {
  Exotic: [
    'Bastard Sword',
    'Dwarven War Axe',
    'Handwraps',
    'Kama',
    'Khopesh',
    'Repeating Heavy Crossbow',
    'Repeating Light Crossbow'
  ],
  Martial: [
    'Battle Axe',
    'Falchion',
    'Great Axe',
    'Great Club',
    'Great Crossbow',
    'Great Sword',
    'Hand Axe',
    'Heavy Pick',
    'Kukri',
    'Light Hammer',
    'Light Pick',
    'Long Bow',
    'Long Sword',
    'Maul',
    'Rapier',
    'Scimitar',
    'Short Bow',
    'Short Sword',
    'Warhammer'
  ],
  Simple: [
    'Club',
    'Dagger',
    'Heavy Crossbow',
    'Heavy Mace',
    'Light Crossbow',
    'Light Mace',
    'Morningstar',
    'Quarterstaff',
    'Sickle'
  ],
  Throwing: ['Dart', 'Shuriken', 'Throwing Axe', 'Throwing Dagger', 'Throwing Hammer']
}

export const SHIELD_TYPES = ['Buckler', 'Large Shield', 'Orb', 'Rune Arm', 'Shield', 'Small Shield', 'Tower Shield']

export const ARMOR_TYPES = ['Cloth Armor', 'Docent', 'Heavy Armor', 'Light Armor', 'Medium Armor']

export interface ClassProficiencies {
  weapons: string[]
  armor: string[]
  shields: string[]
}

export const CLASS_PROFICIENCIES: Record<string, ClassProficiencies> = {
  Alchemist: {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor'],
    shields: []
  },
  Artificer: {
    weapons: [
      ...WEAPON_TYPES.Simple,
      'Light Hammer',
      'Warhammer',
      'Great Crossbow',
      'Repeating Light Crossbow',
      'Repeating Heavy Crossbow'
    ],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Rune Arm', 'Small Shield']
  },
  Barbarian: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Bard: {
    weapons: [...WEAPON_TYPES.Simple, 'Longsword', 'Rapier', 'Short Sword', 'Short Bow'],
    armor: ['Cloth Armor', 'Light Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Cleric: {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor', 'Heavy Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Druid: {
    weapons: ['Club', 'Dagger', 'Dart', 'Quarterstaff', 'Sickle', 'Unarmed', 'Scimitar'],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  'Favored Soul': {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Fighter: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor', 'Heavy Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield', 'Tower Shield']
  },
  Monk: {
    weapons: [...WEAPON_TYPES.Simple, 'Handaxe', 'Handwraps', 'Kama', 'Shuriken'],
    armor: ['Cloth Armor'],
    shields: []
  },
  Paladin: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor', 'Heavy Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Ranger: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Rogue: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor'],
    shields: []
  },
  Sorcerer: {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor'],
    shields: []
  },
  Warlock: {
    weapons: [...WEAPON_TYPES.Simple],
    armor: ['Cloth Armor', 'Light Armor'],
    shields: []
  },
  Wizard: {
    weapons: ['Club', 'Scepter', 'Dagger', 'Quarterstaff', 'Heavy Crossbow', 'Light Crossbow', 'Throwing Dagger'],
    armor: ['Cloth Armor'],
    shields: []
  }
}
