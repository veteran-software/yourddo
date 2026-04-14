import type { GearItem, GearSetup } from '../types.ts'
import SetBonusBadge from './badges/SetBonusBadge.tsx'

const ItemSetBonusDisplay = (props: Props) => {
  const { activeSetup, openSetBonusBrowser, selectedItem } = props

  if (selectedItem.name.includes('Gem of Many Facets')) {
    const gemBonuses = activeSetup.slottedGemSetBonuses?.[selectedItem.id] || []
    const activeGemBonuses = gemBonuses.filter((b) => b !== null)

    if (activeGemBonuses.length === 0) {
      return null
    }

    return (
      <div className='my-0'>
        {activeGemBonuses.map((setName) => (
          <SetBonusBadge
            key={setName}
            openSetBonusBrowser={openSetBonusBrowser}
            setName={setName}
          />
        ))}
      </div>
    )
  }

  if (selectedItem.setBonus && selectedItem.setBonus.length > 0) {
    return (
      <div className='my-0'>
        {selectedItem.setBonus.map((sb) => (
          <SetBonusBadge
            key={sb.name}
            setName={sb.name}
            openSetBonusBrowser={openSetBonusBrowser}
          />
        ))}
      </div>
    )
  }

  return null
}

interface Props {
  selectedItem: GearItem
  activeSetup: GearSetup
  openSetBonusBrowser: (setName: string) => void
}

export default ItemSetBonusDisplay
