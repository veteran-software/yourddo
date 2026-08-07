import { Alert, Divider, Stack, Table, Text, Title } from '@mantine/core'
import BindingSelector from './BindingSelector.tsx'
import { sourceLabels, stepLabel, unavailableStepsForPlan, warningMessage } from './craftingPlanPresentation.ts'
import { EQUIPMENT_SLOTS } from './equipment.ts'
import type { EssenceBinding, EssenceCraftingData } from './essenceCrafting.types.ts'
import type { EssencePlanMaterials } from './materialCalculations.ts'
import type { EssencePlanState } from './plannerState.ts'

interface RecipesToolProps {
  binding: EssenceBinding
  data: EssenceCraftingData
  plan: EssencePlanState
  planMaterials: EssencePlanMaterials
  onBindingChange: (binding: EssenceBinding) => void
}

const equipmentSlotLabels = new Map(EQUIPMENT_SLOTS.map(({ id, label }) => [id, label]))

const RecipeRequirements = ({
  materials,
  testId
}: {
  materials: readonly { ingredientId: string; displayName: string; quantity: number }[]
  testId?: string
}) => (
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
        <Table.Tr key={material.ingredientId}>
          <Table.Td>{material.displayName}</Table.Td>
          <Table.Td style={{ textAlign: 'right' }}>{material.quantity}</Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  </Table>
)

const RecipesTool = ({ binding, data, plan, planMaterials, onBindingChange }: RecipesToolProps) => {
  if (plan.activeSlotIds.length === 0) {
    return (
      <Stack gap='md' p='md'>
        <BindingSelector binding={binding} onChange={onBindingChange} />
        <Alert color='blue' title='No planned items' role='status'>
          Add an equipment slot to see its recipe steps.
        </Alert>
      </Stack>
    )
  }

  return (
    <Stack gap='md' p='md'>
      <Stack gap={4}>
        <Text fw={600}>Detailed recipe plan</Text>
        <BindingSelector binding={binding} onChange={onBindingChange} />
      </Stack>

      {planMaterials.items.map((item) => {
        const itemPlan = plan.itemsBySlotId[item.equipmentSlotId]
        const selectedAugments = itemPlan?.augmentSlots.flatMap((slot) => {
          const augment = slot.augmentId ? data.indexes.augmentById.get(slot.augmentId) : undefined
          return augment ? [`${augment.displayName} (${slot.augmentSlotTypeId})`] : []
        })

        return (
          <Stack key={item.equipmentSlotId} gap='sm' data-testid={`recipes-item-${item.equipmentSlotId}`}>
            <Divider />
            <Stack gap={2}>
              <Title order={3} size='h4'>
                {equipmentSlotLabels.get(item.equipmentSlotId) ?? item.equipmentSlotId}
              </Title>
              <Text c='dimmed' size='sm'>
                Minimum level {String(item.effectiveItemLevel)} · {binding === 'bound' ? 'Bound' : 'Unbound'} recipes
              </Text>
              {selectedAugments?.length ? (
                <Text size='sm'>
                  Augments: {selectedAugments.join(', ')}. Augments do not add crafting recipe steps.
                </Text>
              ) : null}
            </Stack>

            {item.steps.map((step, index) => {
              if (step.status === 'unavailable') {
                return (
                  <Alert
                    color='yellow'
                    title={`Recipe warning: ${sourceLabels[step.source]}`}
                    role='alert'
                    key={`${step.source}-${String(index)}`}
                  >
                    {warningMessage(data, step)}
                  </Alert>
                )
              }

              const recipe = step.recipeId
                ? data.recipes.find((candidate) => candidate.id === step.recipeId)
                : undefined
              return (
                <Stack gap={4} key={`${step.source}-${step.recipeId ?? 'mark'}-${String(index)}`}>
                  <Text fw={600}>{stepLabel(step)}</Text>
                  {recipe ? (
                    <Text size='sm'>
                      Recipe ID: {recipe.id} · Crafting level {String(recipe.craftingLevel)} ·{' '}
                      {recipe.binding === 'bound' ? 'Bound' : 'Unbound'}
                    </Text>
                  ) : null}
                  <RecipeRequirements
                    materials={step.materials}
                    testId={`recipes-step-${item.equipmentSlotId}-${step.source}`}
                  />
                </Stack>
              )
            })}
          </Stack>
        )
      })}

      {unavailableStepsForPlan(planMaterials.items.flatMap((item) => item.steps)).length > 0 ? (
        <Text c='dimmed' size='xs'>
          Warning: unavailable recipe variants are excluded from the ingredient totals.
        </Text>
      ) : null}
    </Stack>
  )
}

export default RecipesTool
