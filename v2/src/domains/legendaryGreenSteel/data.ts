import { loadDataset } from '../../shared/data/loadDataset.ts'
import type {
  LgsActiveAugment,
  LgsBaseItem,
  LgsBonusEffect,
  LgsCraftingComponent,
  LgsData,
  LgsEffect,
  LgsMetadata,
  LgsRequirement,
  LgsSpecialRecipe,
  LgsTierAugment
} from './legendaryGreenSteel.types.ts'

export const lgsDatasetDomain = 'legendary-green-steel'

export class InvalidLgsDataError extends Error {
  constructor(message: string) {
    super(`Invalid Legendary Green Steel data: ${message}`)
    this.name = 'InvalidLgsDataError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const nonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const received = (value: unknown): string =>
  value === undefined ? 'undefined' : Array.isArray(value) ? 'array' : typeof value

const metadata = (value: Record<string, unknown>): LgsMetadata => ({ ...value })

const parseRequirements = (value: unknown, owner: string): LgsRequirement[] => {
  if (!Array.isArray(value)) throw new InvalidLgsDataError(`requirements missing for ${owner}`)
  return value.map((requirement) => {
    if (!isRecord(requirement) || !nonEmptyString(requirement.name) || typeof requirement.quantity !== 'number') {
      throw new InvalidLgsDataError(`invalid requirement for ${owner}`)
    }
    if (!Number.isFinite(requirement.quantity) || requirement.quantity <= 0) {
      throw new InvalidLgsDataError(`invalid requirement quantity for ${requirement.name}`)
    }
    return { name: requirement.name, quantity: requirement.quantity }
  })
}

const parseEffects = (value: unknown, owner: string): LgsEffect[] => {
  if (!Array.isArray(value)) throw new InvalidLgsDataError(`effects missing for ${owner}`)
  return value.map((effect) => {
    if (!isRecord(effect) || !nonEmptyString(effect.name)) throw new InvalidLgsDataError(`invalid effect for ${owner}`)
    if (effect.modifier !== undefined && typeof effect.modifier !== 'number' && typeof effect.modifier !== 'string') {
      throw new InvalidLgsDataError(`invalid effect modifier for ${effect.name}`)
    }
    if (effect.bonus !== undefined && typeof effect.bonus !== 'string') {
      throw new InvalidLgsDataError(`invalid effect bonus for ${effect.name}`)
    }
    return {
      name: effect.name,
      ...(effect.modifier !== undefined ? { modifier: effect.modifier } : {}),
      ...(typeof effect.bonus === 'string' ? { bonus: effect.bonus } : {})
    }
  })
}

const craftedFields = (value: Record<string, unknown>, owner: string) => {
  if (!nonEmptyString(value.name) || !nonEmptyString(value.craftedIn) || typeof value.quantity !== 'number') {
    throw new InvalidLgsDataError(`invalid crafted record for ${owner}`)
  }
  if (!Number.isFinite(value.quantity) || value.quantity <= 0) {
    throw new InvalidLgsDataError(`invalid quantity for ${value.name}`)
  }
  return {
    name: value.name,
    craftedIn: value.craftedIn,
    quantity: value.quantity,
    requirements: parseRequirements(value.requirements, value.name),
    ...(typeof value.image === 'string' ? { image: value.image } : {}),
    ...(isRecord(value.binding) ? { binding: metadata(value.binding) } : {}),
    ...(value.baseValue !== undefined ? { baseValue: value.baseValue } : {}),
    source: metadata(value)
  }
}

const parseBaseItems = (value: unknown): LgsBaseItem[] => {
  if (!Array.isArray(value)) throw new InvalidLgsDataError('baseItems missing')
  return value.map((item) => {
    if (
      !isRecord(item) ||
      (item.ingredientType !== 'Legendary Green Steel Weapon' &&
        item.ingredientType !== 'Legendary Green Steel Accessory')
    ) {
      throw new InvalidLgsDataError('invalid base item')
    }
    return { ...craftedFields(item, 'base item'), ingredientType: item.ingredientType }
  })
}

const parseTiers = (value: unknown, tier: 1 | 2 | 3): LgsTierAugment[] => {
  if (!Array.isArray(value)) throw new InvalidLgsDataError(`tier${tier.toString()} missing`)
  return value.map((augment) => {
    if (
      !isRecord(augment) ||
      !nonEmptyString(augment.title) ||
      !nonEmptyString(augment.augmentType) ||
      (typeof augment.minimumLevel !== 'number' && typeof augment.minimumLevel !== 'string') ||
      augment.tier !== tier ||
      (augment.itemType !== 'Weapon' && augment.itemType !== 'Equipment') ||
      !nonEmptyString(augment.primaryFocus) ||
      !nonEmptyString(augment.essence) ||
      !nonEmptyString(augment.gem)
    ) {
      throw new InvalidLgsDataError(`invalid tier ${tier.toString()} augment`)
    }
    if (augment.secondaryFocus !== undefined && !nonEmptyString(augment.secondaryFocus)) {
      throw new InvalidLgsDataError(`invalid secondary focus for ${String(augment.name)}`)
    }
    return {
      ...craftedFields(augment, `tier ${tier.toString()} augment`),
      title: augment.title,
      augmentType: augment.augmentType,
      minimumLevel: augment.minimumLevel,
      effectsAdded: parseEffects(augment.effectsAdded, String(augment.name)),
      tier,
      itemType: augment.itemType,
      primaryFocus: augment.primaryFocus,
      ...(typeof augment.secondaryFocus === 'string' ? { secondaryFocus: augment.secondaryFocus } : {}),
      essence: augment.essence,
      gem: augment.gem
    }
  })
}

const parseActiveAugments = (value: unknown): LgsActiveAugment[] => {
  if (!Array.isArray(value))
    throw new InvalidLgsDataError(`activeAugments: expected array, received ${received(value)}`)
  return value.map((augment, index) => {
    const path = `activeAugments[${index.toString()}]`
    if (!isRecord(augment)) throw new InvalidLgsDataError(`${path}: expected object, received ${received(augment)}`)
    if (!nonEmptyString(augment.displayName)) {
      throw new InvalidLgsDataError(
        `${path}.displayName: expected non-empty string, received ${received(augment.displayName)}`
      )
    }
    if (!nonEmptyString(augment.augmentType)) {
      throw new InvalidLgsDataError(
        `${path}.augmentType: expected non-empty string, received ${received(augment.augmentType)}`
      )
    }
    if (typeof augment.minimumLevel !== 'number' && typeof augment.minimumLevel !== 'string') {
      throw new InvalidLgsDataError(
        `${path}.minimumLevel: expected number or string, received ${received(augment.minimumLevel)}`
      )
    }
    if (augment.type !== undefined && typeof augment.type !== 'string') {
      throw new InvalidLgsDataError(`${path}.type: expected string, received ${received(augment.type)}`)
    }
    if (augment.description !== undefined && typeof augment.description !== 'string') {
      throw new InvalidLgsDataError(`${path}.description: expected string, received ${received(augment.description)}`)
    }
    return {
      ...craftedFields(augment, path),
      displayName: augment.displayName,
      ...(typeof augment.type === 'string' ? { type: augment.type } : {}),
      minimumLevel: augment.minimumLevel,
      augmentType: augment.augmentType,
      ...(typeof augment.description === 'string' ? { description: augment.description } : {}),
      ...(typeof augment.weight === 'number' || typeof augment.weight === 'string' ? { weight: augment.weight } : {})
    }
  })
}

const parseBonusEffects = (value: unknown): LgsBonusEffect[] => {
  if (!Array.isArray(value)) throw new InvalidLgsDataError('bonusEffects missing')
  return value.map((effect) => {
    if (
      !isRecord(effect) ||
      !nonEmptyString(effect.name) ||
      !nonEmptyString(effect.description) ||
      !Array.isArray(effect.lowerFoci) ||
      !effect.lowerFoci.every(nonEmptyString) ||
      !Array.isArray(effect.tier3Foci) ||
      !effect.tier3Foci.every(nonEmptyString)
    ) {
      throw new InvalidLgsDataError('invalid bonus effect')
    }
    return {
      name: effect.name,
      description: effect.description,
      lowerFoci: [...effect.lowerFoci],
      tier3Foci: [...effect.tier3Foci],
      source: metadata(effect)
    }
  })
}

const parseComponents = (value: unknown): LgsCraftingComponent[] => {
  if (!Array.isArray(value)) throw new InvalidLgsDataError('craftingComponents missing')
  return value.map((component) => {
    if (!isRecord(component)) throw new InvalidLgsDataError('invalid crafting component')
    return {
      ...craftedFields(component, 'crafting component'),
      ...(typeof component.type === 'string' ? { type: component.type } : {})
    }
  })
}

const parseSpecialRecipes = (value: unknown): LgsSpecialRecipe[] => {
  if (!Array.isArray(value)) throw new InvalidLgsDataError('specialRecipes missing')
  return value.map((recipe) => {
    if (!isRecord(recipe) || !nonEmptyString(recipe.name) || typeof recipe.quantity !== 'number') {
      throw new InvalidLgsDataError('invalid special recipe')
    }
    return {
      name: recipe.name,
      quantity: recipe.quantity,
      requirements: parseRequirements(recipe.requirements, recipe.name),
      source: metadata(recipe)
    }
  })
}

export const parseLgsData = (value: unknown): LgsData => {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    throw new InvalidLgsDataError(
      `expected schemaVersion 1, received ${String(isRecord(value) ? value.schemaVersion : undefined)}`
    )
  }
  return {
    schemaVersion: 1,
    baseItems: parseBaseItems(value.baseItems),
    tier1: parseTiers(value.tier1, 1),
    tier2: parseTiers(value.tier2, 2),
    tier3: parseTiers(value.tier3, 3),
    activeAugments: parseActiveAugments(value.activeAugments),
    bonusEffects: parseBonusEffects(value.bonusEffects),
    craftingComponents: parseComponents(value.craftingComponents),
    specialRecipes: parseSpecialRecipes(value.specialRecipes)
  }
}

export const loadLgsData = async (): Promise<LgsData> => parseLgsData(await loadDataset<unknown>(lgsDatasetDomain))
