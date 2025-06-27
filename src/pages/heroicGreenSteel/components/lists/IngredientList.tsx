import { Accordion, Card, ListGroup, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import CraftedIngredientDisplay from '../../../../components/CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from '../../../../components/FarmedIngredientDisplay.tsx'
import { ingredients } from '../../../../data/ingredients.ts'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import type { Ingredient } from '../../../../types/ingredients.ts'
import { findIngredientByName } from '../../../../utils/objectUtils.ts'
import { allAltars } from '../../helpers/elementalData.ts'
import useRecipeBuilder from '../../hooks/useRecipeBuilder.ts'
import TierAccordionItem from '../TierAccordionItem.tsx'
import MaterialsAccordion from './MaterialsAccordion.tsx'

const IngredientList = () => {
  const {
    selectedFecundityItem,
    selectedSubjugationItem,
    selectedInvasionItem,
    selectedDevastationFocused,
    selectedDevastationBasic
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

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
            <TierAccordionItem
              eventKey='2'
              tier='Base Item'
              altarName='Altar of Fecundity'
              selectedItem={selectedFecundityItem}
              getDisplay={getDisplay}
            />

            <TierAccordionItem
              eventKey='3'
              tier='Tier: 1'
              altarName='Altar of Invasion'
              selectedItem={selectedInvasionItem}
              getDisplay={getDisplay}
            />

            <TierAccordionItem
              eventKey='4'
              tier='Tier: 2'
              altarName='Altar of Subjugation'
              selectedItem={selectedSubjugationItem}
              getDisplay={getDisplay}
            />

            <TierAccordionItem
              eventKey='6'
              tier='Tier: 3 Basic'
              altarName='Altar of Devastation'
              selectedItem={selectedDevastationBasic}
              getDisplay={getDisplay}
            />

            <TierAccordionItem
              eventKey='7'
              tier='Tier: 3 Focused'
              altarName='Altar of Devastation'
              selectedItem={selectedDevastationFocused}
              getDisplay={getDisplay}
              showDualShardWarning={true}
            />
          </Accordion>
        </Card.Body>
      </Card>
    </Stack>
  )
}

export default IngredientList
