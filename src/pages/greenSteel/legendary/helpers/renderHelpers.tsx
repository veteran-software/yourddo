import { Stack } from 'react-bootstrap'
import CraftedIngredientDisplay from '../../../../components/CraftedIngredientDisplay.tsx'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { elementColor } from '../../../../utils/utils.ts'

export const renderHeader = (name: string) => (
  <Stack direction='horizontal' gap={0} className='align-items-center justify-content-center'>
    <span className='text-muted me-1'>Focus :</span>
    <span className={`text-${elementColor(name)}`}>{name}</span>
  </Stack>
)

export const renderBody = (ingredient: CraftingIngredient) => (
  <CraftedIngredientDisplay
    dropdownName={ingredient.effectsAdded
      ?.map((effect: Enhancement) => {
        return `${effect.name}${
          effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''
        }`
      })
      .toSorted((a: string, b: string) => a.localeCompare(b))
      .join(', ')}
    ingredient={ingredient}
    isDropdown
    quantity={1}
    showLocation={false}
    showQuantity={false}
    showPopover={false}
  />
)
