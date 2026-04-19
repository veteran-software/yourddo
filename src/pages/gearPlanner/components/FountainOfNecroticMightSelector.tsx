import { Form } from 'react-bootstrap'
import { findFountainUpgradeData } from '../helpers'
import { type GearItem, GearSlot } from '../types'

interface Props {
  item: GearItem
  slot: GearSlot
  active: boolean
  onToggle: (active: boolean) => void
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

const FountainOfNecroticMightSelector = ({ item, slot, active, onToggle, wrapperClassName, wrapperStyle }: Props) => {
  const isUpgradeable = !!findFountainUpgradeData(item.name, item.pageTitle)

  const hasEnchantment = item.enchantments?.some((e) => e.name === 'Upgradeable Item (Black Abbot)')

  if (!isUpgradeable || !hasEnchantment) {
    return null
  }

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <Form.Check
        type='checkbox'
        id={`fountain-upgrade-${item.id}-${slot}`}
        label='Upgrade in Fountain of Necrotic Might'
        checked={active}
        onChange={(e) => {
          onToggle(e.target.checked)
        }}
        style={{ fontSize: '0.65rem' }}
        className='text-start fw-bold text-primary'
      />
    </div>
  )
}

export default FountainOfNecroticMightSelector
