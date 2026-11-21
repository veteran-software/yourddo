import type { EquipmentSlotId } from './equipment.ts'
import type {
  EssenceBinding,
  EssenceCraftingData,
  EssenceEnhancementRecipe,
  EssenceIngredient,
  EssenceMinimumLevelRecipe,
  EssenceRecipeRequirement
} from './essenceCrafting.types.ts'
import type { EssencePlanState, PlannedItem } from './plannerState.ts'

export type EssenceMaterialStepSource = 'minimum-level-shard' | 'prefix' | 'suffix' | 'extra' | 'mark-of-house-cannith'
export type EssenceEnhancementSelectionSource = 'prefix' | 'suffix' | 'extra'

export interface EssenceMaterial {
  ingredientId: string
  displayName: string
  quantity: number
}

export interface EssenceRecipeVariantResolved {
  status: 'resolved'
  recipe: EssenceEnhancementRecipe
}

export interface EssenceEnhancementNotFound {
  status: 'enhancement-not-found'
  enhancementId: string
}

/** The enhancement exists, but its requested recipe variant cannot be used. */
export interface EssenceRecipeVariantUnavailable {
  status: 'recipe-variant-unavailable'
  enhancementId: string
  binding: EssenceBinding
  recipeId: string
}

export type EssenceEnhancementRecipeResolution =
  EssenceRecipeVariantResolved | EssenceEnhancementNotFound | EssenceRecipeVariantUnavailable

export interface EssenceMinimumLevelRecipeResolved {
  status: 'resolved'
  recipe: EssenceMinimumLevelRecipe
}

export interface EssenceMinimumLevelRecipeUnavailable {
  status: 'minimum-level-recipe-unavailable'
  itemLevel: number
  binding: EssenceBinding
}

export type EssenceMinimumLevelRecipeResolution =
  EssenceMinimumLevelRecipeResolved | EssenceMinimumLevelRecipeUnavailable

export interface EssenceResolvedMaterialStep {
  status: 'resolved'
  source: EssenceMaterialStepSource
  recipeId?: string
  selection?: {
    enhancementId: string
    displayName: string
  }
  materials: readonly EssenceMaterial[]
}

export interface EssenceUnavailableMaterialStep {
  status: 'unavailable'
  source: Exclude<EssenceMaterialStepSource, 'mark-of-house-cannith'>
  selection?: {
    enhancementId: string
  }
  reason: Exclude<EssenceEnhancementRecipeResolution | EssenceMinimumLevelRecipeResolution, { status: 'resolved' }>
}

export type EssenceMaterialStep = EssenceResolvedMaterialStep | EssenceUnavailableMaterialStep

export interface EssencePlannedItemMaterials {
  effectiveItemLevel: number
  steps: readonly EssenceMaterialStep[]
  materials: readonly EssenceMaterial[]
}

export interface EssencePlanItemMaterials extends EssencePlannedItemMaterials {
  equipmentSlotId: EquipmentSlotId
}

export interface EssencePlanMaterials {
  items: readonly EssencePlanItemMaterials[]
  materials: readonly EssenceMaterial[]
}

const requirementsToMaterials = (
  data: EssenceCraftingData,
  requirements: readonly EssenceRecipeRequirement[]
): readonly EssenceMaterial[] =>
  requirements.flatMap((requirement) => {
    const ingredient = data.indexes.ingredientById.get(requirement.ingredientId)
    return ingredient ? [toMaterial(ingredient, requirement.quantity)] : []
  })

const toMaterial = (ingredient: EssenceIngredient, quantity: number): EssenceMaterial => ({
  ingredientId: ingredient.id,
  displayName: ingredient.displayName,
  quantity
})

const compareMaterials = (left: EssenceMaterial, right: EssenceMaterial): number =>
  left.displayName.localeCompare(right.displayName, undefined, { sensitivity: 'base' }) ||
  left.ingredientId.localeCompare(right.ingredientId)

/** Combines materials solely by generated ingredient ID, then returns stable display order. */
export const aggregateMaterialsByIngredientId = (materials: readonly EssenceMaterial[]): readonly EssenceMaterial[] => {
  const totalsByIngredientId = new Map<string, EssenceMaterial>()
  for (const material of materials) {
    const existing = totalsByIngredientId.get(material.ingredientId)
    if (existing) existing.quantity += material.quantity
    else totalsByIngredientId.set(material.ingredientId, { ...material })
  }
  return [...totalsByIngredientId.values()].sort(compareMaterials)
}

