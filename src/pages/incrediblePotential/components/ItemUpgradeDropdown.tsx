import { useMemo } from 'react'
import { Dropdown, Stack } from 'react-bootstrap'
import { altarOfSubjugation } from '../../../data/altarOfSubjugation.ts'
import { enhancements } from '../../../data/enhancements.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import DropdownItemTitle from './DropdownItemTitle.tsx'

const enhancementMap: Record<string, Enhancement> = Object.fromEntries(
  enhancements.map((enhancement) => [
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

  const filteredRecipes = useMemo(() => {
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

  return (
    <Dropdown>
      <Dropdown.Toggle size='sm' variant='outline-warning' className='w-100'>
        {buttonLabel}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{ maxHeight: '400px', overflowY: 'auto' }}
        variant='dark'
      >
        {filteredRecipes.map((recipe: CraftingIngredient, idx: number) => {
          return (
            <Dropdown.Item
              key={recipe.name}
              className={`small ${idx > 0 ? 'border-top' : ''}`}
              onClick={() => {
                clickHandler(recipe)
              }}
            >
              <Stack
                direction='vertical'
                gap={1}
                className='text-wrap'
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
            </Dropdown.Item>
          )
        })}
      </Dropdown.Menu>
    </Dropdown>
  )
}

interface Props {
  buttonLabel: string
  clickHandler: (recipe: CraftingIngredient) => void
}

export default ItemUpgradeDropdown
