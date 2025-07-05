import { Fragment, type ReactNode, useMemo } from 'react'
import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { titleCase } from 'title-case'
import { parseUniqueEffects } from '../../pages/greenSteel/legendary/helpers/filterUtils.ts'
import type { Enhancement } from '../../types/core.ts'
import type { CraftingIngredient } from '../../types/crafting'
import FarmedIngredientDisplay from '../FarmedIngredientDisplay'
import FilterOffCanvas from '../filters/FilterOffCanvas.tsx'

const FilterableDropdown = (props: Props) => {
  const {
    canFilter = true,
    filters = [],
    filterMode = 'OR',
    filteredItems,
    onFilterModeChange,
    onFiltersChange,
    groupBySecondaryFocus,
    disabled = false,
    dropdownTriggerPrefix,
    items,
    label,
    onReset,
    onSelect,
    renderSectionHeader,
    renderSectionBody,
    selectedItem,
    title
  } = props

  const renderDropdownItems = (key: string, ingredients: CraftingIngredient[]) => {
    if (ingredients.length === 0) {
      return <></>
    }

    if (groupBySecondaryFocus && renderSectionHeader) {
      return renderSectionHeader(key, ingredients) as React.JSX.Element
    }

    return (
      <>
        <Dropdown.Header className='border-bottom bg-light-subtle text-white'>
          {renderSectionHeader ? (
            renderSectionHeader(key, ingredients)
          ) : (
            <h6 className='m-0 text-center'>{titleCase(key)}</h6>
          )}
        </Dropdown.Header>

        {ingredients.map((ingredient: CraftingIngredient) => (
          <Dropdown.Item
            key={ingredient.name}
            onClick={() => {
              onSelect(ingredient)
            }}
          >
            {renderSectionBody ? (
              renderSectionBody(ingredient)
            ) : (
              <FarmedIngredientDisplay ingredient={ingredient} quantity={1} showLocation={false} showQuantity={false} />
            )}
          </Dropdown.Item>
        ))}
      </>
    )
  }

  const uniqueEffects: string[] = useMemo(() => parseUniqueEffects(items), [items])

  return (
    <Stack direction='vertical' gap={0}>
      <small>{title}</small>
      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <Dropdown.Toggle
            disabled={disabled}
            className='w-100 d-flex flex-row align-items-center justify-content-center border-light'
            title={disabled ? 'You can only select a Basic upgrade or a Focused upgrade' : undefined}
          >
            <Col sm={1}>{dropdownTriggerPrefix}</Col>
            <Col sm={11} className='d-flex justify-content-start'>
              <strong>
                <small>{label}</small>
              </strong>
            </Col>
          </Dropdown.Toggle>

          <Dropdown.Menu
            className='py-0 w-100'
            style={{
              maxHeight: '50vh',
              overflowY: 'auto'
            }}
          >
            {Object.entries(filteredItems ?? items).map(([key, ingredients]: [string, CraftingIngredient[]]) => (
              <Fragment>{renderDropdownItems(key, ingredients)}</Fragment>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {selectedItem && onReset && (
          <Button variant='outline-info' onClick={onReset}>
            Reset
          </Button>
        )}

        {canFilter && onFiltersChange && onFilterModeChange && (
          <FilterOffCanvas
            filterMode={filterMode}
            filterOptions={uniqueEffects}
            items={Object.values(items).flat()}
            getItemFilters={(item: CraftingIngredient): string[] =>
              item.effectsAdded?.map((enhancement: Enhancement) => enhancement.name) ?? []
            }
            selectedFilters={filters}
            setSelectedFilters={onFiltersChange}
            setFilterMode={onFilterModeChange}
          />
        )}
      </Stack>
    </Stack>
  )
}

/**
 * Properties:
 * - canFilter: Optional boolean value indicating whether the filtering functionality is enabled.
 * - disabled: Optional boolean value to indicate if the component is disabled.
 * - dropdownTriggerPrefix: Optional string used as a prefix for the dropdown trigger.
 * - filterMode: Optional mode ('OR' or 'AND') for applying filters.
 * - filters: Optional array of strings representing active filters.
 * - items: A required object where keys are strings and values are arrays of CraftingIngredient objects.
 * - label: A required string used as a label for the component.
 * - onFilterModeChange: Optional callback function triggered when the filter mode changes.
 * - onFiltersChange: Optional callback function triggered when the filters change.
 * - onReset: Optional callback function triggered to handle reset functionality.
 * - onSelect: Required callback function triggered when an item is selected.
 * - selectedItem: Optional selected CraftingIngredient item.
 * - title: A required string representing the title of the component.
 */
interface Props {
  canFilter?: boolean
  disabled?: boolean
  dropdownTriggerPrefix?: string
  filteredItems?: Record<string, CraftingIngredient[]>
  filterMode?: 'OR' | 'AND'
  filters?: string[]
  groupBySecondaryFocus?: boolean
  items: Record<string, CraftingIngredient[]>
  label: string
  onFilterModeChange?: (mode: 'OR' | 'AND') => void
  onFiltersChange?: (filters: string[]) => void
  onReset?: () => void
  onSelect: (item: CraftingIngredient) => void
  renderSectionHeader?: (name: string, ingredients?: CraftingIngredient[]) => ReactNode
  renderSectionBody?: (ingredient: CraftingIngredient) => ReactNode
  selectedItem: CraftingIngredient | undefined
  title: string
}

export default FilterableDropdown
