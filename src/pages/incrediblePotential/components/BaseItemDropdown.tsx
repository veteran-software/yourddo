import { Dropdown } from 'react-bootstrap'
import type { Ring } from '../../../types/core.ts'
import { baseItems } from '../data/baseItems.ts'
import BaseItemDropdownItem from './BaseItemDropdownItem.tsx'

const BaseItemDropdown = (props: Props) => {
  const { buttonLabel, onSelectItem } = props

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant='outline-info'
        className='w-100'
        aria-label='Select an item'
      >
        {buttonLabel}
      </Dropdown.Toggle>
      <Dropdown.Menu
        style={{ maxHeight: '500px', overflowY: 'auto' }}
        aria-labelledby='dropdownMenu'
      >
        {baseItems.length > 0 ? (
          baseItems.map((item: Ring, idx: number) => (
            <BaseItemDropdownItem
              key={item.name}
              item={item}
              idx={idx}
              onSelectItem={onSelectItem}
            />
          ))
        ) : (
          <Dropdown.Item className='text-muted'>
            No items available
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

interface Props {
  onSelectItem: (item: Ring) => void
  buttonLabel: string
}

export default BaseItemDropdown
