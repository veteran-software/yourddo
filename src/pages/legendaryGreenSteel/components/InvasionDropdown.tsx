import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import FilterOffCanvas from '../../../components/filters/FilterOffCanvas.tsx'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  resetInvasionItem,
  selectInvasionItem,
  setInvasionFilterMode,
  setInvasionItemFilters
} from '../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import IngredientDropdownToggle from '../../heroicGreenSteel/components/IngredientDropdownToggle.tsx'
import { filterIngredientsMap, parseUniqueEffects } from '../helpers/filterUtils.ts'
import useInvasion from '../hooks/useInvasion.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'

const InvasionDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedInvasionItem, invasionItemFilters, invasionFilterMode } = useAppSelector(
    (state) => state.legendaryGreenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useInvasion()

  const [label, setLabel] = useState<React.JSX.Element>(<></>)

  const uniqueEffects: string[] = useMemo(() => parseUniqueEffects(ingredientsMap), [ingredientsMap])

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(invasionItemFilters, ingredientsMap),
    [ingredientsMap, invasionItemFilters]
  )

  useEffect(() => {
    setLabel(
      <>
        <Col sm={1}>T1:</Col>
        <Col sm={11} className='d-flex justify-content-start'>
          <strong>
            <small>
              {selectedInvasionItem?.effectsAdded
                ? selectedInvasionItem.effectsAdded
                    .map((effect: Enhancement) => {
                      return `${effect.name}${
                        effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''
                      }`
                    })
                    .join(', ')
                : 'Select an Upgrade...'}
            </small>
          </strong>
        </Col>
      </>
    )
  }, [selectedInvasionItem])

  return (
    <>
      <hr />
      <small>Legendary Altar of Invasion</small>
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
            {Object.entries(filteredIngredientsMap).map(([name, ingredients]) => (
              <IngredientDropdownSection
                key={`${name}-${ingredients
                  .map((ingredient: CraftingIngredient) =>
                    (ingredient.effectsAdded as CraftingIngredient[]).map((effect: CraftingIngredient) => effect.name)
                  )
                  .join('-')}`}
                clickHandler={selectInvasionItem}
                header={
                  <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
                    {name}
                  </Stack>
                }
                ingredientList={ingredients}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {selectedInvasionItem && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetInvasionItem())
            }}
          >
            Reset
          </Button>
        )}

        <FilterOffCanvas
          filterMode={invasionFilterMode}
          filterOptions={uniqueEffects}
          items={Object.values(ingredientsMap).flat()}
          getItemFilters={(item: CraftingIngredient): string[] => {
            return item.effectsAdded?.map((enhancement: Enhancement) => enhancement.name) ?? []
          }}
          selectedFilters={invasionItemFilters}
          setSelectedFilters={(filters: string[]) => {
            dispatch(setInvasionItemFilters(filters))
          }}
          setFilterMode={(mode: 'OR' | 'AND') => dispatch(setInvasionFilterMode(mode))}
        />
      </Stack>
    </>
  )
}

export default InvasionDropdown
