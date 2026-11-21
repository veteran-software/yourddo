import type {
  CraftedIngredientTotal,
  CraftingPlan,
  IngredientTotal,
  ItemCategory,
  MeltingRecipe,
  NearlyFinishedDataset,
  NearlyFinishedEffect,
  NearlyFinishedRequirement,
  ReforgingEntry,
  ShoppingListTotals
} from './nearlyFinished.types.ts'

export const nearlyFinishedPayloadName = 'nearlyFinished.recipes'

const rawMaterialNames = new Set([
  'Iron Defender Claw',
  'Iron Defender Rivet',
  'Iron Juggernaut Part',
  'Iron Juggernaut Plating',
  'Magefire Cannon Core',
  'Magefire Cannon Part',
  'Quorforged Juggernaut Part',
  'Quorforged Juggernaut Plating',
  'Shield Guardian Core',
  'Shield Guardian Gyroscope',
  'Thread of Fate',
  'Worker Drone Actuator',
  'Worker Drone Plating'
])

export class InvalidNearlyFinishedDatasetError extends Error {
  constructor(message = 'The Nearly Finished recipe data does not match the expected format.') {
    super(message)
    this.name = 'InvalidNearlyFinishedDatasetError'
  }
}

export class UnsupportedNearlyFinishedSchemaError extends Error {
  constructor(schemaVersion: unknown) {
    super(`Unsupported Nearly Finished dataset schema version: ${String(schemaVersion)}`)
    this.name = 'UnsupportedNearlyFinishedSchemaError'
  }
}

export class CyclicRecipeDependencyError extends Error {
  constructor(item: string, path: string[]) {
    super(`Cyclic Nearly Finished recipe dependency for ${item}: ${path.join(' -> ')}`)
    this.name = 'CyclicRecipeDependencyError'
  }
}

