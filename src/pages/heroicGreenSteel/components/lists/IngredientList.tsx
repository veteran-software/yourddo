import { Accordion, Card, ListGroup, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import CraftedIngredientDisplay from '../../../../components/CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from '../../../../components/FarmedIngredientDisplay.tsx'
import { ingredients } from '../../../../data/ingredients.ts'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import type { Ingredient } from '../../../../types/ingredients.ts'
import useRecipeBuilder from '../../hooks/useRecipeBuilder.ts'
import FecundityList from './FecundityList.tsx'
import MaterialsAccordion from './MaterialsAccordion.tsx'

const IngredientList = () => {
  const {
    selectedSubjugationItem,
    selectedSubjugationSpell,
    selectedInvasionItem,
    selectedDevastationFocused,
    selectedDevastationBasic
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const { rawMaterials, craftedMaterials } = useRecipeBuilder()

  const getDisplay = (requirement: CraftingIngredient, whereToLook: CraftingIngredient[]) => {
    const ingredient: CraftingIngredient | undefined = whereToLook.find(
      (altarIngredient: CraftingIngredient) => altarIngredient.name === requirement.name
    )

    if (ingredient) {
      return <CraftedIngredientDisplay ingredient={ingredient} quantity={requirement.quantity} />
    } else {
      const farmedIngredient = ingredients.find((farmedIng: Ingredient) => farmedIng.name === requirement.name)
      if (farmedIngredient) {
        return <FarmedIngredientDisplay ingredient={farmedIngredient} quantity={requirement.quantity} />
      }
    }

    return <>Unknown</>
  }

  return (
    <Stack direction='vertical' gap={3} className='m-0 p-0'>
      {(Object.entries(rawMaterials).length > 0 || Object.entries(craftedMaterials).length > 0) && (
        <Card>
          <Card.Header className='text-center'>
            <h6 className='mb-0'>Full Ingredient List</h6>
          </Card.Header>
          <Card.Body className='m-0 p-0'>
            <MaterialsAccordion rawMaterials={rawMaterials} craftedMaterials={craftedMaterials} />
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header className='text-center'>
          <h6 className='mb-0'>Ingredient List by Tier</h6>
        </Card.Header>
        <Card.Body className='m-0 p-0'>
          <Accordion alwaysOpen={false} className='rounded-0'>
            <FecundityList callback={getDisplay} />

            {selectedInvasionItem && (
              <Accordion.Item eventKey='3' className='rounded-0'>
                <Accordion.Header>[Tier: 1] : {selectedInvasionItem.name}</Accordion.Header>
                <Accordion.Body className='p-0'>
                  <ListGroup variant='flush'>
                    {selectedInvasionItem.requirements.map((ingredient: CraftingIngredient) => (
                      <ListGroup.Item key={ingredient.name}>
                        <CraftedIngredientDisplay ingredient={ingredient} quantity={ingredient.quantity} />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            )}

            {selectedSubjugationItem && (
              <Accordion.Item eventKey='4' className='rounded-0'>
                <Accordion.Header>[Tier: 2] : {selectedSubjugationItem.name}</Accordion.Header>
                <Accordion.Body className='p-0'>
                  <ListGroup variant='flush'>
                    {selectedSubjugationItem.requirements.map((ingredient: CraftingIngredient) => (
                      <ListGroup.Item key={ingredient.name}>
                        <CraftedIngredientDisplay ingredient={ingredient} quantity={ingredient.quantity} />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            )}

            {selectedSubjugationSpell && (
              <Accordion.Item eventKey='5' className='rounded-0'>
                <Accordion.Header>
                  [Tier: 2 Spell] : {selectedSubjugationSpell.spell?.name ?? 'Unknown Spell'} (CL:{' '}
                  {selectedSubjugationSpell.spell?.casterLevel ?? 0})
                </Accordion.Header>
                <Accordion.Body className='p-0'>
                  <ListGroup>
                    <ListGroup.Item className='px-2'>
                      All upgrades in the Altar of Subjugation provide a spell. No additional materials are required.
                    </ListGroup.Item>
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            )}

            {selectedDevastationBasic && (
              <Accordion.Item eventKey='6' className='rounded-0'>
                <Accordion.Header>[Tier: 3 Basic] : {selectedDevastationBasic.name}</Accordion.Header>
                <Accordion.Body className='p-0'>
                  <ListGroup variant='flush'>
                    {selectedDevastationBasic.requirements.map((ingredient: CraftingIngredient) => (
                      <ListGroup.Item key={ingredient.name}>
                        <CraftedIngredientDisplay ingredient={ingredient} quantity={ingredient.quantity} />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            )}

            {selectedDevastationFocused && (
              <Accordion.Item eventKey='7' className='rounded-0'>
                <Accordion.Header>[Tier: 3 Focused] : {selectedDevastationFocused.name}</Accordion.Header>
                <Accordion.Body className='p-0'>
                  <ListGroup variant='flush'>
                    {selectedDevastationFocused.requirements.map((ingredient: CraftingIngredient) => (
                      <ListGroup.Item key={ingredient.name}>
                        <CraftedIngredientDisplay ingredient={ingredient} quantity={ingredient.quantity} />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            )}
          </Accordion>
        </Card.Body>
      </Card>
    </Stack>
  )
}

export default IngredientList
