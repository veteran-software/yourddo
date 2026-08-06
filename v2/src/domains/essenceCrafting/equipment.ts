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
  { id: 'helmet', label: 'Helmet', itemCategoryIds: ['helmet'] },
  { id: 'necklace', label: 'Necklace', itemCategoryIds: ['necklace'] },
  { id: 'ring-1', label: 'Ring 1', itemCategoryIds: ['ring'] },
  { id: 'ring-2', label: 'Ring 2', itemCategoryIds: ['ring'] },
  { id: 'trinket', label: 'Trinket', itemCategoryIds: ['trinket'] },
  { id: 'shield', label: 'Shield', itemCategoryIds: ['shield'] }
] as const

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number]
export type EquipmentSlotId = EquipmentSlot['id']
