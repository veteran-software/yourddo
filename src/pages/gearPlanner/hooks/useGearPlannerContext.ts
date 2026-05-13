import { useCallback, useMemo } from 'react'
import { type EnchantmentConflict, getSlotOwner, resolveConflicts } from '../conflictResolver'
import {
  type EntityGearState,
  type GearAugment,
  type GearItem,
  type GearSetup,
  type LootEnchantment,
  type PetState
} from '../types'

export const useGearPlannerContext = ({ activeSetup, artificerPet, druidPet }: Props) => {
  const getEntityEquipped = (slots: Record<string, GearItem | null>): GearItem[] => {
    return Object.values(slots).filter((item): item is GearItem => item !== null)
  }

  const characterEquipped: GearItem[] = useMemo(() => getEntityEquipped(activeSetup.slots), [activeSetup.slots])

  const artificerEquipped: GearItem[] = useMemo(() => {
    if (!activeSetup.classes.includes('Artificer')) {
      return []
    }
    return getEntityEquipped(artificerPet.slots)
  }, [artificerPet.slots, activeSetup.classes])

  const druidEquipped: GearItem[] = useMemo(() => {
    if (!activeSetup.classes.includes('Druid')) {
      return []
    }
    return getEntityEquipped(druidPet.slots)
  }, [druidPet.slots, activeSetup.classes])

  const characterConflicts: Record<string, EnchantmentConflict[]> = useMemo(
    () =>
      resolveConflicts(characterEquipped, {
        slottedAugments: activeSetup.slottedAugments,
        slottedNearlyFinished: activeSetup.slottedNearlyFinished,
        slottedRitualTable: activeSetup.slottedRitualTable,
        slottedLostPurpose: activeSetup.slottedLostPurpose,
        slottedTraceOfMadness: activeSetup.slottedTraceOfMadness,
        slottedFountainOfNecroticMight: activeSetup.slottedFountainOfNecroticMight,
        slottedStormreaverUpgrade: activeSetup.slottedStormreaverUpgrade,
        slottedZhentarimAttuned: activeSetup.slottedZhentarimAttuned
      }),
    [
      characterEquipped,
      activeSetup.slottedAugments,
      activeSetup.slottedNearlyFinished,
      activeSetup.slottedRitualTable,
      activeSetup.slottedLostPurpose,
      activeSetup.slottedTraceOfMadness,
      activeSetup.slottedFountainOfNecroticMight,
      activeSetup.slottedStormreaverUpgrade,
      activeSetup.slottedZhentarimAttuned
    ]
  )

  const petConflicts = useMemo(() => {
    const results: Record<string, Record<string, EnchantmentConflict[]>> = {
      artificer_pet: {},
      druid_pet: {}
    }

    const entities = [
      { id: 'artificer_pet', equipped: artificerEquipped, state: artificerPet },
      { id: 'druid_pet', equipped: druidEquipped, state: druidPet }
    ]

    entities.forEach((entity) => {
      results[entity.id] = resolveConflicts(entity.equipped, {
        slottedAugments: entity.state.slottedAugments,
        slottedNearlyFinished: entity.state.slottedNearlyFinished,
        slottedRitualTable: entity.state.slottedRitualTable,
        slottedLostPurpose: entity.state.slottedLostPurpose,
        slottedTraceOfMadness: entity.state.slottedTraceOfMadness,
        slottedFountainOfNecroticMight: entity.state.slottedFountainOfNecroticMight,
        slottedStormreaverUpgrade: entity.state.slottedStormreaverUpgrade,
        slottedZhentarimAttuned: entity.state.slottedZhentarimAttuned
      })
    })

    return results
  }, [artificerEquipped, artificerPet, druidEquipped, druidPet])

  const artificerConflicts = petConflicts.artificer_pet
  const druidConflicts = petConflicts.druid_pet

  const getEntityState = useCallback(
    (owner: string): EntityGearState => {
      if (owner === 'artificer_pet') {
        return {
          ...artificerPet,
          equipped: artificerEquipped,
          conflicts: artificerConflicts
        }
      }
      if (owner === 'druid_pet') {
        return {
          ...druidPet,
          equipped: druidEquipped,
          conflicts: druidConflicts
        }
      }
      return {
        ...activeSetup,
        equipped: characterEquipped,
        conflicts: characterConflicts
      }
    },
    [
      activeSetup,
      artificerPet,
      druidPet,
      characterEquipped,
      artificerEquipped,
      druidEquipped,
      characterConflicts,
      artificerConflicts,
      druidConflicts
    ]
  )

  const getContextInfo = useCallback(
    (slot: string): ContextInfo => {
      const owner = getSlotOwner(slot)
      const entityState = getEntityState(owner)

      return {
        currentConflicts: entityState.conflicts,
        currentEquipped: entityState.equipped,
        currentSlottedAugments: entityState.slottedAugments,
        currentSlottedFiligrees: entityState.slottedFiligrees,
        currentSlottedNearlyFinished: entityState.slottedNearlyFinished,
        currentSlottedRitualTable: entityState.slottedRitualTable,
        currentSlottedLostPurpose: entityState.slottedLostPurpose,
        currentSlottedTraceOfMadness: entityState.slottedTraceOfMadness,
        currentSlottedFountainOfNecroticMight: entityState.slottedFountainOfNecroticMight,
        currentSlottedStormreaverUpgrade: entityState.slottedStormreaverUpgrade,
        currentSlottedZhentarimAttuned: entityState.slottedZhentarimAttuned
      }
    },
    [getEntityState]
  )

  return {
    characterEquipped,
    artificerEquipped,
    druidEquipped,
    characterConflicts,
    artificerConflicts,
    druidConflicts,
    getContextInfo,
    getEntityState
  }
}

interface Props {
  activeSetup: GearSetup
  artificerPet: PetState
  druidPet: PetState
}

export interface ContextInfo {
  currentConflicts: Record<string, EnchantmentConflict[]>
  currentEquipped: GearItem[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  currentSlottedFiligrees: Record<string, (GearItem | null)[]>
  currentSlottedNearlyFinished: Record<string, LootEnchantment | null>
  currentSlottedRitualTable: Record<string, LootEnchantment | null>
  currentSlottedLostPurpose: Record<string, LootEnchantment | null>
  currentSlottedTraceOfMadness: Record<string, LootEnchantment | null>
  currentSlottedFountainOfNecroticMight: Record<string, boolean>
  currentSlottedStormreaverUpgrade: Record<string, boolean>
  currentSlottedZhentarimAttuned: Record<string, boolean>
}
