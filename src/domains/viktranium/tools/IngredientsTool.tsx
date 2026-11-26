import { Alert, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { RequirementList } from '../../../shared/layout/SlottedCraftingParts'
import type { IngredientCalculation, ViktraniumItem } from '../viktranium.types.ts'

const IngredientsTool = ({
  header,
  item,
  calculation
}: {
  header: ReactNode
  item?: ViktraniumItem
  calculation: IngredientCalculation
}) => {
  if (!item)
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review cumulative ingredients.
      </Alert>
    )
  return (
    <Stack gap='md' p='md'>
      {header}
      {calculation.warnings.length > 0 ? (
        <Alert color='yellow' title='Incomplete total' role='alert'>
          {calculation.warnings.map((warning) => (
            <Text size='sm' key={warning}>
              {warning}
            </Text>
          ))}
        </Alert>
      ) : null}
      {calculation.ingredients.length === 0 ? (
        <Alert color='green' title='No material cost'>
          This valid configuration has no published material requirements.
        </Alert>
      ) : (
        <RequirementList requirements={calculation.ingredients} icons />
      )}
    </Stack>
  )
}

export default IngredientsTool
