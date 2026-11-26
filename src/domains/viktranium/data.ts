import { addNativeSelectionAliases } from './nativeIds'
import { loadScopedAugmentCatalog } from '../gearPlanner/itemCatalog'
import { getCompatibleAugmentTypes } from '../../shared/augments/compatibility.ts'
import {
  armorTypes,
  clothingTypes,
  jewelryTypes,
  meleeWeaponTypes,
  rangedWeaponTypes,
  shieldTypes,
  throwingWeaponTypes
} from '../../shared/items/categories.ts'
import type {
  ViktraniumAugment,
  ViktraniumCategory,
  ViktraniumData,
  ViktraniumFamily,
  ViktraniumIndexes,
  ViktraniumIngredient,
  ViktraniumItem,
  ViktraniumRecipe,
  ViktraniumRequirement
} from './viktranium.types.ts'

export class InvalidViktraniumDataError extends Error {
  constructor(message: string) {
    super(`Invalid Viktranium data: ${message}`)
    this.name = 'InvalidViktraniumDataError'
  }
}

const familyValues: readonly ViktraniumFamily[] = [
  'heroic-crafted-weapons',
  'heroic-quest-loot',
  'legendary-crafted-weapons',
  'legendary-quest-loot',
  'wicked-crafted-weapons'
]

const recipeDevices: Readonly<Partial<Record<string, ViktraniumFamily>>> = {
  'Heroic Viktranium Experiment Crafting': 'heroic-crafted-weapons',
  'Legendary Viktranium Experiment Crafting': 'legendary-crafted-weapons',
  'Wicked Viktranium Experiment Crafting': 'wicked-crafted-weapons'
}

export const supportedSlotTypes = new Set([
  'Blue',
  'Colorless',
  'Green',
  'Lamordia: Dolorous (Accessory)',
  'Lamordia: Dolorous (Armor)',
  'Lamordia: Dolorous (Weapon)',
  'Lamordia: Melancholic (Accessory)',
  'Lamordia: Melancholic (Armor)',
  'Lamordia: Melancholic (Weapon)',
  'Lamordia: Miserable (Accessory)',
  'Lamordia: Miserable (Weapon)',
  'Lamordia: Woeful (Accessory)',
  'Lamordia: Woeful (Weapon)',
  'Moon',
  'Orange',
  'Purple',
  'Red',
  'Sun',
  'Yellow'
])

export const familyFor = (
  minimumLevel: number,
  recipes: readonly ViktraniumRecipe[],
  owner: string
): ViktraniumFamily => {
  if (recipes.length > 0) {
    const family = recipeDevices[recipes[0]?.device ?? '']
    if (!family || recipes.some(({ device }) => recipeDevices[device] !== family)) {
      throw new InvalidViktraniumDataError(`unrecognized or ambiguous crafting device for ${owner}`)
    }
    return family
  }
  if (minimumLevel < 20) return 'heroic-quest-loot'
  if (minimumLevel > 30) return 'legendary-quest-loot'
  throw new InvalidViktraniumDataError(`item level does not map to an approved family for ${owner}`)
}

export const categoryFor = (type: string, owner: string): ViktraniumCategory => {
  if (type === 'Cloth Armor' || armorTypes.has(type)) return 'Armor'
  if (clothingTypes.has(type)) return 'Clothing'
  if (jewelryTypes.has(type)) return 'Jewelry'
  if (shieldTypes.has(type)) return 'Shields'
  if (meleeWeaponTypes.has(type)) return 'Melee'
  if (rangedWeaponTypes.has(type)) return 'Ranged'
  if (throwingWeaponTypes.has(type)) return 'Throwing'
  if (type === 'Rune Arm') return 'Weapons'
  throw new InvalidViktraniumDataError(`unrecognized item type for ${owner}: ${type}`)
}

export const displayNameFor = (name: string): string => {
  if (name === 'Cruel Baton') return 'Sceptre (Cruel Baton)'
  if (name === 'Legendary Cruel Baton') return 'Legendary Sceptre (Legendary Cruel Baton)'
  if (name === "Warden's Hand Turret") return "Great Crossbow (Warden's Hand Turret)"
  if (name === "Legendary Warden's Hand Turret") {
    return "Legendary Great Crossbow (Legendary Warden's Hand Turret)"
  }
  return name
}

const assertUnique = <T>(values: readonly T[], label: string, identity: (value: T) => string, owner?: string) => {
  const seen = new Set<string>()
  for (const value of values) {
    const id = identity(value)
    if (seen.has(id)) throw new InvalidViktraniumDataError(`duplicate ${label} ID${owner ? ' in ' + owner : ''}: ${id}`)
    seen.add(id)
  }
}

