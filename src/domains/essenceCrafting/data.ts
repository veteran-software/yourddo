import { withScopedAugments } from './scopedAugments'
import { isVisibleEffect } from '../../shared/data/visibleEffect'
import { hasDatasetFile, loadDataset, loadDatasetFile } from '../../shared/data/loadDataset.ts'
import type {
  EssenceAffixPosition,
  EssenceAugment,
  EssenceAugmentSlotPlacement,
  EssenceAugmentSlotType,
  EssenceBinding,
  EssenceByItemLevelModifier,
  EssenceCraftingData,
  EssenceCraftingIndexes,
  EssenceEffect,
  EssenceEnhancement,
  EssenceFixedModifier,
  EssenceIngredient,
  EssenceMinimumLevelRecipe,
  EssenceMinimumLevelShard,
  EssenceModifier,
  EssenceModifierBand,
  EssenceModifierUnit,
  EssenceNamedRecord,
  EssencePlacement,
  EssenceRecipe,
  EssenceRecipeRequirement,
  EssenceRules
} from './essenceCrafting.types.ts'

export class InvalidEssenceCraftingDataError extends Error {
  constructor(message: string) {
    super(`Invalid Essence Crafting data: ${message}`)
    this.name = 'InvalidEssenceCraftingDataError'
  }
}

const affixPositions = new Set<EssenceAffixPosition>(['prefix', 'suffix', 'extra'])
const bindings = new Set<EssenceBinding>(['bound', 'unbound'])
const modifierUnits = new Set<EssenceModifierUnit>(['number', 'percent', 'ratio', 'dice', 'text'])

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const nonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const finiteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const positiveInteger = (value: unknown): value is number => finiteNumber(value) && Number.isInteger(value) && value > 0

const invalid = (message: string): never => {
  throw new InvalidEssenceCraftingDataError(message)
}

const expectRecord = (value: unknown, owner: string): Record<string, unknown> => {
  if (!isRecord(value)) invalid(`invalid record for ${owner}`)
  return value as Record<string, unknown>
}

const expectArray = (value: unknown, owner: string): unknown[] => {
  if (!Array.isArray(value)) invalid(`${owner} must be an array`)
  return value as unknown[]
}

const assertUnique = <T>(
  values: readonly T[],
  label: string,
  identity: (value: T) => string | number,
  owner?: string
) => {
  const seen = new Set<string | number>()
  for (const value of values) {
    const id = identity(value)
    if (seen.has(id)) invalid(`duplicate ${label}${owner ? ' for ' + owner : ''}: ${String(id)}`)
    seen.add(id)
  }
}

const assertReference = (index: ReadonlyMap<string, unknown>, id: string, label: string) => {
  if (!index.has(id)) invalid(`missing ${label} reference: ${id}`)
}

const parseNamedRecord = (value: unknown, owner: string): EssenceNamedRecord => {
  const record = expectRecord(value, owner)
  if (!nonEmptyString(record.id) || !nonEmptyString(record.displayName)) invalid(`invalid identity for ${owner}`)
  return { id: record.id as string, displayName: record.displayName as string }
}

const parseNamedRecords = (value: unknown, label: string): EssenceNamedRecord[] => {
  const records = expectArray(value, label)
  if (records.length === 0) invalid(`${label} must be a non-empty array`)
  const parsed = records.map((entry) => parseNamedRecord(entry, label))
  assertUnique(parsed, label, ({ id }) => id)
  return parsed
}

const parseRequirement = (value: unknown, owner: string): EssenceRecipeRequirement => {
  const record = expectRecord(value, `ingredient requirement for ${owner}`)
  if (record.kind !== 'ingredient' || !nonEmptyString(record.ingredientId) || !positiveInteger(record.quantity)) {
    invalid(`invalid ingredient requirement for ${owner}`)
  }
  return { kind: 'ingredient', ingredientId: record.ingredientId as string, quantity: record.quantity as number }
}

const parseRequirements = (value: unknown, owner: string): EssenceRecipeRequirement[] => {
  const requirements = expectArray(value, `requirements for ${owner}`)
  if (requirements.length === 0) invalid(`requirements must be a non-empty array for ${owner}`)
  const parsed = requirements.map((requirement) => parseRequirement(requirement, owner))
  assertUnique(parsed, 'ingredient requirement', ({ ingredientId }) => ingredientId, owner)
  return parsed
}

const parseDie = (value: unknown, owner: string): string => {
  if (!nonEmptyString(value) || !/^d[1-9]\d*$/u.test(value)) invalid(`invalid die for ${owner}`)
  return value as string
}

