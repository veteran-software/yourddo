import recipesData from './recipes.json'

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

export const nearlyCompleteRecipes = recipesData as NearlyCompleteRecipe[]

export const getRecipeCategory = (recipe: NearlyCompleteRecipe): string =>
  recipe.effectsRemoved[0].name.replace('Nearly Complete: ', '')

export const getRecipeTier = (recipe: NearlyCompleteRecipe): RecipeTier =>
  recipe.requirements[0]?.name.startsWith('Legendary ') ? 'Legendary' : 'Heroic'

export const getRecipeCategories = (tier: RecipeTier): string[] =>
  [...new Set(nearlyCompleteRecipes.filter((recipe) => getRecipeTier(recipe) === tier).map(getRecipeCategory))].sort(
    (a, b) => a.localeCompare(b)
  )

export const getRecipes = (tier: RecipeTier, category: string): NearlyCompleteRecipe[] =>
  nearlyCompleteRecipes
    .filter((recipe) => getRecipeTier(recipe) === tier && getRecipeCategory(recipe) === category)
    .toSorted((a, b) => a.name.localeCompare(b.name))
