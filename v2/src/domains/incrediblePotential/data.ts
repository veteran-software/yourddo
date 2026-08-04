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

interface PublishedIncrediblePotentialRing extends Omit<IncrediblePotentialRing, 'setName'> {
  setBonus: { name: string }[]
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

const isSetBonus = (value: unknown): value is { name: string } => isRecord(value) && typeof value.name === 'string'

const isRing = (value: unknown): value is PublishedIncrediblePotentialRing =>
  isRecord(value) &&
  typeof value.pageTitle === 'string' &&
  typeof value.name === 'string' &&
  value.name.length > 0 &&
  typeof value.type === 'string' &&
  typeof value.minLevel === 'string' &&
  Array.isArray(value.enchantments) &&
  value.enchantments.every(isEffect) &&
  Array.isArray(value.setBonus) &&
  value.setBonus.every(isSetBonus)

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

export const parseRings = (value: unknown): IncrediblePotentialRing[] => {
  if (!Array.isArray(value) || !value.every(isRing)) throw new InvalidIncrediblePotentialDataError('Invalid ring data.')

  assertUnique(
    value.map(({ name }) => name),
    'ring name'
  )

  for (const ring of value) {
    if (!Number.isFinite(Number(ring.minLevel))) {
      throw new InvalidIncrediblePotentialDataError(`Invalid minimum level for ${ring.name}.`)
    }

    if (ring.setBonus.length !== 1) {
      throw new InvalidIncrediblePotentialDataError(
        `Expected one set bonus for ${ring.name}, found ${ring.setBonus.length.toString()}.`
      )
    }

    if (ring.setBonus[0].name.trim().length === 0) {
      throw new InvalidIncrediblePotentialDataError(`Invalid set bonus for ${ring.name}.`)
    }

    const placeholders = ring.enchantments.filter(({ name }) => name === 'Incredible Potential')
    if (placeholders.length !== 1) {
      throw new InvalidIncrediblePotentialDataError(
        `Expected one Incredible Potential placeholder for ${ring.name}, found ${placeholders.length.toString()}.`
      )
    }
  }

  return value.map(({ pageTitle, name, type, minLevel, enchantments, setBonus }) => ({
    pageTitle,
    name,
    type,
    minLevel,
    enchantments,
    setName: setBonus[0].name
  }))
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

export const loadIncrediblePotentialData = async (): Promise<IncrediblePotentialData> => {
  const [ringsValue, recipesValue, ingredientsValue] = await Promise.all([
    loadDataset<unknown>('incredible-potential'),
    loadManualPayload<unknown>('altarOfSubjugation.recipes'),
    loadManualPayload<unknown>('ingredients')
  ])

  return {
    rings: parseRings(ringsValue),
    recipes: parseRecipes(recipesValue),
    ingredients: parseIngredients(ingredientsValue)
  }
}
