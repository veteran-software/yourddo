import { ListGroup } from 'react-bootstrap'
import CraftedIngredientDisplay from '../../../components/common/CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from '../../../components/common/FarmedIngredientDisplay.tsx'
import InstructionsPopover from '../../../components/common/InstructionsPopover.tsx'
import { altarOfSubjugation } from '../../../data/altarOfSubjugation.ts'
import { ingredients } from '../../../data/ingredients.ts'
import type { Ring } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { Ingredient } from '../../../types/ingredients.ts'
import { craftedMaterialInstructions } from '../../../utils/strings.ts'

const CraftedMaterialList = (props: Props) => {
  const { craftedIngredients, selectedRing } = props

  return selectedRing && Object.entries(craftedIngredients).length > 0 ? (
    <>
      <hr />

      <ListGroup>
        <ListGroup.Item variant={'secondary'} className='d-flex flex-row justify-content-between'>
          <strong>Crafted Materials</strong>
          <InstructionsPopover instructionsText={craftedMaterialInstructions(selectedRing.name)} />
        </ListGroup.Item>
        {Object.entries(craftedIngredients)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([ing, count], idx: number) => {
            const crafted: CraftingIngredient | undefined = Object.values(altarOfSubjugation).find(
              (ingredient: CraftingIngredient) => ingredient.name === ing
            )

            if (crafted) {
              return (
                <ListGroup.Item key={`${ing}-${String(count)}-${String(idx)}`}>
                  <CraftedIngredientDisplay ingredient={crafted} quantity={count} />
                </ListGroup.Item>
              )
            }

            const farmed: Ingredient | undefined = Object.values(ingredients).find(
              (ingredient: Ingredient) => ingredient.name === ing
            )

            if (farmed) {
              return (
                <ListGroup.Item key={`${ing}-${String(count)}-${String(idx)}`}>
                  <FarmedIngredientDisplay ingredient={farmed} quantity={count} />
                </ListGroup.Item>
              )
            }
          })}
      </ListGroup>
    </>
  ) : (
    <></>
  )
}

interface Props {
  craftedIngredients: Record<string, number>
  selectedRing: Ring | undefined
}

export default CraftedMaterialList
