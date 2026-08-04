import { Alert, Badge, Box, Group, List, Paper, Stack, Text, Title } from '@mantine/core'
import type { DinosaurBoneRequirement, FinishedDinosaurBoneItem } from '../dinosaurBone.types.ts'

const RequirementList = ({ requirements }: { requirements: readonly DinosaurBoneRequirement[] }) => {
  if (requirements.length === 0) {
    return (
      <Text c='dimmed' size='xs'>
        No published crafting requirements.
      </Text>
    )
  }

  return (
    <List spacing='xs' size='sm'>
      {requirements.map((requirement, index) => (
        <List.Item key={`${requirement.name}-${String(index)}`}>
          <Group component='span' justify='space-between' align='flex-start' wrap='nowrap'>
            <Box component='span' style={{ minWidth: 0 }}>
              <Text component='span' size='sm' style={{ overflowWrap: 'anywhere' }}>
                {requirement.name}
              </Text>
              {requirement.foundIn?.map((location) => (
                <Text component='span' display='block' c='dimmed' size='xs' key={location}>
                  {location}
                </Text>
              ))}
            </Box>
            <Badge component='span' variant='light' color='gray'>
              ×{String(requirement.quantity)}
            </Badge>
          </Group>
          {requirement.requirements && requirement.requirements.length > 0 ? (
            <Box mt='xs' ml='sm'>
              <Text c='dimmed' size='xs' mb={4}>
                Component requirements
              </Text>
              <RequirementList requirements={requirement.requirements} />
            </Box>
          ) : null}
        </List.Item>
      ))}
    </List>
  )
}

const CraftingBreakdownTool = ({ finished }: { finished: FinishedDinosaurBoneItem }) => {
  if (!finished.item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review individual crafting requirements.
      </Alert>
    )
  }

  const recipes = [
    {
      id: 'base-item',
      name: finished.item.name,
      label: 'Base item',
      requirements: finished.item.requirements,
      craftedIn: finished.item.craftedIn
    },
    ...finished.slots.flatMap(({ slot, augment }) =>
      augment && (augment.requirements.length > 0 || augment.craftedIn)
        ? [
            {
              id: slot.id,
              name: augment.name,
              label: slot.label,
              requirements: augment.requirements,
              craftedIn: augment.craftedIn
            }
          ]
        : []
    )
  ]

  return (
    <Stack gap='md' p='md'>
      <Text size='sm'>Requirements are kept separate for each crafted part of this build.</Text>
      {recipes.map((recipe) => (
        <Paper component='section' aria-label={`${recipe.name} requirements`} withBorder p='sm' key={recipe.id}>
          <Stack gap='xs'>
            <Group justify='space-between' align='flex-start' wrap='nowrap'>
              <Title order={4} size='h5' style={{ overflowWrap: 'anywhere' }}>
                {recipe.name}
              </Title>
              <Badge variant='light' color={recipe.id === 'base-item' ? 'blue' : 'gray'}>
                {recipe.label}
              </Badge>
            </Group>
            {recipe.craftedIn ? (
              <Text c='dimmed' size='xs'>
                Crafted at {recipe.craftedIn}
              </Text>
            ) : null}
            <RequirementList requirements={recipe.requirements} />
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}

export default CraftingBreakdownTool
