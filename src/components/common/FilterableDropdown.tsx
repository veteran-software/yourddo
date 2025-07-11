import { Fragment, useMemo } from 'react'
import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { titleCase } from 'title-case'
import type { Enhancement } from '../../types/core.ts'
import type { CraftingIngredient } from '../../types/crafting'
import FilterOffCanvas from '../filters/FilterOffCanvas.tsx'
import { parseUniqueEffects } from '../filters/helpers/filterUtils.ts'
import CraftedIngredientDisplay from './CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from './FarmedIngredientDisplay.tsx'

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
    title,
    displayEffectsAdded = false
  } = props

  const isCraftedIngredient = (ingredient: CraftingIngredient): boolean => {
    return 'craftedIn' in ingredient || 'effectsAdded' in ingredient
  }

  const renderIngredientContent = (ingredient: CraftingIngredient) => {
    if (renderSectionBody) {
      return renderSectionBody(ingredient)
    }

    if (isCraftedIngredient(ingredient)) {
      return (
        <>
          <CraftedIngredientDisplay
            ingredient={ingredient}
            quantity={1}
            showLocation={true}
            showQuantity={false}
            showEffects={displayEffectsAdded}
          />
        </>
      )
    }

    return <FarmedIngredientDisplay ingredient={ingredient} quantity={1} showLocation={true} showQuantity={false} />
  }

  const renderDropdownItems = (key: string, ingredients: CraftingIngredient[]) => {
    if (ingredients.length === 0) {
      return <></>
    }

    if (groupBySecondaryFocus && renderSectionHeader) {
      return renderSectionHeader(key, ingredients)
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

        {ingredients.map((ingredient: CraftingIngredient, idx: number) => (
          <Dropdown.Item
            key={`${ingredient.name}-${String(idx)}`}
            onClick={() => {
              onSelect(ingredient)
            }}
          >
            <Stack direction='vertical' gap={1}>
              {renderIngredientContent(ingredient)}
            </Stack>
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
              <Fragment key={`${key}-${ingredients.map((ing: CraftingIngredient) => ing.name).join('|')}`}>
                {renderDropdownItems(key, ingredients)}
              </Fragment>
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
 * @property {boolean} [canFilter] - Indicates if filtering is enabled.
 * @property {boolean} [disabled] - Determines if the component is disabled.
 * @property {boolean} [displayEffectsAdded] - Flag to display additional effects if enabled.
 * @property {string} [dropdownTriggerPrefix] - Optional prefix for the dropdown trigger.
 * @property {'OR' | 'AND'} [filterMode] - Logical mode used for filtering, can be 'OR' or 'AND'.
 * @property {Record<string, CraftingIngredient[]>} [filteredItems] - A record of filtered items.
 * @property {string[]} [filters] - List of currently active filters.
 * @property {boolean} [groupBySecondaryFocus] - Indicates if items should be grouped by a secondary focus.
 * @property {Record<string, CraftingIngredient[]>} items - A record of items categorized by a key.
 * @property {string} label - Label text for the component or input.
 * @property {(mode: 'OR' | 'AND') => void} [onFilterModeChange] - Callback function triggered when the filter mode changes.
 * @property {(filters: string[]) => void} [onFiltersChange] - Callback function invoked when filters are updated.
 * @property {() => void} [onReset] - Callback function invoked when resetting filters or selection.
 * @property {(item: CraftingIngredient) => void} onSelect - Callback function triggered when an item is selected.
 * @property {(ingredient: CraftingIngredient) => Element} [renderSectionBody] - Optional function to render the body of a section.
 * @property {(name: string, ingredients?: CraftingIngredient[]) => Element} [renderSectionHeader] - Optional function to render the header of a section.
 * @property {CraftingIngredient | undefined} selectedItem - The currently selected item, if any.
 * @property {string} title - The title or heading of the component.
 */
interface Props {
  canFilter?: boolean
  disabled?: boolean
  displayEffectsAdded?: boolean
  dropdownTriggerPrefix?: string
  filterMode?: 'OR' | 'AND'
  filteredItems?: Record<string, CraftingIngredient[]>
  filters?: string[]
  groupBySecondaryFocus?: boolean
  items: Record<string, CraftingIngredient[]>
  label: string
  onFilterModeChange?: (mode: 'OR' | 'AND') => void
  onFiltersChange?: (filters: string[]) => void
  onReset?: () => void
  onSelect: (item: CraftingIngredient) => void
  renderSectionBody?: (ingredient: CraftingIngredient) => React.JSX.Element
  renderSectionHeader?: (name: string, ingredients?: CraftingIngredient[]) => React.JSX.Element
  selectedItem: CraftingIngredient | undefined
  title: string
}

export default FilterableDropdown
