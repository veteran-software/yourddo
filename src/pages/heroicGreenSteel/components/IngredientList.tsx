import { useCallback, useEffect, useState } from 'react'
import { Accordion, Card, ListGroup } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import FarmedIngredientDisplay from '../../../components/FarmedIngredientDisplay.tsx'
import { altarOfFecundity } from '../../../data/altarOfFecundity.ts'
import { altarOfInvasion } from '../../../data/altarOfInvasion.ts'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'

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
    if (recipe.craftedIn) {
      recipe.requirements.forEach((requirement: CraftingIngredient) => {
        const ingredient: CraftingIngredient | undefined = whereToLook.find(
          (altarIngredient: CraftingIngredient) => altarIngredient.name === requirement.name
        )

        if (ingredient) {
          setCraftedMaterials((prev) => ({
            ...prev,
            [ingredient.name]: (prev[ingredient.name] ?? 0) + requirement.quantity
          }))

          recipeBuilder(ingredient, whereToLook)
        } else {
          setRawMaterials((prev) => ({
            ...prev,
            [requirement.name]: (prev[requirement.name] ?? 0) + requirement.quantity
          }))
        }
      })
    }
  }, [])

  useEffect(() => {
    if (selectedFecundityItem) {
      recipeBuilder(selectedFecundityItem, altarOfFecundity)
    }

    if (selectedInvasionItem) {
      recipeBuilder(selectedInvasionItem, altarOfInvasion)
    }
  }, [recipeBuilder, selectedFecundityItem, selectedInvasionItem])

  useEffect(() => {
    console.log(craftedMaterials)
    console.log(rawMaterials)
  }, [craftedMaterials, rawMaterials])

  return (
    <Card>
      <Card.Header className='text-center'>
        <h6 className='mb-0'>Ingredient List</h6>
      </Card.Header>
      <Card.Body className='m-0 p-0'>
        <Accordion alwaysOpen={false} className='rounded-0'>
          {selectedFecundityItem && (
            <Accordion.Item eventKey='0' className='rounded-0'>
              <Accordion.Header>[Base Item] : {selectedFecundityItem.name}</Accordion.Header>
              <Accordion.Body className='p-0'>
                <ListGroup variant='flush' className='mb-3'>
                  {selectedFecundityItem.requirements.map((ingredient: CraftingIngredient) => (
                    <ListGroup.Item key={ingredient.name}>
                      {/*{craftedMaterials[ingredient.name] && (*/}
                      {/*  <CraftedMaterialList craftedIngredients={ingredient.requirements} selectedRing={null} />*/}
                      {/*)}*/}
                      <FarmedIngredientDisplay ingredient={ingredient} quantity={ingredient.quantity} />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          )}

          {selectedInvasionItem && (
            <Accordion.Item eventKey='1'>
              <Accordion.Header>[Tier: 1] : {selectedInvasionItem.name}</Accordion.Header>
              <Accordion.Body className='p-0'>
                <ListGroup variant='flush' className='mb-3'>
                  {selectedInvasionItem.requirements.map((ingredient: CraftingIngredient) => (
                    <ListGroup.Item key={ingredient.name}>
                      <FarmedIngredientDisplay ingredient={ingredient} quantity={ingredient.quantity} />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          )}

          {selectedSubjugationItem && (
            <Accordion.Item eventKey='2'>
              <Accordion.Header>[Tier: 2] : {selectedSubjugationItem.name}</Accordion.Header>
              <Accordion.Body className='p-0'>
                <ListGroup variant='flush' className='mb-3'>
                  {selectedSubjugationItem.requirements.map((ingredient: CraftingIngredient) => (
                    <ListGroup.Item key={ingredient.name}>
                      <FarmedIngredientDisplay ingredient={ingredient} quantity={ingredient.quantity} />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          )}

          {selectedSubjugationSpell && (
            <Accordion.Item eventKey='3'>
              <Accordion.Header>
                [Tier: 2 Spell] : {selectedSubjugationSpell.spell?.name ?? 'Unknown Spell'} (CL:{' '}
                {selectedSubjugationSpell.spell?.casterLevel ?? 0})
              </Accordion.Header>
              <Accordion.Body className='p-0'>
                <ListGroup>
                  <ListGroup.Item>
                    All upgrades in the Altar of Subjugation provide a spell. No additional materials are required.
                  </ListGroup.Item>
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          )}

          {selectedDevastationBasic && (
            <Accordion.Item eventKey='4'>
              <Accordion.Header>[Tier: 3 Basic] : {selectedDevastationBasic.name}</Accordion.Header>
              <Accordion.Body className='p-0'>
                <ListGroup variant='flush' className='mb-3'>
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
            <Accordion.Item eventKey='5'>
              <Accordion.Header>[Tier: 3 Focused] : {selectedDevastationFocused.name}</Accordion.Header>
              <Accordion.Body className='p-0'>
                <ListGroup variant='flush' className='mb-3'>
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
  )
}

export default IngredientList
