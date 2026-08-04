import { loadDataset, loadManualPayload } from '../../shared/data/loadDataset.ts'

export interface IncrediblePotentialEffect {
  name: string
  modifier?: number | string
  bonus?: string
  notes?: string
}

export interface IncrediblePotentialRing {
  pageTitle: string
  name: string
  type: string
  minLevel: string
  enchantments: IncrediblePotentialEffect[]
  setName: string
}

export interface AltarRecipe {
  recipeId: number
  name: string
  device: string
  ingredients: string[]
  removed: string | null
  added: IncrediblePotentialEffect[] | null
}

export interface IngredientMetadata {
  name: string
  foundIn: string[]
}

export interface IncrediblePotentialData {
  rings: IncrediblePotentialRing[]
  recipes: AltarRecipe[]
  ingredients: IngredientMetadata[]
}

export class InvalidIncrediblePotentialDataError extends Error {
  constructor(message = 'The Incredible Potential data does not match the expected format.') {
    super(message)
    this.name = 'InvalidIncrediblePotentialDataError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isEffect = (value: unknown): value is IncrediblePotentialEffect => {
  if (!isRecord(value) || typeof value.name !== 'string' || value.name.length === 0) return false

  return (
    (value.modifier === undefined ||
      typeof value.modifier === 'string' ||
      (typeof value.modifier === 'number' && Number.isFinite(value.modifier))) &&
    (value.bonus === undefined || typeof value.bonus === 'string') &&
    (value.notes === undefined || typeof value.notes === 'string')
  )
}

const isRing = (value: unknown): value is Omit<IncrediblePotentialRing, 'setName'> =>
  isRecord(value) &&
  typeof value.pageTitle === 'string' &&
  typeof value.name === 'string' &&
  value.name.length > 0 &&
  typeof value.type === 'string' &&
  typeof value.minLevel === 'string' &&
  Array.isArray(value.enchantments) &&
  value.enchantments.every(isEffect)

const isRecipe = (value: unknown): value is AltarRecipe =>
  isRecord(value) &&
  typeof value.recipeId === 'number' &&
  Number.isFinite(value.recipeId) &&
  typeof value.name === 'string' &&
  value.name.length > 0 &&
  typeof value.device === 'string' &&
  Array.isArray(value.ingredients) &&
  value.ingredients.every((ingredient) => typeof ingredient === 'string' && ingredient.length > 0) &&
  (value.removed === null || typeof value.removed === 'string') &&
  (value.added === null || (Array.isArray(value.added) && value.added.every(isEffect)))

const assertUnique = (values: string[] | number[], label: string) => {
  const seen = new Set<string | number>()

  for (const value of values) {
    if (seen.has(value)) throw new InvalidIncrediblePotentialDataError(`Duplicate ${label}: ${String(value)}`)
    seen.add(value)
  }
}

export const parseRings = (value: unknown): Omit<IncrediblePotentialRing, 'setName'>[] => {
  if (!Array.isArray(value) || !value.every(isRing)) throw new InvalidIncrediblePotentialDataError('Invalid ring data.')

  assertUnique(
    value.map(({ name }) => name),
    'ring name'
  )

  for (const ring of value) {
    if (!Number.isFinite(Number(ring.minLevel))) {
      throw new InvalidIncrediblePotentialDataError(`Invalid minimum level for ${ring.name}.`)
    }

    const placeholders = ring.enchantments.filter(({ name }) => name === 'Incredible Potential')
    if (placeholders.length !== 1) {
      throw new InvalidIncrediblePotentialDataError(
        `Expected one Incredible Potential placeholder for ${ring.name}, found ${placeholders.length.toString()}.`
      )
    }
  }

  return value
}

export const parseRecipes = (value: unknown): AltarRecipe[] => {
  if (!Array.isArray(value) || !value.every(isRecipe)) {
    throw new InvalidIncrediblePotentialDataError('Invalid Altar of Subjugation recipe data.')
  }

  const upgrades = value.filter(({ removed }) => removed === 'Incredible Potential')
  assertUnique(
    upgrades.map(({ recipeId }) => recipeId),
    'ring upgrade recipe ID'
  )
  assertUnique(
    upgrades.map(({ name }) => name),
    'ring upgrade recipe name'
  )

  for (const upgrade of upgrades) {
    if (!upgrade.added || upgrade.added.length === 0) {
      throw new InvalidIncrediblePotentialDataError(`Ring upgrade ${upgrade.name} has no added effect.`)
    }
  }

  return value
}

export const parseIngredients = (value: unknown): IngredientMetadata[] => {
  if (!Array.isArray(value)) throw new InvalidIncrediblePotentialDataError('Invalid ingredient data.')

  const ingredients = value.map((entry): IngredientMetadata => {
    if (!isRecord(entry) || typeof entry.name !== 'string' || entry.name.length === 0) {
      throw new InvalidIncrediblePotentialDataError('Invalid ingredient data.')
    }

    if (
      entry.foundIn !== undefined &&
      entry.foundIn !== null &&
      (!Array.isArray(entry.foundIn) || !entry.foundIn.every((location) => typeof location === 'string'))
    ) {
      throw new InvalidIncrediblePotentialDataError(`Invalid acquisition data for ${entry.name}.`)
    }

    return { name: entry.name, foundIn: entry.foundIn ?? [] }
  })

  assertUnique(
    ingredients.map(({ name }) => name),
    'ingredient name'
  )
  return ingredients
}

export const parseItemSetIndex = (value: unknown): Record<string, { name: string; minLevel: number }[]> => {
  if (!isRecord(value)) throw new InvalidIncrediblePotentialDataError('Invalid item-set index data.')

  for (const entries of Object.values(value)) {
    if (
      !Array.isArray(entries) ||
      !entries.every(
        (entry) =>
          isRecord(entry) &&
          typeof entry.name === 'string' &&
          typeof entry.minLevel === 'number' &&
          Number.isFinite(entry.minLevel)
      )
    ) {
      throw new InvalidIncrediblePotentialDataError('Invalid item-set index data.')
    }
  }

  return value as Record<string, { name: string; minLevel: number }[]>
}

export const joinRingSets = (
  rings: Omit<IncrediblePotentialRing, 'setName'>[],
  itemSets: Record<string, { name: string; minLevel: number }[]>
): IncrediblePotentialRing[] =>
  rings.map((ring) => {
    const matches = Object.entries(itemSets).filter(([, items]) =>
      items.some(({ name, minLevel }) => name === ring.name && minLevel === Number(ring.minLevel))
    )

    if (matches.length !== 1) {
      throw new InvalidIncrediblePotentialDataError(
        `Expected one item-set match for ${ring.name}, found ${matches.length.toString()}.`
      )
    }

    return { ...ring, setName: matches[0][0] }
  })

export const loadIncrediblePotentialData = async (): Promise<IncrediblePotentialData> => {
  const [ringsValue, recipesValue, itemSetsValue, ingredientsValue] = await Promise.all([
    loadDataset<unknown>('incredible-potential'),
    loadManualPayload<unknown>('altarOfSubjugation.recipes'),
    loadDataset<unknown>('item-sets'),
    loadManualPayload<unknown>('ingredients')
  ])

  return {
    rings: joinRingSets(parseRings(ringsValue), parseItemSetIndex(itemSetsValue)),
    recipes: parseRecipes(recipesValue),
    ingredients: parseIngredients(ingredientsValue)
  }
}
