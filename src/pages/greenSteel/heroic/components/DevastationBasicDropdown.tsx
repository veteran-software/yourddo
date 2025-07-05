import { type FC, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import {
  resetDevastationBasic,
  selectDevastationBasic,
  setDevastationBasicFilterMode,
  setDevastationBasicItemFilters
} from '../../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { oneFocusDropdownLabel } from '../../common/helpers/helpers.ts'
import { filterIngredientsMap } from '../../legendary/helpers/filterUtils.ts'
import { renderBody, renderHeader } from '../../legendary/helpers/renderHelpers.tsx'
import { useDevastationBasic } from '../hooks/useDevastationBasic.ts'

const DevastationBasicDropdown: FC = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const {
    selectedDevastationBasic,
    selectedDevastationFocused,
    devastationBasicItemFilters,
    devastationBasicFilterMode
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const { ingredientsMap } = useDevastationBasic()

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(devastationBasicItemFilters, ingredientsMap),
    [ingredientsMap, devastationBasicItemFilters]
  )

  return (
    <FilterableDropdown
      disabled={selectedDevastationFocused !== undefined}
      dropdownTriggerPrefix='T3-B:'
      title='Altar of Devastation: Basic Upgrade'
      items={ingredientsMap}
      filteredItems={filteredIngredientsMap}
      onSelect={(item: CraftingIngredient) => dispatch(selectDevastationBasic(item))}
      onReset={() => dispatch(resetDevastationBasic())}
      selectedItem={selectedDevastationBasic}
      label={oneFocusDropdownLabel(selectedDevastationBasic)}
      canFilter
      filterMode={devastationBasicFilterMode}
      filters={devastationBasicItemFilters}
      onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setDevastationBasicFilterMode(mode))}
      onFiltersChange={(filters: string[]) => dispatch(setDevastationBasicItemFilters(filters))}
      renderSectionHeader={renderHeader}
      renderSectionBody={renderBody}
    />
  )
}

export default DevastationBasicDropdown
