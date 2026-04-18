import { useCallback, useEffect, useState } from 'react'
import { type GearItem, type GearSlot } from '../types'

interface UseGearPlannerUIProps {
  itemNameSearch: string
}

export const useGearPlannerUI = ({ itemNameSearch }: UseGearPlannerUIProps) => {
  const [browsingSlot, setBrowsingSlot] = useState<GearSlot | null>(null)
  const [internalItemNameSearch, setInternalItemNameSearch] = useState('')
  const [itemsToShow, setItemsToShow] = useState(50)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showEnchantmentSearch, setShowEnchantmentSearch] = useState(false)
  const [showSetBonusBrowser, setShowSetBonusBrowser] = useState(false)
  const [browsingSet, setBrowsingSet] = useState<string | null>(null)
  const [showConflicts, setShowConflicts] = useState(false)
  const [showOwnedOnly, setShowOwnedOnly] = useState(false)
  const [setBonusFilter, setSetBonusFilter] = useState<string | null>(null)
  const [pendingMinorArtifact, setPendingMinorArtifact] = useState<{
    slot: GearSlot
    item: GearItem
  } | null>(null)

  useEffect(() => {
    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      setItemsToShow(50)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [itemNameSearch, internalItemNameSearch, browsingSlot])

  const openSlotBrowser = useCallback((slot: GearSlot | null) => {
    setBrowsingSlot(slot)
    setItemsToShow(50)
    setInternalItemNameSearch('')
  }, [])

  const openSetBonusBrowser = useCallback(
    (setName: string) => {
      setBrowsingSet(setName)
      setShowSetBonusBrowser(true)
    },
    [setBrowsingSet]
  )

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.gear-planner-offcanvas')) {
        if (
          !target.closest('.btn') &&
          !target.closest('.gear-planner-sidebar-toggle') &&
          !target.closest('.card-header') &&
          !target.closest('.badge') &&
          !target.closest('.set-bonus-badge-clickable') &&
          !target.closest('.gear-planner-set-card')
        ) {
          setShowSidebar(false)
          setShowEnchantmentSearch(false)
          setShowSetBonusBrowser(false)
          openSlotBrowser(null)
        }
      }
    }

    const anyOpen: boolean = showSidebar || showEnchantmentSearch || showSetBonusBrowser || browsingSlot !== null

    if (anyOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [showSidebar, showEnchantmentSearch, showSetBonusBrowser, browsingSlot, openSlotBrowser])

  return {
    browsingSlot,
    setBrowsingSlot,
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
    pendingMinorArtifact,
    setPendingMinorArtifact,
    showConflicts,
    setShowConflicts,
    showOwnedOnly,
    setShowOwnedOnly,
    setBonusFilter,
    setSetBonusFilter
  }
}
