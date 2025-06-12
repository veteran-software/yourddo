import { useEffect, useMemo } from 'react'
import { Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { altarOfSubjugation } from '../../../data/altarOfSubjugation.ts'
import { enhancements } from '../../../data/enhancements.ts'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  setFilteredUpgradeList,
  setSelectedUpgrade,
  setSelectedUpgradeFilters
} from '../../../redux/slices/incrediblePotentialSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import {
  filterMultipleResults,
  noEffectsAvailable,
  unknownEffect
} from '../../../utils/strings.ts'
import DropdownItemTitle from './DropdownItemTitle.tsx'
import FilterOffCanvas from './FilterOffCanvas.tsx'

const enhancementMap: Record<string, Enhancement> = Object.fromEntries(
  enhancements.map((enhancement: Enhancement) => [
    enhancement.name.toLowerCase(),
    enhancement
  ])
)

const ItemUpgradeDropdown = (props: Props) => {
  const { buttonLabel } = props

  const dispatch: AppDispatch = useAppDispatch()

  const {
    filterMode,
    filteredUpgradeList,
    selectedUpgradeFilters,
    upgradeFilters
  } = useAppSelector((state) => state.incrediblePotential, shallowEqual)

  const baseUpgradeList = useMemo(
    (): CraftingIngredient[] =>
      altarOfSubjugation.filter((recipe: CraftingIngredient) =>
        recipe.name.toLowerCase().includes('ring upgrade')
      ),
    []
  )

  // update the list of items in the dropdown
  useEffect(() => {
    if (selectedUpgradeFilters.length === 0) {
      dispatch(setFilteredUpgradeList(baseUpgradeList))
    } else {
      dispatch(
        setFilteredUpgradeList(
          baseUpgradeList.filter((recipe: CraftingIngredient) => {
            const itemEnhancements: string[] =
              recipe.effectsAdded?.map(
                (enhancement: Enhancement) => enhancement.name
              ) ?? []

            return filterMode === 'OR'
              ? selectedUpgradeFilters.some((filter: string) => {
                  return itemEnhancements.includes(filter)
                })
              : selectedUpgradeFilters.every((filter: string) => {
                  return itemEnhancements.includes(filter)
                })
          })
        )
      )
    }
  }, [
    baseUpgradeList,
    dispatch,
    filterMode,
    selectedUpgradeFilters,
    selectedUpgradeFilters.length
  ])

  const effectDetail = (requirement: Enhancement): string => {
    const enhancementDetail = enhancementMap[requirement.name.toLowerCase()]
    return enhancementDetail.description
  }

  const joinEffects = (effects: Enhancement[] | undefined) => {
    return (
      effects?.map((req: Enhancement) => effectDetail(req)).join(', ') ??
      noEffectsAvailable
    )
  }

  const renderRecipe = (recipe: CraftingIngredient) => (
    <Stack direction='vertical' gap={1} className='text-wrap small'>
      <DropdownItemTitle
        title={recipe.effectsAdded?.[0]?.name ?? unknownEffect}
        subtitle={recipe.name}
      />
      <small className='d-none d-lg-block'>
        {joinEffects(recipe.effectsAdded)}
      </small>
    </Stack>
  )

  return (
    <>
      <hr />
      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <Dropdown.Toggle variant='outline-warning w-100'>
            {buttonLabel}
          </Dropdown.Toggle>
          <Dropdown.Menu
            style={{ maxHeight: '50vh', overflowY: 'auto' }}
            className='py-0'
          >
            {filteredUpgradeList.length > 1 &&
              selectedUpgradeFilters.length > 0 && (
                <Dropdown.Item
                  className='border-top bg-light'
                  key={`informational-dropdown-item`}
                >
                  <div className='text-wrap text-black text-center'>
                    {filterMultipleResults}
                  </div>
                </Dropdown.Item>
              )}

            {filteredUpgradeList.map(
              (recipe: CraftingIngredient, idx: number) => (
                <Dropdown.Item
                  className='border-top'
                  key={`${recipe.name}-${String(idx)}`}
                  onClick={() => {
                    dispatch(setSelectedUpgrade(recipe))
                  }}
                >
                  {renderRecipe(recipe)}
                </Dropdown.Item>
              )
            )}
          </Dropdown.Menu>
        </Dropdown>

        <FilterOffCanvas
          filterMode={filterMode}
          filterOptions={upgradeFilters}
          items={filteredUpgradeList}
          getItemFilters={(item: CraftingIngredient): string[] => {
            return (
              item.enhancements?.map((enhancement) => enhancement.name) ?? []
            )
          }}
          selectedFilters={selectedUpgradeFilters}
          setSelectedFilters={(filters: string[]) => {
            dispatch(setSelectedUpgradeFilters(filters))
          }}
        />
      </Stack>
    </>
  )
}

interface Props {
  buttonLabel: string
}

export default ItemUpgradeDropdown