const parseModifierBand = (value: unknown, owner: string, minimum: number, maximum: number): EssenceModifierBand => {
  const record = expectRecord(value, `modifier band for ${owner}`)
  if (
    !positiveInteger(record.minimumItemLevel) ||
    !positiveInteger(record.maximumItemLevel) ||
    record.minimumItemLevel > record.maximumItemLevel ||
    record.minimumItemLevel < minimum ||
    record.maximumItemLevel > maximum ||
    !finiteNumber(record.value)
  ) {
    invalid(`invalid modifier band for ${owner}`)
  }
  return {
    minimumItemLevel: record.minimumItemLevel as number,
    maximumItemLevel: record.maximumItemLevel as number,
    value: record.value as number
  }
}

const assertNonOverlappingBands = (bands: readonly EssenceModifierBand[], owner: string) => {
  for (let left = 0; left < bands.length; left += 1) {
    for (let right = left + 1; right < bands.length; right += 1) {
      const a = bands[left]
      const b = bands[right]
      if (a.minimumItemLevel <= b.maximumItemLevel && b.minimumItemLevel <= a.maximumItemLevel) {
        invalid(`overlapping modifier bands for ${owner}`)
      }
    }
  }
}

function parseFixedModifier(
  record: Record<string, unknown>,
  unit: EssenceModifierUnit,
  owner: string
): EssenceFixedModifier {
  if ((unit === 'text' && !nonEmptyString(record.value)) || (unit !== 'text' && !finiteNumber(record.value))) {
    invalid(`invalid fixed modifier value for ${owner}`)
  }
  if (
    (unit === 'dice' && (!positiveInteger(record.value) || record.die === undefined)) ||
    (unit !== 'dice' && record.die !== undefined)
  ) {
    invalid(`invalid fixed dice modifier for ${owner}`)
  }
  return {
    kind: 'fixed',
    unit,
    value: record.value,
    ...(unit === 'dice' ? { die: parseDie(record.die, owner) } : {})
  } as EssenceFixedModifier
}

const parseModifier = (value: unknown, owner: string, minimum: number, maximum: number): EssenceModifier => {
  const record = expectRecord(value, `modifier for ${owner}`)
  if (
    !nonEmptyString(record.kind) ||
    !nonEmptyString(record.unit) ||
    !modifierUnits.has(record.unit as EssenceModifierUnit)
  ) {
    invalid(`invalid modifier for ${owner}`)
  }
  const unit = record.unit as EssenceModifierUnit
  if (record.kind === 'fixed') return parseFixedModifier(record, unit, owner)
  if (record.kind !== 'by-item-level' || unit === 'text') invalid(`unsupported modifier kind for ${owner}`)
  if ((unit === 'dice' && record.die === undefined) || (unit !== 'dice' && record.die !== undefined)) {
    invalid(`invalid item-level dice modifier for ${owner}`)
  }
  const bands = expectArray(record.bands, `modifier bands for ${owner}`)
  if (bands.length === 0) invalid(`modifier bands must be non-empty for ${owner}`)
  const parsedBands = bands.map((band) => parseModifierBand(band, owner, minimum, maximum))
  assertNonOverlappingBands(parsedBands, owner)
  return {
    kind: 'by-item-level',
    unit,
    bands: parsedBands,
    ...(unit === 'dice' ? { die: parseDie(record.die, owner) } : {})
  } as EssenceByItemLevelModifier
}

const parseEffect = (value: unknown, owner: string, minimum: number, maximum: number): EssenceEffect => {
  const record = expectRecord(value, `effect for ${owner}`)
  const identity = parseNamedRecord(record, `effect for ${owner}`)
  if (record.bonusTypeId !== undefined && !nonEmptyString(record.bonusTypeId))
    invalid(`invalid bonus type reference for ${owner}`)
  return {
    ...identity,
    ...(record.bonusTypeId !== undefined ? { bonusTypeId: record.bonusTypeId as string } : {}),
    ...(record.modifier !== undefined
      ? { modifier: parseModifier(record.modifier, identity.id, minimum, maximum) }
      : {})
  }
}

const parsePlacement = (value: unknown, owner: string): EssencePlacement => {
  const record = expectRecord(value, `placement for ${owner}`)
  const itemCategoryIds = expectArray(record.itemCategoryIds, `placement categories for ${owner}`)
  if (
    !affixPositions.has(record.position as EssenceAffixPosition) ||
    itemCategoryIds.length === 0 ||
    !itemCategoryIds.every(nonEmptyString)
  ) {
    invalid(`invalid placement for ${owner}`)
  }
  const ids = [...itemCategoryIds] as string[]
  assertUnique(ids, 'placement item category', (id) => id, owner)
  const floors = record.minimumItemLevels === undefined ? undefined : expectRecord(record.minimumItemLevels, owner)
  if (floors && Object.entries(floors).some(([category, floor]) => !ids.includes(category) || !positiveInteger(floor)))
    invalid(`invalid placement minimum item level for ${owner}`)
  return {
    position: record.position as EssenceAffixPosition,
    itemCategoryIds: ids,
    ...(floors && { minimumItemLevels: floors as Record<string, number> })
  }
}

