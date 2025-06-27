import { Container, Image, OverlayTrigger, Stack } from 'react-bootstrap'
import useIngredientImage from '../hooks/useIngredientImage.ts'
import IngredientPopover from '../pages/heroicGreenSteel/components/IngredientPopover.tsx'
import type { CraftingIngredient } from '../types/crafting.ts'
import type { Ingredient } from '../types/ingredients.ts'

const CraftedIngredientDisplay = (props: Props) => {
  const { ingredient, quantity } = props

  const { imageSrc } = useIngredientImage(ingredient?.name ?? '')

  if (!ingredient) {
    return <></>
  }

  return (
    <Stack direction='horizontal' gap={3} className='align-items-center'>
      <OverlayTrigger
        overlay={IngredientPopover({
          ingredient,
          popper: {}
        })}
        placement='auto'
      >
        <Image src={imageSrc} alt={ingredient.name} title={ingredient.name} />
      </OverlayTrigger>

      <Stack direction='vertical' gap={0} className='text-wrap justify-content-center'>
        {ingredient.name}
        {(ingredient as CraftingIngredient).craftedIn && (
          <small>Crafting Location: {(ingredient as CraftingIngredient).craftedIn}</small>
        )}
      </Stack>

      <Container className='w-auto'>
        <strong>{String(quantity)}</strong>
      </Container>
    </Stack>
  )
}

interface Props {
  ingredient: CraftingIngredient | Ingredient | undefined
  quantity: number
}

export default CraftedIngredientDisplay
