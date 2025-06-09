import { Image, Stack } from 'react-bootstrap'
import ringImage from '../../../assets/icons/ringOfIncrediblePotential.png'
import FilterableDropdown from '../../../components/filters/FilterableDropdown.tsx'
import type { Enhancement, Ring } from '../../../types/core.ts'
import { baseItems } from '../data/baseItems.ts'
import DropdownItemTitle from './DropdownItemTitle.tsx'

const BaseItemDropdown = (props: Props) => {
  const { buttonLabel, onSelectItem } = props

  // Function to extract enhancement names from a ring item
  const getItemFilters = (item: Ring): string[] => {
    // Only use the first two enhancements for filtering
    return item.enchantments.slice(0, 2).map((enhancement) => enhancement.name)
  }

  const renderItem = (item: Ring) => (
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
  )

  return (
    <FilterableDropdown
      items={baseItems}
      getItemFilters={getItemFilters}
      renderItem={renderItem}
      onSelectItem={onSelectItem}
      buttonLabel={buttonLabel}
      variant='outline-info'
      maxHeight='500px'
      maxFilterColumns={3}
    />
  )
}

interface Props {
  onSelectItem: (item: Ring) => void
  buttonLabel: string
}

export default BaseItemDropdown
