import camelcase from 'camelcase'
import { Container, OverlayTrigger, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../redux/hooks.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import { ICON_BASE } from '../../utils/constants.ts'
import { getOwnedIngredients } from '../../utils/jsxUtils.tsx'
import { formatIngredientName } from '../../utils/utils.ts'
import FallbackImage from './FallbackImage.tsx'
import IngredientPopover from './IngredientPopover.tsx'

const CraftedIngredientDisplay = (props: Props) => {
  const {
    dropdownName,
    ingredient,
    isDropdown = false,
    quantity,
    showLocation = true,
    showPopover = true,
    showQuantity = true,
    showEffects = false
  } = props

  const { troveData } = useAppSelector((state) => state.app, shallowEqual)

  const formattedName: string = formatIngredientName(ingredient?.image ?? ingredient?.name ?? '')
  const imageSrc = `${ICON_BASE}${camelcase(formattedName)}.png`

  if (!ingredient) {
    return <></>
  }

  const renderEffects = () => {
    if (!showEffects || !('effectsAdded' in ingredient) || !ingredient.effectsAdded?.length) {
      return <></>
    }

    return (
      <small className='text-muted'>
        {ingredient.effectsAdded
          .map((effect) => {
            return `${effect.name}${
              effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''
            }`
          })
          .join(', ')}
      </small>
    )
  }

  return (
    <Stack direction='horizontal' gap={3} className='align-items-center'>
      {showPopover ? (
        <OverlayTrigger
          trigger={['click', 'hover']}
          overlay={(popperProps) => <IngredientPopover {...popperProps} ingredient={ingredient} />}
          placement='auto'
        >
          <FallbackImage src={imageSrc} alt={ingredient.name} />
        </OverlayTrigger>
      ) : (
        <FallbackImage src={imageSrc} alt={ingredient.name} />
      )}

      <Stack direction='vertical' gap={0} className='text-wrap justify-content-center'>
        {isDropdown && dropdownName ? dropdownName : ingredient.name}
        {showLocation && (ingredient as CraftingIngredient).craftedIn && (
          <small>Crafting Location: {(ingredient as CraftingIngredient).craftedIn}</small>
        )}
        {renderEffects()}
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
  dropdownName?: string
  ingredient: CraftingIngredient | Ingredient | undefined
  isDropdown?: boolean
  quantity: number
  showLocation?: boolean
  showPopover?: boolean
  showQuantity?: boolean
  showEffects?: boolean
}

export default CraftedIngredientDisplay
