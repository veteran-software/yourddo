export const gearPlannerSlots = {
  eyes: 'Eyes',
  head: 'Head',
  neck: 'Neck',
  trinket: 'Trinket',
  armor: 'Armor',
  cloak: 'Cloak',
  wrists: 'Wrists',
  waist: 'Waist',
  feet: 'Feet',
  hands: 'Hands',
  firstFinger: 'First Finger',
  secondFinger: 'Second Finger',
  mainHand: 'Main Hand',
  offHand: 'Off Hand',
  quiver: 'Quiver',
  ironDefenderArmor: 'Iron Defender Armor',
  ironDefenderWeapon: 'Iron Defender Weapon',
  wolfCompanionArmor: 'Wolf Companion Armor',
  wolfCompanionWeapon: 'Wolf Companion Weapon'
} as const

export type GearPlannerSlot = (typeof gearPlannerSlots)[keyof typeof gearPlannerSlots]

export const gearPlannerCharacterSlots = [
  gearPlannerSlots.eyes,
  gearPlannerSlots.head,
  gearPlannerSlots.neck,
  gearPlannerSlots.trinket,
  gearPlannerSlots.armor,
  gearPlannerSlots.cloak,
  gearPlannerSlots.wrists,
  gearPlannerSlots.waist,
  gearPlannerSlots.feet,
  gearPlannerSlots.hands,
  gearPlannerSlots.firstFinger,
  gearPlannerSlots.secondFinger,
  gearPlannerSlots.mainHand,
  gearPlannerSlots.offHand,
  gearPlannerSlots.quiver
] as const satisfies readonly GearPlannerSlot[]

export const gearPlannerPetSlots = [
  gearPlannerSlots.ironDefenderArmor,
  gearPlannerSlots.ironDefenderWeapon,
  gearPlannerSlots.wolfCompanionArmor,
  gearPlannerSlots.wolfCompanionWeapon
] as const satisfies readonly GearPlannerSlot[]

export const allGearPlannerSlots = [...gearPlannerCharacterSlots, ...gearPlannerPetSlots] as const

export interface GearPlannerEffect {
  discrepancyNotes?: readonly string[]
  name: string
  statModified?: string
  modifier?: string | number
  bonus?: string | number
  stats?: readonly (string | number)[]
  notes?: string
  [key: string]: unknown
}

export interface GearPlannerAugmentSlot {
  slotTypes?: readonly string[]
  augmentType: string
  name?: string
  [key: string]: unknown
}

export interface GearPlannerSetBonus {
  name: string
  [key: string]: unknown
}

export interface GearPlannerBinding {
  type?: string
  to?: string
  from?: string
  [key: string]: unknown
}

export interface GearPlannerSourceItem {
  discrepancyNotes?: readonly string[]
  blockedSlots?: readonly string[]
  catalogId?: number
  catalogSlots?: readonly GearPlannerSlot[]
  iconLayers?: readonly string[]
  name: string
  pageTitle?: string
  type?: string
  minLevel?: string | number
  absoluteMinLevel?: string | number
  icon?: string
  image?: string
  material?: string
  binding?: GearPlannerBinding
  enchantments?: readonly GearPlannerEffect[] | null
  augments?: readonly GearPlannerAugmentSlot[]
  setBonus?: readonly GearPlannerSetBonus[]
  dropLocations?: readonly Record<string, unknown>[] | null
  artifactType?: string
  upgradeable?: string
  grouping?: string
  [key: string]: unknown
}

export interface GearPlannerAugment {
  discrepancyNotes?: readonly string[]
  clearSecondarySet?: boolean
  name: string
  slotTypes?: readonly string[]
  augmentType: string
  minLevel: number
  effectsAdded: readonly GearPlannerEffect[]
  setBonus?: readonly GearPlannerSetBonus[]
  source: Readonly<Record<string, unknown>>
}

export interface GearPlannerItem {
  alchemical?: { base: import('../alchemical/data').AlchemicalBase; source: GearPlannerSourceItem }
  slaveLordsBase?: import('../slaveLords/data').SlaveLordsBase
  crafts?: readonly import('./crafting.ts').EquippedCraft[]
  id: string
  slot: GearPlannerSlot
  sourceFile: string
  minimumLevel: number
  absoluteMinimumLevel?: number
  source: GearPlannerSourceItem
  essenceCrafting?: {
    kind: string
    itemCategoryId: string
  }
}

export interface GearPlannerFiligree {
  id: string
  name: string
  minimumLevel: number
  grouping?: string
  source: GearPlannerSourceItem
}

export interface GearPlannerCurse {
  discrepancyNotes?: readonly string[]
  id: string
  name: string
  type: string
  enchantments: readonly GearPlannerEffect[]
  source: Readonly<Record<string, unknown>>
}

export interface GearPlannerFiligreeSetThreshold {
  threshold: number
  effects: readonly GearPlannerEffect[]
}

export interface GearPlannerFiligreeSetDefinition {
  name: string
  thresholds: readonly GearPlannerFiligreeSetThreshold[]
  source: Readonly<Record<string, unknown>>
}

export interface GearPlannerSourceDataset {
  fileName: string
  records: readonly GearPlannerSourceItem[]
}

export type GearPlannerSetIndex = ReadonlyMap<string, readonly { setName: string; minimumLevel: number }[]>

export interface GearPlannerData {
  setIndex?: GearPlannerSetIndex
  crafting: import('./crafting.ts').GearCraftingData
  standardSets?: ReadonlyMap<string, import('./standardSetDefinitions.ts').GearPlannerStandardSetDefinition>
  sourceDatasets: readonly GearPlannerSourceDataset[]
  items: readonly GearPlannerItem[]
  itemsBySlot: Readonly<Record<GearPlannerSlot, readonly GearPlannerItem[]>>
  augments: readonly GearPlannerAugment[]
  curses: readonly GearPlannerCurse[]
  filigrees: readonly GearPlannerFiligree[]
  filigreeSetDefinitions: readonly GearPlannerFiligreeSetDefinition[]
  filigreeSetDefinitionByName: ReadonlyMap<string, GearPlannerFiligreeSetDefinition>
  reforging: import('./reforging.ts').GearPlannerReforgingData
  rawItemCount: number
  normalizedItemCount: number
  rejectedItemCount: number
}
