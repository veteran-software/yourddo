import { type GearItem, type GearSetup, GearSlot, type PetState } from './types'

export const initialPetState = (): PetState => ({
  slots: {},
  slottedAugments: {},
  slottedCurses: {},
  slottedFiligrees: {},
  unlockedFiligreeSlots: {},
  slottedGemSetBonuses: {},
  slottedEssenceEnchantments: {},
  slottedNearlyFinished: {},
  slottedRitualTable: {},
  slottedLostPurpose: {},
  slottedTraceOfMadness: {},
  slottedFountainOfNecroticMight: {},
  slottedStormreaverUpgrade: {},
  slottedZhentarimAttuned: {}
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
  slottedNearlyFinished: {},
  slottedRitualTable: {},
  slottedLostPurpose: {},
  slottedTraceOfMadness: {},
  slottedFountainOfNecroticMight: {},
  slottedStormreaverUpgrade: {},
  slottedZhentarimAttuned: {},
  artificerPet: initialPetState(),
  druidPet: initialPetState()
})
