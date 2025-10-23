import camelcase from 'camelcase'
import { Container, Stack } from 'react-bootstrap'
import { FaCircleNotch } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../redux/hooks.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import { ICON_BASE } from '../../utils/constants.ts'
import { getOwnedIngredients } from '../../utils/jsxUtils.tsx'
import { formatIngredientName } from '../../utils/utils.ts'
import FallbackImage from './FallbackImage.tsx'
import NoteTooltip from './NoteTooltip.tsx'

const FarmedIngredientDisplay = (props: Props) => {
  const { ingredient, quantity, showLocation = true, showQuantity = true } = props

  const { troveData } = useAppSelector((state) => state.app, shallowEqual)

  const formattedName: string = formatIngredientName(ingredient?.image ?? ingredient?.name ?? '')
  const imageSrc = `${ICON_BASE}${camelcase(formattedName)}.png`

  if (!ingredient) {
    return <></>
  }

  return (
    <Stack direction='horizontal' gap={3}>
      {imageSrc === '' ? (
        <FaCircleNotch title='Loading...' size={36} color='gray' style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <FallbackImage src={imageSrc} alt={ingredient.name} />
      )}

      <Stack direction='vertical' gap={0} className='text-wrap justify-content-center'>
        <Stack direction='horizontal' gap={2}>
          {ingredient.name}
          {ingredient.notes && <NoteTooltip id={ingredient.name} text={ingredient.notes} />}
        </Stack>

        {showLocation && (
          <small>
            Farming Location{(ingredient.foundIn?.length ?? 0) > 1 ? 's' : ''}:&nbsp;
            {ingredient.foundIn?.toSorted((a: string, b: string) => a.localeCompare(b)).join(', ')}
          </small>
        )}
      </Stack>

      {showQuantity && (
        <Container className='w-auto'>
          <strong>{getOwnedIngredients(ingredient, quantity, troveData)}</strong>
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
