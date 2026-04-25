import { useCallback, useMemo } from 'react'
import { Accordion } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types.ts'
import { cannithRepurposingStation as lostPurposeRecipes } from '../../../data/cannithRepurposingStation.ts'
import type { SetBonus } from '../../../types/crafting.ts'
import { getTroveKey } from '../../../utils/troveUtils.ts'
import { checkPotentialConflict, getSlotOwner } from '../conflictResolver'
import {
  type EntityGearState,
  type GearItem,
  type GearSetup,
  GearSlot,
  isPetSlot,
  type LootEnchantment,
  type SetBonusIndex,
  type SetBonusIndexEntry,
  type SlotKey
} from '../types'
import SearchResultSlot from './SearchResultSlot.tsx'

const isSetMatch = (
  item: GearItem,
  browsingSet: string,
  indexedItems: SetBonusIndexEntry[],
  isLostPurposeSet: boolean
) => {
  const itemLevel: number = Number(item.minLevel) || 1

  // 1. Set Match (must match the set we are browsing)
  if (
    indexedItems.some(
      (ii: SetBonusIndexEntry) =>
        ii.name === item.name &&
        (item.slot === GearSlot.Filigree || ii.minLevel === 0 || Math.abs(ii.minLevel - itemLevel) <= 1)
    )
  )
    return true

  // 1b. Check if the item itself explicitly lists this set bonus
  if (Array.isArray(item.setBonus) && item.setBonus.some((sb: SetBonus) => sb.name === browsingSet)) return true

  // 1c. Lost Purpose check
  if (
    isLostPurposeSet &&
    Array.isArray(item.enchantments) &&
    item.enchantments.some((enchantment: LootEnchantment) => enchantment.name === 'Lost Purpose')
  )
    return true

  return false
}

const SetBonusItems = (props: Props) => {
  const {
    browsingSet,
    allItems,
    setBonusIndex,
    showOwnedOnly,
    showConflicts,
    troveData,
    itemNameSearch,
    getEntityState,
    selectItem,
    openSetBonusBrowser,
    activeSetup,
    isItemVisibleForClasses
  } = props

  const indexedItems = useMemo(
    () => (browsingSet && browsingSet in setBonusIndex ? (setBonusIndex[browsingSet] ?? []) : []),
    [browsingSet, setBonusIndex]
  )

  // Check if this is a Lost Purpose set
  const isLostPurposeSet = useMemo(
    () => lostPurposeRecipes.some((r) => r.setBonus?.[0]?.name === browsingSet),
    [browsingSet]
  )

  const isItemMatch = useCallback(
    (item: GearItem) => {
      // 0. Class/Category visibility check
      if (!isItemVisibleForClasses(item, activeSetup)) {
        return false
      }

      // 0b. Pet check
      if (isPetSlot(item.slot)) {
        return false
      }

      // 1. Set Match (must match the set we are browsing)
      if (!isSetMatch(item, browsingSet, indexedItems, isLostPurposeSet)) {
        return false
      }

      // 4. Owned Only filter
      if (showOwnedOnly && troveData && !(getTroveKey(item.name) in troveData)) {
        return false
      }

      // 5. Name Search
      if (itemNameSearch) {
        const searchLower = itemNameSearch.toLowerCase().trim()
        const normalizedItemName = item.name.toLowerCase().replaceAll(/[^a-z0-9]/g, '')
        const normalizedSearch = searchLower.replaceAll(/[^a-z0-9]/g, '')
        if (!item.name.toLowerCase().includes(searchLower) && !normalizedItemName.includes(normalizedSearch))
          return false
      }

      // 6. Conflict Filter
      if (!showConflicts) {
        const entityState = getEntityState(getSlotOwner(item.slot))
        const isConflicting = (item.enchantments ?? item.effectsAdded ?? []).some((ench) => {
          const res = checkPotentialConflict(
            ench,
            entityState.equipped.filter((i) => i.id !== entityState.slots[item.slot]?.id),
            item.slot,
            entityState.slottedAugments,
            entityState.slottedNearlyFinished,
            entityState.slottedRitualTable,
            entityState.slottedLostPurpose,
            entityState.slottedTraceOfMadness,
            entityState.slottedFountainOfNecroticMight,
            entityState.slottedStormreaverUpgrade,
            entityState.slottedZhentarimAttuned,
            item.id
          )
          return res.isConflict && !res.isUpgrade
        })

        if (isConflicting) return false
      }

      return true
    },
    [
      browsingSet,
      indexedItems,
      isLostPurposeSet,
      showOwnedOnly,
      troveData,
      itemNameSearch,
      showConflicts,
      getEntityState,
      isItemVisibleForClasses,
      activeSetup
    ]
  )

  const setItemResults: GearItem[] = useMemo(() => allItems.filter(isItemMatch), [allItems, isItemMatch])

  if (setItemResults.length === 0) {
    return (
      <div className='text-center py-4 text-secondary small'>
        No items found for this set in the selected level range.
      </div>
    )
  }

  // Group by slot
  const grouped: Record<string, GearItem[]> = {}
  setItemResults
    .toSorted((a, b) => {
      // Priority 1: Trove ownership
      const isOwnedA = troveData?.[getTroveKey(a.name)] ? 1 : 0
      const isOwnedB = troveData?.[getTroveKey(b.name)] ? 1 : 0
      if (isOwnedA !== isOwnedB) return isOwnedB - isOwnedA

      // Priority 2: Min Level (desc)
      const levelA = Number.parseInt(String(a.minLevel), 10) || 0
      const levelB = Number.parseInt(String(b.minLevel), 10) || 0
      if (levelB !== levelA) return levelB - levelA

      // Priority 3: Name (asc)
      return a.name.localeCompare(b.name)
    })
    .forEach((item) => {
      const slotKey: SlotKey = item.slot
      if (!(slotKey in grouped)) {
        grouped[slotKey] = []
      }

      grouped[slotKey].push(item)
    })

  return (
    <Accordion data-bs-theme='dark'>
      {Object.entries(grouped).map(([slot, items]) => {
        return (
          <SearchResultSlot
            key={slot}
            slot={slot}
            items={items}
            entityState={getEntityState(getSlotOwner(slot))}
            selectItem={selectItem}
            setShowEnchantmentSearch={() => {
              /* Don't close for set bonus browser */
            }}
            openSetBonusBrowser={openSetBonusBrowser}
            troveData={troveData}
            browsingSet={browsingSet}
          />
        )
      })}
    </Accordion>
  )
}

interface Props {
  browsingSet: string
  allItems: GearItem[]
  setBonusIndex: SetBonusIndex
  showOwnedOnly: boolean
  showConflicts: boolean
  troveData: ItemRollup | null
  itemNameSearch: string
  getEntityState: (owner: string) => EntityGearState
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  openSetBonusBrowser: (setName: string, slot?: GearSlot | null) => void
  activeSetup: GearSetup
  isItemVisibleForClasses: (item: GearItem, setup: GearSetup) => boolean
}

export default SetBonusItems
