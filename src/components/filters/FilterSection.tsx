import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  ButtonGroup,
  Col,
  Form,
  OverlayTrigger,
  Row,
  ToggleButton,
  Tooltip
} from 'react-bootstrap'

// Styles for the filter components
const customStyles = {
  cursorPointer: {
    cursor: 'pointer'
  },
  disabledFilter: {
    opacity: 0.6
  }
}

/**
 * A reusable filter section component that provides filtering capabilities
 * with support for both 'OR' and 'AND' filtering modes
 */
const FilterSection = <T,>(props: Props<T>) => {
  const {
    filterOptions,
    items,
    getItemFilters,
    onFilteredItemsChange,
    maxFilterColumns = 3
  } = props

  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [filterMode, setFilterMode] = useState<'OR' | 'AND'>('OR')

  // Calculate the count of items for each filter
  const filterCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {}

    filterOptions.forEach((filter: string) => {
      counts[filter] = items.filter((item: T) =>
        getItemFilters(item).includes(filter)
      ).length
    })

    return counts
  }, [filterOptions, items, getItemFilters])

  // Function to toggle a filter selection
  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev: string[]) =>
      prev.includes(filter)
        ? prev.filter((f: string) => f !== filter)
        : [...prev, filter]
    )
  }

  // Calculate which filters would result in no matches if added to the current selection (in AND mode)
  const incompatibleFilters = useMemo(() => {
    if (filterMode !== 'AND' || selectedFilters.length === 0) return []

    // Get the current filtered items based on selected filters
    const currentFilteredItems: T[] = items.filter((item: T) =>
      selectedFilters.every((filterName: string) =>
        getItemFilters(item).includes(filterName)
      )
    )

    // For each unselected filter, check if adding it would result in no matches
    return filterOptions
      .filter((filter: string) => !selectedFilters.includes(filter))
      .filter((filter: string) => {
        // Would adding this filter result in no matches?
        return !currentFilteredItems.some((item) =>
          getItemFilters(item).includes(filter)
        )
      })
  }, [selectedFilters, filterMode, filterOptions, items, getItemFilters])

  // Filter the items based on selected filters and current mode
  const filteredItems: T[] = useMemo(() => {
    if (selectedFilters.length === 0) return items

    return items.filter((item: T) => {
      const itemFilters: string[] = getItemFilters(item)

      if (filterMode === 'OR') {
        // OR logic: Show items that have ANY of the selected filters
        return selectedFilters.some((filter: string) =>
          itemFilters.includes(filter)
        )
      } else {
        // AND logic: Show items that have ALL the selected filters
        return selectedFilters.every((filter: string) =>
          itemFilters.includes(filter)
        )
      }
    })
  }, [items, selectedFilters, filterMode, getItemFilters])

  // Use effect to notify parent of filtered items changes
  useEffect(() => {
    onFilteredItemsChange(filteredItems)
  }, [filteredItems, onFilteredItemsChange])

  return (
    <div className='filter-section p-2 user-select-none'>
      <div className='d-flex justify-content-between mb-2'>
        <h6 className='mb-0'>
          Filter Options:
          {selectedFilters.length > 0 && (
            <small className='text-info ms-2'>
              {filteredItems.length} matches
            </small>
          )}
        </h6>
        <ButtonGroup size='sm'>
          <ToggleButton
            id='filter-mode-or'
            type='radio'
            variant={filterMode === 'OR' ? 'primary' : 'outline-primary'}
            name='filter-mode'
            value='OR'
            checked={filterMode === 'OR'}
            onChange={() => {
              setFilterMode('OR')
              // Reset filters when changing modes to avoid confusion
              if (filterMode !== 'OR') {
                setSelectedFilters([])
              }
            }}
            size='sm'
          >
            OR
          </ToggleButton>
          <ToggleButton
            id='filter-mode-and'
            type='radio'
            variant={filterMode === 'AND' ? 'primary' : 'outline-primary'}
            name='filter-mode'
            value='AND'
            checked={filterMode === 'AND'}
            onChange={() => {
              setFilterMode('AND')
              // Reset filters when changing modes to avoid confusion
              if (filterMode !== 'AND') {
                setSelectedFilters([])
              }
            }}
            size='sm'
          >
            AND
          </ToggleButton>
        </ButtonGroup>
      </div>

      <small className='text-muted d-block mb-2'>
        {filterMode === 'OR'
          ? 'Items with ANY selected option will appear'
          : 'Items with ALL selected options will appear'}
        {filterMode === 'AND' &&
          incompatibleFilters.length > 0 &&
          selectedFilters.length > 0 && (
            <span className='d-block mt-1'>
              Some filters are disabled because they would result in no matches
            </span>
          )}
      </small>

      <Row
        xs={1}
        sm={maxFilterColumns > 1 ? 2 : 1}
        md={maxFilterColumns > 2 ? 3 : 2}
        lg={maxFilterColumns}
        className='g-2'
      >
        {filterOptions.map((filter) => (
          <Col key={filter}>
            {filterMode === 'AND' &&
            incompatibleFilters.includes(filter) &&
            !selectedFilters.includes(filter) ? (
              <OverlayTrigger
                placement='auto'
                overlay={
                  <Tooltip>
                    No items have both this option and your current selection
                  </Tooltip>
                }
              >
                <div style={customStyles.disabledFilter}>
                  <Form.Check
                    type='switch'
                    id={`filter-${filter.replace(/\s+/g, '-').toLowerCase()}`}
                    checked={selectedFilters.includes(filter)}
                    onChange={() => {
                      toggleFilter(filter)
                    }}
                    disabled={true}
                    className='text-truncate'
                    label={
                      <span className='d-flex justify-content-between align-items-center w-100'>
                        <span className='text-truncate'>{filter}</span>
                        <Badge bg='secondary' pill className='ms-1'>
                          {filterCounts[filter]}
                        </Badge>
                      </span>
                    }
                  />
                </div>
              </OverlayTrigger>
            ) : (
              <Form.Check
                type='switch'
                id={`filter-${filter.replace(/\s+/g, '-').toLowerCase()}`}
                checked={selectedFilters.includes(filter)}
                onChange={() => {
                  toggleFilter(filter)
                }}
                className='text-truncate'
                label={
                  <span className='d-flex justify-content-between align-items-center w-100'>
                    <span className='text-truncate'>{filter}</span>
                    <Badge bg='secondary' pill className='ms-1'>
                      {filterCounts[filter]}
                    </Badge>
                  </span>
                }
              />
            )}
          </Col>
        ))}
      </Row>

      {selectedFilters.length > 0 && (
        <div className='mt-2 d-flex justify-content-between align-items-center'>
          <div>
            <Badge bg='info' className='me-1'>
              {selectedFilters.length} active
            </Badge>
            {selectedFilters.map((filter) => (
              <Badge
                key={filter}
                bg='secondary'
                className='me-1'
                style={customStyles.cursorPointer}
                onClick={() => {
                  toggleFilter(filter)
                }}
              >
                {filter} ×
              </Badge>
            ))}
          </div>
          <Badge
            bg='danger'
            className=''
            style={customStyles.cursorPointer}
            onClick={() => {
              setSelectedFilters([])
            }}
          >
            Clear All
          </Badge>
        </div>
      )}
    </div>
  )
}

interface Props<T> {
  filterOptions: string[]
  items: T[]

  /**
   * Function to extract filter values from an item
   * For example, (item) => item.tags or (item) => item.enchantments.map(e => e.name)
   */
  getItemFilters: (item: T) => string[]

  /**
   * Callback when filtered items change
   */
  onFilteredItemsChange: (filteredItems: T[]) => void

  /**
   * Maximum number of columns to display in the filter grid
   * @default 3
   */
  maxFilterColumns?: number
}

export default FilterSection
