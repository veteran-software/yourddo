import { colorAugmentTypes } from '../../shared/augments/compatibility.ts'
import { loadDatasetFile, loadManualPayload } from '../../shared/data/loadDataset.ts'
import type {
  CraftingRequirementsPayload,
  DinosaurBoneAugment,
  DinosaurBoneData,
  DinosaurBoneEffect,
  DinosaurBoneItem,
  DinosaurBoneRequirement,
  DinosaurBoneSetBonus,
  DinosaurBoneSlot
} from './dinosaurBone.types'
import {
  buildDinosaurBoneIndexes,
  classifyItems,
  getAvailableSlots,
  getCompatibleAugments,
  validateUniqueNames
} from './logic.ts'

export const dinosaurBoneDatasetPaths = [
  'dinosaur-bone/items.json',
  'dinosaur-bone/augments.json',
  'master/augment.json'
] as const
export const dinosaurBoneRequirementsPayloadName = 'dinosaurBone.craftingRequirements'

export class InvalidDinosaurBoneDataError extends Error {
  constructor(message: string) {
    super(`Invalid Dinosaur Bone data: ${message}`)
    this.name = 'InvalidDinosaurBoneDataError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const nonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

const parseStringArray = (value: unknown, owner: string): string[] | undefined => {
  if (value === undefined || value === null) return undefined
  if (!Array.isArray(value) || !value.every(nonEmptyString)) {
    throw new InvalidDinosaurBoneDataError(`invalid text list for ${owner}`)
  }
  return [...value]
}

const parseEffect = (value: unknown, owner: string): DinosaurBoneEffect => {
  if (!isRecord(value) || !nonEmptyString(value.name)) {
    throw new InvalidDinosaurBoneDataError(`invalid effect for ${owner}`)
  }
  if (
    value.modifier !== undefined &&
    typeof value.modifier !== 'string' &&
    (typeof value.modifier !== 'number' || !Number.isFinite(value.modifier))
  ) {
    throw new InvalidDinosaurBoneDataError(`invalid effect modifier for ${value.name}`)
  }
  return {
    name: value.name,
    ...(value.modifier !== undefined ? { modifier: value.modifier } : {}),
    ...(typeof value.bonus === 'string' ? { bonus: value.bonus } : {}),
    ...(typeof value.notes === 'string' ? { notes: value.notes } : {})
  }
}

const parseRequirements = (value: unknown, owner: string): DinosaurBoneRequirement[] => {
  if (!Array.isArray(value)) throw new InvalidDinosaurBoneDataError(`requirements missing for ${owner}`)
  return value.map((requirement) => {
    if (
      !isRecord(requirement) ||
      (!nonEmptyString(requirement.name) && !nonEmptyString(requirement.title)) ||
      typeof requirement.quantity !== 'number'
    ) {
      throw new InvalidDinosaurBoneDataError(`invalid requirement for ${owner}`)
    }
    const requirementName = nonEmptyString(requirement.name) ? requirement.name : (requirement.title as string)
    if (!Number.isFinite(requirement.quantity) || requirement.quantity <= 0) {
      throw new InvalidDinosaurBoneDataError(`invalid requirement quantity for ${requirementName}`)
    }
    return {
      name: requirementName,
      quantity: requirement.quantity,
      ...(nonEmptyString(requirement.ingredientType) ? { ingredientType: requirement.ingredientType } : {}),
      ...(parseStringArray(requirement.foundIn, requirementName)
        ? { foundIn: parseStringArray(requirement.foundIn, requirementName) }
        : {}),
      ...(requirement.requirements !== undefined
        ? { requirements: parseRequirements(requirement.requirements, requirementName) }
        : {})
    }
  })
}

const parseSetBonus = (value: unknown, owner: string): DinosaurBoneSetBonus[] | undefined => {
  if (value === undefined || value === null) return undefined
  if (!Array.isArray(value)) throw new InvalidDinosaurBoneDataError(`invalid set bonus for ${owner}`)
  return value.map((bonus) => {
    if (!isRecord(bonus) || !nonEmptyString(bonus.name)) {
      throw new InvalidDinosaurBoneDataError(`invalid set bonus for ${owner}`)
    }
    if (
      bonus.numPiecesEquipped !== undefined &&
      (typeof bonus.numPiecesEquipped !== 'number' || !Number.isFinite(bonus.numPiecesEquipped))
    ) {
      throw new InvalidDinosaurBoneDataError(`invalid set bonus piece count for ${bonus.name}`)
    }
    const bonusName = bonus.name
    return {
      name: bonusName,
      ...(typeof bonus.numPiecesEquipped === 'number' ? { numPiecesEquipped: bonus.numPiecesEquipped } : {}),
      ...(Array.isArray(bonus.enhancements)
        ? { enhancements: bonus.enhancements.map((effect) => parseEffect(effect, bonusName)) }
        : {})
    }
  })
}

const parseSlots = (value: unknown, owner: string): DinosaurBoneSlot[] => {
  if (!Array.isArray(value)) throw new InvalidDinosaurBoneDataError(`augment slots missing for ${owner}`)
  const slots = value.map((slot) => {
    if (!isRecord(slot) || !nonEmptyString(slot.augmentType)) {
      throw new InvalidDinosaurBoneDataError(`invalid augment slot for ${owner}`)
    }
    return {
      id: slot.augmentType,
      augmentType: slot.augmentType,
      label: slot.augmentType.replace(/ Slot(?= |$)/, '')
    }
  })
  const identities = slots.map(({ id }) => id)
  if (new Set(identities).size !== identities.length) {
    throw new InvalidDinosaurBoneDataError(`duplicate augment slot identity for ${owner}`)
  }
  return slots
}

const parseBinding = (value: unknown, owner: string): Record<string, string> | undefined => {
  if (value === undefined || value === null) return undefined
  if (!isRecord(value) || !Object.values(value).every((entry) => typeof entry === 'string')) {
    throw new InvalidDinosaurBoneDataError(`invalid binding for ${owner}`)
  }
  return Object.fromEntries(Object.entries(value) as [string, string][])
}

export const parseItems = (value: unknown): DinosaurBoneItem[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InvalidDinosaurBoneDataError('items payload must be a non-empty array')
  }
  return value.map((item) => {
    if (!isRecord(item) || !nonEmptyString(item.name) || !nonEmptyString(item.type)) {
      throw new InvalidDinosaurBoneDataError('an item is missing name or type')
    }
    const itemName = item.name
    const restrictions = [
      ...(typeof item.restriction === 'string' && item.restriction.trim() ? [item.restriction] : []),
      ...(Array.isArray(item.restrictions) && item.restrictions.every(nonEmptyString) ? item.restrictions : [])
    ]
    const notes = [
      ...(typeof item.details === 'string' && item.details.trim() ? [item.details] : []),
      ...(Array.isArray(item.notes) && item.notes.every(nonEmptyString) ? item.notes : [])
    ]
    return {
      name: itemName,
      type: item.type,
      ...(typeof item.pageTitle === 'string' ? { pageTitle: item.pageTitle } : {}),
      ...(typeof item.description === 'string' ? { description: item.description } : {}),
      ...(nonEmptyString(item.image) ? { image: item.image } : {}),
      ...(nonEmptyString(item.icon) ? { icon: item.icon } : {}),
      ...(typeof item.minLevel === 'string' || typeof item.minLevel === 'number' ? { minLevel: item.minLevel } : {}),
      ...(parseBinding(item.binding, itemName) ? { binding: parseBinding(item.binding, itemName) } : {}),
      ...(typeof item.material === 'string' ? { material: item.material } : {}),
      ...(typeof item.weight === 'string' || typeof item.weight === 'number' ? { weight: item.weight } : {}),
      ...(typeof item.hardness === 'string' || typeof item.hardness === 'number' ? { hardness: item.hardness } : {}),
      ...(typeof item.durability === 'string' || typeof item.durability === 'number'
        ? { durability: item.durability }
        : {}),
      ...(Array.isArray(item.enchantments)
        ? { enchantments: item.enchantments.map((effect) => parseEffect(effect, itemName)) }
        : {}),
      ...(Array.isArray(item.effectsAdded)
        ? { effectsAdded: item.effectsAdded.map((effect) => parseEffect(effect, itemName)) }
        : {}),
      augments: parseSlots(item.augments, itemName),
      ...(parseSetBonus(item.setBonus, itemName) ? { setBonus: parseSetBonus(item.setBonus, itemName) } : {}),
      requirements: [],
      ...(typeof item.craftedIn === 'string' ? { craftedIn: item.craftedIn } : {}),
      ...(restrictions.length > 0 ? { restrictions } : {}),
      ...(notes.length > 0 ? { notes } : {}),
      ...(Array.isArray(item.dropLocations) ? { dropLocations: structuredClone(item.dropLocations) } : {})
    }
  })
}

export const parseAugments = (value: unknown, label: string): DinosaurBoneAugment[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InvalidDinosaurBoneDataError(`${label} augment payload must be a non-empty array`)
  }
  return value.map((augment) => {
    if (!isRecord(augment) || !nonEmptyString(augment.name) || !nonEmptyString(augment.augmentType)) {
      throw new InvalidDinosaurBoneDataError(`an ${label} augment is missing name or augmentType`)
    }
    if (augment.requirements === null && nonEmptyString(augment.craftedIn)) {
      throw new InvalidDinosaurBoneDataError(`requirements missing for crafted augment ${augment.name}`)
    }
    const augmentName = augment.name
    return {
      name: augmentName,
      augmentType: augment.augmentType,
      ...(typeof augment.description === 'string' ? { description: augment.description } : {}),
      ...(typeof augment.minimumLevel === 'string' || typeof augment.minimumLevel === 'number'
        ? { minimumLevel: augment.minimumLevel }
        : typeof augment.minLevel === 'string' || typeof augment.minLevel === 'number'
          ? { minimumLevel: augment.minLevel }
          : {}),
      ...(Array.isArray(augment.effectsAdded)
        ? { effectsAdded: augment.effectsAdded.map((effect) => parseEffect(effect, augmentName)) }
        : {}),
      requirements:
        augment.requirements === undefined || augment.requirements === null
          ? []
          : parseRequirements(augment.requirements, augmentName),
      ...(parseSetBonus(augment.setBonus, augmentName)
        ? { setBonus: parseSetBonus(augment.setBonus, augmentName) }
        : {}),
      ...(parseStringArray(augment.foundIn, augmentName)
        ? { foundIn: parseStringArray(augment.foundIn, augmentName) }
        : {}),
      ...(nonEmptyString(augment.craftedIn) ? { craftedIn: augment.craftedIn } : {})
    }
  })
}

