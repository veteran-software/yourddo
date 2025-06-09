import { type ReactNode, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import FilterSection from './FilterSection'

const FilterableDropdown = <T,>(props: Props<T>) => {
  const {
    items,
    getItemFilters,
    renderItem,
    onSelectItem,
    buttonLabel,
    variant = 'outline-primary',
    maxHeight = '500px',
    filterOptionsLimit = () => true,
    maxFilterColumns
  } = props

  const [filteredItems, setFilteredItems] = useState<T[]>(items)

  // Extract all possible filter options from the items
  const allFilterOptions = Array.from(
    new Set(items.flatMap((item: T) => getItemFilters(item)))
  )
    .filter(filterOptionsLimit)
    .sort((a: string, b: string) => a.localeCompare(b))

  return (
    <Dropdown className='user-select-none'>
      <Dropdown.Toggle
        variant={variant}
        className='w-100'
        aria-label='Select an item'
      >
        {buttonLabel}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          maxHeight,
          overflowY: 'auto',
          width: '100%',
          minWidth: '320px'
        }}
      >
        <Dropdown.Header>
          <FilterSection
            filterOptions={allFilterOptions}
            items={items}
            getItemFilters={getItemFilters}
            onFilteredItemsChange={setFilteredItems}
            maxFilterColumns={maxFilterColumns}
          />
        </Dropdown.Header>

        <Dropdown.Divider />

        {filteredItems.length > 0 ? (
          filteredItems.map((item: T, idx: number) => (
            <Dropdown.Item
              key={String(idx)}
              onClick={() => {
                onSelectItem(item)
              }}
            >
              {renderItem(item, idx)}
            </Dropdown.Item>
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

interface Props<T> {
  /**
   * Items to be displayed and filtered in the dropdown
   */
  items: T[]

  /**
   * Function to extract filter values from an item
   */
  getItemFilters: (item: T) => string[]

  /**
   * Function to render each dropdown item
   */
  renderItem: (item: T, index: number) => ReactNode

  /**
   * Function called when an item is selected
   */
  onSelectItem: (item: T) => void

  /**
   * The label for the dropdown button
   */
  buttonLabel: string

  /**
   * Optional variant for the dropdown button
   * @default 'outline-primary'
   */
  variant?: string

  /**
   * Optional maximum height for the dropdown menu
   * @default '500px'
   */
  maxHeight?: string

  /**
   * Optional filter section heading
   * @default 'Filter Options:'
   */
  filterHeading?: string

  /**
   * Optional function to limit what filter options appear
   * @default (item, idx) => true
   */
  filterOptionsLimit?: (value: string, index: number) => boolean

  /**
   * Maximum number of columns to display in the filter grid
   * @default 3
   */
  maxFilterColumns?: number
}

export default FilterableDropdown
