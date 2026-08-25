import { Alert, Badge, Group, List, Stack, Text, Title } from '@mantine/core'
import type { LgsIngredientPlan, LgsRequirement } from '../legendaryGreenSteel.types.ts'

const IngredientList = ({ values }: { values: readonly LgsRequirement[] }) =>
  values.length ? (
    <List spacing='xs'>
      {values.map(({ name, quantity }) => (
        <List.Item key={name}>
          <Group component='span' justify='space-between' wrap='nowrap'>
            <Text component='span' size='sm'>
              {name}
            </Text>
            <Badge component='span' variant='light' color='gray'>
              ×{quantity}
            </Badge>
          </Group>
        </List.Item>
      ))}
    </List>
  ) : (
    <Text c='dimmed' size='sm'>
      No materials yet.
    </Text>
  )

const IngredientsTool = ({ plan }: { plan: LgsIngredientPlan }) => {
  if (!plan.rawMaterials.length && !plan.craftedMaterials.length) {
    return (
      <Alert color='blue' title='No crafting stages selected' m='md'>
        Select a base item or crafting stage to calculate ingredients.
      </Alert>
    )
  }
  return (
    <Stack gap='lg' p='md'>
      <Stack gap='xs'>
        <Title order={3} size='h5'>
          Raw Materials
        </Title>
        <IngredientList values={plan.rawMaterials} />
      </Stack>
      <Stack gap='xs'>
        <Title order={3} size='h5'>
          Crafted Materials
        </Title>
        <IngredientList values={plan.craftedMaterials} />
      </Stack>
    </Stack>
  )
}

export default IngredientsTool
