import { Form } from 'react-bootstrap'
import { findUpgradeData } from '../helpers'
import { type UpgradeEntry, type UpgradeSelectorProps } from '../types'

interface Props extends UpgradeSelectorProps {
  upgradeDataSet: UpgradeEntry[]
  enchantmentName: string
  label: string
  idPrefix: string
}

const GenericUpgradeSelector = ({
  item,
  slot,
  active,
  onToggle,
  wrapperClassName,
  wrapperStyle,
  upgradeDataSet,
  enchantmentName,
  label,
  idPrefix
}: Props) => {
  const isUpgradeable = !!findUpgradeData(item.name, upgradeDataSet, item.pageTitle)
  const hasEnchantment = item.enchantments?.some((e) => e.name === enchantmentName)

  if (!isUpgradeable || !hasEnchantment) {
    return null
  }

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <Form.Check
        type='checkbox'
        id={`${idPrefix}-${item.id}-${slot}`}
        label={label}
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

export default GenericUpgradeSelector
