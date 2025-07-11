import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import { filterIngredientsMap } from '../../../../components/filters/helpers/filterUtils.ts'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import {
  resetSubjugationItem,
  selectSubjugationItem,
  setSubjugationFilterMode,
  setSubjugationItemFilters
} from '../../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { renderBody, renderHeader } from '../helpers/renderHelpers.tsx'
import useSubjugation from '../hooks/useSubjugation.ts'

const SubjugationDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedSubjugationItem, subjugationItemFilters, subjugationFilterMode } = useAppSelector(
    (state) => state.legendaryGreenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useSubjugation()

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(subjugationItemFilters, ingredientsMap),
    [ingredientsMap, subjugationItemFilters]
  )

  const label: string = selectedSubjugationItem?.effectsAdded
    ? selectedSubjugationItem.effectsAdded
        .map((effect: Enhancement) => {
          return `${effect.name}${
            effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''
          }`
        })
        .join(',')
    : 'Select an Upgrade...'

  return (
    <FilterableDropdown
      dropdownTriggerPrefix='T2:'
      title='Legendary Altar of Subjugation'
      filteredItems={filteredIngredientsMap}
      items={ingredientsMap}
      onSelect={(item: CraftingIngredient) => dispatch(selectSubjugationItem(item))}
      onReset={() => dispatch(resetSubjugationItem())}
      selectedItem={selectedSubjugationItem}
      label={label}
      canFilter
      filterMode={subjugationFilterMode}
      filters={subjugationItemFilters}
      onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setSubjugationFilterMode(mode))}
      onFiltersChange={(filters: string[]) => dispatch(setSubjugationItemFilters(filters))}
      renderSectionHeader={renderHeader}
      renderSectionBody={renderBody}
    />
  )
}

export default SubjugationDropdown
