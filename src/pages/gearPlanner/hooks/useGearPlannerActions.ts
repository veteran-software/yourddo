import { useAppDispatch } from '../../../redux/hooks'
import {
  addSetup as addSetupAction,
  equipItem as equipItemAction,
  removeSetup as removeSetupAction,
  setActiveSetup as setActiveSetupAction,
  setAugment as setAugmentAction,
  setCurse as setCurseAction,
  setEssenceEnchantment as setEssenceEnchantmentAction,
  setFiligree as setFiligreeAction,
  setFountainOfNecroticMight as setFountainOfNecroticMightAction,
  setGemSetBonus as setGemSetBonusAction,
  setItemMaterial as setItemMaterialAction,
  setItemMinLevel as setItemMinLevelAction,
  setLostPurposeEnchantment as setLostPurposeEnchantmentAction,
  setNearlyFinishedEnchantment as setNearlyFinishedEnchantmentAction,
  setRitualTableEnchantment as setRitualTableEnchantmentAction,
  setStormreaverUpgrade as setStormreaverUpgradeAction,
  setTraceOfMadnessEnchantment as setTraceOfMadnessEnchantmentAction,
  setUnlockedFiligreeSlots as setUnlockedFiligreeSlotsAction,
  setZhentarimAttuned as setZhentarimAttunedAction
} from '../../../redux/slices/gearPlannerSlice'
import { getSlotOwner } from '../conflictResolver'
import { isMinorArtifact } from '../helpers'
import { createDefaultSetup } from '../initialState'
import {
  CLASS_PROFICIENCIES,
  type Curse,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment,
  type LootItem,
  type PetState
} from '../types'

interface UseGearPlannerActionsProps {
  setups: GearSetup[]
  activeSetup: GearSetup
  artificerPet: PetState
  druidPet: PetState
  setPendingMinorArtifact: (val: { slot: GearSlot; item: GearItem } | null) => void
}

