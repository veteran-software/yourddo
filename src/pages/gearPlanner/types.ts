export interface SetBonusIndexEntry {
  name: string
  minLevel: number
}

export type SetBonusIndex = Record<string, SetBonusIndexEntry[]>

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
  Ammunition: 'Ammunition',
  ArtificerPetArmor: 'Iron Defender Armor',
  ArtificerPetWeapon: 'Iron Defender Weapon',
  DruidPetArmor: 'Wolf Companion Armor',
  DruidPetWeapon: 'Wolf Companion Weapon',
  Augment: 'Augment'
} as const
export type GearSlot = (typeof GearSlot)[keyof typeof GearSlot]

export const GEAR_SLOTS: GearSlot[] = [
  GearSlot.Armor,
  GearSlot.Head,
  GearSlot.Hands,
  GearSlot.Cloak,
  GearSlot.Waist,
  GearSlot.Feet,
  GearSlot.Wrists,
  GearSlot.Eyes,
  GearSlot.Neck,
  GearSlot.FirstFinger,
  GearSlot.SecondFinger,
  GearSlot.Trinket,
  GearSlot.MainHand,
  GearSlot.OffHand,
  GearSlot.Quiver,
  GearSlot.Ammunition
]

export const ARTIFICER_PET_SLOTS: GearSlot[] = [GearSlot.ArtificerPetArmor, GearSlot.ArtificerPetWeapon]
export const DRUID_PET_SLOTS: GearSlot[] = [GearSlot.DruidPetArmor, GearSlot.DruidPetWeapon]

export interface LootEnchantment {
  name: string
  modifier?: string | number
  bonus?: string
  notes?: string
}

export interface LootBinding {
  type: string
  to: string
  from: string
}

export interface LootBaseValue {
  platinum?: string
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
}

export interface GearAugmentSlot {
  augmentType: string
  name?: string // For specific named slots like Dino Bone
}

export interface GearAugment {
  name: string
  augmentType: string
  minimumLevel: number
  effectsAdded?: LootEnchantment[]
  description?: string
  image?: string
  setBonus?: { name: string }[]
}

export interface LootItem {
  pageTitle: string
  name: string
  type: string
  description: string
  minLevel: string
  absoluteMinLevel: string
  binding?: LootBinding
  restriction: string
  material: string
  hardness: string
  durability: string
  weight: string
  baseValue?: LootBaseValue
  artifacttype: string
  dropLocations: LootDropLocation[]
  update: string
  details: string
  upgradeable: string
  upgradedFrom: string
  bug: string
  replaced: string
  icon: string
  image: string
  optionsRaw: string
  enchantments: LootEnchantment[]
  augments?: GearAugmentSlot[]
  setBonus?: { name: string }[]
}

export interface GearItem extends LootItem {
  id: string // Unique identifier for the gear planner
  slot: GearSlot
  augmentType?: string
  minimumLevel?: number
  effectsAdded?: LootEnchantment[]
}

export interface Curse {
  name: string
  enchantments: LootEnchantment[]
  type: string
}

export interface GearSetup {
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
  slottedAugments: Record<string, Record<number, GearAugment | null>> // itemId -> { slotIndex -> augment }
  slottedCurses: Record<string, Curse | null> // itemId -> curse
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
    'Repeating Light Crossbow',
    'Shuriken'
  ],
  Martial: [
    'Battle Axe',
    'Falchion',
    'Great Axe',
    'Great Club',
    'Great Crossbow',
    'Great Sword',
    'Hand Axe',
    'Handaxe',
    'Heavy Pick',
    'Kukri',
    'Light Hammer',
    'Light Pick',
    'Long Bow',
    'Long Sword',
    'Longsword',
    'Maul',
    'Rapier',
    'Scimitar',
    'Short Bow',
    'Short Sword',
    'Shortbow',
    'Throwing Axe',
    'Throwing Hammer',
    'War Hammer'
  ],
  Simple: [
    'Club',
    'Dagger',
    'Dart',
    'Heavy Crossbow',
    'Heavy Mace',
    'Light Crossbow',
    'Light Mace',
    'Morningstar',
    'Quarterstaff',
    'Scepter',
    'Sickle',
    'Throwing Dagger',
    'Unarmed'
  ]
}

export const SHIELD_TYPES = ['Buckler', 'Large Shield', 'Orb', 'Small Shield', 'Tower Shield']

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
      'War Hammer',
      'Great Crossbow',
      'Repeating Light Crossbow',
      'Repeating Heavy Crossbow'
    ],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Barbarian: {
    weapons: [...WEAPON_TYPES.Simple, ...WEAPON_TYPES.Martial],
    armor: ['Cloth Armor', 'Light Armor', 'Medium Armor'],
    shields: ['Buckler', 'Large Shield', 'Orb', 'Small Shield']
  },
  Bard: {
    weapons: [...WEAPON_TYPES.Simple, 'Longsword', 'Rapier', 'Short Sword', 'Shortbow'],
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
