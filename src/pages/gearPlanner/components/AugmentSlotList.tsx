import { Badge } from 'react-bootstrap'
import type { GearAugmentSlot } from '../types.ts'

const AugmentSlotsList = (props: Props) => {
  const { augments } = props

  return (
    <div className='d-flex flex-wrap gap-1 mt-1'>
      {augments.map((slot, idx) => {
        let bgColor = 'bg-secondary'
        let textColor = 'text-white'

        switch (slot.augmentType) {
          case 'Red':
            bgColor = 'bg-danger'
            break
          case 'Blue':
            bgColor = 'bg-primary'
            break
          case 'Yellow':
            bgColor = 'bg-warning'
            textColor = 'text-dark'
            break
          case 'Purple':
            bgColor = 'bg-purple' // Need to define in CSS
            break
          case 'Orange':
            bgColor = 'bg-orange' // Need to define in CSS
            break
          case 'Green':
            bgColor = 'bg-success'
            break
          case 'Colorless':
            bgColor = 'bg-light'
            textColor = 'text-dark'
            break
          case 'Sun':
            bgColor = 'bg-info'
            textColor = 'text-dark'
            break
          case 'Moon':
            bgColor = 'bg-dark'
            // eslint-disable-next-line sonarjs/no-redundant-assignments
            textColor = 'text-white'
            break
        }

        return (
          <Badge
            key={`${slot.name ?? slot.augmentType}-${String(idx)}`}
            bg={undefined}
            className={`px-1 py-0 ${bgColor} ${textColor} border border-dark`}
            style={{ fontSize: '0.6rem', minWidth: '60px' }}
          >
            {slot.name ?? `${slot.augmentType} Slot`}
          </Badge>
        )
      })}
    </div>
  )
}

interface Props {
  augments: GearAugmentSlot[]
}

export default AugmentSlotsList
