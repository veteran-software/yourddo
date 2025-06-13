import { useMemo } from 'react'
import {
  Badge,
  ButtonGroup,
  Col,
  Form,
  Row,
  ToggleButton
} from 'react-bootstrap'
import { useAppDispatch } from '../../redux/hooks.ts'
import { setFilterMode } from '../../redux/slices/incrediblePotentialSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'

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
    filterMode,
    filterOptions,
    items,
    getItemFilters,
    maxFilterColumns = 3,
    selectedFilters,
    setSelectedFilters
  } = props
  const dispatch: AppDispatch = useAppDispatch()

  // Calculate the count of items for each filter
  const filterCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {}

    filterOptions.forEach((filter: string) => {
      counts[filter] = items.filter((item: T) => {
        return getItemFilters(item).includes(filter)
      }).length
    })

    return counts
  }, [filterOptions, items, getItemFilters])

  const toggleFilter = (filter: string) => {
    setSelectedFilters(
      selectedFilters.includes(filter)
        ? selectedFilters.filter((f: string) => f !== filter)
        : [...selectedFilters, filter]
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
            variant={filterMode === 'OR' ? 'light' : 'outline-light'}
            name='filter-mode'
            value='OR'
            checked={filterMode === 'OR'}
            onChange={() => {
              dispatch(setFilterMode('OR'))
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
            variant={filterMode === 'AND' ? 'light' : 'outline-light'}
            name='filter-mode'
            value='AND'
            checked={filterMode === 'AND'}
            onChange={() => {
              dispatch(setFilterMode('AND'))
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
  filterMode: 'AND' | 'OR'
  filterOptions: string[]
  getItemFilters: (item: T) => string[]
  items: T[]
  maxFilterColumns?: number
  selectedFilters: string[]
  setSelectedFilters: (selectedFilters: string[]) => void
}

export default FilterSection
