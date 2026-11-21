import { Alert, Badge, Box, Group, List, Stack, Text } from '@mantine/core'
import ItemIcon from '../../../shared/items/ItemIcon.tsx'
import type { IngredientCalculation, ViktraniumItem } from '../viktranium.types.ts'

const IngredientsTool = ({ item, calculation }: { item?: ViktraniumItem; calculation: IngredientCalculation }) => {
  if (!item)
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review cumulative ingredients.
      </Alert>
    )
  return (
    <Stack gap='md' p='md'>
      <Text size='sm'>Cumulative requirements for {item.name} and all selected augments.</Text>
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
        <List spacing='sm'>
          {calculation.ingredients.map((ingredient) => (
            <List.Item key={ingredient.id}>
              <Group component='span' justify='space-between' align='flex-start' wrap='nowrap'>
                <Group component='span' wrap='nowrap' align='flex-start' style={{ minWidth: 0 }}>
                  <ItemIcon item={ingredient} size={36} alt='' />
                  <Box component='span' style={{ minWidth: 0 }}>
                    <Text component='span' size='sm'>
                      {ingredient.name}
                    </Text>
                    {ingredient.foundIn.map((location) => (
                      <Text component='span' display='block' c='dimmed' size='xs' key={location}>
                        {location}
                      </Text>
                    ))}
                  </Box>
                </Group>
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
