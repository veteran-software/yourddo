import { useCallback, useMemo } from 'react'
import { getTroveKey } from '../../../utils/troveUtils'
import { ALL_SLOT_KEYS } from '../../essenceCrafting/types'
import { checkPotentialConflict, getBonus, getSlotOwner, normalizeString } from '../conflictResolver'
import { createEssenceCraftedItem } from '../helpers'
import {
  type GearItem,
  type GearSetup,
  GearSlot,
  isPetSlot,
  type SetBonusIndex,
  type SetBonusIndexEntry
} from '../types'

const getVisibleItemNames = (allItemsBySlot: Map<GearSlot, GearItem[]>, min: number, max: number): Set<string> => {
  const names = new Set<string>()
  for (const [slot, items] of allItemsBySlot.entries()) {
    if (isPetSlot(slot)) continue
    for (const item of items) {
      const level = Number(item.minLevel) || 1
      if (level >= min && level <= max) names.add(item.name)
    }
  }
  return names
}

interface GetSetsWithItemsInSlotOptions {
  browsingSlot: GearSlot | null
  allItemsBySlot: Map<GearSlot, GearItem[]>
  itemSetBonusIndex: SetBonusIndex
  min: number
  max: number
  isItemVisibleForClasses: (item: GearItem, setup: GearSetup) => boolean
  activeSetup: GearSetup
  shouldShowItem: (item: GearItem, slot: GearSlot, setup: GearSetup, ignoreSlotted: boolean) => boolean
}

const getSetsWithItemsInSlot = ({
  browsingSlot,
  allItemsBySlot,
  itemSetBonusIndex,
  min,
  max,
  isItemVisibleForClasses,
  activeSetup,
  shouldShowItem
}: GetSetsWithItemsInSlotOptions): Set<string> => {
  if (!browsingSlot) return new Set(Object.keys(itemSetBonusIndex))
  if (isPetSlot(browsingSlot)) return new Set()
  const sets = new Set<string>()
  const slotItems = allItemsBySlot.get(browsingSlot) ?? []
  for (const i of slotItems) {
    const level = Number(i.minLevel) || 1
    if (
      level >= min &&
      level <= max &&
      isItemVisibleForClasses(i, activeSetup) &&
      shouldShowItem(i, browsingSlot, activeSetup, true)
    ) {
      i.setBonus?.forEach((s) => sets.add(s.name))
    }
  }
  return sets
}

