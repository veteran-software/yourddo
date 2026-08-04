import { Alert, Badge, Box, Group, List, Stack, Text } from '@mantine/core'
import type { ClassifiedDinosaurBoneItem, CumulativeIngredient } from '../dinosaurBone.types.ts'

const IngredientsTool = ({
  item,
  ingredients
}: {
  item?: ClassifiedDinosaurBoneItem
  ingredients: CumulativeIngredient[]
}) => {
  if (!item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review cumulative ingredients.
      </Alert>
    )
  }
  return (
    <Stack gap='md' p='md'>
      <Text size='sm'>Cumulative requirements for {item.name} and all selected augments.</Text>
      {ingredients.length === 0 ? (
        <Alert color='green' title='No material cost'>
          This valid configuration has no published material requirements.
        </Alert>
      ) : (
        <List spacing='sm'>
          {ingredients.map((ingredient) => (
            <List.Item key={ingredient.name}>
              <Group component='span' justify='space-between' align='flex-start' wrap='nowrap'>
                <Box component='span' style={{ minWidth: 0 }}>
                  <Text component='span' size='sm' style={{ overflowWrap: 'anywhere' }}>
                    {ingredient.name}
                  </Text>
                  {ingredient.foundIn?.map((location) => (
                    <Text component='span' display='block' c='dimmed' size='xs' key={location}>
                      {location}
                    </Text>
                  ))}
                </Box>
                <Badge component='span' variant='light' color='gray'>
                  ×{String(ingredient.quantity)}
                </Badge>
              </Group>
            </List.Item>
          ))}
        </List>
      )}
    </Stack>
  )
}

export default IngredientsTool
