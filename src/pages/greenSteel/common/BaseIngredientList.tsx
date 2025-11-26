import { Fragment } from 'react'
import { Accordion, Card, ListGroup, Stack } from 'react-bootstrap'
import CraftedIngredientDisplay from '../../../components/common/CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from '../../../components/common/FarmedIngredientDisplay.tsx'
import { ingredients } from '../../../data/ingredients.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { Ingredient } from '../../../types/ingredients.ts'
import { findCraftedIngredientByName } from '../../../utils/objectUtils.ts'
import MaterialsAccordion from '../heroic/components/lists/MaterialsAccordion.tsx'
import TierAccordionItem from '../heroic/components/TierAccordionItem.tsx'

const BaseIngredientList = (props: Props) => {
  const { craftedMaterials, ingredientSources, rawMaterials, tiers } = props

  const getDisplay = (requirement: CraftingIngredient) => {
    const ingredient: CraftingIngredient | undefined = findCraftedIngredientByName(requirement.name, ingredientSources)

    if (ingredient) {
      return (
        <ListGroup.Item key={ingredient.name}>
          <CraftedIngredientDisplay ingredient={ingredient} quantity={requirement.quantity ?? 1} />
        </ListGroup.Item>
      )
    } else {
      const farmedIngredient: Ingredient | undefined = ingredients.find(
        (farmedIng: Ingredient) => farmedIng.name === requirement.name
      )

      if (farmedIngredient) {
        return (
          <ListGroup.Item key={farmedIngredient.name}>
            <FarmedIngredientDisplay ingredient={farmedIngredient} quantity={requirement.quantity ?? 1} />
          </ListGroup.Item>
        )
      }
    }

    return <Fragment key={'undefined-ingredient'} />
  }

  const hasMaterials: boolean = Object.entries(rawMaterials).length > 0 || Object.entries(craftedMaterials).length > 0

  return (
    <Stack direction='vertical' gap={3} className='m-0 p-0'>
      {hasMaterials && (
        <Card>
          <Card.Header className='text-center'>
            <h6 className='mb-0'>Full Ingredient List</h6>
          </Card.Header>
          <Card.Body className='m-0 p-0'>
            <MaterialsAccordion
              rawMaterials={rawMaterials}
              craftedMaterials={craftedMaterials}
              ingredientSources={ingredientSources}
            />
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header className='text-center'>
          <h6 className='mb-0'>Ingredient List by Tier</h6>
        </Card.Header>
        <Card.Body className='m-0 p-0'>
          <Accordion alwaysOpen={false} className='rounded-0'>
            {tiers.map(
              (tier: TierItem) =>
                tier.selectedItem && (
                  <TierAccordionItem
                    key={tier.eventKey}
                    eventKey={tier.eventKey}
                    tier={tier.tier}
                    altarName={tier.altarName}
                    selectedItem={tier.selectedItem}
                    getDisplay={getDisplay}
                    showDualShardWarning={tier.showDualShardWarning}
                  />
                )
            )}
          </Accordion>
        </Card.Body>
      </Card>
    </Stack>
  )
}

interface Props {
  rawMaterials: Record<string, number>
  craftedMaterials: Record<string, number>
  tiers: TierItem[]
  ingredientSources: CraftingIngredient[]
}

export interface TierItem {
  eventKey: string
  tier: string
  altarName: string
  selectedItem: {
    name: string
    requirements: CraftingIngredient[]
  } | null
  showDualShardWarning?: boolean
}

export default BaseIngredientList