const parseEnhancement = (value: unknown, minimum: number, maximum: number): EssenceEnhancement => {
  const record = expectRecord(value, 'enhancement')
  const identity = parseNamedRecord(record, 'enhancement')
  const placements = expectArray(record.placements, `placements for ${identity.id}`)
  const effects = expectArray(record.effects, `effects for ${identity.id}`)
  const recipes = expectRecord(record.recipes, `recipes for ${identity.id}`)
  if (
    !positiveInteger(record.minimumItemLevel) ||
    record.minimumItemLevel < minimum ||
    record.minimumItemLevel > maximum ||
    placements.length === 0 ||
    effects.length === 0 ||
    !nonEmptyString(recipes.boundRecipeId) ||
    !nonEmptyString(recipes.unboundRecipeId)
  ) {
    invalid(`invalid enhancement: ${identity.id}`)
  }
  const parsedPlacements = placements.map((placement) => parsePlacement(placement, identity.id))
  const parsedEffects = effects
    .filter(isVisibleEffect)
    .map((effect) => parseEffect(effect, identity.id, minimum, maximum))
  assertUnique(parsedPlacements, 'placement position', ({ position }) => position, identity.id)
  assertUnique(parsedEffects, 'effect', ({ id }) => id, identity.id)
  return {
    ...identity,
    minimumItemLevel: record.minimumItemLevel as number,
    placements: parsedPlacements,
    effects: parsedEffects,
    recipes: { boundRecipeId: recipes.boundRecipeId as string, unboundRecipeId: recipes.unboundRecipeId as string }
  }
}

const parseRecipe = (value: unknown, minimum: number, maximum: number, maximumCraftingLevel: number): EssenceRecipe => {
  const record = expectRecord(value, 'recipe')
  if (
    !nonEmptyString(record.id) ||
    !bindings.has(record.binding as EssenceBinding) ||
    !positiveInteger(record.craftingLevel) ||
    record.craftingLevel > maximumCraftingLevel
  ) {
    invalid('invalid recipe identity or crafting level')
  }
  const requirements = parseRequirements(record.requirements, record.id as string)
  if (record.kind === 'enhancement-shard') {
    if (!nonEmptyString(record.sourceRecipeId)) invalid(`invalid source recipe ID for ${String(record.id)}`)
    return {
      id: record.id as string,
      kind: 'enhancement-shard',
      sourceRecipeId: record.sourceRecipeId as string,
      binding: record.binding as EssenceBinding,
      craftingLevel: record.craftingLevel as number,
      requirements,
      ...(record.placements !== undefined && {
        placements: expectArray(record.placements, 'recipe placements').map((placement) =>
          parsePlacement(placement, String(record.id))
        )
      })
    }
  }
  if (record.kind === 'minimum-level-shard') {
    if (!positiveInteger(record.itemLevel) || record.itemLevel < minimum || record.itemLevel > maximum) {
      invalid(`invalid minimum-level recipe level for ${String(record.id)}`)
    }
    return {
      id: record.id as string,
      kind: 'minimum-level-shard',
      itemLevel: record.itemLevel as number,
      binding: record.binding as EssenceBinding,
      craftingLevel: record.craftingLevel as number,
      requirements
    }
  }
  return invalid(`unsupported recipe kind for ${String(record.id)}: ${String(record.kind)}`)
}

const parseMinimumLevelShard = (value: unknown, minimum: number, maximum: number): EssenceMinimumLevelShard => {
  const record = expectRecord(value, 'minimum-level shard')
  const recipes = expectRecord(record.recipes, `minimum-level shard recipes for ${String(record.itemLevel)}`)
  if (
    !positiveInteger(record.itemLevel) ||
    record.itemLevel < minimum ||
    record.itemLevel > maximum ||
    !nonEmptyString(recipes.boundRecipeId) ||
    !nonEmptyString(recipes.unboundRecipeId)
  ) {
    invalid('invalid minimum-level shard')
  }
  return {
    itemLevel: record.itemLevel as number,
    recipes: { boundRecipeId: recipes.boundRecipeId as string, unboundRecipeId: recipes.unboundRecipeId as string }
  }
}

const parseAugment = (value: unknown, minimum: number, maximum: number): EssenceAugment => {
  const record = expectRecord(value, 'augment')
  const identity = parseNamedRecord(record, 'augment')
  const effects = expectArray(record.effects, `effects for ${identity.id}`)
  if (
    !nonEmptyString(record.augmentTypeId) ||
    !positiveInteger(record.minimumItemLevel) ||
    record.minimumItemLevel < minimum ||
    record.minimumItemLevel > maximum ||
    effects.length === 0
  ) {
    invalid(`invalid augment: ${identity.id}`)
  }
  const parsedEffects = effects
    .filter(isVisibleEffect)
    .map((effect) => parseEffect(effect, identity.id, minimum, maximum))
  assertUnique(parsedEffects, 'effect', ({ id }) => id, identity.id)
  return {
    ...identity,
    augmentTypeId: record.augmentTypeId as string,
    minimumItemLevel: record.minimumItemLevel as number,
    effects: parsedEffects
  }
}

