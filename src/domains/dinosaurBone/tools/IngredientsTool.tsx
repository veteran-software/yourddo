import { BuildHeader, RequirementList } from './RecipeParts'
import { Alert, Stack } from '@mantine/core'
import type { FinishedDinosaurBoneItem, CumulativeIngredient } from '../dinosaurBone.types.ts'

const IngredientsTool = ({
  finished,
  ingredients
}: {
  finished: FinishedDinosaurBoneItem
  ingredients: CumulativeIngredient[]
}) => {
  if (!finished.item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review cumulative ingredients.
      </Alert>
    )
  }
  return (
    <Stack gap='md' p='md'>
      <BuildHeader finished={finished} />
      {ingredients.length === 0 ? (
        <Alert color='green' title='No material cost'>
          This valid configuration has no published material requirements.
        </Alert>
      ) : (
        <RequirementList requirements={ingredients} />
      )}
    </Stack>
  )
}

export default IngredientsTool
