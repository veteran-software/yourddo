import { loadManualPayload } from '../../shared/data/loadDataset.ts'

export type RecipeTier = 'Heroic' | 'Legendary'

export interface NearlyCompleteRecipeEffect {
  name: string
  modifier?: string
  bonus?: string
}

export interface NearlyCompleteRequirement {
  name: string
  quantity?: number
  requirements: NearlyCompleteRequirement[]
}

export interface NearlyCompleteRecipe {
  name: string
  quantity: number
  craftedIn: string
  effectsAdded: NearlyCompleteRecipeEffect[]
  effectsRemoved: NearlyCompleteRecipeEffect[]
  requirements: NearlyCompleteRequirement[]
}

export type NearlyCompleteRecipes = NearlyCompleteRecipe[]

export const loadNearlyCompleteRecipes = (): Promise<NearlyCompleteRecipes> =>
  loadManualPayload<NearlyCompleteRecipes>('nearlyComplete.recipes')

export const getRecipeCategory = (recipe: NearlyCompleteRecipe): string =>
  recipe.effectsRemoved[0].name.replace('Nearly Complete: ', '')

export const getRecipeTier = (recipe: NearlyCompleteRecipe): RecipeTier =>
  recipe.requirements[0]?.name.startsWith('Legendary ') ? 'Legendary' : 'Heroic'

export const getRecipeCategories = (recipes: NearlyCompleteRecipes, tier: RecipeTier): string[] =>
  [...new Set(recipes.filter((recipe) => getRecipeTier(recipe) === tier).map(getRecipeCategory))].sort((a, b) =>
    a.localeCompare(b)
  )

export const getRecipes = (
  recipes: NearlyCompleteRecipes,
  tier: RecipeTier,
  category: string
): NearlyCompleteRecipe[] =>
  recipes
    .filter((recipe) => getRecipeTier(recipe) === tier && getRecipeCategory(recipe) === category)
    .toSorted((a, b) => a.name.localeCompare(b.name))