const visitRequirements = (
  requirements: readonly ViktraniumRequirement[],
  ingredients: ReadonlyMap<string, ViktraniumIngredient>,
  ancestors: ReadonlySet<string>
) => {
  for (const requirement of requirements) {
    if (!ingredients.has(requirement.ingredientId)) {
      throw new InvalidViktraniumDataError(`missing ingredient reference: ${requirement.ingredientId}`)
    }
    if (ancestors.has(requirement.ingredientId)) {
      throw new InvalidViktraniumDataError(`cyclic nested requirement: ${requirement.ingredientId}`)
    }
    if (requirement.requirements) {
      visitRequirements(requirement.requirements, ingredients, new Set([...ancestors, requirement.ingredientId]))
    }
  }
}

const buildIndexes = (
  items: readonly ViktraniumItem[],
  augments: readonly ViktraniumAugment[],
  ingredients: readonly ViktraniumIngredient[]
): ViktraniumIndexes => {
  const itemById = new Map(items.map((item) => [item.id, item]))
  const augmentById = new Map(augments.map((augment) => [augment.id, augment]))
  const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]))
  const itemsByFamily = new Map<ViktraniumFamily, ViktraniumItem[]>(familyValues.map((family) => [family, []]))
  for (const item of items) itemsByFamily.get(item.family)?.push(item)
  for (const values of itemsByFamily.values()) values.sort((a, b) => a.displayName.localeCompare(b.displayName))
  const augmentsByType = new Map<string, ViktraniumAugment[]>()
  for (const augment of augments) {
    const values = augmentsByType.get(augment.augmentType) ?? []
    values.push(augment)
    augmentsByType.set(augment.augmentType, values)
  }
  for (const values of augmentsByType.values()) {
    values.sort((a, b) => a.name.localeCompare(b.name) || a.minimumLevel - b.minimumLevel || a.id.localeCompare(b.id))
  }
  return { itemById, itemsByFamily, augmentById, augmentsByType, ingredientById }
}

function validateFilledAugments(item: ViktraniumItem, indexes: ViktraniumIndexes) {
  for (const slot of item.slots) {
    if (!slot.filledAugmentId) continue
    const augment = indexes.augmentById.get(slot.filledAugmentId)
    if (!augment) throw new InvalidViktraniumDataError(`missing filled augment reference for ${item.id}/${slot.id}`)
    const compatibleTypes = slot.compatibleAugmentTypes ?? getCompatibleAugmentTypes(slot.augmentType)
    if (!compatibleTypes.includes(augment.augmentType))
      throw new InvalidViktraniumDataError(`incompatible filled augment for ${item.id}/${slot.id}`)
  }
}

export function assembleViktraniumData(
  items: ViktraniumItem[],
  augments: ViktraniumAugment[],
  ingredients: ViktraniumIngredient[]
): ViktraniumData {
  if (!items.length || !augments.length || !ingredients.length) {
    throw new InvalidViktraniumDataError('items, augments, and ingredients are required')
  }
  assertUnique(items, 'item', (item) => item.id)
  assertUnique(augments, 'augment', (augment) => augment.id)
  assertUnique(ingredients, 'ingredient', (ingredient) => ingredient.id)
  const indexes = buildIndexes(items, augments, ingredients)
  const recipes = [...items.flatMap((item) => item.recipes), ...augments.flatMap((augment) => augment.recipes)]
  assertUnique(recipes, 'recipe', (recipe) => recipe.id)
  for (const recipe of recipes) {
    visitRequirements(recipe.requirements, indexes.ingredientById, new Set())
  }
  for (const item of items) {
    assertUnique(item.slots, 'slot', (slot) => slot.id, item.id)
    validateFilledAugments(item, indexes)
  }
  return { schemaVersion: 1, items, augments, ingredients, indexes }
}

export async function loadViktraniumData(): Promise<ViktraniumData> {
  const [data, catalog] = await Promise.all([
    import('./nativeData').then(({ loadNativeViktranium }) => loadNativeViktranium()),
    loadScopedAugmentCatalog()
  ])
  if (!catalog) return addNativeSelectionAliases(data)

  const scopedAugments = catalog.entries.flatMap((entry): ViktraniumAugment[] =>
    entry.slotTypes.map((augmentType) => ({
      id: 'augment-' + String(entry.id),
      name: entry.name,
      augmentType,
      minimumLevel: entry.minimumLevel,
      foundIn: [],
      recipes: [],
      scoped: entry,
      effects: []
    }))
  )
  const augments = [...data.augments, ...scopedAugments]
  const indexes = buildIndexes(data.items, augments, data.ingredients)
  return addNativeSelectionAliases({ ...data, augments, enchantmentNames: catalog.names, indexes })
}