const parseAugmentSlotType = (value: unknown): EssenceAugmentSlotType => {
  const record = expectRecord(value, 'augment slot type')
  const identity = parseNamedRecord(record, 'augment slot type')
  const accepted = expectArray(record.acceptsAugmentTypeIds, `accepted augment types for ${identity.id}`)
  if (accepted.length === 0 || !accepted.every(nonEmptyString)) invalid(`invalid augment slot type: ${identity.id}`)
  const acceptsAugmentTypeIds = [...accepted] as string[]
  assertUnique(acceptsAugmentTypeIds, 'accepted augment type', (id) => id, identity.id)
  return { ...identity, acceptsAugmentTypeIds }
}

const parseAugmentSlotPlacement = (value: unknown): EssenceAugmentSlotPlacement => {
  const record = expectRecord(value, 'augment slot placement')
  const slotTypes = expectArray(record.augmentSlotTypeIds, `augment slot types for ${String(record.itemCategoryId)}`)
  if (!nonEmptyString(record.itemCategoryId) || slotTypes.length === 0 || !slotTypes.every(nonEmptyString)) {
    invalid('invalid augment slot placement')
  }
  const augmentSlotTypeIds = [...slotTypes] as string[]
  assertUnique(augmentSlotTypeIds, 'augment slot type placement', (id) => id, record.itemCategoryId as string)
  return { itemCategoryId: record.itemCategoryId as string, augmentSlotTypeIds }
}

const parseRules = (value: unknown): EssenceRules => {
  const record = expectRecord(value, 'rules')
  const levels = expectRecord(record.supportedItemLevels, 'supported item levels')
  const extraAffix = expectRecord(record.extraAffix, 'extra affix rule')
  if (
    !positiveInteger(levels.minimum) ||
    !positiveInteger(levels.maximum) ||
    levels.minimum > levels.maximum ||
    !positiveInteger(record.maximumCraftingLevel) ||
    extraAffix.position !== 'extra' ||
    extraAffix.consumedWhen !== 'extra-enhancement-applied'
  ) {
    invalid('invalid rules')
  }
  const augmentSlotTypes = expectArray(record.augmentSlotTypes, 'augment slot types').map(parseAugmentSlotType)
  const augmentSlotPlacements = expectArray(record.augmentSlotPlacements, 'augment slot placements').map(
    parseAugmentSlotPlacement
  )
  assertUnique(augmentSlotTypes, 'augment slot type', ({ id }) => id)
  assertUnique(augmentSlotPlacements, 'augment slot placement', ({ itemCategoryId }) => itemCategoryId)
  return {
    supportedItemLevels: { minimum: levels.minimum as number, maximum: levels.maximum as number },
    maximumCraftingLevel: record.maximumCraftingLevel as number,
    extraAffix: {
      position: 'extra',
      markRequirement: parseRequirement(extraAffix.markRequirement, 'extra affix'),
      consumedWhen: 'extra-enhancement-applied'
    },
    augmentSlotTypes,
    augmentSlotPlacements
  }
}

function indexEnhancementPlacements(enhancements: readonly EssenceEnhancement[]) {
  const enhancementsByPlacement = new Map<EssenceAffixPosition, Map<string, EssenceEnhancement[]>>()
  for (const enhancement of enhancements) {
    for (const placement of enhancement.placements) {
      let enhancementsByCategory = enhancementsByPlacement.get(placement.position)
      if (!enhancementsByCategory) {
        enhancementsByCategory = new Map()
        enhancementsByPlacement.set(placement.position, enhancementsByCategory)
      }
      for (const itemCategoryId of placement.itemCategoryIds) {
        const placementEnhancements = enhancementsByCategory.get(itemCategoryId)
        if (placementEnhancements) placementEnhancements.push(enhancement)
        else enhancementsByCategory.set(itemCategoryId, [enhancement])
      }
    }
  }
  return enhancementsByPlacement
}

function minimumLevelRecipe(
  recipeById: ReadonlyMap<string, EssenceRecipe>,
  shard: EssenceMinimumLevelShard,
  binding: EssenceBinding
) {
  const recipe = recipeById.get(shard.recipes[`${binding}RecipeId`])
  if (recipe?.kind !== 'minimum-level-shard' || recipe.binding !== binding || recipe.itemLevel !== shard.itemLevel)
    return invalid(`invalid ${binding} minimum-level recipe reference for level ${String(shard.itemLevel)}`)
  return recipe
}

