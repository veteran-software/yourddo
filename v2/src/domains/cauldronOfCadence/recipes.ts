import { loadManualPayload } from '../../shared/data/loadDataset.ts'

export interface CauldronEffect {
  name: string
  modifier: number | string
  bonus?: string
}

export interface CauldronSetBonus {
  name: string
  numPiecesEquipped: number
  enhancements: CauldronEffect[]
}

export interface CauldronRequirement {
  name: string
  quantity: number
}

export interface CauldronRecipe {
  augmentType: string
  baseValue: { platinum: number }
  binding: {
    type: string
    to: string
    from: string
  }
  craftedIn: string
  description: string
  image: string
  minimumLevel: number
  name: string
  quantity: number
  requirements: CauldronRequirement[]
  setBonus: CauldronSetBonus[]
  weight: number
}

export type CauldronRecipes = CauldronRecipe[]

export interface CauldronOption {
  value: string
  label: string
  disabled: boolean
}

export class InvalidCauldronRecipesError extends Error {
  constructor() {
    super('The Cauldron of Cadence recipe data is invalid.')
    this.name = 'InvalidCauldronRecipesError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isEffect = (value: unknown): value is CauldronEffect => {
  if (!isRecord(value)) return false

  return (
    typeof value.name === 'string' &&
    (typeof value.modifier === 'number' || typeof value.modifier === 'string') &&
    (value.bonus === undefined || typeof value.bonus === 'string')
  )
}

const isRequirement = (value: unknown): value is CauldronRequirement =>
  isRecord(value) && typeof value.name === 'string' && typeof value.quantity === 'number'

const isSetBonus = (value: unknown): value is CauldronSetBonus =>
  isRecord(value) &&
  typeof value.name === 'string' &&
  typeof value.numPiecesEquipped === 'number' &&
  Array.isArray(value.enhancements) &&
  value.enhancements.every(isEffect)

const isRecipe = (value: unknown): value is CauldronRecipe => {
  if (!isRecord(value) || !isRecord(value.baseValue) || !isRecord(value.binding)) return false

  return (
    typeof value.augmentType === 'string' &&
    typeof value.baseValue.platinum === 'number' &&
    typeof value.binding.type === 'string' &&
    typeof value.binding.to === 'string' &&
    typeof value.binding.from === 'string' &&
    typeof value.craftedIn === 'string' &&
    typeof value.description === 'string' &&
    typeof value.image === 'string' &&
    typeof value.minimumLevel === 'number' &&
    typeof value.name === 'string' &&
    typeof value.quantity === 'number' &&
    Array.isArray(value.requirements) &&
    value.requirements.length > 0 &&
    value.requirements.every(isRequirement) &&
    Array.isArray(value.setBonus) &&
    value.setBonus.length > 0 &&
    value.setBonus.every(isSetBonus) &&
    typeof value.weight === 'number'
  )
}

export const loadCauldronRecipes = async (): Promise<CauldronRecipes> => {
  const value = await loadManualPayload<unknown>('cauldronOfCadence.recipes')

  if (!Array.isArray(value) || !value.every(isRecipe)) throw new InvalidCauldronRecipesError()

  return value
}

export const getRequiredItemName = (recipe: CauldronRecipe): string => recipe.requirements.at(-1)?.name ?? ''

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
  `${effect.name} (+${String(effect.modifier)}${effect.bonus ? ` ${effect.bonus}` : ''})`

export const getEffectOptions = (recipes: CauldronRecipes, selectedItem: string | null): CauldronOption[] => {
  const setBonuses = recipes.flatMap((recipe) => recipe.setBonus)
  const uniqueSetBonuses = new Map(setBonuses.map((setBonus) => [setBonus.name, setBonus]))

  return [...uniqueSetBonuses.values()]
    .sort((a, b) => (a.enhancements[0]?.name ?? '').localeCompare(b.enhancements[0]?.name ?? ''))
    .map((setBonus) => {
      const recipe = recipes.find((candidate) => candidate.setBonus.some((bonus) => bonus.name === setBonus.name))

      return {
        value: setBonus.name,
        label: setBonus.enhancements.map(formatEffect).join(', '),
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
