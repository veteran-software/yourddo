import { Alert, Badge, Box, Group, List, Paper, Stack, Text, Title } from '@mantine/core'
import type {
  FinishedViktraniumSlot,
  ViktraniumItem,
  ViktraniumRecipe,
  ViktraniumRequirement
} from '../viktranium.types.ts'

const RequirementList = ({ requirements }: { requirements: readonly ViktraniumRequirement[] }) => (
  <List spacing='xs' size='sm'>
    {requirements.map((requirement) => (
      <List.Item key={`${requirement.ingredientId}-${String(requirement.quantity)}`}>
        <Group component='span' justify='space-between' wrap='nowrap'>
          <Text component='span' size='sm'>
            {requirement.name}
          </Text>
          <Badge component='span' variant='light' color='gray'>
            ×{String(requirement.quantity)}
          </Badge>
        </Group>
        {requirement.requirements?.length ? (
          <Box ml='sm' mt='xs'>
            <RequirementList requirements={requirement.requirements} />
          </Box>
        ) : null}
      </List.Item>
    ))}
  </List>
)

const Recipe = ({ recipe }: { recipe: ViktraniumRecipe }) => (
  <Stack gap='xs'>
    <Text c='dimmed' size='xs'>
      Crafted at {recipe.device}
    </Text>
    {recipe.status !== 'complete' ? <Alert color='yellow'>Recipe is {recipe.status}.</Alert> : null}
    {recipe.requirements.length ? (
      <RequirementList requirements={recipe.requirements} />
    ) : (
      <Text c='dimmed' size='xs'>
        No published requirements.
      </Text>
    )}
  </Stack>
)

const CraftingBreakdownTool = ({
  item,
  slots
}: {
  item?: ViktraniumItem
  slots: readonly FinishedViktraniumSlot[]
}) => {
  if (!item)
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review individual recipes.
      </Alert>
    )
  const components = [
    { id: item.id, name: item.name, label: 'Base item', recipes: item.recipes },
    ...slots.flatMap(({ slot, augment }) =>
      augment ? [{ id: slot.id, name: augment.name, label: slot.label, recipes: augment.recipes }] : []
    )
  ]
  return (
    <Stack gap='md' p='md'>
      <Text size='sm'>Recipes are shown separately for each component.</Text>
      {components.map((component) => (
        <Paper component='section' aria-label={`${component.name} requirements`} withBorder p='sm' key={component.id}>
          <Stack gap='xs'>
            <Group justify='space-between' align='flex-start' wrap='nowrap'>
              <Title order={4} size='h5'>
                {component.name}
              </Title>
              <Badge variant='light' color={component.id === item.id ? 'blue' : 'gray'}>
                {component.label}
              </Badge>
            </Group>
            {component.recipes.length ? (
              component.recipes.map((recipe) => <Recipe recipe={recipe} key={recipe.id} />)
            ) : (
              <Text c='dimmed' size='xs'>
                No crafting recipe is required or published for this component.
              </Text>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}

export default CraftingBreakdownTool
