import { useCallback, useMemo } from 'react'
import { type PetState } from '../../../redux/slices/gearPlannerSlice'
import { type EnchantmentConflict, getSlotOwner, resolveConflicts } from '../conflictResolver'
import { type GearAugment, type GearItem, type GearSetup, type LootEnchantment } from '../types'

export const useGearPlannerContext = ({ activeSetup, artificerPet, druidPet }: Props) => {
  const characterEquipped: GearItem[] = useMemo(() => {
    return Object.values(activeSetup.slots).filter((item): item is GearItem => item !== null)
  }, [activeSetup.slots])

  const artificerEquipped: GearItem[] = useMemo(() => {
    if (!activeSetup.classes.includes('Artificer')) {
      return []
    }

    return Object.values(artificerPet.slots).filter((item): item is GearItem => item !== null)
  }, [artificerPet.slots, activeSetup.classes])

  const druidEquipped: GearItem[] = useMemo(() => {
    if (!activeSetup.classes.includes('Druid')) {
      return []
    }

    return Object.values(druidPet.slots).filter((item): item is GearItem => item !== null)
  }, [druidPet.slots, activeSetup.classes])

  const characterConflicts: Record<string, EnchantmentConflict[]> = useMemo(
    () =>
      resolveConflicts(
        characterEquipped,
        activeSetup.slottedAugments,
        activeSetup.slottedNearlyFinished,
        activeSetup.slottedRitualTable,
        activeSetup.slottedLostPurpose
      ),
    [
      characterEquipped,
      activeSetup.slottedAugments,
      activeSetup.slottedNearlyFinished,
      activeSetup.slottedRitualTable,
      activeSetup.slottedLostPurpose
    ]
  )

  const artificerConflicts: Record<string, EnchantmentConflict[]> = useMemo(
    () =>
      resolveConflicts(
        artificerEquipped,
        artificerPet.slottedAugments,
        artificerPet.slottedNearlyFinished,
        artificerPet.slottedRitualTable,
        artificerPet.slottedLostPurpose
      ),
    [
      artificerEquipped,
      artificerPet.slottedAugments,
      artificerPet.slottedNearlyFinished,
      artificerPet.slottedRitualTable,
      artificerPet.slottedLostPurpose
    ]
  )

  const druidConflicts: Record<string, EnchantmentConflict[]> = useMemo(
    () =>
      resolveConflicts(
        druidEquipped,
        druidPet.slottedAugments,
        druidPet.slottedNearlyFinished,
        druidPet.slottedRitualTable,
        druidPet.slottedLostPurpose
      ),
    [
      druidEquipped,
      druidPet.slottedAugments,
      druidPet.slottedNearlyFinished,
      druidPet.slottedRitualTable,
      druidPet.slottedLostPurpose
    ]
  )

  const getContextInfo = useCallback(
    (slot: string) => {
      const owner = getSlotOwner(slot)

      let currentConflicts: Record<string, EnchantmentConflict[]> = characterConflicts
      let currentEquipped: GearItem[] = characterEquipped
      let currentSlottedAugments: Record<string, Record<number, GearAugment | null>> = activeSetup.slottedAugments
      let currentSlottedFiligrees: Record<string, (GearItem | null)[]> = activeSetup.slottedFiligrees
      let currentSlottedNearlyFinished: Record<string, LootEnchantment | null> = activeSetup.slottedNearlyFinished
      let currentSlottedRitualTable: Record<string, LootEnchantment | null> = activeSetup.slottedRitualTable
      let currentSlottedLostPurpose: Record<string, LootEnchantment | null> = activeSetup.slottedLostPurpose

      if (owner === 'artificer_pet') {
        currentConflicts = artificerConflicts
        currentEquipped = artificerEquipped
        currentSlottedAugments = artificerPet.slottedAugments
        currentSlottedFiligrees = artificerPet.slottedFiligrees
        currentSlottedNearlyFinished = artificerPet.slottedNearlyFinished
        currentSlottedRitualTable = artificerPet.slottedRitualTable
        currentSlottedLostPurpose = artificerPet.slottedLostPurpose
      } else if (owner === 'druid_pet') {
        currentConflicts = druidConflicts
        currentEquipped = druidEquipped
        currentSlottedAugments = druidPet.slottedAugments
        currentSlottedFiligrees = druidPet.slottedFiligrees
        currentSlottedNearlyFinished = druidPet.slottedNearlyFinished
        currentSlottedRitualTable = druidPet.slottedRitualTable
        currentSlottedLostPurpose = druidPet.slottedLostPurpose
      }

      return {
        currentConflicts,
        currentEquipped,
        currentSlottedAugments,
        currentSlottedFiligrees,
        currentSlottedNearlyFinished,
        currentSlottedRitualTable,
        currentSlottedLostPurpose
      }
    },
    [
      characterConflicts,
      artificerConflicts,
      druidConflicts,
      characterEquipped,
      artificerEquipped,
      druidEquipped,
      activeSetup,
      artificerPet,
      druidPet
    ]
  )

  return {
    characterEquipped,
    artificerEquipped,
    druidEquipped,
    characterConflicts,
    artificerConflicts,
    druidConflicts,
    getContextInfo
  }
}

interface Props {
  activeSetup: GearSetup
  artificerPet: PetState
  druidPet: PetState
}
