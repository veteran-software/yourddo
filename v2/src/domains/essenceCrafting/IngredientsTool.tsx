import { Alert, Stack, Table, Text } from '@mantine/core'
import BindingSelector from './BindingSelector.tsx'
import { unavailableStepsForPlan, warningMessage } from './craftingPlanPresentation.ts'
import type { EssenceBinding, EssenceCraftingData } from './essenceCrafting.types.ts'
import type { EssenceMaterial, EssencePlanMaterials } from './materialCalculations.ts'
import type { EssencePlanState } from './plannerState.ts'

interface IngredientsToolProps {
  binding: EssenceBinding
  data: EssenceCraftingData
  plan: EssencePlanState
  planMaterials: EssencePlanMaterials
  onBindingChange: (binding: EssenceBinding) => void
}

const MaterialsTable = ({ materials, testId }: { materials: readonly EssenceMaterial[]; testId?: string }) => (
  <Table withTableBorder withColumnBorders data-testid={testId}>
    <Table.Thead>
      <Table.Tr>
        <Table.Th scope='col'>Ingredient</Table.Th>
        <Table.Th scope='col' style={{ textAlign: 'right' }}>
          Quantity
        </Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
      {materials.map((material) => (
        <Table.Tr key={material.ingredientId} data-testid={`${testId ?? 'ingredient'}-${material.ingredientId}`}>
          <Table.Td>{material.displayName}</Table.Td>
          <Table.Td style={{ textAlign: 'right' }}>{material.quantity}</Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  </Table>
)

const IngredientsTool = ({ binding, data, plan, planMaterials, onBindingChange }: IngredientsToolProps) => {
  const unavailableSteps = unavailableStepsForPlan(planMaterials.items.flatMap((item) => item.steps))

  return (
    <Stack gap='md' p='md'>
      <Stack gap={4}>
        <Text fw={600}>Total materials</Text>
        <BindingSelector binding={binding} onChange={onBindingChange} />
      </Stack>

      {plan.activeSlotIds.length === 0 ? (
        <Alert color='blue' title='No planned items' role='status'>
          Add an equipment slot to calculate its ingredient requirements.
        </Alert>
      ) : (
        <>
          {unavailableSteps.length > 0 ? (
            <Alert color='yellow' title='Material warning' role='alert'>
              <Stack gap={4}>
                {unavailableSteps.map((step, index) => (
                  <Text size='sm' key={`${step.source}-${String(index)}`}>
                    {warningMessage(data, step)}
                  </Text>
                ))}
              </Stack>
            </Alert>
          ) : null}

          <Stack gap='xs'>
            <MaterialsTable materials={planMaterials.materials} testId='ingredients-total-materials' />
          </Stack>
        </>
      )}
    </Stack>
  )
}

export default IngredientsTool