function indexMinimumLevelRecipes(
  recipes: readonly EssenceRecipe[],
  minimumLevelShards: readonly EssenceMinimumLevelShard[],
  minimum: number,
  maximum: number
) {
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]))
  const minimumLevelRecipeByLevel = new Map<number, Readonly<Record<EssenceBinding, EssenceMinimumLevelRecipe>>>()
  const referencedMinimumLevelRecipeIds = new Set<string>()
  for (const shard of minimumLevelShards) {
    const boundRecipe = minimumLevelRecipe(recipeById, shard, 'bound')
    const unboundRecipe = minimumLevelRecipe(recipeById, shard, 'unbound')
    if (referencedMinimumLevelRecipeIds.has(boundRecipe.id) || referencedMinimumLevelRecipeIds.has(unboundRecipe.id)) {
      invalid(`duplicate minimum-level recipe reference for level ${String(shard.itemLevel)}`)
    }
    referencedMinimumLevelRecipeIds.add(boundRecipe.id)
    referencedMinimumLevelRecipeIds.add(unboundRecipe.id)
    minimumLevelRecipeByLevel.set(shard.itemLevel, { bound: boundRecipe, unbound: unboundRecipe })
  }
  for (let level = minimum; level <= maximum; level += 1) {
    const variants = minimumLevelRecipeByLevel.get(level)
    const bound = variants?.bound
    const unbound = variants?.unbound
    if (!bound || !unbound) invalid(`missing minimum-level recipe coverage for level ${String(level)}`)
  }
  for (const recipe of recipes) {
    if (recipe.kind === 'minimum-level-shard' && !referencedMinimumLevelRecipeIds.has(recipe.id)) {
      invalid(`unreferenced minimum-level recipe: ${recipe.id}`)
    }
  }
  return minimumLevelRecipeByLevel
}

const buildIndexes = (
  enhancements: readonly EssenceEnhancement[],
  ingredients: readonly EssenceIngredient[],
  augments: readonly EssenceAugment[],
  recipes: readonly EssenceRecipe[],
  minimumLevelShards: readonly EssenceMinimumLevelShard[],
  minimum: number,
  maximum: number
): EssenceCraftingIndexes => {
  const enhancementById = new Map(enhancements.map((enhancement) => [enhancement.id, enhancement]))
  const enhancementsByPlacement = indexEnhancementPlacements(enhancements)
  const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]))
  const augmentById = new Map(augments.map((augment) => [augment.id, augment]))
  for (const recipe of recipes) {
    for (const requirement of recipe.requirements)
      assertReference(ingredientById, requirement.ingredientId, 'ingredient')
  }
  const minimumLevelRecipeByLevel = indexMinimumLevelRecipes(recipes, minimumLevelShards, minimum, maximum)
  return { enhancementById, enhancementsByPlacement, ingredientById, augmentById, minimumLevelRecipeByLevel }
}

function validateEffectReferences(
  effects: readonly EssenceEffect[],
  bonusTypeById: ReadonlyMap<string, EssenceNamedRecord>
) {
  for (const effect of effects) {
    if (effect.bonusTypeId) assertReference(bonusTypeById, effect.bonusTypeId, 'bonus type')
  }
}

function validateEnhancementReferences(
  enhancement: EssenceEnhancement,
  itemCategoryById: ReadonlyMap<string, EssenceNamedRecord>,
  bonusTypeById: ReadonlyMap<string, EssenceNamedRecord>,
  recipeById: ReadonlyMap<string, EssenceRecipe>
) {
  for (const placement of enhancement.placements) {
    for (const itemCategoryId of placement.itemCategoryIds)
      assertReference(itemCategoryById, itemCategoryId, 'item category')
  }
  validateEffectReferences(enhancement.effects, bonusTypeById)
  const boundRecipe = recipeById.get(enhancement.recipes.boundRecipeId)
  const unboundRecipe = recipeById.get(enhancement.recipes.unboundRecipeId)
  if (boundRecipe?.kind !== 'enhancement-shard' || boundRecipe.binding !== 'bound')
    invalid(`invalid bound recipe reference for ${enhancement.id}`)
  if (unboundRecipe?.kind !== 'enhancement-shard' || unboundRecipe.binding !== 'unbound')
    invalid(`invalid unbound recipe reference for ${enhancement.id}`)
}

function validateAugmentPlacements(
  rules: EssenceRules,
  itemCategoryById: ReadonlyMap<string, EssenceNamedRecord>,
  augmentTypeById: ReadonlyMap<string, EssenceNamedRecord>
) {
  for (const slotType of rules.augmentSlotTypes) {
    for (const augmentTypeId of slotType.acceptsAugmentTypeIds)
      assertReference(augmentTypeById, augmentTypeId, 'augment type')
  }
  for (const placement of rules.augmentSlotPlacements) {
    assertReference(itemCategoryById, placement.itemCategoryId, 'item category')
    for (const slotTypeId of placement.augmentSlotTypeIds) {
      if (!rules.augmentSlotTypes.some(({ id }) => id === slotTypeId))
        invalid(`missing augment slot type reference: ${slotTypeId}`)
    }
  }
}

