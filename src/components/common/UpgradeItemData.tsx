import { Fragment } from 'react'
import { Card, Col, ListGroup, Row } from 'react-bootstrap'
import { ingredients } from '../../data/ingredients.ts'
import type { Enhancement } from '../../types/core.ts'
import type { CraftingIngredient, SetBonus } from '../../types/crafting.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import { bindingDisplay } from '../../utils/objectUtils.ts'
import CraftedIngredientDisplay from './CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from './FarmedIngredientDisplay.tsx'

const UpgradeItemData = (props: Props) => {
  const { ingredient } = props

  if (!ingredient) return null

  return (
    <Card>
      <Card.Header className='d-flex align-items-center justify-content-center'>
        <CraftedIngredientDisplay
          ingredient={ingredient}
          quantity={1}
          showQuantity={false}
          showLocation={false}
          showPopover={false}
        />
      </Card.Header>
      <Card.Body>
        <Row className='g-3'>
          {/* Metadata Section */}
          <Col xs={12} lg={4}>
            <ListGroup>
              <ListGroup.Item className='bg-secondary-subtle text-white'>Basic Information</ListGroup.Item>

              {ingredient.augmentType && (
                <ListGroup.Item className='d-flex flex-row justify-content-between'>
                  <strong>Type:</strong>
                  <span>{ingredient.augmentType}</span>
                </ListGroup.Item>
              )}

              {ingredient.binding && (
                <ListGroup.Item className='d-flex flex-row justify-content-between'>
                  <strong>Binding:</strong>
                  <span>{bindingDisplay(ingredient.binding)}</span>
                </ListGroup.Item>
              )}

              {ingredient.ingredientType && (
                <ListGroup.Item className='d-flex flex-row justify-content-between'>
                  <strong>Ingredient Type:</strong>
                  <span>{ingredient.ingredientType}</span>
                </ListGroup.Item>
              )}

              {ingredient.craftedIn && (
                <ListGroup.Item className='d-flex flex-row justify-content-between'>
                  <strong>Crafting Location:</strong>
                  <span>{ingredient.craftedIn}</span>
                </ListGroup.Item>
              )}

              {ingredient.minimumLevel && (
                <ListGroup.Item className='d-flex flex-row justify-content-between'>
                  <strong>Minimum Level:</strong>
                  <span>{ingredient.minimumLevel}</span>
                </ListGroup.Item>
              )}

              {ingredient.notes && (
                <ListGroup.Item className='d-flex flex-row justify-content-between'>
                  <strong>Notes:</strong>
                  <span>{ingredient.notes}</span>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Col>

          {/* Set Bonus Section */}
          {ingredient.setBonus && (
            <Col xs={12} lg={4}>
              <ListGroup>
                {ingredient.setBonus.map((bonus: SetBonus, idx: number) => (
                  <Fragment key={`bonus-${String(idx)}`}>
                    <ListGroup.Item className='bg-secondary-subtle text-white d-flex flex-row justify-content-between'>
                      {bonus.name}{' '}
                      {bonus.numPiecesEquipped && <span className='ms-2'>({bonus.numPiecesEquipped} pieces)</span>}
                    </ListGroup.Item>

                    {bonus.enhancements?.map((enhancement: Enhancement, enhIdx: number) => (
                      <ListGroup.Item key={`enhancement-${String(enhIdx)}`}>
                        {enhancement.name} (+{enhancement.modifier}
                        {enhancement.bonus ? ` ${enhancement.bonus}` : ''})
                      </ListGroup.Item>
                    ))}
                  </Fragment>
                ))}
              </ListGroup>
            </Col>
          )}

          {/* Requirements Section */}
          {ingredient.requirements && ingredient.requirements.length > 0 && (
            <Col xs={12} lg={4}>
              <ListGroup>
                <ListGroup.Item className='bg-secondary-subtle text-white'>Required Items:</ListGroup.Item>

                {ingredient.requirements.map((req: CraftingIngredient, reqIdx: number) => (
                  <ListGroup.Item key={`req-${String(reqIdx)}`}>
                    <FarmedIngredientDisplay
                      ingredient={ingredients.find((ingredient: Ingredient) => ingredient.name === req.name)}
                      quantity={req.quantity ?? 1}
                    />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  )
}

interface Props {
  ingredient: CraftingIngredient | undefined
}

export default UpgradeItemData
