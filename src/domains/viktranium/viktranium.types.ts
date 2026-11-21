export type ViktraniumFamily =
  | 'heroic-crafted-weapons'
  | 'heroic-quest-loot'
  | 'legendary-crafted-weapons'
  | 'legendary-quest-loot'
  | 'wicked-crafted-weapons'

export type ViktraniumCategory =
  'Armor' | 'Clothing' | 'Jewelry' | 'Shields' | 'Melee' | 'Ranged' | 'Throwing' | 'Weapons'

export interface ViktraniumEffect {
  name: string
  modifier?: string | number
  bonus?: string
  notes?: string
}

export interface ViktraniumRequirement {
  ingredientId: string
  name: string
  quantity: number
  requirements?: readonly ViktraniumRequirement[]
}

export type RecipeStatus = 'complete' | 'incomplete' | 'unavailable'

export interface ViktraniumRecipe {
  id: string
  deviceId: string
  device: string
  productEffect?: string
  status: RecipeStatus
  requirements: readonly ViktraniumRequirement[]
}

export interface ViktraniumSlot {
  id: string
  augmentType: string
  label: string
  order: number
  compatibleAugmentTypes?: readonly string[]
  filledAugmentId?: string
}

export interface ViktraniumLocation {
  sourceType: string
  source?: string
  location?: string
  difficulty?: string
}

export interface ViktraniumItem {
  id: string
  name: string
  displayName: string
  pageTitle: string
  family: ViktraniumFamily
  category: ViktraniumCategory
  type: string
  description?: string
  minimumLevel: number
  binding?: Readonly<Record<string, string>>
  material?: string
  enchantments: readonly ViktraniumEffect[]
  slots: readonly ViktraniumSlot[]
  dropLocations: readonly ViktraniumLocation[]
  recipes: readonly ViktraniumRecipe[]
  icon?: string
  image?: string
  notes?: string
}

export interface ViktraniumAugment {
  id: string
  name: string
  augmentType: string
  minimumLevel: number
  description?: string
  effects: readonly ViktraniumEffect[]
  foundIn: readonly string[]
  recipes: readonly ViktraniumRecipe[]
  image?: string
}

export interface ViktraniumIngredient {
  id: string
  name: string
  description?: string
  foundIn: readonly string[]
  image?: string
}

export interface ViktraniumIndexes {
  itemById: ReadonlyMap<string, ViktraniumItem>
  itemsByFamily: ReadonlyMap<ViktraniumFamily, readonly ViktraniumItem[]>
  augmentById: ReadonlyMap<string, ViktraniumAugment>
  augmentsByType: ReadonlyMap<string, readonly ViktraniumAugment[]>
  ingredientById: ReadonlyMap<string, ViktraniumIngredient>
}

export interface ViktraniumData {
  schemaVersion: 1
  items: readonly ViktraniumItem[]
  augments: readonly ViktraniumAugment[]
  ingredients: readonly ViktraniumIngredient[]
  indexes: ViktraniumIndexes
}

export type SelectedAugments = Readonly<Record<string, string | null>>

export interface FinishedViktraniumSlot {
  slot: ViktraniumSlot
  augment?: ViktraniumAugment
  existing: boolean
}

export interface FinishedViktraniumItem {
  item?: ViktraniumItem
  minimumLevel?: number
  baseEffects: readonly ViktraniumEffect[]
  slots: readonly FinishedViktraniumSlot[]
  emptySlots: readonly ViktraniumSlot[]
  warnings: readonly string[]
  incompleteRecipeWarnings: readonly string[]
}

export interface CumulativeIngredient extends ViktraniumIngredient {
  quantity: number
}

export interface IngredientCalculation {
  ingredients: readonly CumulativeIngredient[]
  warnings: readonly string[]
}
