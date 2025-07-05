import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import {
  resetInvasionItem,
  selectInvasionItem,
  setInvasionFilterMode,
  setInvasionItemFilters
} from '../../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { filterIngredientsMap } from '../helpers/filterUtils.ts'
import { renderBody, renderHeader } from '../helpers/renderHelpers.tsx'
import useInvasion from '../hooks/useInvasion.ts'

const InvasionDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedInvasionItem, invasionItemFilters, invasionFilterMode } = useAppSelector(
    (state) => state.legendaryGreenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useInvasion()

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(invasionItemFilters, ingredientsMap),
    [ingredientsMap, invasionItemFilters]
  )

  const label: string = selectedInvasionItem?.effectsAdded
    ? selectedInvasionItem.effectsAdded
        .map((effect: Enhancement) => {
          return `${effect.name}${
            effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''
          }`
        })
        .join(', ')
    : 'Select an Upgrade...'

  return (
    <FilterableDropdown
      dropdownTriggerPrefix='T1:'
      title='Legendary Altar of Invasion'
      items={ingredientsMap}
      filteredItems={filteredIngredientsMap}
      onSelect={(item: CraftingIngredient) => dispatch(selectInvasionItem(item))}
      onReset={() => dispatch(resetInvasionItem())}
      selectedItem={selectedInvasionItem}
      label={label}
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