export const validateEssenceCraftingDataset = (value: unknown): EssenceCraftingData => {
  const record = expectRecord(value, 'dataset')
  if (record.schemaVersion !== 1) invalid(`unsupported schema version: ${String(record.schemaVersion)}`)
  const rules = parseRules(record.rules)
  const { minimum, maximum } = rules.supportedItemLevels
  const itemCategories = parseNamedRecords(record.itemCategories, 'item category')
  const augmentTypes = parseNamedRecords(record.augmentTypes, 'augment type')
  const bonusTypes = parseNamedRecords(record.bonusTypes, 'bonus type')
  const ingredients = parseNamedRecords(record.ingredients, 'ingredient')
  const enhancementValues = expectArray(record.enhancements, 'enhancements')
  const augmentValues = expectArray(record.augments, 'augments')
  const recipeValues = expectArray(record.recipes, 'recipes')
  const minimumLevelShardValues = expectArray(record.minimumLevelShards, 'minimum-level shards')
  if (
    enhancementValues.length === 0 ||
    augmentValues.length === 0 ||
    recipeValues.length === 0 ||
    minimumLevelShardValues.length === 0
  ) {
    invalid('enhancements, augments, recipes, and minimum-level shards must be non-empty arrays')
  }
  const enhancements = enhancementValues.map((enhancement) => parseEnhancement(enhancement, minimum, maximum))
  const augments = augmentValues.map((augment) => parseAugment(augment, minimum, maximum))
  const recipes = recipeValues.map((recipe) => parseRecipe(recipe, minimum, maximum, rules.maximumCraftingLevel))
  const minimumLevelShards = minimumLevelShardValues.map((shard) => parseMinimumLevelShard(shard, minimum, maximum))
  assertUnique(enhancements, 'enhancement', ({ id }) => id)
  assertUnique(augments, 'augment', ({ id }) => id)
  assertUnique(recipes, 'recipe', ({ id }) => id)
  assertUnique(minimumLevelShards, 'minimum-level shard', ({ itemLevel }) => itemLevel)
  assertUnique(
    [...enhancements.flatMap(({ effects }) => effects), ...augments.flatMap(({ effects }) => effects)],
    'effect',
    ({ id }) => id
  )

  const itemCategoryById = new Map(itemCategories.map((category) => [category.id, category]))
  const augmentTypeById = new Map(augmentTypes.map((type) => [type.id, type]))
  const bonusTypeById = new Map(bonusTypes.map((type) => [type.id, type]))
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]))
  for (const enhancement of enhancements) {
    validateEnhancementReferences(enhancement, itemCategoryById, bonusTypeById, recipeById)
  }
  for (const augment of augments) {
    assertReference(augmentTypeById, augment.augmentTypeId, 'augment type')
    validateEffectReferences(augment.effects, bonusTypeById)
  }
  validateAugmentPlacements(rules, itemCategoryById, augmentTypeById)
  const indexes = buildIndexes(enhancements, ingredients, augments, recipes, minimumLevelShards, minimum, maximum)
  assertReference(indexes.ingredientById, rules.extraAffix.markRequirement.ingredientId, 'extra affix ingredient')
  return {
    schemaVersion: 1,
    itemCategories,
    augmentTypes,
    bonusTypes,
    enhancements,
    ingredients,
    recipes,
    minimumLevelShards,
    augments,
    rules,
    indexes
  }
}

const nativeSlots = new Map([
  ['Armor', 'armor'],
  ['Cloak', 'cloak'],
  ['Eyes', 'goggles'],
  ['Feet', 'boots'],
  ['Hands', 'gloves'],
  ['Head', 'head'],
  ['Neck', 'necklace'],
  ['Orb', 'orb'],
  ['Pet Collar', 'pet-collar'],
  ['Rings', 'ring'],
  ['Runearm', 'rune-arm'],
  ['Shield', 'shield'],
  ['Trinket', 'trinket'],
  ['Waist', 'belt'],
  ['Weapon', 'weapon'],
  ['Wrists', 'bracers']
])

const ratioEffects =
  /(?:^Spell Critical Chance: | Absorption$|^(?:Arcane Spell Failure|Blurry|Dodge|Doubleshot|Doublestrike|Fortification(?: Bypass)?|Melee Attack Speed|Melee Threat|Movement Speed|Ranged Attack Speed|Ranged Threat|Secondary Shield Bash Chance|Spell Threat)$)/

function nativeCategory(slot: unknown) {
  return typeof slot === 'string'
    ? (nativeSlots.get(slot) ?? invalid('unknown shard slot ' + slot))
    : invalid('invalid shard slot')
}

