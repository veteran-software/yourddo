import { Alert, Badge, Group, List, Paper, Stack, Text, Title } from '@mantine/core'
import type { LgsCraftingComponent, LgsRequirement } from '../legendaryGreenSteel.types.ts'

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
  components: readonly LgsCraftingComponent[]
}) => {
  const componentByName = new Map(components.map((component) => [component.name, component]))
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
              {recipe.requirements
                .filter(({ name }) => name !== "Immortal's Heart")
                .map(({ name, quantity }) => (
                  <List.Item key={name}>
                    {name} ×{quantity}
                    {componentByName.has(name) ? ' (crafted component)' : ''}
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
