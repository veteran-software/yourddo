import { getCompatibleAugmentTypes } from '../../shared/augments/compatibility.ts'
import { loadDataset } from '../../shared/data/loadDataset.ts'
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
  RecipeStatus,
  ViktraniumAugment,
  ViktraniumCategory,
  ViktraniumData,
  ViktraniumEffect,
  ViktraniumFamily,
  ViktraniumIndexes,
  ViktraniumIngredient,
  ViktraniumItem,
  ViktraniumLocation,
  ViktraniumRecipe,
  ViktraniumRequirement,
  ViktraniumSlot
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

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const nonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

const parseLevel = (value: unknown, owner: string): number => {
  const level = typeof value === 'string' && value.trim() ? Number(value) : value
  if (typeof level !== 'number' || !Number.isFinite(level) || level < 0) {
    throw new InvalidViktraniumDataError(`invalid minimum level for ${owner}`)
  }
  return level
}

const parseStringArray = (value: unknown, owner: string): string[] => {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value) || !value.every(nonEmptyString)) {
    throw new InvalidViktraniumDataError(`invalid text list for ${owner}`)
  }
  return [...value]
}

const parseEffect = (value: unknown, owner: string): ViktraniumEffect => {
  if (!isRecord(value) || !nonEmptyString(value.name)) {
    throw new InvalidViktraniumDataError(`invalid effect for ${owner}`)
  }
  if (
    value.modifier !== undefined &&
    typeof value.modifier !== 'string' &&
    (typeof value.modifier !== 'number' || !Number.isFinite(value.modifier))
  ) {
    throw new InvalidViktraniumDataError(`invalid effect modifier for ${owner}`)
  }
  return {
    name: value.name,
    ...(value.modifier !== undefined ? { modifier: value.modifier } : {}),
    ...(typeof value.bonus === 'string' ? { bonus: value.bonus } : {}),
    ...(typeof value.notes === 'string' ? { notes: value.notes } : {})
  }
}

const parseRequirement = (value: unknown, owner: string): ViktraniumRequirement => {
  if (
    !isRecord(value) ||
    !nonEmptyString(value.ingredientId) ||
    !nonEmptyString(value.name) ||
    typeof value.quantity !== 'number' ||
    !Number.isFinite(value.quantity) ||
    value.quantity <= 0
  ) {
    throw new InvalidViktraniumDataError(`invalid requirement for ${owner}`)
  }
  return {
    ingredientId: value.ingredientId,
    name: value.name,
    quantity: value.quantity,
    ...(value.requirements !== undefined
      ? { requirements: parseRequirements(value.requirements, `${owner}/${value.name}`) }
      : {})
  }
}

const parseRequirements = (value: unknown, owner: string): ViktraniumRequirement[] => {
  if (!Array.isArray(value)) throw new InvalidViktraniumDataError(`requirements missing for ${owner}`)
  return value.map((requirement) => parseRequirement(requirement, owner))
}

const parseRecipeStatus = (value: unknown, owner: string): RecipeStatus => {
  if (value === undefined) return 'complete'
  if (value === 'complete' || value === 'incomplete' || value === 'unavailable') return value
  throw new InvalidViktraniumDataError(`invalid recipe status for ${owner}`)
}

const parseRecipes = (value: unknown, owner: string): ViktraniumRecipe[] => {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw new InvalidViktraniumDataError(`invalid recipes for ${owner}`)
  return value.map((recipe) => {
    if (
      !isRecord(recipe) ||
      !nonEmptyString(recipe.id) ||
      (!nonEmptyString(recipe.deviceId) && typeof recipe.deviceId !== 'number') ||
      !nonEmptyString(recipe.device)
    ) {
      throw new InvalidViktraniumDataError(`invalid recipe for ${owner}`)
    }
    return {
      id: recipe.id,
      deviceId: String(recipe.deviceId),
      device: recipe.device,
      ...(typeof recipe.productEffect === 'string' ? { productEffect: recipe.productEffect } : {}),
      status: parseRecipeStatus(recipe.status, `${owner}/${recipe.id}`),
      requirements: parseRequirements(recipe.requirements, `${owner}/${recipe.id}`)
    }
  })
}

