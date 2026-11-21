import RecipeDetails from '../../../shared/items/RecipeDetails'
import { legendaryRecipeParts } from '../logic'
import { useIngredientLocations } from '../../../shared/items/useIngredientLocations'
import IngredientStock from '../../../shared/items/IngredientStock'
import { Alert, Badge, Group, List, Stack, Text, Title } from '@mantine/core'
import type { LgsIngredientPlan, LgsRecipe, LgsRequirement } from '../legendaryGreenSteel.types.ts'

const IngredientList = ({
  values,
  components
}: {
  values: readonly LgsRequirement[]
  components?: readonly LgsRecipe[]
}) => {
  const location = useIngredientLocations()
  return values.length ? (
    <List spacing='xs'>
      {values.map(({ id, name, quantity }) => (
        <List.Item key={id}>
          <Group component='span' justify='space-between' wrap='nowrap'>
            <Text component='span' size='sm'>
              {name}
            </Text>
            <Badge component='span' variant='light' color='gray'>
              ×{quantity}
            </Badge>
          </Group>
          {location(name) && (
            <Text size='xs' c='dimmed'>
              Found in: {location(name)}
            </Text>
          )}
          {components && (
            <RecipeDetails name={name} count={quantity} recipeKey={id} lookup={legendaryRecipeParts(components)} />
          )}
          <IngredientStock name={name} required={quantity} />
        </List.Item>
      ))}
    </List>
  ) : (
    <Text c='dimmed' size='sm'>
      No materials yet.
    </Text>
  )
}

const IngredientsTool = ({ plan, components }: { plan: LgsIngredientPlan; components: readonly LgsRecipe[] }) => {
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
        <IngredientList values={plan.craftedMaterials} components={components} />
      </Stack>
    </Stack>
  )
}

export default IngredientsTool