export class MissingIngredientRecipeError extends Error {
  constructor(item: string, ingredient: string) {
    super(`Missing melting recipe for crafted ingredient ${ingredient} required by ${item}`)
    this.name = 'MissingIngredientRecipeError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isPositiveQuantity = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

const isRequirement = (value: unknown): value is NearlyFinishedRequirement =>
  isRecord(value) && typeof value.name === 'string' && value.name.length > 0 && isPositiveQuantity(value.quantity)

const isEffect = (value: unknown): value is NearlyFinishedEffect =>
  isRecord(value) && typeof value.name === 'string' && value.name.length > 0

const isMeltingRecipe = (value: unknown): value is MeltingRecipe =>
  isRecord(value) &&
  typeof value.name === 'string' &&
  value.name.length > 0 &&
  isPositiveQuantity(value.quantity) &&
  Array.isArray(value.requirements) &&
  value.requirements.every(isRequirement)

const isAugment = (value: unknown): value is { orange?: null; purple?: null } =>
  isRecord(value) &&
  Object.keys(value).length > 0 &&
  Object.entries(value).every(([slot, slotValue]) => (slot === 'orange' || slot === 'purple') && slotValue === null)

const isReforgingEntry = (value: unknown): value is ReforgingEntry =>
  isRecord(value) &&
  typeof value.item === 'string' &&
  value.item.length > 0 &&
  typeof value.stage === 'string' &&
  value.stage.length > 0 &&
  Array.isArray(value.cost) &&
  value.cost.length > 0 &&
  value.cost.every(isRequirement) &&
  (value.choices === undefined || (Array.isArray(value.choices) && value.choices.every(isEffect))) &&
  Array.isArray(value.effectsAdded) &&
  value.effectsAdded.every(isEffect) &&
  (value.augments === undefined || (Array.isArray(value.augments) && value.augments.every(isAugment)))

const assertUniqueNames = (names: string[], label: string) => {
  const seen = new Set<string>()

  for (const name of names) {
    if (seen.has(name)) throw new InvalidNearlyFinishedDatasetError(`Duplicate ${label}: ${name}`)
    seen.add(name)
  }
}

export const hasThreadOfFate = (entry: ReforgingEntry): boolean =>
  entry.cost.some(({ name }) => name === 'Thread of Fate')

export const classifyEntry = (entry: ReforgingEntry): ItemCategory => {
  if (hasThreadOfFate(entry)) return 'Raid'
  if (entry.item.startsWith('Legendary') || entry.item.startsWith('The Legendary')) return 'Legendary'
  return 'Heroic'
}

export const getNearlyFinishedEntries = (dataset: NearlyFinishedDataset): ReforgingEntry[] =>
  dataset.reforgingStation
    .filter(({ stage }) => stage === 'Nearly Finished')
    .toSorted((a, b) => a.item.localeCompare(b.item))

export const getEntriesByCategory = (dataset: NearlyFinishedDataset, category: ItemCategory): ReforgingEntry[] =>
  getNearlyFinishedEntries(dataset).filter((entry) => classifyEntry(entry) === category)

export const buildMeltingRecipeLookup = (recipes: MeltingRecipe[]): ReadonlyMap<string, MeltingRecipe> => {
  assertUniqueNames(
    recipes.map(({ name }) => name),
    'melting recipe'
  )
  return new Map(recipes.map((recipe) => [recipe.name, recipe]))
}

interface Totals {
  raw: Map<string, number>
  crafted: Map<string, number>
}

const addQuantity = (totals: Map<string, number>, name: string, quantity: number) => {
  totals.set(name, (totals.get(name) ?? 0) + quantity)
}

const expandRequirement = (
  requirement: NearlyFinishedRequirement,
  recipes: ReadonlyMap<string, MeltingRecipe>,
  totals: Totals,
  dependencyPath: string[],
  item: string
) => {
  const recipe = recipes.get(requirement.name)

  if (!recipe) {
    if (!rawMaterialNames.has(requirement.name)) throw new MissingIngredientRecipeError(item, requirement.name)
    addQuantity(totals.raw, requirement.name, requirement.quantity)
    return
  }

  const cycleStart = dependencyPath.indexOf(requirement.name)
  if (cycleStart >= 0) {
    throw new CyclicRecipeDependencyError(item, [...dependencyPath.slice(cycleStart), requirement.name])
  }

  addQuantity(totals.crafted, requirement.name, requirement.quantity)
  const nextPath = [...dependencyPath, requirement.name]

  for (const child of recipe.requirements) {
    expandRequirement(
      { name: child.name, quantity: child.quantity * requirement.quantity },
      recipes,
      totals,
      nextPath,
      item
    )
  }
}

const toSortedTotals = (totals: ReadonlyMap<string, number>): IngredientTotal[] =>
  [...totals].map(([name, quantity]) => ({ name, quantity })).toSorted((a, b) => a.name.localeCompare(b.name))

const orderCraftedMaterials = (
  totals: ReadonlyMap<string, number>,
  recipes: ReadonlyMap<string, MeltingRecipe>,
  item: string
): CraftedIngredientTotal[] => {
  const visited = new Set<string>()
  const visiting: string[] = []
  const ordered: CraftedIngredientTotal[] = []

  const visit = (name: string) => {
    if (visited.has(name) || !totals.has(name)) return

    const cycleStart = visiting.indexOf(name)
    if (cycleStart >= 0) throw new CyclicRecipeDependencyError(item, [...visiting.slice(cycleStart), name])

    visiting.push(name)
    const recipe = recipes.get(name)
    for (const requirement of recipe?.requirements ?? []) visit(requirement.name)
    visiting.pop()
    visited.add(name)

    ordered.push({
      name,
      quantity: totals.get(name) ?? 0,
      requirements: recipe?.requirements.map((requirement) => ({ ...requirement })) ?? []
    })
  }

  for (const name of totals.keys()) visit(name)
  return ordered
}

export const buildCraftingPlan = (entry: ReforgingEntry, meltingRecipes: MeltingRecipe[]): CraftingPlan => {
  const recipes = buildMeltingRecipeLookup(meltingRecipes)
  const totals: Totals = { raw: new Map(), crafted: new Map() }

  for (const requirement of entry.cost) expandRequirement(requirement, recipes, totals, [], entry.item)

  return {
    rawMaterials: toSortedTotals(totals.raw),
    craftedMaterials: orderCraftedMaterials(totals.crafted, recipes, entry.item),
    finalStep: {
      item: entry.item,
      quantity: 1,
      requirements: entry.cost.map((requirement) => ({ ...requirement }))
    }
  }
}

export const buildShoppingListTotals = (plan: CraftingPlan): ShoppingListTotals => ({
  rawMaterials: plan.rawMaterials.map((material) => ({ ...material })),
  craftedMaterials: plan.craftedMaterials.map(({ name, quantity }) => ({ name, quantity }))
})

const assertValidCalculatedQuantity = ({ name, quantity }: IngredientTotal) => {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new InvalidNearlyFinishedDatasetError(`Invalid calculated quantity for ${name}: ${String(quantity)}`)
  }
}

const validateDataset = (dataset: NearlyFinishedDataset) => {
  const entries = getNearlyFinishedEntries(dataset)

  assertUniqueNames(
    dataset.reforgingStation.map(({ item, stage }) => `${item}\u0000${stage}`),
    'item and stage entry'
  )
  assertUniqueNames(
    entries.map(({ item }) => item),
    'Nearly Finished item'
  )

  for (const entry of entries) {
    const plan = buildCraftingPlan(entry, dataset.meltingStation)

    plan.rawMaterials.forEach(assertValidCalculatedQuantity)
    plan.craftedMaterials.forEach(assertValidCalculatedQuantity)

    const stepIndex = new Map(plan.craftedMaterials.map(({ name }, index) => [name, index]))
    for (const [index, step] of plan.craftedMaterials.entries()) {
      for (const requirement of step.requirements) {
        const dependencyIndex = stepIndex.get(requirement.name)
        if (dependencyIndex !== undefined && dependencyIndex >= index) {
          throw new InvalidNearlyFinishedDatasetError(
            `Crafted dependency ${requirement.name} is not ordered before ${step.name}`
          )
        }
      }
    }
  }
}

export const parseNearlyFinishedDataset = (value: unknown): NearlyFinishedDataset => {
  if (!isRecord(value)) throw new InvalidNearlyFinishedDatasetError()

  if ('schemaVersion' in value && value.schemaVersion !== 2) {
    throw new UnsupportedNearlyFinishedSchemaError(value.schemaVersion)
  }

  if (
    !Array.isArray(value.meltingStation) ||
    !value.meltingStation.every(isMeltingRecipe) ||
    !Array.isArray(value.reforgingStation) ||
    !value.reforgingStation.every(isReforgingEntry)
  ) {
    throw new InvalidNearlyFinishedDatasetError()
  }

  const dataset: NearlyFinishedDataset = {
    meltingStation: value.meltingStation,
    reforgingStation: value.reforgingStation
  }

  validateDataset(dataset)
  return dataset
}