const familyFor = (minimumLevel: number, recipes: readonly ViktraniumRecipe[], owner: string): ViktraniumFamily => {
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

const categoryFor = (type: string, owner: string): ViktraniumCategory => {
  if (armorTypes.has(type)) return 'Armor'
  if (clothingTypes.has(type)) return 'Clothing'
  if (jewelryTypes.has(type)) return 'Jewelry'
  if (shieldTypes.has(type)) return 'Shields'
  if (meleeWeaponTypes.has(type)) return 'Melee'
  if (rangedWeaponTypes.has(type)) return 'Ranged'
  if (throwingWeaponTypes.has(type)) return 'Throwing'
  if (type === 'Rune Arm') return 'Weapons'
  throw new InvalidViktraniumDataError(`unrecognized item type for ${owner}: ${type}`)
}

const displayNameFor = (name: string): string => {
  if (name === 'Cruel Baton') return 'Sceptre (Cruel Baton)'
  if (name === 'Legendary Cruel Baton') return 'Legendary Sceptre (Legendary Cruel Baton)'
  if (name === "Warden's Hand Turret") return "Great Crossbow (Warden's Hand Turret)"
  if (name === "Legendary Warden's Hand Turret") {
    return "Legendary Great Crossbow (Legendary Warden's Hand Turret)"
  }
  return name
}

const parseSlot = (value: unknown, owner: string): ViktraniumSlot => {
  if (
    !isRecord(value) ||
    !nonEmptyString(value.id) ||
    !nonEmptyString(value.augmentType) ||
    !nonEmptyString(value.label) ||
    typeof value.order !== 'number' ||
    !Number.isInteger(value.order) ||
    value.order < 0
  ) {
    throw new InvalidViktraniumDataError(`invalid slot for ${owner}`)
  }
  if (!supportedSlotTypes.has(value.augmentType)) {
    throw new InvalidViktraniumDataError(`unknown slot type for ${owner}: ${value.augmentType}`)
  }
  const compatible =
    value.compatibleAugmentTypes === undefined
      ? undefined
      : parseStringArray(value.compatibleAugmentTypes, `${owner}/${value.id}`)
  if (compatible?.some((type) => !supportedSlotTypes.has(type))) {
    throw new InvalidViktraniumDataError(`unknown compatible slot type for ${owner}/${value.id}`)
  }
  return {
    id: value.id,
    augmentType: value.augmentType,
    label: value.label,
    order: value.order,
    ...(compatible ? { compatibleAugmentTypes: compatible } : {}),
    ...(nonEmptyString(value.filledAugmentId) ? { filledAugmentId: value.filledAugmentId } : {})
  }
}

const parseBinding = (value: unknown, owner: string): Readonly<Record<string, string>> | undefined => {
  if (value === undefined || value === null) return undefined
  if (!isRecord(value) || !Object.values(value).every((part) => typeof part === 'string')) {
    throw new InvalidViktraniumDataError(`invalid binding for ${owner}`)
  }
  return value as Readonly<Record<string, string>>
}

const parseLocation = (value: unknown, owner: string): ViktraniumLocation => {
  if (!isRecord(value) || !nonEmptyString(value.sourceType)) {
    throw new InvalidViktraniumDataError(`invalid location for ${owner}`)
  }
  return {
    sourceType: value.sourceType,
    ...(typeof value.source === 'string' ? { source: value.source } : {}),
    ...(typeof value.location === 'string' ? { location: value.location } : {}),
    ...(typeof value.difficulty === 'string' ? { difficulty: value.difficulty } : {})
  }
}

const parseItems = (value: unknown): ViktraniumItem[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InvalidViktraniumDataError('items must be a non-empty array')
  }
  return value.map((item) => {
    if (
      !isRecord(item) ||
      !nonEmptyString(item.id) ||
      !nonEmptyString(item.name) ||
      !nonEmptyString(item.pageTitle) ||
      !nonEmptyString(item.type) ||
      !Array.isArray(item.slots) ||
      item.slots.length === 0
    ) {
      throw new InvalidViktraniumDataError('an item is missing required identity or slots')
    }
    const itemId = item.id
    const itemName = item.name
    const itemType = item.type
    const pageTitle = item.pageTitle
    const minimumLevel = parseLevel(item.minimumLevel, itemId)
    const recipes = parseRecipes(item.recipes, itemId)
    const slots = item.slots.map((slot) => parseSlot(slot, itemId)).sort((a, b) => a.order - b.order)
    assertUnique(slots, 'slot', (slot) => slot.id, itemId)
    return {
      id: itemId,
      name: itemName,
      displayName: displayNameFor(itemName),
      pageTitle,
      family: familyFor(minimumLevel, recipes, itemId),
      category: categoryFor(itemType, itemId),
      type: itemType,
      ...(typeof item.description === 'string' ? { description: item.description } : {}),
      minimumLevel,
      ...(parseBinding(item.binding, itemId) ? { binding: parseBinding(item.binding, itemId) } : {}),
      ...(typeof item.material === 'string' ? { material: item.material } : {}),
      enchantments: Array.isArray(item.enchantments)
        ? item.enchantments.map((effect) => parseEffect(effect, itemId))
        : [],
      slots,
      dropLocations: Array.isArray(item.dropLocations)
        ? item.dropLocations.map((location) => parseLocation(location, itemId))
        : [],
      recipes,
      ...(nonEmptyString(item.icon) ? { icon: item.icon } : {}),
      ...(nonEmptyString(item.image) ? { image: item.image } : {}),
      ...(typeof item.notes === 'string' ? { notes: item.notes } : {})
    }
  })
}

