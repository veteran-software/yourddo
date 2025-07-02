import { useMemo } from 'react'
import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import FilterOffCanvas from '../../../components/filters/FilterOffCanvas.tsx'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  resetSubjugationItem,
  selectSubjugationItem,
  setSubjugationFilterMode,
  setSubjugationItemFilters
} from '../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import IngredientDropdownToggle from '../../heroicGreenSteel/components/IngredientDropdownToggle.tsx'
import { filterIngredientsMap, parseUniqueEffects } from '../helpers/filterUtils.ts'
import useSubjugation from '../hooks/useSubjugation.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'

const SubjugationDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedSubjugationItem, subjugationItemFilters, subjugationFilterMode } = useAppSelector(
    (state) => state.legendaryGreenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useSubjugation()

  const uniqueEffects: string[] = useMemo(() => parseUniqueEffects(ingredientsMap), [ingredientsMap])

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(subjugationItemFilters, ingredientsMap),
    [ingredientsMap, subjugationItemFilters]
  )

  const label = (
    <>
      <Col sm={1}>T2:</Col>
      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>
            {selectedSubjugationItem
              ? selectedSubjugationItem.effectsAdded
                  ?.map((effect: Enhancement) => {
                    return `${effect.name}${
                      effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''
                    }`
                  })
                  .join(',')
              : 'Select an Upgrade...'}
          </small>
        </strong>
      </Col>
    </>
  )

  const renderSection = (name: string, ingredients: CraftingIngredient[]) => {
    return (
      <IngredientDropdownSection
        key={`${name}=${btoa(JSON.stringify(ingredients))}`}
        clickHandler={selectSubjugationItem}
        header={
          <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
            {`Focus: ${name}`}
          </Stack>
        }
        ingredientList={ingredients}
      />
    )
  }

  return (
    <>
      <hr />

      <small>Legendary Altar of Subjugation</small>

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
            {Object.entries(filteredIngredientsMap).map(([name, ingredients]: [string, CraftingIngredient[]]) =>
              renderSection(name, ingredients)
            )}
          </Dropdown.Menu>
        </Dropdown>

        {selectedSubjugationItem && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetSubjugationItem())
            }}
          >
            Reset
          </Button>
        )}

        <FilterOffCanvas
          filterMode={subjugationFilterMode}
          filterOptions={uniqueEffects}
          items={Object.values(ingredientsMap).flat()}
          getItemFilters={(item: CraftingIngredient): string[] => {
            return item.effectsAdded?.map((enhancement: Enhancement) => enhancement.name) ?? []
          }}
          selectedFilters={subjugationItemFilters}
          setSelectedFilters={(filters: string[]) => {
            dispatch(setSubjugationItemFilters(filters))
          }}
          setFilterMode={(mode: 'AND' | 'OR') => dispatch(setSubjugationFilterMode(mode))}
        />
      </Stack>
    </>
  )
}

export default SubjugationDropdown
