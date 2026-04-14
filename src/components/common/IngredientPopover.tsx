import { CloseButton, ListGroup, Popover, PopoverBody, PopoverHeader } from 'react-bootstrap'
import type { OverlayInjectedProps } from 'react-bootstrap/OverlayTrigger'
import { ingredients } from '../../data/ingredients.ts'
import { allAltars } from '../../pages/greenSteel/common/helpers/elementalData.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import { findCraftedIngredientByName } from '../../utils/objectUtils.ts'
import CraftedIngredientDisplay from './CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from './FarmedIngredientDisplay.tsx'

const IngredientPopover = (props: Props) => {
  const { ingredient, ...popper } = props

  const hasRequirements = !!(ingredient as CraftingIngredient).requirements?.length
  const hasEffects = !!('effectsAdded' in ingredient && ingredient.effectsAdded?.length)

  if (!hasRequirements && !hasEffects) {
    return <></>
  }

  return (
    <Popover key={ingredient.name} id={ingredient.name} className='m-0 p-0' {...popper}>
      <PopoverHeader as={'h6'} className='text-center d-flex align-items-center justify-content-between py-1 px-2'>
        <div className='flex-grow-1'>
          {hasRequirements ? 'Ingredients to make' : 'Effects of'}
          <br />
          <strong>{ingredient.name}</strong>
        </div>
        <CloseButton
          className='ms-2'
          onClick={() => {
            if ('hide' in props && typeof props.hide === 'function') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              props.hide()
            }
          }}
        />
      </PopoverHeader>
      <PopoverBody className='m-0 p-0' style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {hasEffects && (
          <ListGroup variant='flush' className={hasRequirements ? 'border-bottom' : ''}>
            {ingredient.effectsAdded?.map((effect, idx) => (
              <ListGroup.Item key={`effect-${String(idx)}`} className='py-1 px-3'>
                <small>
                  <strong>{effect.name}</strong>
                  {effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${String(effect.bonus)})` : ''}
                  {effect.notes && (
                    <div className='text-muted' style={{ fontSize: '0.9em', fontStyle: 'italic' }}>
                      {effect.notes}
                    </div>
                  )}
                </small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        {hasRequirements && (
          <ListGroup variant='flush'>
            {(ingredient as CraftingIngredient).requirements?.map((ing: CraftingIngredient, idx: number) => {
              const altarCheck: CraftingIngredient | undefined = findCraftedIngredientByName(ing.name, allAltars)

              if (altarCheck) {
                return (
                  <ListGroup.Item key={`${ing.name}-${String(idx)}`}>
                    <CraftedIngredientDisplay
                      ingredient={altarCheck}
                      quantity={ing.quantity ?? 0}
                      key={`${ing.name}-${String(idx)}`}
                    />
                  </ListGroup.Item>
                )
              }

              return (
                <ListGroup.Item key={`${ing.name}-${String(idx)}`}>
                  <FarmedIngredientDisplay
                    ingredient={findCraftedIngredientByName(ing.name, ingredients as CraftingIngredient[])}
                    quantity={ing.quantity ?? 0}
                    key={`${ing.name}-${String(idx)}`}
                  />
                </ListGroup.Item>
              )
            })}
          </ListGroup>
        )}
      </PopoverBody>
    </Popover>
  )
}

interface Props extends Partial<OverlayInjectedProps> {
  ingredient: CraftingIngredient | Ingredient
}

export default IngredientPopover
