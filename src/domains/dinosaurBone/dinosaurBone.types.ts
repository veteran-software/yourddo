export interface DinosaurBoneEffect {
  name: string
  modifier?: number | string
  bonus?: string
  notes?: string
}

export interface DinosaurBoneRequirement {
  name: string
  quantity: number
  ingredientType?: string
  foundIn?: readonly string[]
  requirements?: readonly DinosaurBoneRequirement[]
}

export interface DinosaurBoneSlot {
  id: string
  augmentType: string
  label: string
}

export interface DinosaurBoneSetBonus {
  name: string
  numPiecesEquipped?: number
  enhancements?: readonly DinosaurBoneEffect[]
}

export interface DinosaurBoneItem {
  name: string
  pageTitle?: string
  type: string
  description?: string
  image?: string
  icon?: string
  artifactType?: string
  minLevel?: string | number
  binding?: Readonly<Record<string, string>>
  material?: string
  weight?: string | number
  hardness?: string | number
  durability?: string | number
  enchantments?: readonly DinosaurBoneEffect[]
  effectsAdded?: readonly DinosaurBoneEffect[]
  augments: readonly DinosaurBoneSlot[]
  setBonus?: readonly DinosaurBoneSetBonus[]
  requirements: readonly DinosaurBoneRequirement[]
  craftedIn?: string
  restrictions?: readonly string[]
  notes?: readonly string[]
  dropLocations?: readonly unknown[]
}

export interface DinosaurBoneAugment {
  name: string
  augmentType: string
  description?: string
  minimumLevel?: string | number
  effectsAdded?: readonly DinosaurBoneEffect[]
  requirements: readonly DinosaurBoneRequirement[]
  setBonus?: readonly DinosaurBoneSetBonus[]
  foundIn?: readonly string[]
  craftedIn?: string
}

export type ItemFamily = 'crafted-weapons' | 'attuned-weapons' | 'armor-accessories' | 'named-items'

export interface ClassifiedDinosaurBoneItem extends DinosaurBoneItem {
  family: ItemFamily
}

export interface DinosaurBoneIndexes {
  itemByName: ReadonlyMap<string, ClassifiedDinosaurBoneItem>
  itemsByFamily: ReadonlyMap<ItemFamily, readonly ClassifiedDinosaurBoneItem[]>
  augmentByName: ReadonlyMap<string, DinosaurBoneAugment>
  augmentsByType: ReadonlyMap<string, readonly DinosaurBoneAugment[]>
}

export interface DinosaurBoneData {
  items: readonly ClassifiedDinosaurBoneItem[]
  dinosaurAugments: readonly DinosaurBoneAugment[]
  colorAugments: readonly DinosaurBoneAugment[]
  indexes: DinosaurBoneIndexes
}

export type SelectedAugments = Readonly<Record<string, string | null>>

export interface FinishedSlot {
  slot: DinosaurBoneSlot
  augment?: DinosaurBoneAugment
}

export interface FinishedDinosaurBoneItem {
  item?: ClassifiedDinosaurBoneItem
  originalEffects: readonly DinosaurBoneEffect[]
  slots: readonly FinishedSlot[]
  emptySlots: readonly DinosaurBoneSlot[]
  setBonuses: readonly DinosaurBoneSetBonus[]
  warnings: readonly string[]
}

export interface CumulativeIngredient {
  name: string
  quantity: number
  ingredientType?: string
  foundIn?: readonly string[]
}

export interface CraftingRequirementsPayload {
  schemaVersion: 1
  items: readonly { name: string; requirements: readonly DinosaurBoneRequirement[] }[]
  identityDifferences: readonly { legacyName: string; currentCdnName: string }[]
}
