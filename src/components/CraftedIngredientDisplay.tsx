import { Container, Image, OverlayTrigger, Stack } from 'react-bootstrap'
import useIngredientImage from '../hooks/useIngredientImage.ts'
import IngredientPopover from '../pages/greenSteel/heroic/components/IngredientPopover.tsx'
import type { CraftingIngredient } from '../types/crafting.ts'
import type { Ingredient } from '../types/ingredients.ts'

const CraftedIngredientDisplay = (props: Props) => {
  const {
    dropdownName,
    ingredient,
    isDropdown = false,
    quantity,
    showLocation = true,
    showPopover = true,
    showQuantity = true
  } = props

  const { imageSrc } = useIngredientImage(ingredient?.name ?? '', ingredient?.image)

  if (!ingredient) {
    return <></>
  }

  return (
    <Stack direction='horizontal' gap={3} className='align-items-center'>
      {showPopover ? (
        <OverlayTrigger
          overlay={IngredientPopover({
            ingredient,
            popper: {}
          })}
          placement='auto'
        >
          <Image src={imageSrc} alt={ingredient.name} title={ingredient.name} />
        </OverlayTrigger>
      ) : (
        <Image src={imageSrc} alt={ingredient.name} title={ingredient.name} />
      )}

      <Stack direction='vertical' gap={0} className='text-wrap justify-content-center'>
        {isDropdown && dropdownName ? dropdownName : ingredient.name}
        {showLocation && (ingredient as CraftingIngredient).craftedIn && (
          <small>Crafting Location: {(ingredient as CraftingIngredient).craftedIn}</small>
        )}
      </Stack>

      {showQuantity && (
        <Container className='w-auto'>
          <strong>{String(quantity)}</strong>
        </Container>
      )}
    </Stack>
  )
}

interface Props {
  dropdownName?: string
  ingredient: CraftingIngredient | Ingredient | undefined
  isDropdown?: boolean
  quantity: number
  showLocation?: boolean
  showPopover?: boolean
  showQuantity?: boolean
}

export default CraftedIngredientDisplay
