import camelcase from 'camelcase'
import { Container, OverlayTrigger, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../redux/hooks.ts'
import type { Enhancement } from '../../types/core.ts'
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

    const effects = ingredient.effectsAdded
    const MAX_VISIBLE_EFFECTS = 3

    const displayedEffects = effects.slice(0, MAX_VISIBLE_EFFECTS)
    const remainingCount = effects.length - MAX_VISIBLE_EFFECTS

    const effectToString = (effect: Enhancement) => {
      return `${effect.name}${effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''}`
    }

    return (
      <small className='text-muted'>
        {displayedEffects.map(effectToString).join(', ')}
        {remainingCount > 0 && (
          <OverlayTrigger
            trigger={['hover', 'click']}
            delay={{ show: 250, hide: 1000 }}
            placement='top'
            rootClose
            overlay={<IngredientPopover ingredient={ingredient} />}
          >
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              {`, and ${String(remainingCount)} more...`}
            </span>
          </OverlayTrigger>
        )}
      </small>
    )
  }

  return (
    <Stack direction='horizontal' gap={3} className='align-items-center'>
      {showPopover ? (
        <OverlayTrigger
          trigger={['hover', 'click']}
          delay={{ show: 250, hide: 1000 }}
          overlay={<IngredientPopover ingredient={ingredient} />}
          placement='auto'
          rootClose
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
