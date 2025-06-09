import { useMemo } from 'react'
import { Stack } from 'react-bootstrap'
import FilterableDropdown from '../../../components/filters/FilterableDropdown'
import { altarOfSubjugation } from '../../../data/altarOfSubjugation.ts'
import { enhancements } from '../../../data/enhancements.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import DropdownItemTitle from './DropdownItemTitle.tsx'

const enhancementMap: Record<string, Enhancement> = Object.fromEntries(
  enhancements.map((enhancement: Enhancement) => [
    enhancement.name.toLowerCase(),
    enhancement
  ])
)

const ItemUpgradeDropdown = (props: Props) => {
  const { buttonLabel, clickHandler } = props

  const effectDetail = (requirement: Enhancement): string => {
    const enhancementDetail = enhancementMap[requirement.name.toLowerCase()]
    return enhancementDetail.description
  }

  const filteredRecipes: CraftingIngredient[] = useMemo(() => {
    return altarOfSubjugation.filter((recipe: CraftingIngredient) =>
      recipe.name.toLowerCase().includes('ring upgrade')
    )
  }, [])

  const joinEffects = (effects: Enhancement[] | undefined) => {
    return (
      effects?.map((req: Enhancement) => effectDetail(req)).join(', ') ??
      'No effects available'
    )
  }

  // Extract filter values from a recipe
  const getRecipeFilters = (recipe: CraftingIngredient): string[] => {
    const filters: string[] = []

    if (recipe.effectsAdded?.[0]?.name) {
      filters.push(recipe.effectsAdded[0].name)
    }

    return filters
  }

  // Render each recipe in the dropdown
  const renderRecipe = (recipe: CraftingIngredient) => (
    <Stack
      direction='vertical'
      gap={1}
      className='text-wrap small'
      style={{ maxWidth: '50vw' }}
    >
      <DropdownItemTitle
        title={recipe.effectsAdded?.[0]?.name ?? 'Unknown Effect'}
        subtitle={recipe.name}
      />
      <small className='d-none d-lg-block'>
        {joinEffects(recipe.effectsAdded)}
      </small>
    </Stack>
  )

  return (
    <FilterableDropdown
      items={filteredRecipes}
      getItemFilters={getRecipeFilters}
      renderItem={renderRecipe}
      onSelectItem={clickHandler}
      buttonLabel={buttonLabel}
      variant='outline-warning'
      maxHeight='400px'
      maxFilterColumns={2}
    />
  )
}

interface Props {
  buttonLabel: string
  clickHandler: (recipe: CraftingIngredient) => void
}

export default ItemUpgradeDropdown