function nativePlacements(recipe: Record<string, unknown>, level: number): EssencePlacement[] {
  const rules = recipe.placementRules === undefined ? {} : expectRecord(recipe.placementRules, 'shard placement rules')
  return [...affixPositions].flatMap((position) => {
    const categories = expectArray(recipe[position], position + ' shard slots').map(nativeCategory)
    if (!categories.length) return []
    const floors = new Map<string, number>()
    for (const entry of rules[position] === undefined ? [] : expectArray(rules[position], 'position rules')) {
      const rule = expectRecord(entry, 'shard placement rule')
      if (
        (rule.itemClass !== undefined && rule.itemClass !== 'Shield' && rule.itemClass !== 'Weapon') ||
        (rule.shieldType !== undefined && rule.shieldType !== 'Orb') ||
        (rule.minItemLevel !== undefined && !positiveInteger(rule.minItemLevel))
      )
        return invalid('unsupported shard placement rule')
      for (const slot of expectArray(rule.slots, 'placement slots').map(nativeCategory)) {
        if (!categories.includes(slot) || (rule.shieldType === 'Orb' && slot !== 'orb'))
          return invalid('shard placement rule does not match its slots')
        const floor = positiveInteger(rule.minItemLevel) ? Math.max(rule.minItemLevel, level) : level
        floors.set(slot, Math.min(floors.get(slot) ?? floor, floor))
      }
    }
    return [{ position, itemCategoryIds: [...new Set(categories)], minimumItemLevels: Object.fromEntries(floors) }]
  })
}

function combinePlacements(bound: readonly EssencePlacement[], unbound: readonly EssencePlacement[], level: number) {
  return [...affixPositions].flatMap((position) => {
    const floors = new Map<string, number>()
    for (const placement of [...bound, ...unbound].filter((entry) => entry.position === position))
      for (const category of placement.itemCategoryIds) {
        const floor = placement.minimumItemLevels?.[category] ?? level
        floors.set(category, Math.min(floors.get(category) ?? floor, floor))
      }
    return floors.size
      ? [{ position, itemCategoryIds: [...floors.keys()], minimumItemLevels: Object.fromEntries(floors) }]
      : []
  })
}

function findOrAddNamed(records: Map<string, EssenceNamedRecord>, name: string, kind: string) {
  const existing = records.get(name)
  if (existing) return existing.id
  const id = kind + '-native-' + encodeURIComponent(name)
  records.set(name, { id, displayName: name })
  return id
}

function nativeRecipe(
  row: Record<string, unknown>,
  binding: EssenceBinding,
  level: number,
  ingredients: Map<string, EssenceNamedRecord>
) {
  if (!positiveInteger(row.recipeId) || !positiveInteger(row.level) || !positiveInteger(row.essence))
    return invalid('invalid native shard recipe')
  const materials = expectArray(row.collectible, 'shard collectibles').map((entry) =>
    expectRecord(entry, 'collectible')
  )
  const requirements = [{ name: 'Magic Item Essence', quantity: row.essence }, ...materials].map((material) => {
    if (!nonEmptyString(material.name) || !positiveInteger(material.quantity))
      return invalid('invalid native shard ingredient')
    return {
      kind: 'ingredient',
      ingredientId: findOrAddNamed(ingredients, material.name, 'ingredient'),
      quantity: material.quantity
    }
  })
  return {
    id: 'recipe-source-' + String(row.recipeId),
    kind: 'enhancement-shard',
    sourceRecipeId: String(row.recipeId),
    binding,
    craftingLevel: row.level,
    requirements,
    placements: nativePlacements(row, level)
  }
}

