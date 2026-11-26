import { loadNativeDinosaurBone } from './nativeData'
import type { DinosaurBoneAugment, DinosaurBoneData } from './dinosaurBone.types'
import {
  buildDinosaurBoneIndexes,
  classifyItems,
  getAvailableSlots,
  getCompatibleAugments,
  validateUniqueNames
} from './logic.ts'

export class InvalidDinosaurBoneDataError extends Error {
  constructor(message: string) {
    super(`Invalid Dinosaur Bone data: ${message}`)
    this.name = 'InvalidDinosaurBoneDataError'
  }
}

function withLegacyNames<T>(index: ReadonlyMap<string, T>, aliases: [string, string][]) {
  const result = new Map(index)
  for (const [legacy, current] of aliases) {
    const record = index.get(current)
    if (record && !result.has(legacy)) result.set(legacy, record)
  }
  return result
}

export const loadDinosaurBoneData = async (): Promise<DinosaurBoneData> => {
  const {
    items: joinedItems,
    dinosaurAugments,
    colorAugments,
    craftedNames,
    enchantmentNames
  } = await loadNativeDinosaurBone()
  validateUniqueNames(joinedItems, 'item name')
  validateUniqueNames(dinosaurAugments, 'Dinosaur Bone augment name')
  validateUniqueNames(colorAugments, 'color augment name')
  validateUniqueNames([...dinosaurAugments, ...colorAugments], 'augment identity')

  const items = classifyItems(joinedItems, craftedNames)
  const indexes = buildDinosaurBoneIndexes(items, dinosaurAugments, colorAugments)

  indexes.itemByName = withLegacyNames(indexes.itemByName, [
    ['Dinosaur Bone Bone Dart', 'Dinosaur Bone Dart'],
    ['Pendant of the Earth', 'Legendary Pendant of the Earth']
  ])
  indexes.augmentByName = withLegacyNames(indexes.augmentByName, [
    ['Ruby of The Gatekeepers', 'Ruby of the Gatekeepers'],
    ['Ruby of Radiance 66', 'Ruby of Radiance 166'],
    ['Topaz of Augment Summoning', 'Topaz of Augmented Summoning'],
    ['Emerald of Eldritch Empowerment', 'Emerald of Arcane Empowerment'],
    ['Emerald of Vile Empowerment', 'Emerald of Arcane Empowerment']
  ])
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

  return { items, dinosaurAugments, colorAugments, indexes, enchantmentNames }
}
