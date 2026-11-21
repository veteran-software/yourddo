export type EssenceAffixPosition = 'prefix' | 'suffix' | 'extra'
export type EssenceBinding = 'bound' | 'unbound'
export type EssenceRecipeKind = 'enhancement-shard' | 'minimum-level-shard'
export type EssenceRequirementKind = 'ingredient'
export type EssenceModifierUnit = 'number' | 'percent' | 'dice' | 'text'

export interface EssenceNamedRecord {
  id: string
  displayName: string
}

export type EssenceIngredient = EssenceNamedRecord

export interface EssencePlacement {
  position: EssenceAffixPosition
  itemCategoryIds: readonly string[]
}

export interface EssenceModifierBand {
  minimumItemLevel: number
  maximumItemLevel: number
  value: number
}

export interface EssenceFixedModifier {
  kind: 'fixed'
  unit: EssenceModifierUnit
  value: number | string
  die?: string
}

export interface EssenceByItemLevelModifier {
  kind: 'by-item-level'
  unit: Exclude<EssenceModifierUnit, 'text'>
  bands: readonly EssenceModifierBand[]
  die?: string
}

export type EssenceModifier = EssenceFixedModifier | EssenceByItemLevelModifier

export interface EssenceEffect extends EssenceNamedRecord {
  bonusTypeId?: string
  modifier?: EssenceModifier
}

export interface EssenceEnhancementRecipes {
  boundRecipeId: string
  unboundRecipeId: string
}

export interface EssenceEnhancement extends EssenceNamedRecord {
  minimumItemLevel: number
  placements: readonly EssencePlacement[]
  effects: readonly EssenceEffect[]
  recipes: EssenceEnhancementRecipes
}

export interface EssenceRecipeRequirement {
  kind: EssenceRequirementKind
  ingredientId: string
  quantity: number
}

export interface EssenceRecipeBase {
  id: string
  kind: EssenceRecipeKind
  binding: EssenceBinding
  craftingLevel: number
  requirements: readonly EssenceRecipeRequirement[]
}

export interface EssenceEnhancementRecipe extends EssenceRecipeBase {
  kind: 'enhancement-shard'
  sourceRecipeId: string
}

export interface EssenceMinimumLevelRecipe extends EssenceRecipeBase {
  kind: 'minimum-level-shard'
  itemLevel: number
}

export type EssenceRecipe = EssenceEnhancementRecipe | EssenceMinimumLevelRecipe

export interface EssenceMinimumLevelShard {
  itemLevel: number
  recipes: EssenceEnhancementRecipes
}

export interface EssenceAugment extends EssenceNamedRecord {
  augmentTypeId: string
  minimumItemLevel: number
  effects: readonly EssenceEffect[]
}

export interface EssenceAugmentSlotType extends EssenceNamedRecord {
  acceptsAugmentTypeIds: readonly string[]
}

export interface EssenceAugmentSlotPlacement {
  itemCategoryId: string
  augmentSlotTypeIds: readonly string[]
}

export interface EssenceExtraAffixRule {
  position: 'extra'
  markRequirement: EssenceRecipeRequirement
  consumedWhen: 'extra-enhancement-applied'
}

export interface EssenceRules {
  supportedItemLevels: {
    minimum: number
    maximum: number
  }
  maximumCraftingLevel: number
  extraAffix: EssenceExtraAffixRule
  augmentSlotTypes: readonly EssenceAugmentSlotType[]
  augmentSlotPlacements: readonly EssenceAugmentSlotPlacement[]
}

export interface EssenceCraftingIndexes {
  enhancementById: ReadonlyMap<string, EssenceEnhancement>
  enhancementsByPlacement: ReadonlyMap<EssenceAffixPosition, ReadonlyMap<string, readonly EssenceEnhancement[]>>
  ingredientById: ReadonlyMap<string, EssenceIngredient>
  augmentById: ReadonlyMap<string, EssenceAugment>
  minimumLevelRecipeByLevel: ReadonlyMap<number, Readonly<Record<EssenceBinding, EssenceMinimumLevelRecipe>>>
}

export interface EssenceCraftingData {
  schemaVersion: 1
  itemCategories: readonly EssenceNamedRecord[]
  augmentTypes: readonly EssenceNamedRecord[]
  bonusTypes: readonly EssenceNamedRecord[]
  enhancements: readonly EssenceEnhancement[]
  ingredients: readonly EssenceIngredient[]
  recipes: readonly EssenceRecipe[]
  minimumLevelShards: readonly EssenceMinimumLevelShard[]
  augments: readonly EssenceAugment[]
  rules: EssenceRules
  indexes: EssenceCraftingIndexes
}
