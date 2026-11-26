import { loadItemSetResource } from '../../shared/data/loadItemSetResource.ts'
import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import { isVisibleEffect } from '../../shared/data/visibleEffect'

const domain = 'incredible-potential'
const potential = 'Incredible Potential'
const mediumEnergyCell = 'Shavarath Medium Energy Cell'

export interface IncrediblePotentialEffect {
  name: string
  modifier?: number | string
  bonus?: string
  notes?: string
}

export interface IncrediblePotentialRing {
  id: number
  name: string
  type: string
  minLevel: number
  enchantments: IncrediblePotentialEffect[]
  setName?: string
}

export interface RecipeIngredient {
  name: string
  quantity: number
  recipeId?: number
}

interface Recipe {
  recipeId: number
  name: string
  ingredients: RecipeIngredient[]
}

export interface RingUpgrade extends Recipe {
  stage: 'ringUpgrade'
  added: IncrediblePotentialEffect[]
  ringIds: number[]
}

export type AltarRecipe = RingUpgrade | (Recipe & { stage: 'component' | 'shardImbuement' })

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

function record(value: unknown, label: string): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(Object.entries(value))
  }
  throw new InvalidIncrediblePotentialDataError('Invalid ' + label)
}

function list(value: unknown, label: string): unknown[] {
  if (Array.isArray(value)) return value
  throw new InvalidIncrediblePotentialDataError('Invalid ' + label)
}

function nameOf(value: unknown, label: string): string {
  if (typeof value === 'string' && value.trim()) return value
  throw new InvalidIncrediblePotentialDataError('Invalid ' + label)
}

function positiveInteger(value: unknown, label: string): number {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return value
  throw new InvalidIncrediblePotentialDataError('Invalid ' + label)
}

function indexById<T extends { id: number }>(rows: T[], label: string): Map<number, T> {
  const indexed = new Map(rows.map((row) => [row.id, row]))
  if (indexed.size !== rows.length) throw new InvalidIncrediblePotentialDataError('Duplicate ID in ' + label)
  return indexed
}

function resolveId<T>(index: ReadonlyMap<number, T>, value: unknown, label: string): T {
  const id = positiveInteger(value, label)
  const entry = index.get(id)
  if (!entry) throw new InvalidIncrediblePotentialDataError(`Missing ${label} ${id.toString()}`)
  return entry
}

function parseEffect(value: unknown) {
  const effect = record(value, 'effect')
  return {
    id: positiveInteger(effect.id, 'effect ID'),
    name: typeof effect.displayName === 'string' ? effect.displayName : '',
    description: typeof effect.description === 'string' ? effect.description.trim() : '',
    enchantments: list(effect.enchantments, 'effect enchantments'),
    visible: isVisibleEffect(effect)
  }
}

function displayEffect(effect: ReturnType<typeof parseEffect>): IncrediblePotentialEffect[] {
  if (!effect.visible) return []

  // Burst effects describe an on-hit proc. Their modifiers target the enemy and are not worn stats.
  const stats = effect.name.endsWith(' Burst')
    ? []
    : effect.enchantments.flatMap((value): IncrediblePotentialEffect[] => {
        const stat = record(value, 'enchantment')
        if (stat.internal === true || !isVisibleEffect(stat) || typeof stat.displayName !== 'string') return []
        if (typeof stat.value !== 'number' || !Number.isFinite(stat.value)) return []

        if (stat.operation === 'Multiply' && stat.unit === 'multiplier') {
          const percent = Math.round((1 - stat.value) * 10000) / 100
          return [{ name: stat.displayName, modifier: `${percent.toString()}%` }]
        }

        return [
          {
            name: stat.displayName,
            modifier: stat.value,
            bonus: typeof stat.bonusType === 'string' ? stat.bonusType : undefined
          }
        ]
      })

  return stats.length ? stats : [{ name: nameOf(effect.name, 'effect name'), notes: effect.description }]
}

function parseItem(row: unknown) {
  const item = record(row, 'item')
  const name = nameOf(item.name, 'item name')
  const sources = list(item.sources ?? [], 'item sources').flatMap((value) => {
    const source = record(value, 'item source')
    if (source.kind === 'crafting_device' || source.kind === 'store_catalog') return []
    return [nameOf(source.name, 'source name')]
  })
  return { id: positiveInteger(item.id, 'item ID'), name, foundIn: [...new Set(sources)] }
}