const makeGearItemComparator =
  (troveData: Record<string, unknown> | null) =>
  (a: GearItem, b: GearItem): number => {
    if (a.isEssenceCrafted && !b.isEssenceCrafted) return -1
    if (!a.isEssenceCrafted && b.isEssenceCrafted) return 1

    const isOwnedA = troveData?.[getTroveKey(a.name)] ? 1 : 0
    const isOwnedB = troveData?.[getTroveKey(b.name)] ? 1 : 0
    if (isOwnedA !== isOwnedB) return isOwnedB - isOwnedA

    const levelA = Number(a.minLevel) || 1
    const levelB = Number(b.minLevel) || 1
    if (levelA !== levelB) return levelB - levelA

    return a.name.localeCompare(b.name)
  }

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
  enchantmentBonusType,
  setBonusFilter,
  showOwnedOnly,
  showConflicts,
  getEntityState,
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

  const isItemConflicting = useCallback(
    (item: GearItem, slot: GearSlot) => {
      if (showConflicts) {
        return false
      }

      const entityState = getEntityState(getSlotOwner(slot))
      const equipped = entityState.equipped.filter((i) => i.id !== entityState.slots[slot]?.id)

      const enchantments = item.enchantments ?? item.effectsAdded ?? []
      for (const ench of enchantments) {
        const { isConflict, isUpgrade } = checkPotentialConflict(ench, equipped, slot, {
          slottedAugments: entityState.slottedAugments,
          slottedNearlyFinished: entityState.slottedNearlyFinished,
          slottedRitualTable: entityState.slottedRitualTable,
          slottedLostPurpose: entityState.slottedLostPurpose,
          slottedTraceOfMadness: entityState.slottedTraceOfMadness,
          slottedFountainOfNecroticMight: entityState.slottedFountainOfNecroticMight,
          slottedStormreaverUpgrade: entityState.slottedStormreaverUpgrade,
          slottedZhentarimAttuned: entityState.slottedZhentarimAttuned,
          ignoreItemId: item.id
        })

        if (isConflict && !isUpgrade) {
          return true
        }
      }

      return false
    },
    [showConflicts, getEntityState]
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

    const visibleItemNames = getVisibleItemNames(allItemsBySlot, min, max)
    const setsWithItemsInSlot = getSetsWithItemsInSlot({
      browsingSlot,
      allItemsBySlot,
      itemSetBonusIndex,
      min,
      max,
      isItemVisibleForClasses,
      activeSetup,
      shouldShowItem
    })

    return Object.keys(itemSetBonusIndex)
      .filter((setName: string) => {
        if (!isSetVisibleInRange(setName, itemSetBonusIndex, visibleItemNames)) {
          return false
        }

        if (browsingSlot && !browsingSet) {
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
    isSetVisibleInRange
  ])

  const filteredFiligreeSets: string[] = useMemo(() => {
    if (!dataReady) return []
    if (browsingSlot && !browsingSet && browsingSlot !== GearSlot.Filigree) return []
    return Object.keys(filigreeSetBonusIndex).sort((a, b) => a.localeCompare(b))
  }, [filigreeSetBonusIndex, dataReady, browsingSlot, browsingSet])

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
      items.push(
        createItem('Weapon (Melee)', `Essence Crafted Weapon (Melee)`),
        createItem('Weapon (Ranged)', `Essence Crafted Weapon (Ranged)`)
      )
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

        if (isItemConflicting(item, browsingSlot)) {
          return false
        }

        return filterByOwned(item)
      })
      .sort(makeGearItemComparator(troveData))
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
    getEssenceCraftedItems,
    isItemConflicting
  ])

  const searchResultsBySlot = useMemo(() => {
    if (!dataReady) return {}

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

        if (!showConflicts && isItemConflicting(item, slot)) {
          return false
        }

        if (normalizedSearch) {
          if (enchantmentBonusType) {
            const hasMatch =
              item.enchantments?.some(
                (e) => normalizeString(e.name).includes(normalizedSearch) && getBonus(e.bonus) === enchantmentBonusType
              ) ||
              item.effectsAdded?.some(
                (e) => normalizeString(e.name).includes(normalizedSearch) && getBonus(e.bonus) === enchantmentBonusType
              )
            if (!hasMatch) return false
          } else {
            const matchName = item.normalizedName?.includes(normalizedSearch)
            const matchEnchantment = item.normalizedEnchantments?.some((e) => e.includes(normalizedSearch))
            if (!matchName && !matchEnchantment) return false
          }
        }

        const level: number = Number(item.minLevel) || 1

        return level >= activeSetup.minLevel && level <= activeSetup.maxLevel
      })

      if (filtered.length > 0) {
        results[slot] = filtered.toSorted(makeGearItemComparator(troveData))
      }
    }

    return results
  }, [
    dataReady,
    enchantmentSearch,
    enchantmentBonusType,
    allItemsBySlot,
    activeSetup,
    showOwnedOnly,
    troveData,
    isItemVisibleForClasses,
    browsingSlot,
    getEssenceCraftedItems,
    isItemConflicting,
    showConflicts
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
  enchantmentBonusType: string
  setBonusFilter: string | null
  showOwnedOnly: boolean
  showConflicts: boolean
  getEntityState: (owner: string) => import('../types').EntityGearState
  troveData: Record<string, unknown> | null
  isItemVisibleForClasses: (item: GearItem, setup: GearSetup) => boolean
}

export default useGearPlannerFiltering
