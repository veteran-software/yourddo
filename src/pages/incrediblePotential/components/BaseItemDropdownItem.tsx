import { Dropdown, Image, Stack } from 'react-bootstrap'
import ringImage from '../../../assets/icons/ringOfIncrediblePotential.png'
import type { Enhancement, Ring } from '../../../types/core.ts'
import DropdownItemTitle from './DropdownItemTitle.tsx'

const BaseItemDropdownItem = (props: Props) => {
  const { onSelectItem, idx, item } = props

  return (
    <Dropdown.Item
      key={`${item.name}-${String(idx)}`}
      className={`small${idx > 0 ? ' border-top' : ''}`}
      onClick={() => {
        onSelectItem(item)
      }}
    >
      <Stack direction='horizontal' gap={3}>
        <Image
          src={ringImage}
          alt={item.name}
          title={item.name}
          className='d-none d-md-block'
        />
        <Stack direction='vertical' gap={0}>
          <DropdownItemTitle title={item.name} />
          <small className='d-none d-lg-block'>
            {item.enchantments
              .map((enhancement: Enhancement) => enhancement.name)
              .join(', ')}
          </small>
        </Stack>
      </Stack>
    </Dropdown.Item>
  )
}

interface Props {
  item: Ring
  idx: number
  onSelectItem: (item: Ring) => void
}

export default BaseItemDropdownItem
