import { useCallback, useMemo, useRef } from 'react'
import { useAppSelector } from '../../../redux/hooks'
import { renderGearPlanner } from './renderGearPlanner.tsx'
import { useGearPlannerActions } from './useGearPlannerActions'
import { useGearPlannerContext } from './useGearPlannerContext'
import { useGearPlannerData } from './useGearPlannerData'
import { useGearPlannerFiltering } from './useGearPlannerFiltering'
import { isMetal as isMetalHelper, useFormatDropLocations, useIsItemVisibleForClasses } from './useGearPlannerHelpers'
import { useGearPlannerUI } from './useGearPlannerUI'

interface Props {
  enchantmentSearch: string
  itemNameSearch: string
  setBonusFilter: string | null
  showConflicts: boolean
  showOwnedOnly: boolean
}

const useGearPlanner = (props: Props) => {
  const {
    itemNameSearch: propItemNameSearch,
    setBonusFilter: propSetBonusFilter,
    showOwnedOnly: propShowOwnedOnly
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

  const isMetal = useCallback((material: string | null | undefined) => isMetalHelper(material), [])
  const formatDropLocations = useFormatDropLocations()
  const isItemVisibleForClasses = useIsItemVisibleForClasses()

  const activeSetup = setups.find((s) => s.id === activeSetupId) ?? setups[0]
  const { artificerPet, druidPet } = activeSetup

  const {
    characterEquipped,
    artificerEquipped,
    druidEquipped,
    characterConflicts,
    artificerConflicts,
    druidConflicts,
    getContextInfo
  } = useGearPlannerContext({ activeSetup, artificerPet, druidPet })

  const { filteredItems, filteredItemSets, filteredFiligreeSets, searchResultsBySlot } = useGearPlannerFiltering({
    dataReady,
    allItems,
    allFiligrees,
    allItemsBySlot,
    itemToSetsMap,
    itemSetBonusIndex,
    filigreeSetBonusIndex,
    activeSetup,
    browsingSlot,
    browsingSet,
    itemNameSearch: propItemNameSearch,
    internalItemNameSearch,
    setBonusFilter: propSetBonusFilter ?? setBonusFilter,
    showOwnedOnly: propShowOwnedOnly || showOwnedOnly,
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
    artificerPet,
    druidPet,
    characterConflicts,
    artificerConflicts,
    druidConflicts,
    characterEquipped,
    artificerEquipped,
    druidEquipped,
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
    setRitualTableEnchantment: actions.setRitualTableEnchantment,
    setLostPurposeEnchantment: actions.setLostPurposeEnchantment
  })

  const observerTargetRef = useRef<HTMLDivElement>(null)

  return {
    activeSetup,
    addSetup: actions.addSetup,
    allAugments,
    allCurses,
    artificerEquipped,
    allFiligrees,
    allItems: useMemo(() => [...allItems, ...allFiligrees], [allItems, allFiligrees]),
    browsingSlot,
    browsingSet,
    setBrowsingSet,
    showSidebar,
    setShowSidebar,
    showEnchantmentSearch,
    setShowEnchantmentSearch,
    showSetBonusBrowser,
    setShowSetBonusBrowser,
    characterEquipped,
    deleteSetup: actions.deleteSetup,
    druidEquipped,
    filteredItems,
    filteredItemSets,
    filteredFiligreeSets,
    allFiligreeSetNames,
    getContextInfo,
    isItemVisibleForClasses,
    isMetal,
    setItemMaterial: actions.setItemMaterial,
    itemNameSearch: propItemNameSearch || internalItemNameSearch,
    itemsToShow,
    loading,
    openSetBonusBrowser,
    openSlotBrowser,
    setBrowsingSlot,
    pendingMinorArtifact,
    setPendingMinorArtifact,
    renderSlot,
    searchResultsBySlot,
    selectItem: actions.selectItem,
    setBonusIndex: useMemo(
      () => ({ ...itemSetBonusIndex, ...filigreeSetBonusIndex }),
      [itemSetBonusIndex, filigreeSetBonusIndex]
    ),
    setItemNameSearch: setInternalItemNameSearch,
    setSlottedFiligree: actions.setSlottedFiligree,
    setUnlockedFiligreeSlots: actions.setUnlockedFiligreeSlots,
    updateClassProficiencies: actions.updateClassProficiencies,
    observerTargetRef,
    dataReady,
    essenceEnchantments,
    setEssenceEnchantment: actions.setEssenceEnchantment,
    setItemMinLevel: actions.setItemMinLevel,
    setLostPurposeEnchantment: actions.setLostPurposeEnchantment,
    observerTarget: observerTargetRef,
    showConflicts,
    setShowConflicts,
    showOwnedOnly,
    setShowOwnedOnly,
    setBonusFilter,
    setSetBonusFilter
  }
}

export default useGearPlanner
export { FiligreeLabel } from './useGearPlannerHelpers'
