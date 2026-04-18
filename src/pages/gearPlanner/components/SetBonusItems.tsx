import { Accordion } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types.ts'
import { cannithRepurposingStation as lostPurposeRecipes } from '../../../data/cannithRepurposingStation.ts'
import type { SetBonus } from '../../../types/crafting.ts'
import { getTroveKey } from '../../../utils/troveUtils.ts'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import {
  ARTIFICER_PET_SLOTS,
  DRUID_PET_SLOTS,
  type GearAugment,
  type GearItem,
  GearSlot,
  type LootEnchantment,
  type LootItem,
  type SetBonusIndex,
  type SetBonusIndexEntry,
  type SlotKey
} from '../types.ts'
import SearchResultSlot from './SearchResultSlot.tsx'

const SetBonusItems = (props: Props) => {
  const {
    browsingSet,
    allItems,
    setBonusIndex,
    showOwnedOnly,
    troveData,
    itemNameSearch,
    getContextInfo,
    selectItem,
    openSetBonusBrowser
  } = props

  const indexedItems = browsingSet in setBonusIndex ? setBonusIndex[browsingSet] : []

  // Check if this is a Lost Purpose set
  const isLostPurposeSet = lostPurposeRecipes.some((r) => r.setBonus?.[0]?.name === browsingSet)

  const setItemResults: GearItem[] = allItems.filter((item) => {
    const itemLevel: number = Number(item.minLevel) || 1

    // 0. Pet check
    const isPetSlot = (slot: string) =>
      ARTIFICER_PET_SLOTS.includes(slot as GearSlot) || DRUID_PET_SLOTS.includes(slot as GearSlot)
    if (isPetSlot(item.slot)) {
      return false
    }

    // 1. Set Match (must match the set we are browsing)

    let isMatch: boolean | undefined = indexedItems?.some(
      (ii: SetBonusIndexEntry) =>
        ii.name === item.name &&
        (item.slot === GearSlot.Filigree || ii.minLevel === 0 || Math.abs(ii.minLevel - itemLevel) <= 1)
    )

    // 1b. Check if the item itself explicitly lists this set bonus
    if (!isMatch && Array.isArray(item.setBonus)) {
      isMatch = item.setBonus.some((sb: SetBonus) => sb.name === browsingSet)
    }

    // 1c. Lost Purpose check
    if (!isMatch && isLostPurposeSet && Array.isArray(item.enchantments)) {
      isMatch = item.enchantments.some((enchantment: LootEnchantment) => enchantment.name === 'Lost Purpose')
    }

    if (!isMatch) {
      return false
    }

    // 2. Class Visibility (skip if we want to see everything in the set?)
    // The user said "show other items that also have the set bonus"
    // Usually we want to see what's available for our class, but if it's not showing anything,
    // maybe this filter is too strict. However, isItemVisibleForClasses usually just checks slot usability.
    // if (!isItemVisibleForClasses(item, activeSetup)) return false

    // 3. Level Range
    // When explicitly browsing a set, we want to show all items in that set regardless of the current level filter.
    // This ensures that when a user clicks a set bonus, they can actually "browse other items in the set"
    // as requested, even if they are higher or lower level than the current setup's range.
    // if (itemLevel < min || itemLevel > max) return false

    // 4. Owned Only filter
    if (showOwnedOnly && troveData) {
      if (!(getTroveKey(item.name) in troveData)) {
        return false
      }
    }

    // 5. Name Search
    if (itemNameSearch) {
      const searchLower = itemNameSearch.toLowerCase().trim()
      if (
        !item.name.toLowerCase().includes(searchLower) &&
        !item.name
          .toLowerCase()
          .replaceAll(/[^a-z0-9]/g, '')
          .includes(searchLower.replaceAll(/[^a-z0-9]/g, ''))
      )
        return false
    }

    return true
  })

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
        const { currentConflicts, currentEquipped, currentSlottedAugments, currentSlottedFiligrees } =
          getContextInfo(slot)

        return (
          <SearchResultSlot
            key={slot}
            slot={slot}
            items={items}
            currentConflicts={currentConflicts}
            currentEquipped={currentEquipped}
            currentSlottedAugments={currentSlottedAugments}
            currentSlottedFiligrees={currentSlottedFiligrees as Record<string, (GearItem | null)[]>}
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
  troveData: ItemRollup | null
  itemNameSearch: string
  getContextInfo: (slot: string) => {
    currentConflicts: Record<string, EnchantmentConflict[]>
    currentEquipped: GearItem[]
    currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
    currentSlottedFiligrees: Record<string, (LootItem | null)[]>
  }
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  openSetBonusBrowser: (setName: string, slot?: GearSlot | null) => void
}

export default SetBonusItems
