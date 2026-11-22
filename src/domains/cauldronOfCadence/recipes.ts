export { loadCauldronRecipes, InvalidCauldronRecipesError } from './catalog'

export interface CauldronEffect {
  name: string
  modifier: number | string
  bonus?: string
}

export interface CauldronSetBonus {
  name: string
  numPiecesEquipped: number
  discrepancies?: string[]
  enhancements: CauldronEffect[]
}

export interface CauldronRequirement {
  name: string
  quantity: number
}

export interface CauldronRecipe {
  augmentType: string
  requiredItem: string
  restrictions?: string
  binding: {
    type: string
    to: string
    from: string
  }
  craftedIn: string
  description: string
  minimumLevel: number
  name: string
  quantity: number
  requirements: CauldronRequirement[]
  setBonus: CauldronSetBonus[]
}

export type CauldronRecipes = CauldronRecipe[]

export interface CauldronOption {
  value: string
  label: string
  disabled: boolean
  searchText?: string
}

export const getRequiredItemName = (recipe: CauldronRecipe): string => recipe.requiredItem

export const getItemOptions = (recipes: CauldronRecipes, selectedItem: string | null): CauldronOption[] =>
  recipes
    .map(getRequiredItemName)
    .toSorted((a, b) => a.localeCompare(b))
    .map((name) => ({
      value: name,
      label: name,
      disabled: selectedItem !== null && selectedItem !== name
    }))

export const formatEffect = (effect: CauldronEffect): string =>
  `${effect.name} (+${String(effect.modifier)}${effect.bonus ? ' ' + effect.bonus : ''})`

export const getEffectOptions = (recipes: CauldronRecipes, selectedItem: string | null): CauldronOption[] => {
  const setBonuses = recipes.flatMap((recipe) => recipe.setBonus)
  const uniqueSetBonuses = new Map(setBonuses.map((setBonus) => [setBonus.name, setBonus]))

  return [...uniqueSetBonuses.values()]
    .sort((a, b) => (a.enhancements[0]?.name ?? '').localeCompare(b.enhancements[0]?.name ?? ''))
    .map((setBonus) => {
      const recipe = recipes.find((candidate) => candidate.setBonus.some((bonus) => bonus.name === setBonus.name))

      return {
        value: setBonus.name,
        searchText: [setBonus.name, ...setBonus.enhancements.map(formatEffect)].join(' ').toLowerCase(),
        label:
          setBonus.enhancements.length > 2
            ? setBonus.name + ' · ' + String(setBonus.enhancements.length) + ' effects'
            : setBonus.enhancements.map(formatEffect).join(', '),
        disabled: selectedItem !== null && (!recipe || getRequiredItemName(recipe) !== selectedItem)
      }
    })
}

export const findRecipeByItem = (recipes: CauldronRecipes, itemName: string): CauldronRecipe | undefined =>
  recipes.find((recipe) => getRequiredItemName(recipe) === itemName)

export const findRecipeBySetBonus = (recipes: CauldronRecipes, setBonusName: string): CauldronRecipe | undefined =>
  recipes.find((recipe) => recipe.setBonus.some((setBonus) => setBonus.name === setBonusName))

export const findSelectedRecipe = (
  recipes: CauldronRecipes,
  itemName: string,
  setBonusName: string
): CauldronRecipe | undefined => {
  const recipe = findRecipeByItem(recipes, itemName)
  return recipe?.setBonus.some((setBonus) => setBonus.name === setBonusName) ? recipe : undefined
}
