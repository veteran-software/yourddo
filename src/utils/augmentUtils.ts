import augmentMaster from '../data/augments/augmentMaster.ts'
import type { AugmentItem } from '../types/augmentItem.ts'

// Build a type index once to avoid repeated filtering and duplicated code
const AUGMENTS_BY_TYPE: Record<string, AugmentItem[]> = (() => {
  const index: Record<string, AugmentItem[]> = {}
  augmentMaster.forEach((aug: AugmentItem) => {
    const key = (aug.augmentType ?? '').toLowerCase()
    if (!index[key].length) index[key] = []
    index[key].push(aug)
  })
  return index
})()

const getByType = (typeKey: string): AugmentItem[] => {
  const list = AUGMENTS_BY_TYPE[typeKey.toLowerCase()] ?? []
  // Return a copy to prevent accidental external mutations
  return list.slice()
}

// Configuration that maps a slot to the group labels and their corresponding type keys
const SLOT_GROUPS: Record<string, { label: string; key: string }[]> = {
  red: [
    { label: 'Red', key: 'red' },
    { label: 'Colorless', key: 'colorless' }
  ],
  blue: [
    { label: 'Blue', key: 'blue' },
    { label: 'Colorless', key: 'colorless' }
  ],
  yellow: [
    { label: 'Yellow', key: 'yellow' },
    { label: 'Colorless', key: 'colorless' }
  ],
  purple: [
    { label: 'Red', key: 'red' },
    { label: 'Blue', key: 'blue' },
    { label: 'Purple', key: 'purple' },
    { label: 'Colorless', key: 'colorless' }
  ],
  orange: [
    { label: 'Red', key: 'red' },
    { label: 'Yellow', key: 'yellow' },
    { label: 'Orange', key: 'orange' },
    { label: 'Colorless', key: 'colorless' }
  ],
  green: [
    { label: 'Blue', key: 'blue' },
    { label: 'Yellow', key: 'yellow' },
    { label: 'Green', key: 'green' },
    { label: 'Colorless', key: 'colorless' }
  ],
  sun: [{ label: 'Sun', key: 'sun' }],
  moon: [{ label: 'Moon', key: 'moon' }],
  'lamordia: dolorous (armor)': [{ label: 'Lamordia: Dolorous (Armor)', key: 'lamordia: dolorous (armor)' }],
  'lamordia: melancholic (armor)': [{ label: 'Lamordia: Melancholic (Armor)', key: 'lamordia: melancholic (armor)' }],
  'lamordia: miserable (accessory)': [
    { label: 'Lamordia: Miserable (Accessory)', key: 'lamordia: miserable (accessory)' }
  ],
  'lamordia: woeful (accessory)': [{ label: 'Lamordia: Woeful (Accessory)', key: 'lamordia: woeful (accessory)' }]
}

export const findAugmentsForSlot = (slot: string): Record<string, AugmentItem[]> => {
  const slotLower = slot.toLowerCase()
  const config = SLOT_GROUPS[slotLower] ?? [{ label: 'Colorless', key: 'colorless' }]

  // Build groups from config
  const groups: Record<string, AugmentItem[]> = {}
  config.forEach(({ label, key }) => {
    groups[label] = getByType(key).sort((a: AugmentItem, b: AugmentItem) => a.name.localeCompare(b.name))
  })

  // Sort group keys alphabetically to maintain previous behavior
  const sortedAugmentList: Record<string, AugmentItem[]> = {}
  Object.keys(groups)
    .sort((a: string, b: string) => a.localeCompare(b))
    .forEach((key: string) => {
      sortedAugmentList[key] = groups[key]
    })

  return sortedAugmentList
}
