import { baseItemArt } from '../../shared/items/itemArt'
import type { ViktraniumIngredient, ViktraniumRecipe } from './viktranium.types'

export interface NativeViktraniumIngredient extends Record<string, unknown> {
  id: number
  name: string
  description?: string
  sources?: { name: string; availability: string }[]
}

export interface NativeViktraniumRecipe {
  id: number
  outputItemId: number
  device: string
  quantity: number
  ingredients: { ingredientId: number; quantity: number }[]
  knownDiscrepancies?: { stated: string; resolved: string }[]
}

export function buildViktraniumRecipes(
  devices: Readonly<Record<string, { id: number; name: string }>>,
  recipeRows: readonly NativeViktraniumRecipe[],
  ingredientRows: readonly NativeViktraniumIngredient[]
) {
  const indexedIngredients = new Map<number, ViktraniumIngredient>()
  for (const row of ingredientRows) {
    if (indexedIngredients.has(row.id)) throw new Error('Repeated Viktranium ingredient ' + String(row.id))
    indexedIngredients.set(row.id, {
      id: 'ingredient-' + String(row.id),
      name: row.name,
      description: row.description,
      art: baseItemArt('viktranium', row),
      foundIn: [
        ...new Set(
          (row.sources ?? []).map(
            (source) => source.name + (source.availability === 'unverified' ? ' (unverified)' : '')
          )
        )
      ]
    })
  }
  const byOutputId = new Map<number, ViktraniumRecipe[]>()
  for (const row of recipeRows) {
    const device = devices[row.device]
    if (!device) throw new Error('Missing Viktranium crafting device ' + row.device)
    if (row.quantity !== 1 || byOutputId.has(row.outputItemId))
      throw new Error('Unexpected Viktranium recipe output for ' + String(row.outputItemId))
    const requirements = row.ingredients.map(({ ingredientId, quantity }) => {
      const ingredient = indexedIngredients.get(ingredientId)
      if (!ingredient) throw new Error('Missing Viktranium ingredient ' + String(ingredientId))
      if (!Number.isSafeInteger(quantity) || quantity < 1)
        throw new Error('Invalid recipe quantity for ' + ingredient.name)
      return { ingredientId: ingredient.id, name: ingredient.name, quantity }
    })
    byOutputId.set(row.outputItemId, [
      {
        id: 'recipe-' + String(row.id),
        deviceId: String(device.id),
        device: device.name,
        status: 'complete',
        requirements,
        notes: row.knownDiscrepancies?.map(
          ({ stated, resolved }) => 'The recipe lists ' + stated + ' and produces ' + resolved + '.'
        )
      }
    ])
  }
  return { ingredients: [...indexedIngredients.values()], byOutputId }
}
