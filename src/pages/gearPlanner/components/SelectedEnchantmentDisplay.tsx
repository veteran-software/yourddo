import { type EntityGearState, type GearItem, type GearSlot, type LootEnchantment } from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'

export interface BaseSelectorProps {
  item: GearItem
  slot: GearSlot
  selectedEnchantment: LootEnchantment | null
  onSelect: (enchantment: LootEnchantment | null) => void
  entityState: EntityGearState
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

interface Props {
  selectedEnchantment?: LootEnchantment | null
  selectedEnchantments?: LootEnchantment[] | null
  item: GearItem
  slot: GearSlot
  entityState: EntityGearState
  className?: string
}

const SelectedEnchantmentDisplay = (props: Props) => {
  const { selectedEnchantment, selectedEnchantments, item, slot, entityState, className } = props

  const enchantments = selectedEnchantments ?? (selectedEnchantment ? [selectedEnchantment] : [])

  if (enchantments.length === 0) return null

  return (
    <div className={className ?? 'mt-1 text-secondary text-start'} style={{ fontSize: '0.6rem', lineHeight: '1.1' }}>
      <EnchantmentList
        enchantments={enchantments}
        itemId={item.id}
        entityState={entityState}
        source='slot'
        browsingSlot={slot}
      />
    </div>
  )
}

export default SelectedEnchantmentDisplay
