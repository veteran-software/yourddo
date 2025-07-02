import { Fragment } from 'react'
import { Accordion, Card, ListGroup, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import CraftedIngredientDisplay from '../../../components/CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from '../../../components/FarmedIngredientDisplay.tsx'
import { altarOfFecundity } from '../../../data/altarOfFecundity.ts'
import { ingredients } from '../../../data/ingredients.ts'
import { legendaryAltarOfDevastation } from '../../../data/legendaryAltarOfDevastation.ts'
import { legendaryAltarOfInvasion } from '../../../data/legendaryAltarOfInvasion.ts'
import { legendaryAltarOfSubjugation } from '../../../data/legendaryAltarOfSubjugation.ts'
import { useAppSelector } from '../../../redux/hooks'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { Ingredient } from '../../../types/ingredients.ts'
import { findIngredientByName } from '../../../utils/objectUtils.ts'
import MaterialsAccordion from '../../heroicGreenSteel/components/lists/MaterialsAccordion.tsx'
import TierAccordionItem from '../../heroicGreenSteel/components/TierAccordionItem.tsx'
import useRecipeBuilder from '../../heroicGreenSteel/hooks/useRecipeBuilder.ts'

const IngredientList = () => {
  const {
    selectedFecundityItem,
    selectedSubjugationItem,
    selectedInvasionItem,
    selectedDevastationItem,
    selectedActiveAugment
  } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const { rawMaterials, craftedMaterials } = useRecipeBuilder()

  const getDisplay = (requirement: CraftingIngredient) => {
    const ingredient: CraftingIngredient | undefined = findIngredientByName(requirement.name, [
      ...legendaryAltarOfInvasion,
      ...legendaryAltarOfSubjugation,
      ...legendaryAltarOfDevastation,
      ...altarOfFecundity
    ])

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

    return <Fragment key={'undefined-ingredient'} />
  }

  const hasMaterials = Object.entries(rawMaterials).length > 0 || Object.entries(craftedMaterials).length > 0

  return (
    <Stack direction='vertical' gap={3} className='m-0 p-0'>
      {hasMaterials && (
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
            {selectedFecundityItem && (
              <TierAccordionItem
                eventKey='2'
                tier='Base Item'
                altarName='Eldritch Altar of Fecundity'
                selectedItem={{
                  name: selectedFecundityItem.name,
                  requirements: selectedFecundityItem.requirements ?? []
                }}
                getDisplay={getDisplay}
              />
            )}

            {selectedInvasionItem && (
              <TierAccordionItem
                eventKey='3'
                tier='Tier: 1'
                altarName='Legendary Altar of Invasion'
                selectedItem={{
                  name: selectedInvasionItem.name,
                  requirements: selectedInvasionItem.requirements ?? []
                }}
                getDisplay={getDisplay}
              />
            )}

            {selectedSubjugationItem && (
              <TierAccordionItem
                eventKey='4'
                tier='Tier: 2'
                altarName='Legendary Altar of Subjugation'
                selectedItem={{
                  name: selectedSubjugationItem.name,
                  requirements: selectedSubjugationItem.requirements ?? []
                }}
                getDisplay={getDisplay}
              />
            )}

            {selectedDevastationItem && (
              <TierAccordionItem
                eventKey='6'
                tier='Tier: 3'
                altarName='Legendary Altar of Devastation'
                selectedItem={{
                  name: selectedDevastationItem.name,
                  requirements: selectedDevastationItem.requirements ?? []
                }}
                getDisplay={getDisplay}
              />
            )}

            {selectedActiveAugment && (
              <TierAccordionItem
                eventKey='7'
                tier='Active Augment'
                altarName='Eldritch Altar of Fecundity'
                selectedItem={{
                  name: selectedActiveAugment.name,
                  requirements: selectedActiveAugment.requirements ?? []
                }}
                getDisplay={getDisplay}
              />
            )}
          </Accordion>
        </Card.Body>
      </Card>
    </Stack>
  )
}

export default IngredientList
