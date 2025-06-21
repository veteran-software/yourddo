import { useCallback, useEffect, useState } from 'react'
import { Accordion, Card, ListGroup, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import CraftedIngredientDisplay from '../../../components/CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from '../../../components/FarmedIngredientDisplay.tsx'
import { altarOfDevastation } from '../../../data/altarOfDevastation.ts'
import { altarOfFecundity } from '../../../data/altarOfFecundity.ts'
import { altarOfInvasion } from '../../../data/altarOfInvasion.ts'
import { altarOfSubjugation } from '../../../data/altarOfSubjugation.ts'
import { ingredients } from '../../../data/ingredients.ts'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { Ingredient } from '../../../types/ingredients.ts'
import { findIngredientByName } from '../../../utils/objectUtils.ts'
import FecundityList from './lists/FecundityList.tsx'

const IngredientList = () => {
  const {
    selectedFecundityItem,
    selectedSubjugationItem,
    selectedSubjugationSpell,
    selectedInvasionItem,
    selectedDevastationFocused,
    selectedDevastationBasic
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const [rawMaterials, setRawMaterials] = useState<Record<string, number>>({})
  const [craftedMaterials, setCraftedMaterials] = useState<Record<string, number>>({})

  const recipeBuilder = useCallback((recipe: CraftingIngredient, whereToLook: CraftingIngredient[]) => {
    recipe.requirements.forEach((requirement: CraftingIngredient) => {
      const ingredient: CraftingIngredient | undefined = whereToLook.find(
        (altarIngredient: CraftingIngredient) => altarIngredient.name === requirement.name
      )

      if (ingredient) {
        setCraftedMaterials((prev: Record<string, number>) => ({
          ...prev,
          [ingredient.name]: (prev[ingredient.name] ?? 0) + requirement.quantity
        }))

        recipeBuilder(ingredient, whereToLook)
      } else {
        setRawMaterials((prev: Record<string, number>) => ({
          ...prev,
          [requirement.name]: (prev[requirement.name] ?? 0) + requirement.quantity
        }))
      }
    })
  }, [])

  useEffect(() => {
    setRawMaterials({})
    setCraftedMaterials({})

    if (selectedFecundityItem) {
      recipeBuilder(selectedFecundityItem, altarOfFecundity)
    }

    if (selectedInvasionItem) {
      recipeBuilder(selectedInvasionItem, altarOfInvasion)
    }

    if (selectedSubjugationItem) {
      recipeBuilder(selectedSubjugationItem, altarOfSubjugation)
    }

    if (selectedDevastationBasic) {
      recipeBuilder(selectedDevastationBasic, altarOfDevastation)
    }

    if (selectedDevastationFocused) {
      recipeBuilder(selectedDevastationFocused, altarOfDevastation)
    }
  }, [
    recipeBuilder,
    selectedDevastationBasic,
    selectedDevastationFocused,
    selectedFecundityItem,
    selectedInvasionItem,
    selectedSubjugationItem
  ])

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
            <Accordion alwaysOpen={false} className='rounded-0'>
              {Object.entries(rawMaterials).length > 0 && (
                <Accordion.Item eventKey='0' className='rounded-0'>
                  <Accordion.Header>Materials to Farm</Accordion.Header>
                  <Accordion.Body className='p-0'>
                    <ListGroup variant='flush'>
                      {Object.entries(rawMaterials).map(([name, count]: [name: string, count: number]) => {
                        // Don't want to display the weapons required to charge depleted cells
                        // It's basically ingredient bloat
                        if (
                          /\b((green\s+steel)|enchanted|earth|air|fire|water|positive|negative)\s+(accessory|weapon)\b/i.test(
                            name
                          )
                        ) {
                          return <></>
                        }

                        return (
                          <ListGroup.Item key={name}>
                            <FarmedIngredientDisplay
                              ingredient={findIngredientByName(name, ingredients as CraftingIngredient[])}
                              quantity={count}
                            />
                          </ListGroup.Item>
                        )
                      })}
                    </ListGroup>
                  </Accordion.Body>
                </Accordion.Item>
              )}

              {Object.entries(craftedMaterials).length > 0 && (
                <Accordion.Item eventKey='1' className='rounded-0'>
                  <Accordion.Header>Materials to Craft</Accordion.Header>
                  <Accordion.Body className='p-0'>
                    <ListGroup variant='flush'>
                      {Object.entries(craftedMaterials).map(([name, count]: [name: string, count: number]) => {
                        return (
                          <ListGroup.Item key={name}>
                            <CraftedIngredientDisplay
                              ingredient={findIngredientByName(name, [
                                ...altarOfFecundity,
                                ...altarOfInvasion,
                                ...altarOfSubjugation,
                                ...altarOfDevastation
                              ])}
                              quantity={count}
                            />
                          </ListGroup.Item>
                        )
                      })}
                    </ListGroup>
                  </Accordion.Body>
                </Accordion.Item>
              )}
            </Accordion>
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
                        <FarmedIngredientDisplay ingredient={ingredient} quantity={ingredient.quantity} />
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
                        <FarmedIngredientDisplay ingredient={ingredient} quantity={ingredient.quantity} />
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
