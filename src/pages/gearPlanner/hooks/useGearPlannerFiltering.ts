import { useCallback, useMemo } from 'react'
import { getTroveKey } from '../../../utils/troveUtils'
import { normalizeString } from '../conflictResolver'
import {
  ARTIFICER_PET_SLOTS,
  DRUID_PET_SLOTS,
  type GearItem,
  type GearSetup,
  GearSlot,
  type SetBonusIndex,
  type SetBonusIndexEntry
} from '../types'

const isPetSlot = (slot: string) =>
  ARTIFICER_PET_SLOTS.includes(slot as GearSlot) || DRUID_PET_SLOTS.includes(slot as GearSlot)

export const useGearPlannerFiltering = ({
  dataReady,
  allItemsBySlot,
  itemToSetsMap,
  itemSetBonusIndex,
  filigreeSetBonusIndex,
  activeSetup,
  browsingSlot,
  browsingSet,
  itemNameSearch,
  internalItemNameSearch,
  setBonusFilter,
  showOwnedOnly,
  troveData,
  isItemVisibleForClasses
}: Props) => {
  const filterByOwned: (item: GearItem) => boolean = useCallback(
    (item: GearItem) => {
      if (showOwnedOnly && troveData) {
        return getTroveKey(item.name) in troveData
      }

      return true
    },
    [showOwnedOnly, troveData]
  )

  const shouldShowItem = useCallback((item: GearItem, slot: GearSlot, setup: GearSetup, skipLevelCheck = false) => {
    if (!skipLevelCheck) {
      const level: number = Number(item.minLevel) || 1
      if (level < setup.minLevel || level > setup.maxLevel) {
        return false
      }
    }

    if (slot === GearSlot.MainHand || slot === GearSlot.OffHand) {
      return true
    }

    return item.slot === slot
  }, [])

  const isSetVisibleInRange = useCallback(
    (setName: string, index: SetBonusIndex, visibleItemKeys: Set<string>, isFiligreeSet = false) => {
      const indexedItems: SetBonusIndexEntry[] | undefined = index[setName]
      const { minLevel: min, maxLevel: max } = activeSetup

      if (!indexedItems) return false

      for (const item of indexedItems) {
        if (isFiligreeSet) {
          return true
        }

        if (item.minLevel >= min && item.minLevel <= max) {
          if (visibleItemKeys.has(`${item.name}|${item.minLevel.toString()}`)) {
            return true
          }
        }
      }

      return false
    },
    [activeSetup]
  )

  const filteredItemSets = useMemo(() => {
    if (!dataReady) {
      return []
    }

    const { minLevel: min, maxLevel: max } = activeSetup

    const getVisibleItemKeys = (): Set<string> => {
      const keys = new Set<string>()

      for (const [slot, items] of allItemsBySlot.entries()) {
        if (!isItemVisibleForClasses({ slot } as GearItem, activeSetup)) {
          continue
        }

        // Filter out pet gear - not shown in set browser at all
        if (isPetSlot(slot)) {
          continue
        }

        for (const item of items) {
          const level: number = Number(item.minLevel) || 1
          if (level >= min && level <= max) {
            const key = `${item.name}|${level.toString()}`
            keys.add(key)
          }
        }
      }

      return keys
    }

    const getSetsWithItemsInSlot = (): Set<string> => {
      const sets = new Set<string>()

      if (browsingSlot) {
        // Filter out pet gear - not shown in set browser at all
        if (isPetSlot(browsingSlot)) {
          return sets
        }

        const slotItems: GearItem[] = allItemsBySlot.get(browsingSlot) ?? []

        for (const i of slotItems) {
          const level = Number(i.minLevel) || 1

          if (
            level >= min &&
            level <= max &&
            isItemVisibleForClasses(i, activeSetup) &&
            shouldShowItem(i, browsingSlot, activeSetup, true)
          ) {
            const key = `${i.name}|${level.toString()}`
            const itemSets = itemToSetsMap.get(key)

            if (itemSets) {
              itemSets.forEach((s) => sets.add(s))
            }
          }
        }
      }

      return sets
    }

    const visibleItemKeys: Set<string> = getVisibleItemKeys()
    const setsWithItemsInSlot: Set<string> = getSetsWithItemsInSlot()

    return Object.keys(itemSetBonusIndex)
      .filter((setName: string) => {
        if (!isSetVisibleInRange(setName, itemSetBonusIndex, visibleItemKeys)) {
          return false
        }

        if (browsingSlot && browsingSet === null) {
          return setsWithItemsInSlot.has(setName)
        }

        return true
      })
      .sort((a, b) => a.localeCompare(b))
  }, [
    itemSetBonusIndex,
    activeSetup,
    dataReady,
    allItemsBySlot,
    isItemVisibleForClasses,
    browsingSlot,
    browsingSet,
    shouldShowItem,
    itemToSetsMap,
    isSetVisibleInRange
  ])

  const filteredFiligreeSets: string[] = useMemo(() => {
    if (!dataReady) {
      return []
    }

    return Object.keys(filigreeSetBonusIndex)
      .filter((setName: string) => {
        if (!isSetVisibleInRange(setName, filigreeSetBonusIndex, new Set(), true)) {
          return false
        }

        if (browsingSlot && browsingSet === null && browsingSlot !== GearSlot.Filigree) {
          return false
        }

        return true
      })
      .sort((a, b) => a.localeCompare(b))
  }, [filigreeSetBonusIndex, dataReady, isSetVisibleInRange, browsingSlot, browsingSet])

  const filteredItems: GearItem[] = useMemo(() => {
    if (!dataReady || !browsingSlot) {
      return []
    }

    const slotItems: GearItem[] = allItemsBySlot.get(browsingSlot) ?? []
    const normalizedSearch: string = normalizeString(itemNameSearch || internalItemNameSearch)

    return slotItems
      .filter((item: GearItem) => {
        if (!isItemVisibleForClasses(item, activeSetup)) {
          return false
        }

        if (!shouldShowItem(item, browsingSlot, activeSetup)) {
          return false
        }

        if (normalizedSearch && !normalizeString(item.name).includes(normalizedSearch)) {
          return false
        }

        if (setBonusFilter) {
          const key = `${item.name}|${String(item.minLevel)}`
          const itemSets: string[] | undefined = itemToSetsMap.get(key)
          if (!itemSets?.includes(setBonusFilter)) {
            return false
          }
        }

        return filterByOwned(item)
      })
      .sort((a, b) => {
        const isOwnedA = troveData?.[getTroveKey(a.name)] ? 1 : 0
        const isOwnedB = troveData?.[getTroveKey(b.name)] ? 1 : 0

        if (isOwnedA !== isOwnedB) {
          return isOwnedB - isOwnedA
        }

        const levelA = Number(a.minLevel) || 1
        const levelB = Number(b.minLevel) || 1

        if (levelA !== levelB) {
          return levelB - levelA
        }

        return a.name.localeCompare(b.name)
      })
  }, [
    dataReady,
    browsingSlot,
    allItemsBySlot,
    itemNameSearch,
    internalItemNameSearch,
    activeSetup,
    shouldShowItem,
    setBonusFilter,
    itemToSetsMap,
    filterByOwned,
    troveData,
    isItemVisibleForClasses
  ])

  const searchResultsBySlot = useMemo(() => {
    if (!dataReady) return {} as Record<GearSlot, GearItem[]>

    const results: Partial<Record<GearSlot, GearItem[]>> = {}
    const normalizedSearch: string = normalizeString(itemNameSearch || internalItemNameSearch)

    if (!normalizedSearch || normalizedSearch.length < 3) return results

    const isBrowsingPet = browsingSlot && isPetSlot(browsingSlot)

    for (const [slot, items] of allItemsBySlot.entries()) {
      // Skip pet slots unless we are browsing a pet
      const isThisPetSlot = isPetSlot(slot)
      if (isThisPetSlot && !isBrowsingPet) {
        continue
      }
      if (!isThisPetSlot && isBrowsingPet) {
        continue
      }

      const filtered = items.filter((item) => {
        if (!isItemVisibleForClasses(item, activeSetup)) {
          return false
        }

        if (showOwnedOnly && troveData && !(getTroveKey(item.name) in troveData)) {
          return false
        }

        if (!normalizeString(item.name).includes(normalizedSearch)) {
          return false
        }

        const level: number = Number(item.minLevel) || 1

        return level >= activeSetup.minLevel && level <= activeSetup.maxLevel
      })

      if (filtered.length > 0) {
        results[slot] = filtered.toSorted((a, b) => {
          const isOwnedA = troveData?.[getTroveKey(a.name)] ? 1 : 0
          const isOwnedB = troveData?.[getTroveKey(b.name)] ? 1 : 0

          if (isOwnedA !== isOwnedB) {
            return isOwnedB - isOwnedA
          }

          const levelA = Number(a.minLevel) || 1
          const levelB = Number(b.minLevel) || 1

          if (levelA !== levelB) {
            return levelB - levelA
          }

          return a.name.localeCompare(b.name)
        })
      }
    }

    return results
  }, [
    dataReady,
    itemNameSearch,
    internalItemNameSearch,
    allItemsBySlot,
    activeSetup,
    showOwnedOnly,
    troveData,
    isItemVisibleForClasses
  ])

  return {
    filteredItems,
    filteredItemSets,
    filteredFiligreeSets,
    searchResultsBySlot,
    shouldShowItem
  }
}

interface Props {
  dataReady: boolean
  allItems: GearItem[]
  allFiligrees: GearItem[]
  allItemsBySlot: Map<GearSlot, GearItem[]>
  itemToSetsMap: Map<string, string[]>
  itemSetBonusIndex: SetBonusIndex
  filigreeSetBonusIndex: SetBonusIndex
  activeSetup: GearSetup
  browsingSlot: GearSlot | null
  browsingSet: string | null
  itemNameSearch: string
  internalItemNameSearch: string
  setBonusFilter: string | null
  showOwnedOnly: boolean
  troveData: Record<string, unknown> | null
  isItemVisibleForClasses: (item: GearItem, setup: GearSetup) => boolean
}
