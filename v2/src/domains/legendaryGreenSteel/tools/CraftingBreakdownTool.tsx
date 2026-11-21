import { Alert, Badge, Group, List, Paper, Stack, Text, Title } from '@mantine/core'
import type { LgsRecipe, LgsRequirement } from '../legendaryGreenSteel.types.ts'

interface LgsCraftingStage {
  label: string
  recipe?: { name: string; craftedIn: string; requirements: readonly LgsRequirement[] }
  displayName?: string
}

const CraftingBreakdownTool = ({
  stages,
  components
}: {
  stages: readonly LgsCraftingStage[]
  components: readonly LgsRecipe[]
}) => {
  const componentIds = new Set(components.map((component) => component.id))
  const selectedStages = stages.filter(
    (stage): stage is LgsCraftingStage & { recipe: NonNullable<LgsCraftingStage['recipe']> } => Boolean(stage.recipe)
  )

  if (!selectedStages.length) {
    return (
      <Alert color='blue' title='No crafting stages selected' m='md'>
        Select a base item or crafting stage to review the crafting progression.
      </Alert>
    )
  }

  return (
    <Stack gap='md' p='md'>
      {selectedStages.map(({ label, recipe, displayName }, index) => (
        <Paper withBorder p='sm' key={label}>
          <Stack gap='xs'>
            <Group justify='space-between' align='flex-start' wrap='nowrap'>
              <Stack gap={0}>
                <Title order={3} size='h5'>
                  {label}
                </Title>
                <Text fw={600} size='sm'>
                  {displayName ?? recipe.name}
                </Text>
              </Stack>
              <Badge variant='light'>Step {index + 1}</Badge>
            </Group>
            <Text c='dimmed' size='xs'>
              {recipe.craftedIn}
            </Text>
            <List spacing={4} size='sm'>
              {recipe.requirements.map(({ id, name, quantity }) => (
                <List.Item key={id}>
                  {name} ×{quantity}
                  {componentIds.has(id) ? ' (crafted component)' : ''}
                </List.Item>
              ))}
            </List>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}

export default CraftingBreakdownTool
