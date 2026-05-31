import stormreaverUpgradeData from '../../../data/stormreaverUpgrade.json'
import { type UpgradeSelectorProps } from '../types'
import GenericUpgradeSelector from './GenericUpgradeSelector'

const StormreaverUpgradeSelector = (props: UpgradeSelectorProps) => {
  return (
    <GenericUpgradeSelector
      {...props}
      upgradeDataSet={stormreaverUpgradeData}
      enchantmentName='Upgradeable Item (Stormreaver)'
      label='Upgrade in Stormreaver Monument'
      idPrefix='stormreaver-upgrade'
    />
  )
}

export default StormreaverUpgradeSelector
