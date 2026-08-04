import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import type {
  DinosaurBoneAugment,
  DinosaurBoneData,
  DinosaurBoneEffect,
  DinosaurBoneItem,
  DinosaurBoneRequirement,
  DinosaurBoneSetBonus,
  DinosaurBoneSlot
} from './dinosaurBone.types'
import { classifyItems, getAvailableSlots, getCompatibleAugments, validateUniqueNames } from './logic.ts'

export class InvalidDinosaurBoneDataError extends Error {
  constructor(message: string) {
    super(`Invalid Dinosaur Bone data: ${message}`)
    this.name = 'InvalidDinosaurBoneDataError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const parseEffect = (value: unknown): DinosaurBoneEffect => {
  if (!isRecord(value) || typeof value.name !== 'string' || value.name.length === 0) {
    throw new InvalidDinosaurBoneDataError('an effect is invalid')
  }
  if (value.modifier !== undefined && typeof value.modifier !== 'number' && typeof value.modifier !== 'string') {
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
      (typeof requirement.name !== 'string' && typeof requirement.title !== 'string') ||
      typeof requirement.quantity !== 'number'
    ) {
      throw new InvalidDinosaurBoneDataError(`invalid requirement for ${owner}`)
    }
    const name =
      typeof requirement.name === 'string'
        ? requirement.name
        : typeof requirement.title === 'string'
          ? requirement.title
          : ''
    if (!Number.isFinite(requirement.quantity) || requirement.quantity <= 0) {
      throw new InvalidDinosaurBoneDataError(`invalid requirement quantity for ${name}`)
    }
    return {
      name,
      quantity: requirement.quantity,
      ...(requirement.requirements !== undefined
        ? { requirements: parseRequirements(requirement.requirements, name) }
        : {})
    }
  })
}

const parseSetBonus = (value: unknown): DinosaurBoneSetBonus[] | undefined => {
  if (value === undefined || value === null) return undefined
  if (!Array.isArray(value)) throw new InvalidDinosaurBoneDataError('setBonus must be an array')
  return value.map((bonus) => {
    if (!isRecord(bonus) || typeof bonus.name !== 'string') {
      throw new InvalidDinosaurBoneDataError('invalid set bonus')
    }
    return {
      name: bonus.name,
      ...(typeof bonus.numPiecesEquipped === 'number' ? { numPiecesEquipped: bonus.numPiecesEquipped } : {}),
      ...(Array.isArray(bonus.enhancements) ? { enhancements: bonus.enhancements.map(parseEffect) } : {})
    }
  })
}

const parseSlots = (value: unknown, owner: string): DinosaurBoneSlot[] => {
  if (!Array.isArray(value)) throw new InvalidDinosaurBoneDataError(`augment slots missing for ${owner}`)
  return value.map((slot) => {
    if (!isRecord(slot) || typeof slot.augmentType !== 'string' || slot.augmentType.length === 0) {
      throw new InvalidDinosaurBoneDataError(`invalid augment slot for ${owner}`)
    }
    return { augmentType: slot.augmentType }
  })
}

const requirementsFromCraftingLocation = (locations: unknown): DinosaurBoneRequirement[] => {
  if (!Array.isArray(locations)) return []
  const location = locations.find(
    (entry): entry is Record<string, unknown> => isRecord(entry) && entry.sourceType === 'Dinosaur Bone Crafting'
  )
  if (!location) return []

  const requirements = [
    ['boneRaptor', 'Fossilized Raptor Claw'],
    ['boneTriceratops', 'Fossilized Triceratops Horn'],
    ['bonePteradon', 'Fossilized Pteranodon Vertebra'],
    ['boneAnkylosaur', 'Fossilized Ankylosaur Rib']
  ] as const

  return requirements.flatMap(([key, name]) => {
    const quantity = location[key]
    return typeof quantity === 'number' && Number.isFinite(quantity) && quantity > 0 ? [{ name, quantity }] : []
  })
}