function parseCatalog(
  baseValue: unknown,
  ingredientsValue: unknown,
  effectsValue: unknown,
  recipesValue: unknown,
  setValue: unknown
): IncrediblePotentialData {
  const bases = list(baseValue, 'base items').map((value) => record(value, 'base item'))
  const ingredients = list(ingredientsValue, 'ingredients').map(parseItem)
  const items = indexById([...bases.map(parseItem), ...ingredients], 'materials')
  const effects = indexById(list(effectsValue, 'effects').map(parseEffect), 'effects')

  const setNames = new Set(
    list(setValue, 'item sets').map((value) => nameOf(record(value, 'item set').name, 'set name'))
  )
  const rings = bases
    .filter((item) => item.craftingRole === 'ring')
    .map((item): IncrediblePotentialRing => {
      const { id, name } = resolveId(items, item.id, 'ring')
      const minLevel = positiveInteger(item.minimumLevel, 'ring level')
      const ringEffects = list(item.effects, 'ring effects').map((value) =>
        resolveId(effects, record(value, 'ring effect').effectId, 'ring effect')
      )
      const setEffect = ringEffects.find((effect) => effect.visible && setNames.has(effect.name))
      const enchantments = ringEffects.filter((effect) => effect !== setEffect).flatMap(displayEffect)
      if (!enchantments.some((effect) => effect.name === potential)) {
        throw new InvalidIncrediblePotentialDataError(`Missing Incredible Potential effect on ${name}`)
      }
      return {
        id,
        name,
        type: nameOf(item.itemType, 'ring type'),
        minLevel,
        setName: setEffect?.name,
        enchantments
      }
    })
    .toSorted((a, b) => a.name.localeCompare(b.name))

  const recipeRows = list(recipesValue, 'recipes').map((value) => {
    const recipe = record(value, 'recipe')
    return {
      raw: recipe,
      id: positiveInteger(recipe.id, 'recipe ID'),
      name: nameOf(recipe.name, 'recipe name'),
      stage: recipe.stage
    }
  })
  const recipesById = indexById(recipeRows, 'recipes')
  const components = new Map<number, number>()
  for (const recipe of recipeRows) {
    if (recipe.stage !== 'component' || recipe.name === mediumEnergyCell) continue
    const output = resolveId(items, recipe.raw.outputItemId, 'component output')
    if (components.has(output.id) || recipe.raw.quantity !== 1) {
      throw new InvalidIncrediblePotentialDataError(`Unsupported component output for ${recipe.name}`)
    }
    components.set(output.id, recipe.id)
  }

  const recipes = recipeRows.flatMap((recipe): AltarRecipe[] => {
    const { id: recipeId, name, stage } = recipe
    if (stage === 'ringReset' || (stage === 'component' && name === mediumEnergyCell)) return []
    if (stage !== 'shardImbuement' && stage !== 'component' && stage !== 'ringUpgrade') {
      throw new InvalidIncrediblePotentialDataError(`Invalid recipe stage for ${name}`)
    }

    const inputs = list(recipe.raw.ingredients, 'recipe ingredients').map((value): RecipeIngredient => {
      const input = record(value, 'recipe ingredient')
      const quantity = positiveInteger(input.quantity, 'ingredient quantity')
      const material = resolveId(items, input.ingredientId ?? input.itemId, 'recipe material')
      if (input.preparationRecipeId !== undefined) {
        const prep = resolveId(recipesById, input.preparationRecipeId, 'preparation recipe')
        return { name: prep.name, quantity, recipeId: prep.id }
      }
      return { name: material.name, quantity, recipeId: components.get(material.id) }
    })

    if (stage === 'component') return [{ recipeId, name, stage, ingredients: inputs }]
    const keeper = record(recipe.raw.keeper, 'recipe keeper')
    if (stage === 'shardImbuement') {
      const shard = resolveId(items, keeper.itemId, 'base shard')
      return [{ recipeId, name, stage, ingredients: [...inputs, { name: shard.name, quantity: 1 }] }]
    }

    const ringIds = list(keeper.itemIds, 'eligible rings').map((value) => positiveInteger(value, 'eligible ring ID'))
    const added = list(recipe.raw.addEffectIds, 'added effects').flatMap((id) =>
      displayEffect(resolveId(effects, id, 'added effect'))
    )
    if (!added.length || !ringIds.length || ringIds.some((id) => !rings.some((ring) => ring.id === id))) {
      throw new InvalidIncrediblePotentialDataError(`Invalid effect or eligible rings for ${name}`)
    }
    return [{ recipeId, name, stage, ingredients: inputs, added, ringIds }]
  })

  return { rings, recipes, ingredients: [...items.values()] }
}

export async function loadIncrediblePotentialData(): Promise<IncrediblePotentialData> {
  const manifest = record(await loadDatasetFile<unknown>(`${domain}/manifest.json`), 'crafting manifest')
  if (manifest.system !== domain) throw new InvalidIncrediblePotentialDataError('Invalid crafting manifest system')
  const resources = record(manifest.resources, 'crafting resources')
  const read = (key: string) => {
    const path = nameOf(resources[key], key)
    if (!/^(?:[\w-]+\/)*[\w-]+\.json$/.test(path))
      throw new InvalidIncrediblePotentialDataError('Invalid path for ' + key)
    return loadDatasetFile<unknown>(`${domain}/${path}`)
  }
  const [bases, ingredients, effects, recipes, sets] = await Promise.all([
    read('baseItems'),
    read('ingredients'),
    read('effects'),
    read('recipes'),
    loadItemSetResource('itemSets')
  ])
  return parseCatalog(bases, ingredients, effects, recipes, sets)
}
