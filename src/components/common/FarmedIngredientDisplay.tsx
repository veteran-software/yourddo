import camelcase from 'camelcase'
import { Container, OverlayTrigger, Stack } from 'react-bootstrap'
import { FaCircleNotch } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../redux/hooks.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import { ICON_BASE } from '../../utils/constants.ts'
import { getOwnedIngredients } from '../../utils/jsxUtils.tsx'
import { formatDropLocation, formatIngredientName } from '../../utils/utils.ts'
import FallbackImage from './FallbackImage.tsx'
import IngredientPopover from './IngredientPopover.tsx'
import NoteTooltip from './NoteTooltip.tsx'

const FarmedIngredientDisplay = (props: Props) => {
  const { ingredient, quantity, showLocation = true, showQuantity = true } = props

  const { troveData } = useAppSelector((state) => state.app, shallowEqual)

  const formattedName: string = formatIngredientName(ingredient?.image ?? ingredient?.name ?? '')
  const imageSrc = `${ICON_BASE}${camelcase(formattedName)}.png`

  if (!ingredient) {
    return <></>
  }

  const locations =
    ingredient.foundIn?.map((loc) => formatDropLocation(loc)).toSorted((a, b) => a.localeCompare(b)) ?? []

  return (
    <Stack direction='horizontal' gap={3}>
      {imageSrc === '' ? (
        <FaCircleNotch title='Loading...' size={36} color='gray' style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <OverlayTrigger
          trigger={['hover', 'click']}
          delay={{ show: 250, hide: 1000 }}
          overlay={<IngredientPopover ingredient={ingredient} />}
          placement='auto'
          rootClose
        >
          <FallbackImage src={imageSrc} alt={ingredient.name} />
        </OverlayTrigger>
      )}

      <Stack direction='vertical' gap={0} className='text-wrap justify-content-center'>
        <Stack direction='horizontal' gap={2}>
          {ingredient.name}
          {ingredient.notes && <NoteTooltip id={ingredient.name} text={ingredient.notes} />}
        </Stack>

        {showLocation && locations.length > 0 && (
          <small>
            Farming Location{locations.length > 1 ? 's' : ''}:&nbsp;
            {locations.join(', ')}
          </small>
        )}
      </Stack>

      {showQuantity && (
        <Container className='w-auto ms-auto'>
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
