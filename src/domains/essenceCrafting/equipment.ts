export const PET_COLLAR_SLOTS = [
  { id: 'iron-defender-collar', label: 'Iron Defender Collar', itemCategoryIds: ['pet-collar'], petClass: 'Artificer' },
  { id: 'wolf-companion-collar', label: 'Wolf Companion Collar', itemCategoryIds: ['pet-collar'], petClass: 'Druid' },
  { id: 'dark-wolf-collar', label: 'Dark Wolf Collar', itemCategoryIds: ['pet-collar'], petClass: 'Dark Hunter' }
] as const

export type PetClass = (typeof PET_COLLAR_SLOTS)[number]['petClass']

export function readPetClasses(value: unknown): PetClass[] {
  return Array.isArray(value)
    ? PET_COLLAR_SLOTS.map(({ petClass }) => petClass).filter((name) => value.includes(name))
    : []
}

/**
 * The single source of truth for both the supported planner positions and
 * their presentation order. Category IDs are the normalized IDs published by
 * the Essence Crafting dataset, not legacy placement aliases.
 */
export const EQUIPMENT_SLOTS = [
  { id: 'main-hand', label: 'Main Hand', itemCategoryIds: ['weapon'] },
  { id: 'off-hand', label: 'Off Hand', itemCategoryIds: ['weapon'] },
  { id: 'rune-arm', label: 'Rune Arm', itemCategoryIds: ['rune-arm'] },
  { id: 'orb', label: 'Orb', itemCategoryIds: ['orb'] },
  { id: 'armor', label: 'Armor', itemCategoryIds: ['armor'] },
  { id: 'belt', label: 'Belt', itemCategoryIds: ['belt'] },
  { id: 'boots', label: 'Boots', itemCategoryIds: ['boots'] },
  { id: 'bracers', label: 'Bracers', itemCategoryIds: ['bracers'] },
  { id: 'cloak', label: 'Cloak', itemCategoryIds: ['cloak'] },
  { id: 'gloves', label: 'Gloves', itemCategoryIds: ['gloves'] },
  { id: 'goggles', label: 'Goggles', itemCategoryIds: ['goggles'] },
  { id: 'helmet', label: 'Helmet', itemCategoryIds: ['head'] },
  { id: 'necklace', label: 'Necklace', itemCategoryIds: ['necklace'] },
  { id: 'ring-1', label: 'Ring 1', itemCategoryIds: ['ring'] },
  { id: 'ring-2', label: 'Ring 2', itemCategoryIds: ['ring'] },
  { id: 'trinket', label: 'Trinket', itemCategoryIds: ['trinket'] },
  { id: 'shield', label: 'Shield', itemCategoryIds: ['shield'] },
  ...PET_COLLAR_SLOTS
] as const

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number]
export type EquipmentSlotId = EquipmentSlot['id']

export const getAvailableEquipmentSlots = (petClasses: readonly PetClass[] = []): EquipmentSlot[] =>
  EQUIPMENT_SLOTS.filter((slot) => !('petClass' in slot) || petClasses.includes(slot.petClass))