function nativeEffects(
  row: Record<string, unknown>,
  enhancementId: string,
  level: number,
  maximum: number,
  bonuses: Map<string, EssenceNamedRecord>,
  previous: EssenceEnhancement | undefined
) {
  return expectArray(row.enchantments, 'shard enchantments').map((entry, index) => {
    const effect = expectRecord(entry, 'shard enchantment')
    if (!nonEmptyString(effect.name) || (effect.bonus !== null && !nonEmptyString(effect.bonus)))
      return invalid('invalid native shard effect')
    const displayName = effect.name === 'SkillEnhancement' ? 'All Skills' : effect.name
    const bonus = effect.bonus === 'NaturalArmor' ? 'Natural Armor' : effect.bonus
    const bonusTypeId = bonus ? findOrAddNamed(bonuses, bonus, 'bonus') : undefined
    const die = effect.modifierDice
    const percent = ratioEffects.test(displayName)
    const unit = die ? 'dice' : percent ? 'ratio' : 'number'
    const modifiers = expectArray(effect.modifiers, 'native shard modifier values')
    const values = new Map<number, number>()
    for (const modifier of modifiers) {
      const point = expectRecord(modifier, 'native shard modifier')
      if (
        !positiveInteger(point.level) ||
        point.level < level ||
        point.level > maximum ||
        values.has(point.level) ||
        !finiteNumber(point.value)
      )
        return invalid('invalid native shard scale: ' + displayName)
      values.set(point.level, point.value)
    }
    const legacy = previous?.effects.find(
      (candidate) => candidate.displayName === displayName && candidate.bonusTypeId === bonusTypeId
    )?.modifier
    const bands: EssenceModifierBand[] = []
    for (let itemLevel = level; values.size > 0 && itemLevel <= maximum; itemLevel++) {
      const fallback =
        legacy?.kind === 'by-item-level' && legacy.unit === unit && legacy.die === die
          ? legacy.bands.find((band) => band.minimumItemLevel <= itemLevel && band.maximumItemLevel >= itemLevel)?.value
          : undefined
      const value = values.get(itemLevel) ?? fallback
      if (value === undefined) continue
      const last = bands.at(-1)
      if (last?.value === value && last.maximumItemLevel === itemLevel - 1) last.maximumItemLevel = itemLevel
      else bands.push({ minimumItemLevel: itemLevel, maximumItemLevel: itemLevel, value })
    }
    return {
      id: enhancementId + '-effect-' + String(index),
      displayName,
      bonusTypeId,
      ...(bands.length && { modifier: { kind: 'by-item-level', unit, die, bands } })
    }
  })
}

export function withPublishedEssenceShards(support: EssenceCraftingData, source: unknown): EssenceCraftingData {
  const overlays = expectArray(source, 'native shards')
  const enhancementsByName = new Map(support.enhancements.map((row) => [row.displayName, row]))
  const ingredients = new Map(support.ingredients.map((row) => [row.displayName, row]))
  const bonuses = new Map(support.bonusTypes.map((row) => [row.displayName, row]))
  const recipes: unknown[] = support.recipes.filter(({ kind }) => kind === 'minimum-level-shard')
  const itemCategories = [...support.itemCategories]
  if (!itemCategories.some(({ id }) => id === 'pet-collar'))
    itemCategories.push({ id: 'pet-collar', displayName: 'Pet Collar' })
  const enhancements = overlays.map((entry) => {
    const shard = expectRecord(entry, 'native shard')
    if (!nonEmptyString(shard.name)) return invalid('unnamed native shard')
    const bound = expectRecord(shard.bound, shard.name + ' bound')
    const unbound = expectRecord(shard.unbound, shard.name + ' unbound')
    const level = bound.minItemLevel
    if (
      !positiveInteger(level) ||
      level !== unbound.minItemLevel ||
      JSON.stringify(bound.enchantments) !== JSON.stringify(unbound.enchantments)
    )
      return invalid('inconsistent bound and unbound shard effects: ' + shard.name)
    const boundRecipe = nativeRecipe(bound, 'bound', level, ingredients)
    const unboundRecipe = nativeRecipe(unbound, 'unbound', level, ingredients)
    const previous = enhancementsByName.get(shard.name)
    const id = previous?.id ?? 'enhancement-native-' + boundRecipe.sourceRecipeId
    recipes.push(boundRecipe, unboundRecipe)
    return {
      id,
      displayName: shard.name,
      minimumItemLevel: level,
      placements: combinePlacements(boundRecipe.placements, unboundRecipe.placements, level),
      effects: nativeEffects(bound, id, level, support.rules.supportedItemLevels.maximum, bonuses, previous),
      recipes: { boundRecipeId: boundRecipe.id, unboundRecipeId: unboundRecipe.id }
    }
  })
  const data = validateEssenceCraftingDataset({
    ...support,
    itemCategories,
    enhancements,
    recipes,
    ingredients: [...ingredients.values()],
    bonusTypes: [...bonuses.values()]
  })
  return { ...data, previousEnhancementById: support.indexes.enhancementById }
}

export async function loadEssenceCraftingData(): Promise<EssenceCraftingData> {
  const manifestPath = 'essence/manifest.json'
  const source = async () => {
    if (!(await hasDatasetFile(manifestPath))) return undefined
    const manifest = expectRecord(await loadDatasetFile<unknown>(manifestPath), 'native shard manifest')
    const { shards } = expectRecord(manifest.resources, 'native shard resources')
    if (manifest.system !== 'essence' || typeof shards !== 'string' || !/^[\w.-]+\.json$/.test(shards))
      return invalid('invalid native shard manifest')
    return loadDatasetFile<unknown>('essence/' + shards)
  }
  const [payload, native] = await Promise.all([loadDataset<unknown>('essence-crafting'), source()])
  const support = validateEssenceCraftingDataset(payload)
  return withScopedAugments(native === undefined ? support : withPublishedEssenceShards(support, native))
}
