import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import {
  resetInvasionItem,
  selectInvasionItem,
  setInvasionFilterMode,
  setInvasionItemFilters
} from '../../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { oneFocusDropdownLabel } from '../../common/helpers/helpers.ts'
import { filterIngredientsMap } from '../../legendary/helpers/filterUtils.ts'
import { renderBody, renderHeader } from '../../legendary/helpers/renderHelpers.tsx'
import useInvasion from '../hooks/useInvasion.ts'

const InvasionDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedInvasionItem, invasionItemFilters, invasionFilterMode } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useInvasion()

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(invasionItemFilters, ingredientsMap),
    [ingredientsMap, invasionItemFilters]
  )

  return (
    <FilterableDropdown
      dropdownTriggerPrefix='T1:'
      title='Altar of Invasion'
      items={ingredientsMap}
      filteredItems={filteredIngredientsMap}
      onSelect={(item: CraftingIngredient) => dispatch(selectInvasionItem(item))}
      onReset={() => dispatch(resetInvasionItem())}
      selectedItem={selectedInvasionItem}
      label={oneFocusDropdownLabel(selectedInvasionItem)}
      canFilter
      filterMode={invasionFilterMode}
      filters={invasionItemFilters}
      onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setInvasionFilterMode(mode))}
      onFiltersChange={(filters: string[]) => dispatch(setInvasionItemFilters(filters))}
      renderSectionHeader={renderHeader}
      renderSectionBody={renderBody}
    />
  )
}

export default InvasionDropdown