export const parseColorAugments = (value: unknown): DinosaurBoneAugment[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InvalidDinosaurBoneDataError('master augment payload must be a non-empty array')
  }
  const compatibleTypes = new Set<string>(colorAugmentTypes)
  const colorValues = value.filter(
    (augment) =>
      isRecord(augment) && typeof augment.augmentType === 'string' && compatibleTypes.has(augment.augmentType)
  )
  return parseAugments(colorValues, 'color')
}

export const parseCraftingRequirements = (value: unknown): CraftingRequirementsPayload => {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.items)) {
    throw new InvalidDinosaurBoneDataError('unsupported crafting requirements payload')
  }
  if (!Array.isArray(value.identityDifferences)) {
    throw new InvalidDinosaurBoneDataError('crafting requirements identity differences are missing')
  }
  const items = value.items.map((entry) => {
    if (!isRecord(entry) || !nonEmptyString(entry.name)) {
      throw new InvalidDinosaurBoneDataError('invalid crafting requirement item identity')
    }
    return { name: entry.name, requirements: parseRequirements(entry.requirements, entry.name) }
  })
  const identityDifferences = value.identityDifferences.map((entry) => {
    if (!isRecord(entry) || !nonEmptyString(entry.legacyName) || !nonEmptyString(entry.currentCdnName)) {
      throw new InvalidDinosaurBoneDataError('invalid crafting requirement identity difference')
    }
    return { legacyName: entry.legacyName, currentCdnName: entry.currentCdnName }
  })
  validateUniqueNames(items, 'crafting requirement item name')
  validateUniqueNames(
    identityDifferences.map(({ legacyName }) => ({ name: legacyName })),
    'legacy identity'
  )
  validateUniqueNames(
    identityDifferences.map(({ currentCdnName }) => ({ name: currentCdnName })),
    'CDN identity'
  )
  return { schemaVersion: 1, items, identityDifferences }
}

