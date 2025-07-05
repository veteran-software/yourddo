import { ListGroup, Popover, PopoverBody, PopoverHeader } from 'react-bootstrap'
import type { OverlayInjectedProps } from 'react-bootstrap/OverlayTrigger'
import CraftedIngredientDisplay from '../../../../components/CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from '../../../../components/FarmedIngredientDisplay.tsx'
import { ingredients } from '../../../../data/ingredients.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import type { Ingredient } from '../../../../types/ingredients.ts'
import { findIngredientByName } from '../../../../utils/objectUtils.ts'
import { allAltars } from '../../common/helpers/elementalData.ts'

const IngredientPopover = (props: Props) => {
  const { ingredient, popper } = props

  return (
    <Popover key={ingredient.name} id={ingredient.name} className='m-0 p-0 position-fixed' {...popper}>
      <PopoverHeader as={'h6'} className='text-center'>
        Ingredients to make
        <br />
        <strong>{ingredient.name}</strong>
      </PopoverHeader>
      <PopoverBody className='m-0 p-0'>
        <ListGroup variant='flush'>
          {(ingredient as CraftingIngredient).requirements?.map((ing: CraftingIngredient, idx: number) => {
            const altarCheck: CraftingIngredient | undefined = findIngredientByName(ing.name, allAltars)

            if (altarCheck) {
              return (
                <ListGroup.Item key={`${ing.name}-${String(idx)}`}>
                  <CraftedIngredientDisplay
                    ingredient={altarCheck}
                    quantity={ing.quantity}
                    key={`${ing.name}-${String(idx)}`}
                  />
                </ListGroup.Item>
              )
            }

            return (
              <ListGroup.Item key={`${ing.name}-${String(idx)}`}>
                <FarmedIngredientDisplay
                  ingredient={findIngredientByName(ing.name, ingredients as CraftingIngredient[])}
                  quantity={ing.quantity}
                  key={`${ing.name}-${String(idx)}`}
                />
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      </PopoverBody>
    </Popover>
  )
}

interface Props {
  ingredient: CraftingIngredient | Ingredient
  popper: Partial<OverlayInjectedProps>
}

export default IngredientPopover
