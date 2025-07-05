import { useMemo } from 'react'
import { Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import {
  resetDevastationItem,
  selectDevastationItem,
  setDevastationFilterMode,
  setDevastationItemFilters
} from '../../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructLgsShard } from '../../../../utils/objectUtils.ts'
import { elementColor } from '../../../../utils/utils.ts'
import { filterIngredientsMap } from '../helpers/filterUtils.ts'
import { useDevastation } from '../hooks/useDevastation.ts'

const DevastationDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedDevastationItem, devastationItemFilters, devastationFilterMode } = useAppSelector(
    (state) => state.legendaryGreenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useDevastation()

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(devastationItemFilters, ingredientsMap),
    [ingredientsMap, devastationItemFilters]
  )

  const dropdownItemText = (effect: Enhancement) => {
    const modAndBonus: string = effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''

    return `${effect.name}${modAndBonus}`
  }

  const renderDropdownItem = (ingredient: CraftingIngredient, idx: number) => {
    return (
      <Dropdown.Item
        key={`${ingredient.name}-${String(idx)}`}
        onClick={() => {
          dispatch(selectDevastationItem(ingredient))
        }}
      >
        <small>
          {ingredient.effectsAdded
            ?.map(dropdownItemText)
            .toSorted((a: string, b: string) => a.localeCompare(b))
            .join(', ')}
        </small>
      </Dropdown.Item>
    )
  }

  const renderSection = (name: string, ingredients?: CraftingIngredient[]) => {
    // Group ingredients by their secondary focus
    const groupedIngredients = ingredients?.reduce((accumulator: Record<string, CraftingIngredient[]>, ingredient) => {
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

    if (!groupedIngredients) return <></>

    return (
      <>
        {Object.entries(groupedIngredients).map(([secondaryFocus, focusIngredients]) => (
          <>
            <Dropdown.Header className='border-bottom bg-light-subtle text-white'>
              <h6 className='m-0 text-center'>
                <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
                  <small className='text-muted me-1'>Foci :</small>
                  <small className='text-muted'>Primary →</small>{' '}
                  <small className={`text-${elementColor(name)}`}>{name}</small>{' '}
                  {secondaryFocus && (
                    <>
                      <small className='text-muted ms-1'>| Secondary →</small>{' '}
                      <small className={`text-${elementColor(secondaryFocus)}`}>{secondaryFocus}</small>
                    </>
                  )}
                </Stack>
              </h6>
            </Dropdown.Header>

            {focusIngredients.length > 0 && focusIngredients.map(renderDropdownItem)}
          </>
        ))}
      </>
    )
  }

  return (
    <FilterableDropdown
      dropdownTriggerPrefix='T3:'
      title='Legendary Altar of Devastation'
      items={ingredientsMap}
      filteredItems={filteredIngredientsMap}
      onSelect={(item: CraftingIngredient) => dispatch(selectDevastationItem(item))}
      onReset={() => dispatch(resetDevastationItem())}
      selectedItem={selectedDevastationItem}
      label={
        selectedDevastationItem?.effectsAdded
          ? selectedDevastationItem.effectsAdded.map((effect: Enhancement) => effect.name).join(', ')
          : 'Select a Tier 3 Upgrade...'
      }
      canFilter={true}
      filterMode={devastationFilterMode}
      filters={devastationItemFilters}
      onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setDevastationFilterMode(mode))}
      onFiltersChange={(filters: string[]) => dispatch(setDevastationItemFilters(filters))}
      renderSectionHeader={renderSection}
      groupBySecondaryFocus={true}
    />
  )
}

export default DevastationDropdown