export const useGearPlannerActions = ({
  setups,
  activeSetup,
  artificerPet,
  druidPet,
  setPendingMinorArtifact
}: UseGearPlannerActionsProps) => {
  const dispatch = useAppDispatch()

  const addSetup = () => {
    const newId = crypto.randomUUID()
    const newSetup = createDefaultSetup(newId, `New Setup ${String(setups.length + 1)}`)

    dispatch(addSetupAction(newSetup))
    dispatch(setActiveSetupAction(newId))
  }

  const deleteSetup = (id: string): void => {
    dispatch(removeSetupAction(id))
  }

  const updateClassProficiencies = (setup: GearSetup, oldClasses: (string | null)[], newClasses: (string | null)[]) => {
    const oldWeaponProficiencies = new Set<string>()
    const oldArmorProficiencies = new Set<string>()
    const oldShieldProficiencies = new Set<string>()
    oldClasses.forEach((cls) => {
      if (cls) {
        CLASS_PROFICIENCIES[cls].weapons.forEach((w) => oldWeaponProficiencies.add(w))
        CLASS_PROFICIENCIES[cls].armor.forEach((a) => oldArmorProficiencies.add(a))
        CLASS_PROFICIENCIES[cls].shields.forEach((s) => oldShieldProficiencies.add(s))
      }
    })

    const newWeaponProficiencies = new Set<string>()
    const newArmorProficiencies = new Set<string>()
    const newShieldProficiencies = new Set<string>()
    newClasses.forEach((cls) => {
      if (cls) {
        CLASS_PROFICIENCIES[cls].weapons.forEach((w) => newWeaponProficiencies.add(w))
        CLASS_PROFICIENCIES[cls].armor.forEach((a) => newArmorProficiencies.add(a))
        CLASS_PROFICIENCIES[cls].shields.forEach((s) => newShieldProficiencies.add(s))
      }
    })

    const weaponsToRemove = new Set([...oldWeaponProficiencies].filter((w) => !newWeaponProficiencies.has(w)))
    const armorToRemove = new Set([...oldArmorProficiencies].filter((a) => !newArmorProficiencies.has(a)))
    const shieldsToRemove = new Set([...oldShieldProficiencies].filter((s) => !newShieldProficiencies.has(s)))

    const updatedWeaponFilters = setup.weaponFilters.filter((w) => !weaponsToRemove.has(w))
    const updatedArmorFilters = setup.armorFilters.filter((a) => !armorToRemove.has(a))
    const updatedShieldFilters = setup.shieldFilters.filter((s) => !shieldsToRemove.has(s))

    newWeaponProficiencies.forEach((w) => {
      if (!updatedWeaponFilters.includes(w)) {
        updatedWeaponFilters.push(w)
      }
    })
    newArmorProficiencies.forEach((a) => {
      if (!updatedArmorFilters.includes(a)) {
        updatedArmorFilters.push(a)
      }
    })
    newShieldProficiencies.forEach((s) => {
      if (!updatedShieldFilters.includes(s)) {
        updatedShieldFilters.push(s)
      }
    })

    setup.weaponFilters = updatedWeaponFilters
    setup.armorFilters = updatedArmorFilters
    setup.shieldFilters = updatedShieldFilters
  }

  const selectItem = (slot: GearSlot, item: GearItem | null): void => {
    if (item && isMinorArtifact(item)) {
      const owner = getSlotOwner(slot)
      let currentEquipped = Object.values(activeSetup.slots)
      if (owner === 'artificer_pet') currentEquipped = Object.values(artificerPet.slots)
      if (owner === 'druid_pet') currentEquipped = Object.values(druidPet.slots)

      const hasMinorArtifact = currentEquipped.some((i) => i && isMinorArtifact(i) && i.id !== item.id)

      if (hasMinorArtifact) {
        setPendingMinorArtifact({ slot, item })
        return
      }
    }

    dispatch(
      equipItemAction({
        slot,
        item
      })
    )
  }

  const setSlottedFiligree = (itemId: string, slotIndex: number, filigree: LootItem | null, slot?: GearSlot) => {
    dispatch(
      setFiligreeAction({
        itemId,
        slotIndex,
        filigree,
        slot
      })
    )
  }

  const setSlottedAugment = (itemId: string, slotIndex: number, augment: GearAugment | null, slot?: GearSlot) => {
    dispatch(
      setAugmentAction({
        itemId,
        slotIndex,
        augment,
        slot
      })
    )
  }

  const setSlottedCurse = (itemId: string, curse: Curse | null, slot?: GearSlot) => {
    dispatch(
      setCurseAction({
        itemId,
        curse,
        slot
      })
    )
  }

  const setSlottedGemSetBonus = (itemId: string, slotIndex: number, setName: string | null, slot?: GearSlot) => {
    dispatch(
      setGemSetBonusAction({
        itemId,
        slotIndex,
        setName,
        slot
      })
    )
  }

  const setItemMaterial = (itemId: string, material: string, slot?: GearSlot) => {
    dispatch(
      setItemMaterialAction({
        itemId,
        material,
        slot
      })
    )
  }

  const setActiveSetup = (id: string) => {
    dispatch(setActiveSetupAction(id))
  }

  const setUnlockedFiligreeSlots = (itemId: string, numSlots: number, slot: GearSlot) => {
    dispatch(
      setUnlockedFiligreeSlotsAction({
        itemId,
        numSlots,
        slot
      })
    )
  }

  const setEssenceEnchantment = (itemId: string, slotName: string, enchantmentId: string | null, slot?: GearSlot) => {
    dispatch(
      setEssenceEnchantmentAction({
        itemId,
        slotName,
        enchantmentId,
        slot
      })
    )
  }

  const setItemMinLevel = (itemId: string, minLevel: number, slot?: GearSlot) => {
    dispatch(
      setItemMinLevelAction({
        itemId,
        minLevel,
        slot
      })
    )
  }

  const setNearlyFinishedEnchantment = (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => {
    dispatch(
      setNearlyFinishedEnchantmentAction({
        itemId,
        enchantment,
        slot
      })
    )
  }

  const setRitualTableEnchantment = (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => {
    dispatch(
      setRitualTableEnchantmentAction({
        itemId,
        enchantment,
        slot
      })
    )
  }

  const setLostPurposeEnchantment = (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => {
    dispatch(
      setLostPurposeEnchantmentAction({
        itemId,
        enchantment,
        slot
      })
    )
  }

  const setTraceOfMadnessEnchantment = (itemId: string, upgradeName: string | null, slot?: GearSlot) => {
    dispatch(
      setTraceOfMadnessEnchantmentAction({
        itemId,
        upgradeName,
        slot
      })
    )
  }

  const setFountainOfNecroticMight = (itemId: string, active: boolean, slot?: GearSlot) => {
    dispatch(
      setFountainOfNecroticMightAction({
        itemId,
        active,
        slot
      })
    )
  }

  const setStormreaverUpgrade = (itemId: string, active: boolean, slot?: GearSlot) => {
    dispatch(
      setStormreaverUpgradeAction({
        itemId,
        active,
        slot
      })
    )
  }

  const setZhentarimAttuned = (itemId: string, active: boolean, slot?: GearSlot) => {
    dispatch(
      setZhentarimAttunedAction({
        itemId,
        active,
        slot
      })
    )
  }

  return {
    addSetup,
    deleteSetup,
    updateClassProficiencies,
    selectItem,
    setSlottedFiligree,
    setSlottedAugment,
    setSlottedCurse,
    setSlottedGemSetBonus,
    setItemMaterial,
    setActiveSetup,
    setUnlockedFiligreeSlots,
    setEssenceEnchantment,
    setItemMinLevel,
    setNearlyFinishedEnchantment,
    setRitualTableEnchantment,
    setLostPurposeEnchantment,
    setTraceOfMadnessEnchantment,
    setFountainOfNecroticMight,
    setStormreaverUpgrade,
    setZhentarimAttuned
  }
}