const joinRequirements = (
  items: readonly DinosaurBoneItem[],
  payload: CraftingRequirementsPayload
): DinosaurBoneItem[] => {
  const itemNames = new Set(items.map(({ name }) => name))
  const aliases = new Map(
    payload.identityDifferences.map(({ legacyName, currentCdnName }) => [legacyName, currentCdnName])
  )
  const requirementsByName = new Map<string, readonly DinosaurBoneRequirement[]>()
  for (const record of payload.items) {
    const joinedName = itemNames.has(record.name) ? record.name : aliases.get(record.name)
    if (!joinedName || !itemNames.has(joinedName)) {
      throw new InvalidDinosaurBoneDataError(`missing item join for crafting requirements: ${record.name}`)
    }
    if (requirementsByName.has(joinedName)) {
      throw new InvalidDinosaurBoneDataError(`duplicate joined crafting requirements: ${joinedName}`)
    }
    requirementsByName.set(joinedName, record.requirements)
  }
  return items.map((item) => ({ ...item, requirements: requirementsByName.get(item.name) ?? [] }))
}

export const loadDinosaurBoneData = async (): Promise<DinosaurBoneData> => {
  const [itemsValue, dinosaurAugmentsValue, masterAugmentsValue, requirementsValue] = await Promise.all([
    loadDatasetFile<unknown>(dinosaurBoneDatasetPaths[0]),
    loadDatasetFile<unknown>(dinosaurBoneDatasetPaths[1]),
    loadDatasetFile<unknown>(dinosaurBoneDatasetPaths[2]),
    loadManualPayload<unknown>(dinosaurBoneRequirementsPayloadName)
  ])
  const parsedItems = parseItems(itemsValue)
  const requirements = parseCraftingRequirements(requirementsValue)
  const joinedItems = joinRequirements(parsedItems, requirements)
  const dinosaurAugments = parseAugments(dinosaurAugmentsValue, 'Dinosaur Bone')
  const colorAugments = parseColorAugments(masterAugmentsValue)

  validateUniqueNames(joinedItems, 'item name')
  validateUniqueNames(dinosaurAugments, 'Dinosaur Bone augment name')
  validateUniqueNames(colorAugments, 'color augment name')
  validateUniqueNames([...dinosaurAugments, ...colorAugments], 'augment identity')

  const craftedNames = new Set(
    joinedItems.filter(({ requirements: values }) => values.length > 0).map(({ name }) => name)
  )
  if (craftedNames.size !== requirements.items.length) {
    throw new InvalidDinosaurBoneDataError('not every crafting requirement record produced one crafted item')
  }
  const items = classifyItems(joinedItems, craftedNames)
  const indexes = buildDinosaurBoneIndexes(items, dinosaurAugments, colorAugments)

  for (const item of items) {
    for (const slot of getAvailableSlots(item)) {
      let options: readonly DinosaurBoneAugment[]
      try {
        options = getCompatibleAugments(slot.augmentType, indexes)
      } catch (cause) {
        throw new InvalidDinosaurBoneDataError(
          `${cause instanceof Error ? cause.message : String(cause)} on ${item.name}`
        )
      }
      if (options.length === 0) {
        throw new InvalidDinosaurBoneDataError(`no compatibility source for ${slot.label} on ${item.name}`)
      }
    }
  }

  return { items, dinosaurAugments, colorAugments, indexes }
}
