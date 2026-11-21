import type { GearItem } from './types.ts'

export interface GemSetBonusGroup {
  label: string
  setBonuses: string[]
}

const sortAlphabetically = (values: string[]): string[] => [...values].sort((a, b) => a.localeCompare(b))

const BASE_GEM_SET_BONUS_GROUPS: GemSetBonusGroup[] = [
  {
    label: 'Random set 1 (from Red Fens or Vault of Night)',
    setBonuses: sortAlphabetically([
      'Divine Blessing',
      "Elder's Knowledge",
      'Marshwalker',
      "Raven's Eye",
      "Shaman's Fury",
      "Siren's Ward",
      "Vulkoor's Cunning",
      "Vulkoor's Might",
      'Kundarak Delving Equipment',
      "Mroranon's Might",
      "Silver Concord's Subtlety",
      'Wards of House Kundarak',
      'Draconic Prophecy'
    ])
  },
  {
    label: 'Random set 2 (from Chronoscope or Sands of Menechtarun)',
    setBonuses: sortAlphabetically([
      'Might of the Abishai',
      "The Desert's Biting Sands",
      "The Desert's Burning Sun",
      "The Desert's Starless Nights",
      "The Desert's Writhing Storm",
      'Menechtarun Scavenger',
      'Oasis of Morality',
      "Vulkoor's Chosen",
      "Windlasher's Ferocity"
    ])
  }
]

const EPIC_GEM_SET_BONUS_GROUPS: GemSetBonusGroup[] = [
  {
    label: 'Random set 1 (from Epic Vault of Night or Epic Red Fens)',
    setBonuses: sortAlphabetically([
      'Epic Divine Blessing',
      "Epic Elder's Knowledge",
      'Epic Marshwalker',
      "Epic Raven's Eye",
      "Epic Shaman's Fury",
      "Epic Siren's Ward",
      "Epic Vulkoor's Cunning",
      "Epic Vulkoor's Might",
      'Epic Kundarak Delving Equipment',
      "Epic Mroranon's Might",
      "Epic Silver Concord's Subtlety",
      'Epic Wards of House Kundarak',
      'Epic Draconic Prophecy'
    ])
  },
  {
    label: 'Random set 2 (from Epic Chronoscope or Epic Sands of Menechtarun)',
    setBonuses: sortAlphabetically([
      'Epic Might of the Abishai',
      "The Epic Desert's Biting Sands",
      "The Epic Desert's Burning Sun",
      "The Epic Desert's Starless Nights",
      "The Epic Desert's Writhing Storm",
      'Epic Menechtarun Scavenger',
      'Epic Oasis of Morality',
      "Epic Vulkoor's Chosen",
      "Epic Windlasher's Ferocity"
    ])
  }
]

const LEGENDARY_GEM_SET_BONUS_GROUPS: GemSetBonusGroup[] = [
  {
    label: 'Random set 1 (Legendary Vault of Night or Legendary Red Fens)',
    setBonuses: sortAlphabetically([
      'Legendary Divine Blessing',
      "Legendary Elder's Knowledge",
      'Legendary Marshwalker',
      "Legendary Raven's Eye",
      "Legendary Shaman's Fury",
      "Legendary Siren's Ward",
      "Legendary Vulkoor's Cunning",
      "Legendary Vulkoor's Might",
      'Legendary Kundarak Delving Equipment',
      "Legendary Mroranon's Might",
      "Legendary Silver Concord's Subtlety",
      'Legendary Wards of House Kundarak',
      'Legendary Draconic Prophecy'
    ])
  },
  {
    label: 'Random set 2 (Legendary Chronoscope or Legendary Sands of Menechtarun)',
    setBonuses: sortAlphabetically([
      'Legendary Might of the Abishai',
      "The Legendary Desert's Biting Sands",
      "The Legendary Desert's Burning Sun",
      "The Legendary Desert's Starless Nights",
      "The Legendary Desert's Writhing Storm",
      'Legendary Menechtarun Scavenger',
      'Legendary Oasis of Morality',
      "Legendary Vulkoor's Chosen",
      "Legendary Windlasher's Ferocity"
    ])
  }
]

const fallbackGroups = (item: GearItem): GemSetBonusGroup[] => {
  const gemSetBonuses = sortAlphabetically(item.setBonus?.map((sb) => sb.name) ?? [])

  return [
    {
      label: 'Random set 1',
      setBonuses: gemSetBonuses
    },
    {
      label: 'Random set 2',
      setBonuses: gemSetBonuses
    }
  ]
}

export const getGemSetBonusGroups = (item: GearItem): GemSetBonusGroup[] => {
  if (item.pageTitle === 'Legendary Gem of Many Facets' || item.name === 'Legendary Gem of Many Facets') {
    return LEGENDARY_GEM_SET_BONUS_GROUPS
  }

  if (item.pageTitle === 'Epic Gem of Many Facets' || item.name === 'Epic Gem of Many Facets') {
    return EPIC_GEM_SET_BONUS_GROUPS
  }

  if (item.pageTitle === 'Gem of Many Facets' || item.name === 'Gem of Many Facets') {
    return BASE_GEM_SET_BONUS_GROUPS
  }

  return fallbackGroups(item)
}
