import { Accordion } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types.ts'
import { cannithRepurposingStation as lostPurposeRecipes } from '../../../data/cannithRepurposingStation.ts'
import { getTroveKey } from '../../../utils/troveUtils.ts'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import {
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment,
  type LootItem,
  type SetBonusIndex,
  type SlotKey
} from '../types.ts'
import SearchResultSlot from './SearchResultSlot.tsx'

const SetBonusItems = (props: Props) => {
  const {
    browsingSet,
    activeSetup,
    allItems,
    setBonusIndex,
    isItemVisibleForClasses,
    showOwnedOnly,
    troveData,
    itemNameSearch,
    getContextInfo,
    selectItem,
    openSetBonusBrowser
  } = props

  const indexedItems = browsingSet in setBonusIndex ? setBonusIndex[browsingSet] : []
  const min = activeSetup.minLevel
  const max = activeSetup.maxLevel

  // Check if this is a Lost Purpose set
  const isLostPurposeSet = lostPurposeRecipes.some((r) => r.setBonus?.[0]?.name === browsingSet)

  const setItemResults = allItems.filter((item) => {
    const itemLevel = Number(item.minLevel) || 1
    if (itemLevel < min || itemLevel > max) return false
    if (!isItemVisibleForClasses(item, activeSetup)) return false

    // Owned Only filter
    if (showOwnedOnly && troveData) {
      if (!(getTroveKey(item.name) in troveData)) {
        return false
      }
    }

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

    // Normal set bonus check
    const isInIndex = indexedItems?.some(
      (ii) => ii.name === item.name && (item.slot === GearSlot.Filigree || ii.minLevel === itemLevel)
    )

    if (isInIndex) return true

    // Lost Purpose check
    if (isLostPurposeSet && Array.isArray(item.enchantments)) {
      return item.enchantments.some((enchantment: LootEnchantment) => enchantment.name === 'Lost Purpose')
    }

    return false
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
  activeSetup: GearSetup
  allItems: GearItem[]
  setBonusIndex: SetBonusIndex
  isItemVisibleForClasses: (item: GearItem, setup: GearSetup) => boolean
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
  openSetBonusBrowser: (setName: string) => void
}

export default SetBonusItems
