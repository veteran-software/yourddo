import { useCallback, useMemo, useRef } from 'react'
import { useAppSelector } from '../../../redux/hooks'
import { createDefaultSetup } from '../initialState'
import type { GearSetup } from '../types.ts'
import { renderGearPlanner } from './renderGearPlanner.tsx'
import { useGearPlannerActions } from './useGearPlannerActions'
import { useGearPlannerContext } from './useGearPlannerContext'
import { useGearPlannerData } from './useGearPlannerData'
import { useGearPlannerFiltering } from './useGearPlannerFiltering'
import { isMetal, useFormatDropLocations, useIsItemVisibleForClasses } from './useGearPlannerHelpers'
import { useGearPlannerUI } from './useGearPlannerUI'

interface Props {
  enchantmentSearch: string
  enchantmentBonusType: string
  itemNameSearch: string
  setBonusFilter: string | null
  showConflicts: boolean
  showOwnedOnly: boolean
}

const useGearPlanner = (props: Props) => {
  const {
    itemNameSearch: propItemNameSearch,
    setBonusFilter: propSetBonusFilter,
    showOwnedOnly: propShowOwnedOnly,
    showConflicts: propShowConflicts
  } = props

  const { characterSetups: setups, activeSetupId } = useAppSelector((state) => state.gearPlanner)

  const { troveData } = useAppSelector((state) => state.app)

  const {
    allItems,
    allAugments,
    allCurses,
    allFiligrees,
    allFiligreeSetNames,
    essenceEnchantments,
    itemSetBonusIndex,
    filigreeSetBonusIndex,
    loading,
    dataReady,
    allItemsBySlot,
    itemToSetsMap
  } = useGearPlannerData()

  const {
    browsingSlot,
    internalItemNameSearch,
    setInternalItemNameSearch,
    itemsToShow,
    setItemsToShow,
    showSidebar,
    setShowSidebar,
    showEnchantmentSearch,
    setShowEnchantmentSearch,
    showSetBonusBrowser,
    setShowSetBonusBrowser,
    browsingSet,
    setBrowsingSet,
    openSlotBrowser,
    openSetBonusBrowser,
    setBrowsingSlot,
    pendingMinorArtifact,
    setPendingMinorArtifact,
    showConflicts,
    setShowConflicts,
    showOwnedOnly,
    setShowOwnedOnly,
    setBonusFilter,
    setSetBonusFilter
  } = useGearPlannerUI({ itemNameSearch: propItemNameSearch })

  const formatDropLocations = useFormatDropLocations()
  const isItemVisibleForClasses = useIsItemVisibleForClasses()

  const activeSetup: GearSetup =
    setups.find((s: GearSetup) => s.id === activeSetupId) ??
    (setups.length > 0 ? setups[0] : createDefaultSetup('default', 'Default Setup'))
  const { artificerPet, druidPet } = activeSetup

  const { characterEquipped, artificerEquipped, druidEquipped, getContextInfo, getEntityState } = useGearPlannerContext(
    { activeSetup, artificerPet, druidPet }
  )

  const { filteredItems, filteredItemSets, filteredFiligreeSets, searchResultsBySlot } = useGearPlannerFiltering({
    dataReady,
    allItemsBySlot,
    itemToSetsMap,
    itemSetBonusIndex,
    filigreeSetBonusIndex,
    activeSetup,
    browsingSlot,
    browsingSet,
    enchantmentSearch: props.enchantmentSearch,
    enchantmentBonusType: props.enchantmentBonusType,
    itemNameSearch: propItemNameSearch,
    internalItemNameSearch,
    setBonusFilter: propSetBonusFilter ?? setBonusFilter,
    showOwnedOnly: propShowOwnedOnly || showOwnedOnly,
    showConflicts: propShowConflicts || showConflicts,
    getEntityState,
    troveData: troveData,
    isItemVisibleForClasses
  })

  const actions = useGearPlannerActions({
    setups,
    activeSetup,
    artificerPet,
    druidPet,
    setPendingMinorArtifact
  })

  const { renderSlot } = renderGearPlanner({
    activeSetup,
    getEntityState,
    troveData: troveData,
    allAugments,
    allCurses,
    openSlotBrowser,
    openSetBonusBrowser,
    formatDropLocations,
    isMetal,
    setItemMinLevel: actions.setItemMinLevel,
    setItemMaterial: actions.setItemMaterial,
    essenceEnchantments,
    setSlottedGemSetBonus: actions.setSlottedGemSetBonus,
    setSlottedAugment: actions.setSlottedAugment,
    setSlottedCurse: actions.setSlottedCurse,
    setEssenceEnchantment: actions.setEssenceEnchantment,
    setNearlyFinishedEnchantment: actions.setNearlyFinishedEnchantment,
    setAlmostThereEnchantment: actions.setAlmostThereEnchantment,
    setFinishingTouchEnchantment: actions.setFinishingTouchEnchantment,
    setRitualTableEnchantment: actions.setRitualTableEnchantment,
    setLostPurposeEnchantment: actions.setLostPurposeEnchantment,
    setTraceOfMadnessEnchantment: actions.setTraceOfMadnessEnchantment,
    setFountainOfNecroticMight: actions.setFountainOfNecroticMight,
    setStormreaverUpgrade: actions.setStormreaverUpgrade,
    setZhentarimAttuned: actions.setZhentarimAttuned
  })

  const observerRef = useRef<IntersectionObserver | null>(null)
  const observerTarget = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect()
      observerRef.current = null
      if (node) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) setItemsToShow((prev) => prev + 50)
          },
          { threshold: 1 }
        )
        observer.observe(node)
        observerRef.current = observer
      }
    },
    [setItemsToShow]
  )

  return {
    activeSetup,
    addSetup: actions.addSetup,
    clearTab: actions.clearSetup,
    importSetups: actions.importSetups,
    allAugments,
    allCurses,
    allFiligreeSetNames,
    allFiligrees,
    allItems,
    artificerEquipped,
    browsingSet,
    browsingSlot,
    characterEquipped,
    dataReady,
    deleteSetup: actions.deleteSetup,
    druidEquipped,
    essenceEnchantments,
    filteredFiligreeSets,
    filteredItemSets,
    filteredItems,
    getContextInfo,
    getEntityState,
    isItemVisibleForClasses,
    isMetal,
    itemNameSearch: propItemNameSearch || internalItemNameSearch,
    itemsToShow,
    loading,
    observerTarget,
    openSetBonusBrowser,
    openSlotBrowser,
    pendingMinorArtifact,
    renderSlot,
    searchResultsBySlot,
    selectItem: actions.selectItem,
    setBonusFilter,
    setBonusIndex: useMemo(
      () => ({ ...itemSetBonusIndex, ...filigreeSetBonusIndex }),
      [itemSetBonusIndex, filigreeSetBonusIndex]
    ),
    setBrowsingSet,
    setBrowsingSlot,
    setEssenceEnchantment: actions.setEssenceEnchantment,
    setFountainOfNecroticMight: actions.setFountainOfNecroticMight,
    setItemMaterial: actions.setItemMaterial,
    setItemMinLevel: actions.setItemMinLevel,
    setItemNameSearch: setInternalItemNameSearch,
    setLostPurposeEnchantment: actions.setLostPurposeEnchantment,
    setPendingMinorArtifact,
    setSetBonusFilter,
    setShowConflicts,
    setShowEnchantmentSearch,
    setShowOwnedOnly,
    setShowSetBonusBrowser,
    setShowSidebar,
    setSlottedFiligree: actions.setSlottedFiligree,
    setStormreaverUpgrade: actions.setStormreaverUpgrade,
    setZhentarimAttuned: actions.setZhentarimAttuned,
    setUnlockedFiligreeSlots: actions.setUnlockedFiligreeSlots,
    showConflicts,
    showEnchantmentSearch,
    showOwnedOnly,
    showSetBonusBrowser,
    showSidebar,
    updateClassProficiencies: actions.updateClassProficiencies
  }
}

export default useGearPlanner
export { FiligreeLabel } from './useGearPlannerHelpers'
