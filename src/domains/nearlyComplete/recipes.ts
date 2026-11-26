import { loadNativeNearlyComplete } from '../gearPlanner/nativeUpgradeData'
import type { GearPlannerEffect } from '../gearPlanner/gearPlanner.types'
import { isVisibleEffect } from '../../shared/data/visibleEffect'
import { hasDatasetFile, loadManualPayload } from '../../shared/data/loadDataset.ts'

export type RecipeTier = 'Heroic' | 'Legendary'

export type NearlyCompleteRecipeEffect = GearPlannerEffect

export interface NearlyCompleteRequirement {
  name: string
  quantity?: number
  requirements: NearlyCompleteRequirement[]
}

export interface NearlyCompleteRecipe {
  keeperIds?: readonly number[]
  hostEffects?: ReadonlyMap<number, readonly GearPlannerEffect[]>
  name: string
  quantity: number
  craftedIn: string
  effectsAdded: NearlyCompleteRecipeEffect[]
  effectsRemoved: NearlyCompleteRecipeEffect[]
  requirements: NearlyCompleteRequirement[]
}

export type NearlyCompleteRecipes = NearlyCompleteRecipe[]

export const loadNearlyCompleteRecipes = async (): Promise<NearlyCompleteRecipes> => {
  if (await hasDatasetFile('nearly-complete/enchantment-names.json')) return (await loadNativeNearlyComplete()).recipes
  return loadManualPayload<NearlyCompleteRecipes>('nearlyComplete.recipes').then((recipes) =>
    recipes.map((recipe) => ({
      ...recipe,
      effectsAdded: recipe.effectsAdded.filter(isVisibleEffect),
      effectsRemoved: recipe.effectsRemoved.filter(isVisibleEffect)
    }))
  )
}

export const getRecipeCategory = (recipe: NearlyCompleteRecipe): string =>
  recipe.effectsRemoved[0]?.name.replace('Nearly Complete: ', '') ?? ''

export const getRecipeTier = (recipe: NearlyCompleteRecipe): RecipeTier =>
  recipe.requirements[0]?.name.startsWith('Legendary ') ? 'Legendary' : 'Heroic'

export const getRecipeCategories = (recipes: NearlyCompleteRecipes, tier: RecipeTier): string[] =>
  [
    ...new Set(
      recipes
        .filter((recipe) => getRecipeTier(recipe) === tier)
        .map(getRecipeCategory)
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b))

export const getRecipes = (
  recipes: NearlyCompleteRecipes,
  tier: RecipeTier,
  category: string
): NearlyCompleteRecipe[] =>
  recipes
    .filter((recipe) => getRecipeTier(recipe) === tier && getRecipeCategory(recipe) === category)
    .toSorted((a, b) => a.name.localeCompare(b.name))
