import { useMemo } from 'react'
import { Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import { filterIngredientsMap } from '../../../../components/filters/helpers/filterUtils.ts'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import {
  resetSubjugationItem,
  selectSubjugationItem,
  setSubjugationFilterMode,
  setSubjugationItemFilters
} from '../../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { type ElementalList, subjugationElementalList } from '../../common/helpers/elementalData.ts'
import useSubjugationBasic from '../hooks/useSubjugationBasic.ts'

const SubjugationBasicDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedSubjugationItem, subjugationItemFilters, subjugationFilterMode } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useSubjugationBasic()

  const filteredIngredientsMap: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(subjugationItemFilters, ingredientsMap),
    [ingredientsMap, subjugationItemFilters]
  )

  const isAspect = (name: string) => {
    return !name.includes('Balance') && !name.includes('Stalemate') && !name.includes('Tempered')
  }

  const renderSectionBody = (ingredients: CraftingIngredient[]) => {
    return ingredients.length > 0
      ? ingredients.map((ingredient: CraftingIngredient, idx: number) => (
          <Dropdown.Item
            key={`${ingredient.name}-${String(idx)}`}
            onClick={() => {
              dispatch(selectSubjugationItem(ingredient))
            }}
          >
            <small>
              {ingredient.effectsAdded
                ?.map((effect: Enhancement) => effect.name)
                .toSorted((a: string, b: string) => a.localeCompare(b))
                .join(', ')}
            </small>
          </Dropdown.Item>
        ))
      : [<>Unknown Ingredient</>]
  }

  const renderSectionHeader = (name: string, ingredients?: CraftingIngredient[]) => {
    if (!ingredients) return <></>

    // Handle the special case for items with more than 6 ingredients (Ash, Dust, Vacuum, etc.)
    if (ingredients.length > 6) {
      const foci: ElementalList[] = subjugationElementalList.filter((element: ElementalList) =>
        element.name.includes(name)
      )

      if (foci.length > 1) {
        return (
          <>
            <Dropdown.Header className='border-bottom bg-light-subtle text-white'>
              <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
                {`${name} (T1: ${foci[0]?.elements[1]})`}
              </Stack>
            </Dropdown.Header>

            {renderSectionBody(
              ingredients.filter((ing: CraftingIngredient) =>
                ing.requirements?.at(0)?.name.includes(foci[0]?.elements[1])
              )
            )}

            <Dropdown.Header className='border-bottom bg-light-subtle text-white'>
              <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
                {`${name} (T1: ${foci[0]?.elements[0]})`}
              </Stack>
            </Dropdown.Header>

            {renderSectionBody(
              ingredients.filter((ing: CraftingIngredient) =>
                ing.requirements?.at(0)?.name.includes(foci[0]?.elements[0])
              )
            )}
          </>
        )
      }
    }

    return (
      <>
        <Dropdown.Header className='border-bottom bg-light-subtle text-white'>
          <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
            {isAspect(name) ? `Aspect of ${name}` : name}
          </Stack>
        </Dropdown.Header>

        {renderSectionBody(ingredients)}
      </>
    )
  }

  const label = selectedSubjugationItem
    ? (selectedSubjugationItem.effectsAdded
        ?.slice(0, -1)
        .map((effect) => effect.name)
        .join(',') ?? 'No Upgrades Available...')
    : 'Select an Upgrade...'

  return (
    <FilterableDropdown
      filteredItems={filteredIngredientsMap}
      filterMode={subjugationFilterMode}
      filters={subjugationItemFilters}
      onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setSubjugationFilterMode(mode))}
      onFiltersChange={(filters: string[]) => dispatch(setSubjugationItemFilters(filters))}
      items={ingredientsMap}
      label={label}
      title='Altar of Subjugation'
      dropdownTriggerPrefix='T2:'
      selectedItem={selectedSubjugationItem}
      onSelect={(item) => dispatch(selectSubjugationItem(item))}
      onReset={() => dispatch(resetSubjugationItem())}
      renderSectionHeader={renderSectionHeader}
      groupBySecondaryFocus={true}
    />
  )
}

export default SubjugationBasicDropdown
