export interface LgsRequirement {
  name: string
  quantity: number
}

export interface LgsEffect {
  name: string
  modifier?: number | string
  bonus?: string
}

export type LgsMetadata = Readonly<Record<string, unknown>>

interface LgsCraftedRecord {
  name: string
  craftedIn: string
  quantity: number
  requirements: readonly LgsRequirement[]
  image?: string
  binding?: LgsMetadata
  baseValue?: unknown
  source: LgsMetadata
}

export interface LgsBaseItem extends LgsCraftedRecord {
  ingredientType: 'Legendary Green Steel Weapon' | 'Legendary Green Steel Accessory'
}

export interface LgsTierAugment extends LgsCraftedRecord {
  title: string
  augmentType: string
  minimumLevel: number | string
  effectsAdded: readonly LgsEffect[]
  tier: 1 | 2 | 3
  itemType: 'Weapon' | 'Equipment'
  primaryFocus: string
  secondaryFocus?: string
  essence: string
  gem: string
}

export interface LgsActiveAugment extends LgsCraftedRecord {
  displayName: string
  type?: string
  minimumLevel: number | string
  augmentType: string
  description?: string
  weight?: number | string
}

export interface LgsBonusEffect {
  name: string
  description: string
  lowerFoci: readonly string[]
  tier3Foci: readonly string[]
  source: LgsMetadata
}

export interface LgsCraftingComponent extends LgsCraftedRecord {
  type?: string
}

export interface LgsSpecialRecipe {
  name: string
  quantity: number
  requirements: readonly LgsRequirement[]
  source: LgsMetadata
}

export interface LgsData {
  schemaVersion: 1
  baseItems: readonly LgsBaseItem[]
  tier1: readonly LgsTierAugment[]
  tier2: readonly LgsTierAugment[]
  tier3: readonly LgsTierAugment[]
  activeAugments: readonly LgsActiveAugment[]
  bonusEffects: readonly LgsBonusEffect[]
  craftingComponents: readonly LgsCraftingComponent[]
  specialRecipes: readonly LgsSpecialRecipe[]
}

export interface LgsPlan {
  baseItemName: string | null
  tier1Name: string | null
  tier2Name: string | null
  tier3Name: string | null
  bonusEffectName: string | null
  activeAugmentName: string | null
}

export interface LgsIngredientPlan {
  rawMaterials: readonly LgsRequirement[]
  craftedMaterials: readonly LgsRequirement[]
}
