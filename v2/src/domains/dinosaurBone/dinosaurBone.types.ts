export interface DinosaurBoneEffect {
  name: string
  modifier?: number | string
  bonus?: string
  notes?: string
}

export interface DinosaurBoneRequirement {
  name: string
  quantity: number
  requirements?: DinosaurBoneRequirement[]
}

export interface DinosaurBoneSlot {
  augmentType: string
}

export interface DinosaurBoneSetBonus {
  name: string
  numPiecesEquipped?: number
  enhancements?: DinosaurBoneEffect[]
}

export interface DinosaurBoneItem {
  name: string
  pageTitle?: string
  type: string
  description?: string
  image?: string
  icon?: string
  minLevel?: string | number
  binding?: Record<string, string>
  material?: string
  weight?: string | number
  hardness?: string | number
  durability?: string | number
  enchantments?: DinosaurBoneEffect[] | null
  effectsAdded?: DinosaurBoneEffect[]
  augments: DinosaurBoneSlot[]
  setBonus?: DinosaurBoneSetBonus[]
  requirements: DinosaurBoneRequirement[]
  craftedIn?: string
  dropLocations?: unknown[]
}

export interface DinosaurBoneAugment {
  name: string
  augmentType: string
  description?: string
  minimumLevel?: string | number
  effectsAdded?: DinosaurBoneEffect[]
  requirements?: DinosaurBoneRequirement[]
  setBonus?: DinosaurBoneSetBonus[]
}

export type ItemFamily = 'crafted-weapons' | 'attuned-weapons' | 'armor-accessories' | 'named-items'

export interface ClassifiedDinosaurBoneItem extends DinosaurBoneItem {
  family: ItemFamily
}

export interface DinosaurBoneData {
  items: ClassifiedDinosaurBoneItem[]
  dinosaurAugments: DinosaurBoneAugment[]
  colorAugments: DinosaurBoneAugment[]
}

export type SelectedAugments = Record<string, string | null>
