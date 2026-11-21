export type ItemCategory = 'Heroic' | 'Legendary' | 'Raid'

export interface NearlyFinishedRequirement {
  name: string
  quantity: number
}

export interface MeltingRecipe {
  name: string
  quantity: number
  requirements: NearlyFinishedRequirement[]
}

export interface NearlyFinishedEffect {
  name: string
}

export interface NearlyFinishedAugment {
  orange?: null
  purple?: null
}

export interface ReforgingEntry {
  item: string
  stage: string
  cost: NearlyFinishedRequirement[]
  choices?: NearlyFinishedEffect[]
  effectsAdded: NearlyFinishedEffect[]
  augments?: NearlyFinishedAugment[]
}

export interface NearlyFinishedDataset {
  meltingStation: MeltingRecipe[]
  reforgingStation: ReforgingEntry[]
}

export interface IngredientTotal {
  name: string
  quantity: number
}

export interface CraftedIngredientTotal extends IngredientTotal {
  requirements: NearlyFinishedRequirement[]
}

export interface CraftingPlan {
  rawMaterials: IngredientTotal[]
  craftedMaterials: CraftedIngredientTotal[]
  finalStep: {
    item: string
    quantity: 1
    requirements: NearlyFinishedRequirement[]
  }
}

export interface ShoppingListTotals {
  rawMaterials: IngredientTotal[]
  craftedMaterials: IngredientTotal[]
}
