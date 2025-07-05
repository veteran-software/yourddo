import { ListGroup } from 'react-bootstrap'
import { altarOfDevastation } from '../../../../data/altarOfDevastation.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { findIngredientByName } from '../../../../utils/objectUtils.ts'

const DualShardInstructions = ({ selectedItem }: { selectedItem: { requirements: CraftingIngredient[] } }) => {
  const dualShardIngredient = findIngredientByName(selectedItem.requirements[1].name, altarOfDevastation)

  if (!dualShardIngredient) return null

  return (
    <ListGroup.Item variant='info'>
      <span className='text-decoration-underline'>
        To craft the <strong>{selectedItem.requirements[1].name}</strong>:
      </span>
      <ol>
        <li>Create a(n) {dualShardIngredient.requirements?.[0].name}</li>
        <li>Create a(n) {dualShardIngredient.requirements?.[1].name}</li>
        <li>
          Combine both in the <strong>Altar of Devastation</strong> with a <strong>Shavarath High Energy Cell</strong>
        </li>
      </ol>
    </ListGroup.Item>
  )
}

export default DualShardInstructions
