import { Badge } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types.ts'
import { getTroveOwners, normItem } from '../../../utils/troveUtils.ts'

const TroveBadge = (props: Props) => {
  const { itemName, troveData } = props

  const troveEntry = troveData?.[normItem(itemName)]

  if (!troveEntry) {
    return null
  }

  const owners = getTroveOwners(troveEntry)

  if (!owners) {
    return null
  }

  return (
    <Badge bg='primary' className='mx-1 shadow-sm border border-1' style={{ fontSize: '0.6rem' }}>
      {owners}
    </Badge>
  )
}

interface Props {
  itemName: string
  troveData: ItemRollup | null
}

export default TroveBadge
