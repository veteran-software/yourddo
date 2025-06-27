import { Accordion, Card, ListGroup, Stack } from 'react-bootstrap'
import { FaExclamationTriangle } from 'react-icons/fa'
import { shallowEqual } from 'react-redux'
import CraftedIngredientDisplay from '../../../../components/CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from '../../../../components/FarmedIngredientDisplay.tsx'
import { altarOfDevastation } from '../../../../data/altarOfDevastation.ts'
import { ingredients } from '../../../../data/ingredients.ts'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import type { Ingredient } from '../../../../types/ingredients.ts'
import { findIngredientByName } from '../../../../utils/objectUtils.ts'
import { allAltars } from '../../helpers/elementalData.ts'
import useRecipeBuilder from '../../hooks/useRecipeBuilder.ts'
import FecundityList from './FecundityList.tsx'
import MaterialsAccordion from './MaterialsAccordion.tsx'

const IngredientList = () => {
  const { selectedSubjugationItem, selectedInvasionItem, selectedDevastationFocused, selectedDevastationBasic } =
    useAppSelector((state) => state.greenSteel, shallowEqual)

  const { rawMaterials, craftedMaterials } = useRecipeBuilder()

  const getDisplay = (requirement: CraftingIngredient) => {
    const ingredient: CraftingIngredient | undefined = findIngredientByName(requirement.name, allAltars)

    if (ingredient) {
      return (
        <ListGroup.Item key={ingredient.name}>
          <CraftedIngredientDisplay ingredient={ingredient} quantity={requirement.quantity} />
        </ListGroup.Item>
      )
    } else {
      const farmedIngredient: Ingredient | undefined = ingredients.find(
        (farmedIng: Ingredient) => farmedIng.name === requirement.name
      )

      if (farmedIngredient) {
        return (
          <ListGroup.Item key={farmedIngredient.name}>
            <FarmedIngredientDisplay ingredient={farmedIngredient} quantity={requirement.quantity} />
          </ListGroup.Item>
        )
      }
    }

    return <></>
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
                    <ListGroup.Item variant='secondary' className='text-center'>
                      <small>
                        Combine the following ingredients in the <strong>Altar of Invasion</strong>.<br />
                        Hover or tap on the ingredient image to learn more about each ingredient.
                      </small>
                    </ListGroup.Item>
                    {selectedInvasionItem.requirements.map((ingredient: CraftingIngredient) => getDisplay(ingredient))}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            )}

            {selectedSubjugationItem && (
              <Accordion.Item eventKey='4' className='rounded-0'>
                <Accordion.Header>[Tier: 2] : {selectedSubjugationItem.name}</Accordion.Header>
                <Accordion.Body className='p-0'>
                  <ListGroup variant='flush'>
                    <ListGroup.Item variant='secondary' className='text-center'>
                      <small>
                        Combine the following ingredients in the <strong>Altar of Subjugation</strong>.<br />
                        Hover or tap on the ingredient image to learn more about each ingredient.
                      </small>
                    </ListGroup.Item>
                    {selectedSubjugationItem.requirements.map((ingredient: CraftingIngredient) =>
                      getDisplay(ingredient)
                    )}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            )}

            {selectedDevastationBasic && (
              <Accordion.Item eventKey='6' className='rounded-0'>
                <Accordion.Header>[Tier: 3 Basic] : {selectedDevastationBasic.name}</Accordion.Header>
                <Accordion.Body className='p-0'>
                  <ListGroup variant='flush'>
                    <ListGroup.Item variant='secondary' className='text-center'>
                      <small>
                        Combine the following ingredients in the <strong>Altar of Devastation</strong>.<br />
                        Hover or tap on the ingredient image to learn more about each ingredient.
                      </small>
                    </ListGroup.Item>
                    {selectedDevastationBasic.requirements.map((ingredient: CraftingIngredient) =>
                      getDisplay(ingredient)
                    )}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            )}

            {selectedDevastationFocused && (
              <Accordion.Item eventKey='7' className='rounded-0'>
                <Accordion.Header>
                  {selectedDevastationFocused.requirements[1].name.includes('Dual Shard') && (
                    <span className='align-bottom'>
                      <FaExclamationTriangle color='yellow' />
                      &nbsp;
                    </span>
                  )}
                  [Tier: 3 Focused] : {selectedDevastationFocused.name}
                </Accordion.Header>
                <Accordion.Body className='p-0'>
                  <ListGroup variant='flush'>
                    {selectedDevastationFocused.requirements.some((selected: CraftingIngredient) =>
                      selected.name.includes('Dual Shard')
                    ) && (
                      <ListGroup.Item variant='info'>
                        <span className='text-decoration-underline'>
                          To craft the <strong>{selectedDevastationFocused.requirements[1].name}</strong>:
                        </span>
                        <ol>
                          <li>
                            Create a(n){' '}
                            {
                              findIngredientByName(selectedDevastationFocused.requirements[1].name, altarOfDevastation)
                                ?.requirements[0].name
                            }
                          </li>
                          <li>
                            Create a(n){' '}
                            {
                              findIngredientByName(selectedDevastationFocused.requirements[1].name, altarOfDevastation)
                                ?.requirements[1].name
                            }
                          </li>
                          <li>
                            Combine both in the <strong>Altar of Devastation</strong> with a{' '}
                            <strong>Shavarath High Energy Cell</strong>
                          </li>
                        </ol>
                      </ListGroup.Item>
                    )}

                    {selectedDevastationFocused.requirements.map((ingredient: CraftingIngredient) =>
                      getDisplay(ingredient)
                    )}
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
