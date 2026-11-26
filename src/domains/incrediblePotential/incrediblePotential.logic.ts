import type {
  AltarRecipe,
  IncrediblePotentialData,
  IncrediblePotentialEffect,
  IncrediblePotentialRing,
  IngredientMetadata,
  RecipeIngredient,
  RingUpgrade
} from './data.ts'

export type FilterMode = 'OR' | 'AND'

export interface MaterialTotal {
  name: string
  quantity: number
  foundIn: string[]
}

export interface CraftingStep {
  name: string
  requirements: MaterialTotal[]
}

export interface CraftingPlan {
  rawMaterials: MaterialTotal[]
  craftedMaterials: MaterialTotal[]
  steps: CraftingStep[]
}

export const ringIconUrl = 'https://yourddo.s3.us-east-2.amazonaws.com/icons/ringOfIncrediblePotential.png'
export const unknownIconUrl = 'https://yourddo.s3.us-east-2.amazonaws.com/icons/unknown.png'

export class CyclicAltarRecipeError extends Error {
  constructor(path: string[]) {
    super(`Cyclic Altar of Subjugation recipe dependency: ${path.join(' -> ')}`)
    this.name = 'CyclicAltarRecipeError'
  }
}

export class MissingUpgradeIngredientError extends Error {
  constructor(upgrade: string) {
    super(`The ring upgrade ${upgrade} does not reference an Imbued Shard of Great Power.`)
    this.name = 'MissingUpgradeIngredientError'
  }
}

export class MissingAltarRecipeError extends Error {
  constructor(parent: string, requirement: string) {
    super(`Missing Altar of Subjugation recipe for ${requirement}, required by ${parent}.`)
    this.name = 'MissingAltarRecipeError'
  }
}

export class InvalidCalculatedQuantityError extends Error {
  constructor(name: string, quantity: number) {
    super(`Invalid calculated quantity for ${name}: ${quantity.toString()}.`)
    this.name = 'InvalidCalculatedQuantityError'
  }
}

const addTotal = (totals: Map<string, number>, name: string, quantity: number) => {
  totals.set(name, (totals.get(name) ?? 0) + quantity)
}

const toMaterials = (
  totals: ReadonlyMap<string, number>,
  ingredientMetadata: ReadonlyMap<string, IngredientMetadata>
): MaterialTotal[] =>
  [...totals]
    .map(([name, quantity]) => ({ name, quantity, foundIn: ingredientMetadata.get(name)?.foundIn ?? [] }))
    .toSorted((a, b) => a.name.localeCompare(b.name))

const orderStepRecipes = (recipes: AltarRecipe[]): AltarRecipe[] => {
  const stage = (name: string) => {
    if (name.startsWith('Focus of ')) return 0
    if (name.startsWith('Gem of ')) return 1
    if (name.endsWith(' Essence')) return 2
    return 3
  }

  return recipes.toSorted((a, b) => stage(a.name) - stage(b.name) || a.name.localeCompare(b.name))
}

export const getRingUpgrades = (recipes: AltarRecipe[]): RingUpgrade[] =>
  recipes.filter((recipe) => recipe.stage === 'ringUpgrade')

export const getRingFilterValues = (ring: IncrediblePotentialRing): string[] => [
  ...ring.enchantments.map(({ name }) => name),
  ...(ring.setName ? [ring.setName] : [])
]

export const getUpgradeFilterValues = (upgrade: RingUpgrade): string[] => upgrade.added.map(({ name }) => name)

export const getFilterOptions = <T>(items: T[], getValues: (item: T) => string[]): string[] =>
  [...new Set(items.flatMap(getValues))].toSorted((a, b) => a.localeCompare(b))

export const filterItems = <T>(
  items: T[],
  selectedFilters: string[],
  mode: FilterMode,
  getValues: (item: T) => string[]
): T[] => {
  if (selectedFilters.length === 0) return items

  return items.filter((item) => {
    const values = getValues(item)
    return mode === 'OR'
      ? selectedFilters.some((filter) => values.includes(filter))
      : selectedFilters.every((filter) => values.includes(filter))
  })
}

