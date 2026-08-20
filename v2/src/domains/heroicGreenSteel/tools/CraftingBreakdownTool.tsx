import { Alert, Badge, Button, Center, Group, List, Loader, Paper, Stack, Text, Title } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { loadHeroicGreenSteelRecipeData } from '../data.ts'
import type { HgsDevice, HgsRecipeData } from '../heroicGreenSteel.types.ts'
import { expandIngredientRequirements, selectedRecipes, stripDdoMarkup } from '../logic.ts'

const CraftingBreakdownTool = ({
  recipeIds,
  devices
}: {
  recipeIds: readonly number[]
  devices: Readonly<Record<'base' | 'tier1' | 'tier2' | 'tier3', HgsDevice>>
}) => {
  const [data, setData] = useState<HgsRecipeData | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    loadHeroicGreenSteelRecipeData()
      .then((value) => {
        if (active) setData(value)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause)
      })
    return () => {
      active = false
    }
  }, [attempt])

  const result = useMemo(() => {
    if (!data || recipeIds.length === 0) return { recipes: [], error: null }
    try {
      expandIngredientRequirements(recipeIds, data)
      return { recipes: selectedRecipes(recipeIds, data.recipeById), error: null }
    } catch (cause) {
      return { recipes: [], error: cause }
    }
  }, [data, recipeIds])

  if (error || result.error) {
    const cause = error ?? result.error
    return (
      <Alert color='red' title='Crafting breakdown is unavailable' m='md'>
        <Stack gap='sm' align='flex-start'>
          <Text size='sm'>The selected recipe progression could not be loaded.</Text>
          {import.meta.env.DEV ? <Text size='xs'>{cause instanceof Error ? cause.message : String(cause)}</Text> : null}
          <Button
            size='xs'
            onClick={() => {
              setError(null)
              setAttempt((value) => value + 1)
            }}
          >
            Retry
          </Button>
        </Stack>
      </Alert>
    )
  }
  if (!data) {
    return (
      <Center mih={180} role='status' aria-live='polite'>
        <Stack align='center' gap='xs'>
          <Loader size='sm' />
          <Text c='dimmed' size='sm'>
            Loading crafting recipes…
          </Text>
        </Stack>
      </Center>
    )
  }
  if (result.recipes.length === 0) {
    return (
      <Alert color='blue' title='No crafting stages selected' m='md'>
        Select a base item to review the altar progression.
      </Alert>
    )
  }

  return (
    <Stack gap='md' p='md'>
      {result.recipes.map((recipe, index) => (
        <Paper withBorder p='sm' key={recipe.id}>
          <Stack gap='xs'>
            <Group justify='space-between' align='flex-start' wrap='nowrap'>
              <Title order={3} size='h5'>
                {recipe.name}
              </Title>
              <Badge variant='light'>Step {index + 1}</Badge>
            </Group>
            <Text c='dimmed' size='xs'>
              {devices[recipe.device].name}
            </Text>
            {recipe.description ? <Text size='sm'>{stripDdoMarkup(recipe.description)}</Text> : null}
            <List spacing={4} size='sm'>
              {recipe.ingredients.map((relation, ingredientIndex) => (
                <List.Item key={`${relation.ingredientId.toString()}-${ingredientIndex.toString()}`}>
                  {data.ingredientById.get(relation.ingredientId)?.name ?? 'Missing ingredient'} ×
                  {relation.quantity.toString()}
                  {relation.producerRecipeId ? ' (crafted component)' : ''}
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
