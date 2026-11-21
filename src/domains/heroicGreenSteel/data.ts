import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import type {
  HgsBaseItem,
  HgsDevice,
  HgsEffect,
  HgsIngredient,
  HgsInitialData,
  HgsManifest,
  HgsMechanic,
  HgsProc,
  HgsRecipe,
  HgsRecipeData,
  HgsRecipeIngredient,
  HgsSpell,
  HgsTargetEligibility,
  HgsTier2Data,
  HgsTier3Data,
  HgsTierOption
} from './heroicGreenSteel.types.ts'

const domainRoot = 'heroic-green-steel'
const manifestPath = `${domainRoot}/manifest.json`

export class InvalidHeroicGreenSteelDataError extends Error {
  constructor(message: string) {
    super(`Invalid Heroic Green Steel data: ${message}`)
    this.name = 'InvalidHeroicGreenSteelDataError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isOptionalNumber = (value: unknown): value is number | undefined => value === undefined || isNumber(value)
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString)
const isNumberArray = (value: unknown): value is number[] => Array.isArray(value) && value.every(isNumber)
const isHexMask = (value: unknown): value is string => isString(value) && /^0x[\da-f]+$/i.test(value)

const parsePath = (value: unknown, label: string): string => {
  if (
    !isString(value) ||
    value.startsWith('/') ||
    value.includes('\\') ||
    value.split('/').some((part) => part === '' || part === '.' || part === '..') ||
    !value.endsWith('.json')
  ) {
    throw new InvalidHeroicGreenSteelDataError(`invalid ${label} resource path`)
  }
  return value
}

const parseDevice = (value: unknown, label: string): HgsDevice => {
  if (!isRecord(value) || !isNumber(value.id) || !isString(value.name)) {
    throw new InvalidHeroicGreenSteelDataError(`invalid ${label} device`)
  }
  return { id: value.id, name: value.name }
}

export const parseHeroicGreenSteelManifest = (value: unknown): HgsManifest => {
  if (!isRecord(value)) throw new InvalidHeroicGreenSteelDataError('manifest must be an object')
  if (value.schemaVersion !== 1) {
    throw new InvalidHeroicGreenSteelDataError(
      `expected manifest schemaVersion 1, received ${String(value.schemaVersion)}`
    )
  }
  if (value.system !== 'heroic-green-steel') {
    throw new InvalidHeroicGreenSteelDataError(`unexpected manifest system ${String(value.system)}`)
  }
  if (!isString(value.sourceVersion) || !isRecord(value.devices) || !isRecord(value.resources)) {
    throw new InvalidHeroicGreenSteelDataError('manifest metadata is incomplete')
  }
  const resources = value.resources
  if (!isRecord(resources.tiers) || !isRecord(resources.recipes)) {
    throw new InvalidHeroicGreenSteelDataError('manifest resources are incomplete')
  }
  return {
    schemaVersion: 1,
    system: 'heroic-green-steel',
    sourceVersion: value.sourceVersion,
    devices: {
      base: parseDevice(value.devices.base, 'base'),
      tier1: parseDevice(value.devices.tier1, 'tier1'),
      tier2: parseDevice(value.devices.tier2, 'tier2'),
      tier3: parseDevice(value.devices.tier3, 'tier3')
    },
    resources: {
      baseItems: parsePath(resources.baseItems, 'base items'),
      effects: parsePath(resources.effects, 'effects'),
      spells: parsePath(resources.spells, 'spells'),
      ingredients: parsePath(resources.ingredients, 'ingredients'),
      tiers: {
        tier1: parsePath(resources.tiers.tier1, 'tier 1'),
        tier2: parsePath(resources.tiers.tier2, 'tier 2'),
        tier3Basic: parsePath(resources.tiers.tier3Basic, 'tier 3 basic'),
        tier3Focused: parsePath(resources.tiers.tier3Focused, 'tier 3 focused')
      },
      recipes: {
        base: parsePath(resources.recipes.base, 'base recipes'),
        tier1: parsePath(resources.recipes.tier1, 'tier 1 recipes'),
        tier2: parsePath(resources.recipes.tier2, 'tier 2 recipes'),
        tier3: parsePath(resources.recipes.tier3, 'tier 3 recipes')
      }
    }
  }
}

const assertArray = (value: unknown, label: string): unknown[] => {
  if (!Array.isArray(value)) throw new InvalidHeroicGreenSteelDataError(`${label} must be an array`)
  return value
}

const assertUniqueIds = (values: readonly { id: number }[], label: string) => {
  const ids = new Set<number>()
  for (const value of values) {
    if (ids.has(value.id)) throw new InvalidHeroicGreenSteelDataError(`duplicate ${label} ID ${value.id.toString()}`)
    ids.add(value.id)
  }
}

const indexed = <T extends { id: number }>(values: readonly T[]) => new Map(values.map((value) => [value.id, value]))

export const parseBaseItems = (value: unknown): HgsBaseItem[] => {
  const items = assertArray(value, 'base items').map((entry): HgsBaseItem => {
    if (
      !isRecord(entry) ||
      !isNumber(entry.id) ||
      !isString(entry.name) ||
      typeof entry.description !== 'string' ||
      !isOptionalNumber(entry.iconId) ||
      !isNumber(entry.recipeId) ||
      (entry.type !== 'weapon' && entry.type !== 'equipment') ||
      (entry.weaponType !== undefined && !isString(entry.weaponType))
    ) {
      throw new InvalidHeroicGreenSteelDataError('invalid base item')
    }
    if (entry.type === 'weapon' && !isString(entry.weaponType)) {
      throw new InvalidHeroicGreenSteelDataError(`weapon ${entry.name} has no weaponType`)
    }
    return {
      id: entry.id,
      name: entry.name,
      description: entry.description,
      recipeId: entry.recipeId,
      type: entry.type,
      ...(entry.iconId !== undefined ? { iconId: entry.iconId } : {}),
      ...(entry.weaponType !== undefined ? { weaponType: entry.weaponType } : {})
    }
  })
  assertUniqueIds(items, 'base item')
  return items
}

const parseDice = (value: unknown, label: string) => {
  if (!isRecord(value) || !isNumber(value.count) || !isNumber(value.sides) || value.count <= 0 || value.sides <= 0) {
    throw new InvalidHeroicGreenSteelDataError(`invalid dice for ${label}`)
  }
  return { count: value.count, sides: value.sides }
}

const mechanicTypes = new Set([
  '',
  'absorption',
  'concealment',
  'criticalHitResistance',
  'criticalThreatRange',
  'damage',
  'damageReductionBypass',
  'healingAmplification',
  'immunity',
  'namedEngineAction',
  'negativeLevels',
  'regeneration',
  'resistance',
  'speedModifier',
  'spellLore',
  'spellPower',
  'status',
  'summon'
])

const parseTargetEligibility = (value: unknown, label: string): HgsTargetEligibility => {
  if (!isRecord(value)) throw new InvalidHeroicGreenSteelDataError(`invalid target eligibility for ${label}`)
  const eligibility: HgsTargetEligibility = {}
  for (const key of ['excludedCreatureTraits', 'includedGenus', 'excludedGenus'] as const) {
    if (value[key] !== undefined && !isStringArray(value[key])) {
      throw new InvalidHeroicGreenSteelDataError(`invalid target eligibility ${key} for ${label}`)
    }
    if (isStringArray(value[key])) eligibility[key] = [...value[key]]
  }
  for (const key of ['unknownIncludedGenusMask', 'unknownExcludedGenusMask'] as const) {
    if (value[key] !== undefined && !isHexMask(value[key])) {
      throw new InvalidHeroicGreenSteelDataError(`invalid target eligibility ${key} for ${label}`)
    }
    if (isHexMask(value[key])) eligibility[key] = value[key]
  }
  return eligibility
}

const parseMechanic = (value: unknown, label: string): HgsMechanic => {
  if (!isRecord(value) || (value.type === undefined && !isString(value.name))) {
    throw new InvalidHeroicGreenSteelDataError(`invalid mechanic for ${label}`)
  }
  if (value.type !== undefined && (typeof value.type !== 'string' || !mechanicTypes.has(value.type))) {
    throw new InvalidHeroicGreenSteelDataError(`unknown mechanic type for ${label}: ${JSON.stringify(value.type)}`)
  }
  const mechanic: HgsMechanic = {}
  if (typeof value.type === 'string') mechanic.type = value.type
  if (isString(value.name)) mechanic.name = value.name
  if (isNumber(value.value)) mechanic.value = value.value
  else if (value.value !== undefined) {
    if (!isRecord(value.value) || value.value.dice === undefined) {
      throw new InvalidHeroicGreenSteelDataError(`invalid mechanic value for ${label}`)
    }
    mechanic.value = { dice: parseDice(value.value.dice, label) }
  }
  if (value.amount !== undefined) {
    if (!isRecord(value.amount) || value.amount.dice === undefined) {
      throw new InvalidHeroicGreenSteelDataError(`invalid mechanic amount for ${label}`)
    }
    mechanic.amount = { dice: parseDice(value.amount.dice, label) }
  }
  for (const key of ['bonusType', 'unit', 'target', 'damageType', 'durationType'] as const) {
    if (value[key] !== undefined && !isString(value[key])) {
      throw new InvalidHeroicGreenSteelDataError(`invalid mechanic ${key} for ${label}`)
    }
    if (isString(value[key])) mechanic[key] = value[key]
  }
  for (const key of ['rawModifier', 'intervalSeconds', 'multiplier', 'entityId'] as const) {
    if (value[key] !== undefined && !isNumber(value[key])) {
      throw new InvalidHeroicGreenSteelDataError(`invalid mechanic ${key} for ${label}`)
    }
    if (isNumber(value[key])) mechanic[key] = value[key]
  }
  for (const key of ['traits', 'materials'] as const) {
    if (value[key] !== undefined && !isStringArray(value[key])) {
      throw new InvalidHeroicGreenSteelDataError(`invalid mechanic ${key} for ${label}`)
    }
    if (isStringArray(value[key])) mechanic[key] = [...value[key]]
  }
  if (value.targetEligibility !== undefined)
    mechanic.targetEligibility = parseTargetEligibility(value.targetEligibility, label)
  if (value.dice !== undefined) mechanic.dice = parseDice(value.dice, label)
  if (value.save !== undefined) {
    if (!isRecord(value.save) || !isNumber(value.save.dc) || !isString(value.save.type)) {
      throw new InvalidHeroicGreenSteelDataError(`invalid save for ${label}`)
    }
    mechanic.save = { dc: value.save.dc, type: value.save.type }
  }
  if (mechanic.type === 'damage' && (!mechanic.damageType || !mechanic.dice)) {
    throw new InvalidHeroicGreenSteelDataError(`damage mechanic is incomplete for ${label}`)
  }
  if (mechanic.type === 'immunity' && !mechanic.traits?.length) {
    throw new InvalidHeroicGreenSteelDataError(`immunity mechanic is incomplete for ${label}`)
  }
  if (mechanic.type === 'damageReductionBypass' && !mechanic.materials?.length) {
    throw new InvalidHeroicGreenSteelDataError(`damage reduction bypass is incomplete for ${label}`)
  }
  if (mechanic.type === 'criticalThreatRange' && mechanic.multiplier === undefined) {
    throw new InvalidHeroicGreenSteelDataError(`critical threat range is incomplete for ${label}`)
  }
  if (mechanic.type === 'speedModifier' && (!mechanic.target || mechanic.rawModifier === undefined)) {
    throw new InvalidHeroicGreenSteelDataError(`speed modifier is incomplete for ${label}`)
  }
  if (mechanic.type === 'negativeLevels' && !mechanic.amount) {
    throw new InvalidHeroicGreenSteelDataError(`negative levels mechanic is incomplete for ${label}`)
  }
  if ((mechanic.type === 'status' || mechanic.type === 'summon') && !mechanic.name) {
    throw new InvalidHeroicGreenSteelDataError(`${mechanic.type} mechanic is incomplete for ${label}`)
  }
  if (mechanic.type === 'summon' && mechanic.entityId === undefined) {
    throw new InvalidHeroicGreenSteelDataError(`summon mechanic is incomplete for ${label}`)
  }
  return mechanic
}

const parseProc = (value: unknown, label: string): HgsProc => {
  if (!isRecord(value) || !isString(value.trigger) || !Array.isArray(value.outcomes)) {
    throw new InvalidHeroicGreenSteelDataError(`invalid proc for ${label}`)
  }
  if (value.procChance !== undefined && (!isNumber(value.procChance) || value.procChance < 0 || value.procChance > 1)) {
    throw new InvalidHeroicGreenSteelDataError(`invalid proc chance for ${label}`)
  }
  return {
    trigger: value.trigger,
    outcomes: value.outcomes.map((outcome) => parseMechanic(outcome, label)),
    ...(value.procChance !== undefined ? { procChance: value.procChance } : {})
  }
}

export const parseEffects = (value: unknown): HgsEffect[] => {
  const effects = assertArray(value, 'effects').map((entry): HgsEffect => {
    if (
      !isRecord(entry) ||
      !isNumber(entry.id) ||
      !isString(entry.displayName) ||
      typeof entry.description !== 'string' ||
      !Array.isArray(entry.enchantments) ||
      !Array.isArray(entry.procs)
    ) {
      throw new InvalidHeroicGreenSteelDataError('invalid effect')
    }
    return {
      id: entry.id,
      displayName: entry.displayName,
      description: entry.description,
      enchantments: entry.enchantments.map((mechanic) => parseMechanic(mechanic, entry.displayName as string)),
      procs: entry.procs.map((proc) => parseProc(proc, entry.displayName as string))
    }
  })
  assertUniqueIds(effects, 'effect')
  return effects
}

export const parseSpells = (value: unknown): HgsSpell[] => {
  const spells = assertArray(value, 'spells').map((entry): HgsSpell => {
    if (
      !isRecord(entry) ||
      !isNumber(entry.id) ||
      !isString(entry.name) ||
      typeof entry.description !== 'string' ||
      !isNumber(entry.casterLevel) ||
      !isNumber(entry.charges) ||
      !isNumber(entry.rechargePerDay)
    ) {
      throw new InvalidHeroicGreenSteelDataError('invalid spell')
    }
    return {
      id: entry.id,
      name: entry.name,
      description: entry.description,
      casterLevel: entry.casterLevel,
      charges: entry.charges,
      rechargePerDay: entry.rechargePerDay
    }
  })
  assertUniqueIds(spells, 'spell')
  return spells
}

export const parseIngredients = (value: unknown): HgsIngredient[] => {
  const ingredients = assertArray(value, 'ingredients').map((entry): HgsIngredient => {
    if (
      !isRecord(entry) ||
      !isNumber(entry.id) ||
      !isString(entry.name) ||
      typeof entry.description !== 'string' ||
      !isOptionalNumber(entry.iconId)
    ) {
      throw new InvalidHeroicGreenSteelDataError('invalid ingredient')
    }
    return {
      id: entry.id,
      name: entry.name,
      description: entry.description,
      ...(entry.iconId !== undefined ? { iconId: entry.iconId } : {})
    }
  })
  assertUniqueIds(ingredients, 'ingredient')
  return ingredients
}

export const parseTierOptions = (
  value: unknown,
  tier: 'tier1' | 'tier2' | 'tier3-basic' | 'tier3-focused'
): HgsTierOption[] => {
  const options = assertArray(value, `${tier} options`).map((entry): HgsTierOption => {
    if (
      !isRecord(entry) ||
      !isNumber(entry.id) ||
      !isString(entry.name) ||
      (entry.type !== 'weapon' && entry.type !== 'equipment') ||
      !isString(entry.essence) ||
      !isString(entry.focus) ||
      !isString(entry.gem) ||
      !isNumberArray(entry.effectIds) ||
      !isOptionalNumber(entry.spellId) ||
      !isNumber(entry.recipeId)
    ) {
      throw new InvalidHeroicGreenSteelDataError(`invalid ${tier} option`)
    }
    for (const key of ['aspect', 'requiresFocus', 'requiresAspect'] as const) {
      if (entry[key] !== undefined && !isString(entry[key])) {
        throw new InvalidHeroicGreenSteelDataError(`invalid ${key} for ${entry.name}`)
      }
    }
    if (entry.focuses !== undefined && !isStringArray(entry.focuses)) {
      throw new InvalidHeroicGreenSteelDataError(`invalid focuses for ${entry.name}`)
    }
    if (entry.shardType !== undefined && entry.shardType !== 'single' && entry.shardType !== 'compound') {
      throw new InvalidHeroicGreenSteelDataError(`invalid shardType for ${entry.name}`)
    }
    if (tier === 'tier2' && (!isString(entry.requiresFocus) || !isString(entry.aspect))) {
      throw new InvalidHeroicGreenSteelDataError(`tier 2 compatibility fields missing for ${entry.name}`)
    }
    if (tier === 'tier3-focused' && (!isString(entry.requiresAspect) || !entry.shardType)) {
      throw new InvalidHeroicGreenSteelDataError(`focused compatibility fields missing for ${entry.name}`)
    }
    return {
      id: entry.id,
      name: entry.name,
      type: entry.type,
      essence: entry.essence,
      focus: entry.focus,
      gem: entry.gem,
      effectIds: [...entry.effectIds],
      recipeId: entry.recipeId,
      ...(isString(entry.aspect) ? { aspect: entry.aspect } : {}),
      ...(isString(entry.requiresFocus) ? { requiresFocus: entry.requiresFocus } : {}),
      ...(isString(entry.requiresAspect) ? { requiresAspect: entry.requiresAspect } : {}),
      ...(entry.shardType === 'single' || entry.shardType === 'compound' ? { shardType: entry.shardType } : {}),
      ...(isStringArray(entry.focuses) ? { focuses: [...entry.focuses] } : {}),
      ...(entry.spellId !== undefined ? { spellId: entry.spellId } : {})
    }
  })
  assertUniqueIds(options, `${tier} option`)
  return options
}

const parseRecipeIngredient = (value: unknown, owner: string): HgsRecipeIngredient => {
  if (
    !isRecord(value) ||
    !isNumber(value.ingredientId) ||
    !isNumber(value.quantity) ||
    value.quantity <= 0 ||
    !isOptionalNumber(value.producerRecipeId)
  ) {
    throw new InvalidHeroicGreenSteelDataError(`invalid recipe ingredient for ${owner}`)
  }
  return {
    ingredientId: value.ingredientId,
    quantity: value.quantity,
    ...(value.producerRecipeId !== undefined ? { producerRecipeId: value.producerRecipeId } : {})
  }
}

export const parseRecipes = (value: unknown): HgsRecipe[] => {
  const recipes = assertArray(value, 'recipes').map((entry): HgsRecipe => {
    if (
      !isRecord(entry) ||
      !isNumber(entry.id) ||
      !isString(entry.name) ||
      (entry.description !== undefined && typeof entry.description !== 'string') ||
      !isOptionalNumber(entry.iconId) ||
      !['base', 'tier1', 'tier2', 'tier3'].includes(String(entry.device)) ||
      !Array.isArray(entry.ingredients)
    ) {
      throw new InvalidHeroicGreenSteelDataError('invalid recipe')
    }
    const device = entry.device as HgsRecipe['device']
    return {
      id: entry.id,
      name: entry.name,
      device,
      ingredients: entry.ingredients.map((ingredient) => parseRecipeIngredient(ingredient, entry.name as string)),
      ...(entry.description !== undefined ? { description: entry.description } : {}),
      ...(entry.iconId !== undefined ? { iconId: entry.iconId } : {})
    }
  })
  assertUniqueIds(recipes, 'recipe')
  return recipes
}

const resourcePath = (path: string) => `${domainRoot}/${path}`

let manifestPromise: Promise<HgsManifest> | undefined
let initialPromise: Promise<HgsInitialData> | undefined
let tier2Promise: Promise<HgsTier2Data> | undefined
let tier3Promise: Promise<HgsTier3Data> | undefined
let recipePromise: Promise<HgsRecipeData> | undefined

const loadManifest = () => {
  manifestPromise ??= loadDatasetFile<unknown>(manifestPath)
    .then(parseHeroicGreenSteelManifest)
    .catch((cause: unknown) => {
      manifestPromise = undefined
      throw cause
    })
  return manifestPromise
}

const cache = <T>(promise: Promise<T>, clear: () => void) =>
  promise.catch((cause: unknown) => {
    clear()
    throw cause
  })

export const loadHeroicGreenSteelInitialData = (): Promise<HgsInitialData> => {
  initialPromise ??= cache(
    loadManifest().then(async (manifest) => {
      const [baseItemsValue, effectsValue, tier1Value] = await Promise.all([
        loadDatasetFile<unknown>(resourcePath(manifest.resources.baseItems)),
        loadDatasetFile<unknown>(resourcePath(manifest.resources.effects)),
        loadDatasetFile<unknown>(resourcePath(manifest.resources.tiers.tier1))
      ])
      const baseItems = parseBaseItems(baseItemsValue)
      const effects = parseEffects(effectsValue)
      const tier1 = parseTierOptions(tier1Value, 'tier1')
      return {
        manifest,
        baseItems,
        effects,
        tier1,
        baseItemById: indexed(baseItems),
        effectById: indexed(effects),
        tier1ById: indexed(tier1)
      }
    }),
    () => {
      initialPromise = undefined
    }
  )
  return initialPromise
}

export const loadHeroicGreenSteelTier2Data = (): Promise<HgsTier2Data> => {
  tier2Promise ??= cache(
    loadManifest().then(async (manifest) => {
      const [tier2Value, spellsValue] = await Promise.all([
        loadDatasetFile<unknown>(resourcePath(manifest.resources.tiers.tier2)),
        loadDatasetFile<unknown>(resourcePath(manifest.resources.spells))
      ])
      const tier2 = parseTierOptions(tier2Value, 'tier2')
      const spells = parseSpells(spellsValue)
      return { tier2, spells, tier2ById: indexed(tier2), spellById: indexed(spells) }
    }),
    () => {
      tier2Promise = undefined
    }
  )
  return tier2Promise
}

export const loadHeroicGreenSteelTier3Data = (): Promise<HgsTier3Data> => {
  tier3Promise ??= cache(
    loadManifest().then(async (manifest) => {
      const [basicValue, focusedValue] = await Promise.all([
        loadDatasetFile<unknown>(resourcePath(manifest.resources.tiers.tier3Basic)),
        loadDatasetFile<unknown>(resourcePath(manifest.resources.tiers.tier3Focused))
      ])
      const tier3Basic = parseTierOptions(basicValue, 'tier3-basic')
      const tier3Focused = parseTierOptions(focusedValue, 'tier3-focused')
      return {
        tier3Basic,
        tier3Focused,
        tier3BasicById: indexed(tier3Basic),
        tier3FocusedById: indexed(tier3Focused)
      }
    }),
    () => {
      tier3Promise = undefined
    }
  )
  return tier3Promise
}

export const loadHeroicGreenSteelRecipeData = (): Promise<HgsRecipeData> => {
  recipePromise ??= cache(
    loadManifest().then(async (manifest) => {
      const values = await Promise.all([
        loadDatasetFile<unknown>(resourcePath(manifest.resources.ingredients)),
        loadDatasetFile<unknown>(resourcePath(manifest.resources.recipes.base)),
        loadDatasetFile<unknown>(resourcePath(manifest.resources.recipes.tier1)),
        loadDatasetFile<unknown>(resourcePath(manifest.resources.recipes.tier2)),
        loadDatasetFile<unknown>(resourcePath(manifest.resources.recipes.tier3))
      ])
      const ingredients = parseIngredients(values[0])
      const recipes = values.slice(1).flatMap(parseRecipes)
      assertUniqueIds(recipes, 'recipe')
      return { ingredients, recipes, ingredientById: indexed(ingredients), recipeById: indexed(recipes) }
    }),
    () => {
      recipePromise = undefined
    }
  )
  return recipePromise
}

export const resetHeroicGreenSteelDataCache = () => {
  manifestPromise = undefined
  initialPromise = undefined
  tier2Promise = undefined
  tier3Promise = undefined
  recipePromise = undefined
}
