import type {
  AltarRecipe,
  IncrediblePotentialData,
  IncrediblePotentialEffect,
  IncrediblePotentialRing,
  IngredientMetadata
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

export const trophyQuantity = 9
export const ringIconUrl = 'https://yourddo.s3.us-east-2.amazonaws.com/icons/ringOfIncrediblePotential.png'
export const unknownIconUrl = 'https://yourddo.s3.us-east-2.amazonaws.com/icons/unknown.png'

export class CyclicAltarRecipeError extends Error {
  constructor(path: string[]) {
    super(`Cyclic Altar of Subjugation recipe dependency: ${path.join(' -> ')}`)
    this.name = 'CyclicAltarRecipeError'
  }
}

export class DuplicateAltarRecipeError extends Error {
  constructor(name: string) {
    super(`Multiple Altar of Subjugation recipes are named ${name}.`)
    this.name = 'DuplicateAltarRecipeError'
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

const quantityFor = (name: string): number => (name === 'Shavarath Trophy of War' ? trophyQuantity : 1)

const buildRecipeLookup = (recipes: AltarRecipe[]): ReadonlyMap<string, AltarRecipe[]> => {
  const lookup = new Map<string, AltarRecipe[]>()

  for (const recipe of recipes) {
    lookup.set(recipe.name, [...(lookup.get(recipe.name) ?? []), recipe])
  }

  return lookup
}

const getSingleRecipe = (recipes: ReadonlyMap<string, AltarRecipe[]>, name: string): AltarRecipe | undefined => {
  const matches = recipes.get(name) ?? []
  if (matches.length > 1) throw new DuplicateAltarRecipeError(name)
  return matches[0]
}

const isExpectedCraftedRequirement = (name: string): boolean =>
  name.startsWith('Focus of ') ||
  name.startsWith('Gem of ') ||
  name.endsWith(' Essence') ||
  (name.endsWith(' Shard of Great Power') && name !== 'Shard of Great Power')

const isLegacyItemPlaceholder = (name: string): boolean => /\bEnchanted (Accessory|Weapon)\b/i.test(name)

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

export const getRingUpgrades = (recipes: AltarRecipe[]): AltarRecipe[] =>
  recipes.filter(({ removed }) => removed === 'Incredible Potential')

export const getRingFilterValues = (ring: IncrediblePotentialRing): string[] => [
  ...ring.enchantments.map(({ name }) => name),
  ring.setName
]

export const getUpgradeFilterValues = (upgrade: AltarRecipe): string[] => upgrade.added?.map(({ name }) => name) ?? []

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
      formattedModifier =
        Math.abs(numericModifier) > 0 && Math.abs(numericModifier) < 1
          ? `${(numericModifier * 100).toString()}%`
          : `${numericModifier >= 0 ? '+' : ''}${numericModifier.toString()}`
    } else {
      formattedModifier = modifier.toString()
    }
  }

  const details = [formattedModifier, bonus].filter(Boolean).join(' ')
  return details ? `${name} (${details})` : name
}

export const buildCraftingPlan = (
  upgrade: AltarRecipe,
  recipes: AltarRecipe[],
  ingredients: IngredientMetadata[]
): CraftingPlan => {
  const rawTotals = new Map<string, number>()
  const craftedTotals = new Map<string, number>()
  const stepRecipes: AltarRecipe[] = []
  const ingredientMetadata = new Map(ingredients.map((ingredient) => [ingredient.name, ingredient]))
  const recipeLookup = buildRecipeLookup(recipes)

  const expand = (name: string, quantity: number, path: string[], parent: string) => {
    const recipe = getSingleRecipe(recipeLookup, name)

    if (!recipe) {
      if (isLegacyItemPlaceholder(name)) return
      if (isExpectedCraftedRequirement(name)) throw new MissingAltarRecipeError(parent, name)
      addTotal(rawTotals, name, quantity)
      return
    }

    const cycleStart = path.indexOf(name)
    if (cycleStart >= 0) throw new CyclicAltarRecipeError([...path.slice(cycleStart), name])

    addTotal(craftedTotals, name, quantity)
    stepRecipes.push(recipe)

    for (const requirement of recipe.ingredients) {
      expand(requirement, quantity * quantityFor(requirement), [...path, name], recipe.name)
    }
  }

  const shardName = upgrade.ingredients.find((name) => name.endsWith(' Shard of Great Power'))
  if (!shardName) throw new MissingUpgradeIngredientError(upgrade.name)

  expand(shardName, 1, [], upgrade.name)
  for (const requirement of upgrade.ingredients.filter((name) => name !== shardName)) {
    expand(requirement, quantityFor(requirement), [], upgrade.name)
  }

  const uniqueSteps = new Map<number, AltarRecipe>()
  for (const recipe of stepRecipes) uniqueSteps.set(recipe.recipeId, recipe)

  const steps = orderStepRecipes([...uniqueSteps.values()]).map((recipe) => ({
    name: recipe.name,
    requirements: recipe.ingredients
      .filter((name) => !isLegacyItemPlaceholder(name))
      .map((name) => ({
        name,
        quantity: quantityFor(name),
        foundIn: ingredientMetadata.get(name)?.foundIn ?? []
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name))
  }))

  steps.push({
    name: upgrade.name,
    requirements: upgrade.ingredients
      .filter((name) => !isLegacyItemPlaceholder(name))
      .map((name) => ({
        name,
        quantity: quantityFor(name),
        foundIn: ingredientMetadata.get(name)?.foundIn ?? []
      }))
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

  const ringOptions = getFilterOptions(data.rings, getRingFilterValues)
  for (const option of ringOptions) {
    if (!data.rings.some((ring) => getRingFilterValues(ring).includes(option))) {
      throw new Error(`Ring filter option does not match a ring: ${option}`)
    }
  }

  const upgradeOptions = getFilterOptions(upgrades, getUpgradeFilterValues)
  for (const option of upgradeOptions) {
    if (!upgrades.some((upgrade) => getUpgradeFilterValues(upgrade).includes(option))) {
      throw new Error(`Upgrade filter option does not match an upgrade: ${option}`)
    }
  }
}
