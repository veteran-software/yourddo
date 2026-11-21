import zhentarimData from '../../../data/zhentarimAttuned.json'
import { type UpgradeSelectorProps } from '../types'
import GenericUpgradeSelector from './GenericUpgradeSelector'

const ZhentarimAttunedSelector = (props: UpgradeSelectorProps) => {
  return (
    <GenericUpgradeSelector
      {...props}
      upgradeDataSet={zhentarimData}
      enchantmentName='Zhentarim Attuned'
      label='Upgrade with Zhentarim Black Stones'
      idPrefix='zhentarim-attuned'
    />
  )
}

export default ZhentarimAttunedSelector
