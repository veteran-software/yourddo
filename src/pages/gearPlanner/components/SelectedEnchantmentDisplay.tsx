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
  selectedEnchantment: LootEnchantment | null
  item: GearItem
  slot: GearSlot
  entityState: EntityGearState
  className?: string
}

const SelectedEnchantmentDisplay = (props: Props) => {
  const { selectedEnchantment, item, slot, entityState, className } = props

  if (!selectedEnchantment) return null

  return (
    <div className={className ?? 'mt-1 text-secondary text-start'} style={{ fontSize: '0.6rem', lineHeight: '1.1' }}>
      <EnchantmentList
        enchantments={[selectedEnchantment]}
        itemId={item.id}
        entityState={entityState}
        source='slot'
        browsingSlot={slot}
      />
    </div>
  )
}

export default SelectedEnchantmentDisplay
