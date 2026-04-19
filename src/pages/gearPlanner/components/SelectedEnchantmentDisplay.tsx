import type { EnchantmentConflict } from '../conflictResolver.ts'
import {
  type GearAugment,
  type GearItem,
  type GearSlot,
  type LootEnchantment
} from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'

export interface BaseSelectorProps {
  item: GearItem
  slot: GearSlot
  selectedEnchantment: LootEnchantment | null
  onSelect: (enchantment: LootEnchantment | null) => void
  conflicts: Record<string, EnchantmentConflict[]>
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedNearlyFinished: Record<string, LootEnchantment | null>
  slottedRitualTable: Record<string, LootEnchantment | null>
  slottedLostPurpose: Record<string, LootEnchantment | null>
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

interface Props {
  selectedEnchantment: LootEnchantment | null
  item: GearItem
  slot: GearSlot
  conflicts: Record<string, EnchantmentConflict[]>
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedNearlyFinished: Record<string, LootEnchantment | null>
  slottedRitualTable: Record<string, LootEnchantment | null>
  slottedLostPurpose: Record<string, LootEnchantment | null>
  className?: string
}

const SelectedEnchantmentDisplay = (props: Props) => {
  const {
    selectedEnchantment,
    item,
    slot,
    conflicts,
    equippedItems,
    slottedAugments,
    slottedNearlyFinished,
    slottedRitualTable,
    slottedLostPurpose,
    className
  } = props

  if (!selectedEnchantment) return null

  return (
    <div className={className ?? 'mt-1 text-secondary text-start'} style={{ fontSize: '0.6rem', lineHeight: '1.1' }}>
      <EnchantmentList
        enchantments={[selectedEnchantment]}
        itemId={item.id}
        conflicts={conflicts}
        equippedItems={equippedItems}
        source='slot'
        browsingSlot={slot}
        slottedAugments={slottedAugments}
        slottedNearlyFinished={slottedNearlyFinished}
        slottedRitualTable={slottedRitualTable}
        slottedLostPurpose={slottedLostPurpose}
      />
    </div>
  )
}

export default SelectedEnchantmentDisplay
