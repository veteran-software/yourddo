import type { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import type { ReactNode } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useAppDispatch } from '../../../redux/hooks.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'

const IngredientDropdownSection = (props: Props) => {
  const { clickHandler, fecundity, header, ingredientList } = props

  const dispatch: AppDispatch = useAppDispatch()

  return (
    <>
      <Dropdown.Header className='border-bottom bg-light-subtle text-white'>
        <h6 className='m-0 text-center'>{header}</h6>
      </Dropdown.Header>

      {ingredientList.length > 0 &&
        ingredientList.map((ingredient: CraftingIngredient, idx: number) => {
          if (fecundity) {
            return (
              <Dropdown.Item
                key={ingredient.name}
                onClick={() => {
                  dispatch(clickHandler(ingredient))
                }}
              >
                <small>{ingredient.name}</small>
              </Dropdown.Item>
            )
          }

          return (
            <Dropdown.Item
              key={`${ingredient.name}-${String(idx)}`}
              onClick={() => {
                dispatch(clickHandler(ingredient))
              }}
            >
              <small>
                {ingredient.effectsAdded
                  ?.map((effect: Enhancement) => {
                    return `${effect.name}${
                      effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''
                    }`
                  })
                  .toSorted((a: string, b: string) => a.localeCompare(b))
                  .join(', ')}
              </small>
            </Dropdown.Item>
          )
        })}
    </>
  )
}

interface Props {
  clickHandler: ActionCreatorWithPayload<CraftingIngredient>
  fecundity?: boolean
  header: ReactNode
  ingredientList: CraftingIngredient[]
}

export default IngredientDropdownSection
