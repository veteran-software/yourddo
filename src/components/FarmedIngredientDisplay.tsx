import { Container, Image, Stack } from 'react-bootstrap'
import useIngredientImage from '../hooks/useIngredientImage.ts'
import type { Ingredient } from '../types/ingredients.ts'
import NoteTooltip from './NoteTooltip.tsx'

const FarmedIngredientDisplay = (props: Props) => {
  const { ingredient, quantity, showLocation = true, showQuantity = true } = props

  const { imageSrc } = useIngredientImage(ingredient?.name ?? '')

  if (!ingredient) {
    return <></>
  }

  return (
    <Stack direction='horizontal' gap={3}>
      <Image src={imageSrc} alt={ingredient.name} title={ingredient.name} />

      <Stack direction='vertical' gap={0} className='text-wrap justify-content-center'>
        <Stack direction='horizontal' gap={2}>
          {ingredient.name}
          {ingredient.notes && <NoteTooltip id={ingredient.name} text={ingredient.notes} />}
        </Stack>

        {showLocation && (
          <small>
            Farming Location{(ingredient.foundIn?.length ?? 0) > 1 ? 's' : ''}:{' '}
            {ingredient.foundIn?.toSorted((a: string, b: string) => a.localeCompare(b)).join(', ')}
          </small>
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
  ingredient: Ingredient | undefined
  quantity: number
  showLocation?: boolean
  showQuantity?: boolean
}

export default FarmedIngredientDisplay