export const resolveEnhancementRecipe = (
  data: EssenceCraftingData,
  enhancementId: string,
  binding: EssenceBinding
): EssenceEnhancementRecipeResolution => {
  const enhancement = data.indexes.enhancementById.get(enhancementId)
  if (!enhancement) return { status: 'enhancement-not-found', enhancementId }

  const recipeId = binding === 'bound' ? enhancement.recipes.boundRecipeId : enhancement.recipes.unboundRecipeId
  const recipe = data.recipes.find((candidate) => candidate.id === recipeId)
  if (recipe?.kind !== 'enhancement-shard' || recipe.binding !== binding) {
    return { status: 'recipe-variant-unavailable', enhancementId, binding, recipeId }
  }
  return { status: 'resolved', recipe }
}

export const resolveMinimumLevelShardRecipe = (
  data: EssenceCraftingData,
  itemLevel: number,
  binding: EssenceBinding
): EssenceMinimumLevelRecipeResolution => {
  const recipe = data.indexes.minimumLevelRecipeByLevel.get(itemLevel)?.[binding]
  return recipe ? { status: 'resolved', recipe } : { status: 'minimum-level-recipe-unavailable', itemLevel, binding }
}

const resolveEnhancementStep = (
  data: EssenceCraftingData,
  source: EssenceEnhancementSelectionSource,
  enhancementId: string,
  binding: EssenceBinding
): EssenceMaterialStep => {
  const resolution = resolveEnhancementRecipe(data, enhancementId, binding)
  if (resolution.status !== 'resolved') {
    return { status: 'unavailable', source, selection: { enhancementId }, reason: resolution }
  }
  const enhancement = data.indexes.enhancementById.get(enhancementId)
  if (!enhancement) throw new Error(`Resolved enhancement recipe has no enhancement: ${enhancementId}`)
  return {
    status: 'resolved',
    source,
    recipeId: resolution.recipe.id,
    selection: { enhancementId, displayName: enhancement.displayName },
    materials: requirementsToMaterials(data, resolution.recipe.requirements)
  }
}

const isResolvedStep = (step: EssenceMaterialStep): step is EssenceResolvedMaterialStep => step.status === 'resolved'

const effectiveItemLevel = (item: PlannedItem, masterMinimumLevel: number): number =>
  item.minimumLevelOverride ?? masterMinimumLevel

/**
 * Produces the fixed crafting sequence for one item. Extra and its Mark cost
 * are included only when both an Extra is selected and Mark permission is on.
 */
export const calculatePlannedItemMaterials = (
  data: EssenceCraftingData,
  item: PlannedItem,
  masterMinimumLevel: number,
  binding: EssenceBinding
): EssencePlannedItemMaterials => {
  const itemLevel = effectiveItemLevel(item, masterMinimumLevel)
  const minimumLevelResolution = resolveMinimumLevelShardRecipe(data, itemLevel, binding)
  const steps: EssenceMaterialStep[] = []

  if (minimumLevelResolution.status === 'resolved') {
    steps.push({
      status: 'resolved',
      source: 'minimum-level-shard',
      recipeId: minimumLevelResolution.recipe.id,
      materials: requirementsToMaterials(data, minimumLevelResolution.recipe.requirements)
    })
  } else {
    steps.push({ status: 'unavailable', source: 'minimum-level-shard', reason: minimumLevelResolution })
  }

  if (item.prefixEnhancementId) steps.push(resolveEnhancementStep(data, 'prefix', item.prefixEnhancementId, binding))
  if (item.suffixEnhancementId) steps.push(resolveEnhancementStep(data, 'suffix', item.suffixEnhancementId, binding))

  if (item.hasCannithMark && item.extraEnhancementId) {
    steps.push(resolveEnhancementStep(data, 'extra', item.extraEnhancementId, binding))
    const markRequirement = data.rules.extraAffix.markRequirement
    const markIngredient = data.indexes.ingredientById.get(markRequirement.ingredientId)
    if (markIngredient) {
      steps.push({
        status: 'resolved',
        source: 'mark-of-house-cannith',
        materials: [toMaterial(markIngredient, markRequirement.quantity)]
      })
    }
  }

  return {
    effectiveItemLevel: itemLevel,
    steps,
    materials: aggregateMaterialsByIngredientId(steps.filter(isResolvedStep).flatMap((step) => step.materials))
  }
}

/** Calculates materials only for the plan's active equipment slots. */
export const calculatePlanMaterials = (
  data: EssenceCraftingData,
  plan: EssencePlanState,
  binding: EssenceBinding
): EssencePlanMaterials => {
  const items = plan.activeSlotIds.flatMap((equipmentSlotId) => {
    const item = plan.itemsBySlotId[equipmentSlotId]
    return item
      ? [
          {
            equipmentSlotId,
            ...calculatePlannedItemMaterials(data, item, plan.masterMinimumLevel, binding)
          }
        ]
      : []
  })
  return { items, materials: aggregateMaterialsByIngredientId(items.flatMap((item) => item.materials)) }
}
