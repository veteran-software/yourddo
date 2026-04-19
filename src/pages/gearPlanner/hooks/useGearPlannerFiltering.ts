import { useCallback, useMemo } from 'react'
import { getTroveKey } from '../../../utils/troveUtils'
import { ALL_SLOT_KEYS } from '../../essenceCrafting/types'
import { normalizeString } from '../conflictResolver'
import { createEssenceCraftedItem } from '../helpers'
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
  enchantmentSearch,
  setBonusFilter,
  showOwnedOnly,
  troveData,
  isItemVisibleForClasses
}: Props) => {
  const filterByOwned: (item: GearItem) => boolean = useCallback(
    (item: GearItem) => {
      if (item.isEssenceCrafted) {
        return true
      }

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

    return item.slot === slot
  }, [])

  const isSetVisibleInRange = useCallback(
    (setName: string, index: SetBonusIndex, visibleItemNames: Set<string>, isFiligreeSet = false) => {
      const indexedItems: SetBonusIndexEntry[] | undefined = index[setName]

      if (!indexedItems) {
        return false
      }

      if (isFiligreeSet) {
        return true
      }

      return indexedItems.some((item) => visibleItemNames.has(item.name))
    },
    []
  )

  const filteredItemSets = useMemo(() => {
    if (!dataReady) {
      return []
    }

    const { minLevel: min, maxLevel: max } = activeSetup

    const getVisibleItemNames = (): Set<string> => {
      const names = new Set<string>()

      for (const [slot, items] of allItemsBySlot.entries()) {
        // Filter out pet gear - not shown in the set browser at all
        if (isPetSlot(slot)) {
          continue
        }

        for (const item of items) {
          const level: number = Number(item.minLevel) || 1
          if (level >= min && level <= max) {
            names.add(item.name)
          }
        }
      }

      return names
    }

    const getSetsWithItemsInSlot = (): Set<string> => {
      const sets = new Set<string>()

      const targetSlot = browsingSlot
      if (targetSlot) {
        // Filter out pet gear - not shown in the set browser at all
        if (isPetSlot(targetSlot)) {
          return sets
        }

        const slotItems: GearItem[] = allItemsBySlot.get(targetSlot) ?? []

        for (const i of slotItems) {
          const level = Number(i.minLevel) || 1

          if (
            level >= min &&
            level <= max &&
            isItemVisibleForClasses(i, activeSetup) &&
            shouldShowItem(i, targetSlot, activeSetup, true)
          ) {
            if (i.setBonus) {
              i.setBonus.forEach((s) => sets.add(s.name))
            }
          }
        }
      } else {
        // If browsingSlot is null, all sets are available
        return new Set(Object.keys(itemSetBonusIndex))
      }

      return sets
    }

    const visibleItemNames: Set<string> = getVisibleItemNames()
    const setsWithItemsInSlot: Set<string> = getSetsWithItemsInSlot()

    return Object.keys(itemSetBonusIndex)
      .filter((setName: string) => {
        if (!isSetVisibleInRange(setName, itemSetBonusIndex, visibleItemNames)) {
          return false
        }

        if (browsingSlot && (browsingSet === null || browsingSet === '')) {
          return setsWithItemsInSlot.has(setName)
        }

        if (browsingSet && browsingSet !== '') {
          return true
        }

        if (!browsingSlot && (browsingSet === null || browsingSet === '')) {
          return true
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

        return !(browsingSlot && (browsingSet === null || browsingSet === '') && browsingSlot !== GearSlot.Filigree)
      })
      .sort((a, b) => a.localeCompare(b))
  }, [filigreeSetBonusIndex, dataReady, isSetVisibleInRange, browsingSlot, browsingSet])

  const getEssenceCraftedItems = useCallback((slot: GearSlot, minLevel: number) => {
    const items: GearItem[] = []

    if (isPetSlot(slot)) return items

    const createItem = (type: string, name?: string): GearItem =>
      createEssenceCraftedItem(type, name ?? `Essence Crafted ${type}`, slot, minLevel)

    const getSlotLabel = (s: GearSlot) => {
      const mapping: Record<string, string> = {
        [GearSlot.Head]: 'helmet',
        [GearSlot.Hands]: 'gloves',
        [GearSlot.Feet]: 'boots',
        [GearSlot.Wrists]: 'bracers',
        [GearSlot.Eyes]: 'goggles',
        [GearSlot.Cloak]: 'cloak',
        [GearSlot.Waist]: 'belt',
        [GearSlot.Neck]: 'necklace',
        [GearSlot.FirstFinger]: 'ring1',
        [GearSlot.SecondFinger]: 'ring2',
        [GearSlot.Armor]: 'armor',
        [GearSlot.Trinket]: 'trinket',
        [GearSlot.MainHand]: 'mainHand',
        [GearSlot.OffHand]: 'offHand'
      }
      const key = mapping[s]
      const label = ALL_SLOT_KEYS.find((k) => k.key === key)?.label
      if (label === 'Ring 1' || label === 'Ring 2') return 'Ring'
      if (label === 'Weapon (Main Hand)' || label === 'Weapon (Off Hand)') return 'Weapon'
      return label ?? s
    }

    if (slot === GearSlot.MainHand || slot === GearSlot.OffHand) {
      items.push(createItem('Weapon', `Essence Crafted Weapon`))
      if (slot === GearSlot.OffHand) {
        items.push(
          createItem('Shield', `Essence Crafted Shield`),
          createItem('Rune Arm', `Essence Crafted Rune Arm`),
          createItem('Orb', `Essence Crafted Orb`)
        )
      }
    } else if (slot === GearSlot.Armor) {
      items.push(createItem('Armor', `Essence Crafted Armor`))
    } else if (slot === GearSlot.Augment || slot === GearSlot.Filigree || slot === GearSlot.Quiver) {
      // These slots don't usually have essence crafting or have other specialized crafting
    } else {
      const label = getSlotLabel(slot)
      items.push(createItem('Crafted', `Essence Crafted ${label}`))
    }

    return items
  }, [])

  const filteredItems: GearItem[] = useMemo(() => {
    const normalizedSearch: string = normalizeString(itemNameSearch || internalItemNameSearch)

    if (!dataReady || !browsingSlot) {
      return []
    }

    const slotItems: GearItem[] = allItemsBySlot.get(browsingSlot) ?? []
    const essenceCraftedItems = getEssenceCraftedItems(browsingSlot, activeSetup.minLevel)
    const combinedItems = [...essenceCraftedItems, ...slotItems]

    return combinedItems
      .filter((item: GearItem) => {
        if (!isItemVisibleForClasses(item, activeSetup)) {
          return false
        }

        if (!shouldShowItem(item, browsingSlot, activeSetup)) {
          return false
        }

        if (normalizedSearch) {
          const matchName = item.normalizedName?.includes(normalizedSearch)
          const matchEnchantment = item.normalizedEnchantments?.some((e) => e.includes(normalizedSearch))

          if (!matchName && !matchEnchantment) {
            return false
          }
        }

        if (setBonusFilter) {
          const itemSets = item.setBonus?.map((sb) => sb.name) ?? []
          const indexedSets = itemToSetsMap.get(`${item.name}|${String(item.minLevel)}`) ?? []
          if (!itemSets.includes(setBonusFilter) && !indexedSets.includes(setBonusFilter)) {
            return false
          }
        }

        return filterByOwned(item)
      })
      .sort((a, b) => {
        if (a.isEssenceCrafted && !b.isEssenceCrafted) {
          return -1
        }
        if (!a.isEssenceCrafted && b.isEssenceCrafted) {
          return 1
        }

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
    isItemVisibleForClasses,
    getEssenceCraftedItems
  ])

  const searchResultsBySlot = useMemo(() => {
    if (!dataReady) return {} as Record<GearSlot, GearItem[]>

    const results: Partial<Record<GearSlot, GearItem[]>> = {}
    const normalizedSearch: string = normalizeString(enchantmentSearch)

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

      const essenceCraftedItems = getEssenceCraftedItems(slot, activeSetup.minLevel)
      const combinedItems = [...essenceCraftedItems, ...items]

      const filtered = combinedItems.filter((item) => {
        if (!isItemVisibleForClasses(item, activeSetup)) {
          return false
        }

        if (showOwnedOnly && troveData && !item.isEssenceCrafted && !(getTroveKey(item.name) in troveData)) {
          return false
        }

        if (normalizedSearch) {
          const matchName = item.normalizedName?.includes(normalizedSearch)
          const matchEnchantment = item.normalizedEnchantments?.some((e) => e.includes(normalizedSearch))

          if (!matchName && !matchEnchantment) {
            return false
          }
        }

        const level: number = Number(item.minLevel) || 1

        return level >= activeSetup.minLevel && level <= activeSetup.maxLevel
      })

      if (filtered.length > 0) {
        results[slot] = filtered.toSorted((a, b) => {
          if (a.isEssenceCrafted && !b.isEssenceCrafted) {
            return -1
          }
          if (!a.isEssenceCrafted && b.isEssenceCrafted) {
            return 1
          }

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
    enchantmentSearch,
    allItemsBySlot,
    activeSetup,
    showOwnedOnly,
    troveData,
    isItemVisibleForClasses,
    browsingSlot,
    getEssenceCraftedItems
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
  enchantmentSearch: string
  setBonusFilter: string | null
  showOwnedOnly: boolean
  troveData: Record<string, unknown> | null
  isItemVisibleForClasses: (item: GearItem, setup: GearSetup) => boolean
}