const parseItems = (value: unknown): DinosaurBoneItem[] => {
  if (!Array.isArray(value)) throw new InvalidDinosaurBoneDataError('items payload must be an array')
  return value.map((item) => {
    if (!isRecord(item) || typeof item.name !== 'string' || typeof item.type !== 'string') {
      throw new InvalidDinosaurBoneDataError('an item is missing name or type')
    }
    const requirements =
      item.requirements === null || item.requirements === undefined
        ? requirementsFromCraftingLocation(item.dropLocations)
        : parseRequirements(item.requirements, item.name)
    return {
      name: item.name,
      type: item.type,
      ...(typeof item.pageTitle === 'string' ? { pageTitle: item.pageTitle } : {}),
      ...(typeof item.description === 'string' ? { description: item.description } : {}),
      ...(typeof item.image === 'string' && item.image.length > 0 ? { image: item.image } : {}),
      ...(typeof item.icon === 'string' && item.icon.length > 0 ? { icon: item.icon } : {}),
      ...(typeof item.minLevel === 'string' || typeof item.minLevel === 'number' ? { minLevel: item.minLevel } : {}),
      ...(isRecord(item.binding) ? { binding: item.binding as Record<string, string> } : {}),
      ...(typeof item.material === 'string' ? { material: item.material } : {}),
      ...(typeof item.weight === 'string' || typeof item.weight === 'number' ? { weight: item.weight } : {}),
      ...(typeof item.hardness === 'string' || typeof item.hardness === 'number' ? { hardness: item.hardness } : {}),
      ...(typeof item.durability === 'string' || typeof item.durability === 'number'
        ? { durability: item.durability }
        : {}),
      ...(Array.isArray(item.enchantments) ? { enchantments: item.enchantments.map(parseEffect) } : {}),
      ...(Array.isArray(item.effectsAdded) ? { effectsAdded: item.effectsAdded.map(parseEffect) } : {}),
      augments: parseSlots(item.augments, item.name),
      ...(parseSetBonus(item.setBonus) ? { setBonus: parseSetBonus(item.setBonus) } : {}),
      requirements,
      ...(typeof item.craftedIn === 'string' ? { craftedIn: item.craftedIn } : {}),
      ...(Array.isArray(item.dropLocations) ? { dropLocations: item.dropLocations } : {})
    }
  })
}

const parseAugments = (value: unknown): DinosaurBoneAugment[] => {
  if (!Array.isArray(value)) throw new InvalidDinosaurBoneDataError('augment payload must be an array')
  return value.map((augment) => {
    if (!isRecord(augment) || typeof augment.name !== 'string' || typeof augment.augmentType !== 'string') {
      throw new InvalidDinosaurBoneDataError('an augment is missing name or augmentType')
    }
    return {
      name: augment.name,
      augmentType: augment.augmentType,
      ...(typeof augment.description === 'string' ? { description: augment.description } : {}),
      ...(typeof augment.minimumLevel === 'string' || typeof augment.minimumLevel === 'number'
        ? { minimumLevel: augment.minimumLevel }
        : {}),
      ...(Array.isArray(augment.effectsAdded) ? { effectsAdded: augment.effectsAdded.map(parseEffect) } : {}),
      ...(augment.requirements !== undefined
        ? { requirements: parseRequirements(augment.requirements, augment.name) }
        : {}),
      ...(parseSetBonus(augment.setBonus) ? { setBonus: parseSetBonus(augment.setBonus) } : {})
    }
  })
}

export const loadDinosaurBoneData = async (): Promise<DinosaurBoneData> => {
  const [itemsValue, dinosaurAugmentsValue, masterAugmentsValue] = await Promise.all([
    loadDatasetFile<unknown>('dinosaur-bone/items.json'),
    loadDatasetFile<unknown>('dinosaur-bone/augments.json'),
    loadDatasetFile<unknown>('master/augment.json')
  ])
  const items = parseItems(itemsValue)
  const dinosaurAugments = parseAugments(dinosaurAugmentsValue)
  const masterAugments = parseAugments(masterAugmentsValue)
  const colorAugments = masterAugments.filter((augment) =>
    ['Red', 'Blue', 'Yellow', 'Purple', 'Orange', 'Green', 'Colorless'].includes(augment.augmentType)
  )

  validateUniqueNames(items, 'item name')
  validateUniqueNames(dinosaurAugments, 'Dinosaur Bone augment name')
  validateUniqueNames(colorAugments, 'color augment name')

  for (const item of items) {
    for (const slot of getAvailableSlots(item)) {
      const options = getCompatibleAugments(slot, dinosaurAugments, colorAugments)
      if (options.length === 0) {
        throw new InvalidDinosaurBoneDataError(`no options published for slot ${slot} on ${item.name}`)
      }
    }
  }

  return {
    items: classifyItems(items),
    dinosaurAugments,
    colorAugments
  }
}
