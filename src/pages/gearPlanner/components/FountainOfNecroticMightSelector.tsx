import fountainData from '../../../data/fountainOfNecroticMight.json'
import { type UpgradeSelectorProps } from '../types'
import GenericUpgradeSelector from './GenericUpgradeSelector'

const FountainOfNecroticMightSelector = (props: UpgradeSelectorProps) => {
  return (
    <GenericUpgradeSelector
      {...props}
      upgradeDataSet={fountainData}
      enchantmentName='Upgradeable Item (Black Abbot)'
      label='Upgrade in Fountain of Necrotic Might'
      idPrefix='fountain-upgrade'
    />
  )
}

export default FountainOfNecroticMightSelector