const parseAugments = (value: unknown): ViktraniumAugment[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InvalidViktraniumDataError('augments must be a non-empty array')
  }
  return value.map((augment) => {
    if (
      !isRecord(augment) ||
      !nonEmptyString(augment.id) ||
      !nonEmptyString(augment.name) ||
      !nonEmptyString(augment.augmentType) ||
      !supportedSlotTypes.has(augment.augmentType)
    ) {
      throw new InvalidViktraniumDataError('an augment has invalid identity or type')
    }
    const augmentId = augment.id
    const augmentName = augment.name
    const augmentType = augment.augmentType
    return {
      id: augmentId,
      name: augmentName,
      augmentType,
      minimumLevel: parseLevel(augment.minimumLevel, augmentId),
      ...(typeof augment.description === 'string' ? { description: augment.description } : {}),
      effects: Array.isArray(augment.effects) ? augment.effects.map((effect) => parseEffect(effect, augmentId)) : [],
      foundIn: parseStringArray(augment.foundIn, augmentId),
      recipes: parseRecipes(augment.recipes, augmentId),
      ...(nonEmptyString(augment.image) ? { image: augment.image } : {})
    }
  })
}

const parseIngredients = (value: unknown): ViktraniumIngredient[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InvalidViktraniumDataError('ingredients must be a non-empty array')
  }
  return value.map((ingredient) => {
    if (!isRecord(ingredient) || !nonEmptyString(ingredient.id) || !nonEmptyString(ingredient.name)) {
      throw new InvalidViktraniumDataError('an ingredient is missing its identity')
    }
    return {
      id: ingredient.id,
      name: ingredient.name,
      ...(typeof ingredient.description === 'string' ? { description: ingredient.description } : {}),
      foundIn: parseStringArray(ingredient.foundIn, ingredient.id),
      ...(nonEmptyString(ingredient.image) ? { image: ingredient.image } : {})
    }
  })
}

const assertUnique = <T>(values: readonly T[], label: string, identity: (value: T) => string, owner?: string) => {
  const seen = new Set<string>()
  for (const value of values) {
    const id = identity(value)
    if (seen.has(id)) throw new InvalidViktraniumDataError(`duplicate ${label} ID${owner ? ` in ${owner}` : ''}: ${id}`)
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

export const validateViktraniumDataset = (value: unknown): ViktraniumData => {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    throw new InvalidViktraniumDataError(
      `unsupported schema version: ${String(isRecord(value) ? value.schemaVersion : undefined)}`
    )
  }
  const items = parseItems(value.items)
  const augments = parseAugments(value.augments)
  const ingredients = parseIngredients(value.ingredients)
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
    for (const slot of item.slots) {
      if (slot.filledAugmentId) {
        const augment = indexes.augmentById.get(slot.filledAugmentId)
        if (!augment) {
          throw new InvalidViktraniumDataError(`missing filled augment reference for ${item.id}/${slot.id}`)
        }
        const compatibleTypes = slot.compatibleAugmentTypes ?? getCompatibleAugmentTypes(slot.augmentType)
        if (!compatibleTypes.includes(augment.augmentType)) {
          throw new InvalidViktraniumDataError(`incompatible filled augment for ${item.id}/${slot.id}`)
        }
      }
    }
  }
  return { schemaVersion: 1, items, augments, ingredients, indexes }
}

export const loadViktraniumData = async (): Promise<ViktraniumData> =>
  validateViktraniumDataset(await loadDataset<unknown>('viktranium'))
