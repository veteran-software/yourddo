import { useMemo } from 'react'
import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import FilterOffCanvas from '../../../components/filters/FilterOffCanvas.tsx'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  resetDevastationItem,
  selectDevastationItem,
  setDevastationFilterMode,
  setDevastationItemFilters
} from '../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { deconstructLgsShard } from '../../../utils/objectUtils.ts'
import IngredientDropdownToggle from '../../heroicGreenSteel/components/IngredientDropdownToggle.tsx'
import { filterIngredientsMap, parseUniqueEffects } from '../helpers/filterUtils.ts'
import { useDevastation } from '../hooks/useDevastation.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'

const DevastationDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedDevastationItem, devastationItemFilters, devastationFilterMode } = useAppSelector(
    (state) => state.legendaryGreenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useDevastation()

  const uniqueEffects: string[] = useMemo(() => parseUniqueEffects(ingredientsMap), [ingredientsMap])

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(devastationItemFilters, ingredientsMap),
    [ingredientsMap, devastationItemFilters]
  )

  const label = (
    <>
      <Col sm={1} title='Tier 3 : Legendary Altar of Devastation'>
        T3:
      </Col>

      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>
            {selectedDevastationItem
              ? selectedDevastationItem.effectsAdded?.map((effect: Enhancement) => effect.name).join(', ')
              : 'Select a Tier 3 Upgrade...'}
          </small>
        </strong>
      </Col>
    </>
  )

  const renderSection = (name: string, ingredients: CraftingIngredient[]) => {
    // Group ingredients by their secondary focus
    const groupedIngredients = ingredients.reduce((accumulator: Record<string, CraftingIngredient[]>, ingredient) => {
      const deconstructed: {
        focusP: string
        focusS?: string
        essence: string
        gem: string
      } | null = deconstructLgsShard(ingredient.name)
      const secondaryFocus: string = deconstructed?.focusS ?? 'Other'

      accumulator[secondaryFocus] ??= []

      accumulator[secondaryFocus].push(ingredient)

      return accumulator
    }, {})

    return (
      <>
        {Object.entries(groupedIngredients).map(([secondaryFocus, focusIngredients]) => (
          <IngredientDropdownSection
            key={`${name}-${secondaryFocus}`}
            clickHandler={selectDevastationItem}
            header={
              <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
                {name} - {secondaryFocus}
              </Stack>
            }
            ingredientList={focusIngredients}
          />
        ))}
      </>
    )
  }

  return (
    <>
      <hr />

      <small>Legendary Altar of Devastation</small>

      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <IngredientDropdownToggle label={label} />

          <Dropdown.Menu
            className='py-0 w-100'
            style={{
              maxHeight: '50vh',
              overflowY: 'auto'
            }}
          >
            {Object.entries(filteredIngredientsMap).map(([element, ingredients]) =>
              renderSection(element, ingredients)
            )}
          </Dropdown.Menu>
        </Dropdown>

        {selectedDevastationItem && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetDevastationItem())
            }}
          >
            Reset
          </Button>
        )}

        <FilterOffCanvas
          filterMode={devastationFilterMode}
          filterOptions={uniqueEffects}
          items={Object.values(ingredientsMap).flat()}
          getItemFilters={(item: CraftingIngredient): string[] => {
            return item.effectsAdded?.map((enhancement: Enhancement) => enhancement.name) ?? []
          }}
          selectedFilters={devastationItemFilters}
          setSelectedFilters={(filters: string[]) => {
            dispatch(setDevastationItemFilters(filters))
          }}
          setFilterMode={(mode: 'OR' | 'AND') => dispatch(setDevastationFilterMode(mode))}
        />
      </Stack>
    </>
  )
}

export default DevastationDropdown