export const formatEffect = ({ name, modifier, bonus }: IncrediblePotentialEffect): string => {
  let formattedModifier = ''

  if (modifier !== undefined) {
    const numericModifier = typeof modifier === 'number' ? modifier : Number(modifier)
    if (Number.isFinite(numericModifier)) {
      const sign = numericModifier >= 0 ? '+' : ''
      formattedModifier =
        Math.abs(numericModifier) > 0 && Math.abs(numericModifier) < 1
          ? `${(numericModifier * 100).toString()}%`
          : `${sign}${numericModifier.toString()}`
    } else {
      formattedModifier = modifier.toString()
    }
  }

  const details = [formattedModifier, bonus].filter(Boolean).join(' ')
  return details ? `${name} (${details})` : name
}

export const buildCraftingPlan = (
  upgrade: RingUpgrade,
  recipes: AltarRecipe[],
  ingredients: IngredientMetadata[]
): CraftingPlan => {
  const rawTotals = new Map<string, number>()
  const craftedTotals = new Map<string, number>()
  const stepRecipes = new Map<number, AltarRecipe>()
  const ingredientMetadata = new Map(ingredients.map((ingredient) => [ingredient.name, ingredient]))
  const recipeLookup = new Map(recipes.map((recipe) => [recipe.recipeId, recipe]))

  const expand = (
    { name, quantity, recipeId }: RecipeIngredient,
    multiplier: number,
    path: AltarRecipe[],
    parent: string
  ) => {
    const total = quantity * multiplier
    if (recipeId === undefined) {
      addTotal(rawTotals, name, total)
      return
    }

    const recipe = recipeLookup.get(recipeId)
    if (!recipe) throw new MissingAltarRecipeError(parent, name)
    const cycleStart = path.findIndex((step) => step.recipeId === recipeId)
    if (cycleStart >= 0) throw new CyclicAltarRecipeError([...path.slice(cycleStart).map((step) => step.name), name])

    addTotal(craftedTotals, name, total)
    stepRecipes.set(recipeId, recipe)
    for (const requirement of recipe.ingredients) {
      expand(requirement, total, [...path, recipe], recipe.name)
    }
  }

  const hasShard = upgrade.ingredients.some(
    ({ recipeId }) => recipeId !== undefined && recipeLookup.get(recipeId)?.stage === 'shardImbuement'
  )
  for (const requirement of upgrade.ingredients) {
    expand(requirement, 1, [upgrade], upgrade.name)
  }
  if (!hasShard) throw new MissingUpgradeIngredientError(upgrade.name)

  const steps = [...orderStepRecipes([...stepRecipes.values()]), upgrade].map((recipe) => {
    const totals = new Map<string, number>()
    for (const { name, quantity } of recipe.ingredients) addTotal(totals, name, quantity)
    return { name: recipe.name, requirements: toMaterials(totals, ingredientMetadata) }
  })

  return {
    rawMaterials: toMaterials(rawTotals, ingredientMetadata),
    craftedMaterials: toMaterials(craftedTotals, ingredientMetadata),
    steps
  }
}

const assertValidMaterials = (materials: MaterialTotal[]) => {
  for (const { name, quantity } of materials) {
    if (!Number.isFinite(quantity) || quantity <= 0) throw new InvalidCalculatedQuantityError(name, quantity)
  }
}

export const validateIncrediblePotentialData = (data: IncrediblePotentialData): void => {
  const upgrades = getRingUpgrades(data.recipes)

  for (const upgrade of upgrades) {
    const plan = buildCraftingPlan(upgrade, data.recipes, data.ingredients)
    assertValidMaterials(plan.rawMaterials)
    assertValidMaterials(plan.craftedMaterials)
    for (const step of plan.steps) assertValidMaterials(step.requirements)
  }
}
