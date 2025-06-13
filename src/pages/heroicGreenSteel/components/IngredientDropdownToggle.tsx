import { Dropdown } from 'react-bootstrap'
import type { CraftingIngredient } from '../../../types/crafting.ts'

const IngredientDropdownToggle = (props: Props) => {
  const { craftingLocation, fecundity, placeholderText, selectedIngredient } =
    props

  if (fecundity) {
    return (
      <Dropdown.Toggle variant='outline-info w-100'>
        <small>
          {craftingLocation}:{' '}
          {selectedIngredient ? selectedIngredient.name : placeholderText}
        </small>
      </Dropdown.Toggle>
    )
  }

  return (
    <Dropdown.Toggle variant='outline-info w-100'>
      <small>
        {craftingLocation}:{' '}
        {selectedIngredient
          ? (selectedIngredient.effectsAdded
              ?.map((effect) => effect.name)
              .join(', ') ?? placeholderText)
          : placeholderText}
      </small>
    </Dropdown.Toggle>
  )
}

interface Props {
  craftingLocation: string
  fecundity?: boolean
  placeholderText: string
  selectedIngredient: CraftingIngredient | undefined
}

export default IngredientDropdownToggle
