import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import { filterIngredientsMap } from '../../../../components/filters/helpers/filterUtils.ts'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import {
  resetDevastationFocused,
  selectDevastationFocused,
  setDevastationFocusedFilterMode,
  setDevastationFocusedItemFilters
} from '../../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { renderBody, renderHeader } from '../../legendary/helpers/renderHelpers.tsx'
import useDevastationFocused from '../hooks/useDevastationFocused.ts'

const DevastationFocusedDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const {
    selectedDevastationFocused,
    selectedDevastationBasic,
    devastationFocusedItemFilters,
    devastationFocusedFilterMode
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const { ingredientsMap } = useDevastationFocused()

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(devastationFocusedItemFilters, ingredientsMap),
    [ingredientsMap, devastationFocusedItemFilters]
  )

  return (
    <FilterableDropdown
      disabled={selectedDevastationBasic !== undefined}
      dropdownTriggerPrefix='T3-F:'
      title='Altar of Devastation : Focused Upgrades'
      items={ingredientsMap}
      filteredItems={filteredIngredientsMap}
      onSelect={(item: CraftingIngredient) => dispatch(selectDevastationFocused(item))}
      onReset={() => dispatch(resetDevastationFocused())}
      selectedItem={selectedDevastationFocused}
      label={
        selectedDevastationFocused
          ? (selectedDevastationFocused.effectsAdded?.map((effect: Enhancement) => effect.name).join(', ') ??
            'No Upgrades Available...')
          : 'Select a Focused Upgrade...'
      }
      canFilter
      filterMode={devastationFocusedFilterMode}
      filters={devastationFocusedItemFilters}
      onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setDevastationFocusedFilterMode(mode))}
      onFiltersChange={(filters: string[]) => dispatch(setDevastationFocusedItemFilters(filters))}
      renderSectionHeader={renderHeader}
      renderSectionBody={renderBody}
    />
  )
}

export default DevastationFocusedDropdown
