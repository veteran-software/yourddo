import { type GearItem, type GearSetup, GearSlot, type PetState } from './types'
import { createEmptyItemUpgrades } from './upgradeState'

export const initialPetState = (): PetState => ({
  slots: {},
  slottedAugments: {},
  slottedCurses: {},
  slottedFiligrees: {},
  unlockedFiligreeSlots: {},
  slottedGemSetBonuses: {},
  slottedEssenceEnchantments: {},
  itemUpgrades: createEmptyItemUpgrades()
})

export const createDefaultSetup = (id: string, name: string): GearSetup => ({
  id,
  name,
  minLevel: 1,
  maxLevel: 34,
  classes: [null, null, null],
  weaponFilters: [],
  armorFilters: [],
  shieldFilters: [],
  allowMetalWithDruid: false,
  slots: {} as Record<GearSlot, GearItem | null>,
  slottedAugments: {},
  slottedCurses: {},
  slottedFiligrees: {},
  unlockedFiligreeSlots: {},
  slottedGemSetBonuses: {},
  slottedEssenceEnchantments: {},
  itemUpgrades: createEmptyItemUpgrades(),
  artificerPet: initialPetState(),
  druidPet: initialPetState()
})
