import { Alert, Badge, Button, Center, Group, List, Loader, Stack, Text, Title } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { loadHeroicGreenSteelRecipeData } from '../data.ts'
import type { HgsRecipeData } from '../heroicGreenSteel.types.ts'
import { expandIngredientRequirements } from '../logic.ts'

const IngredientsTool = ({ recipeIds }: { recipeIds: readonly number[] }) => {
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
    if (!data || recipeIds.length === 0) return null
    try {
      return { plan: expandIngredientRequirements(recipeIds, data), error: null }
    } catch (cause) {
      return { plan: null, error: cause }
    }
  }, [data, recipeIds])

  if (error || result?.error) {
    const cause = error ?? result?.error
    return (
      <Alert color='red' title='Ingredient data is unavailable' m='md'>
        <Stack gap='sm' align='flex-start'>
          <Text size='sm'>The material requirements could not be calculated.</Text>
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
            Loading ingredient recipes…
          </Text>
        </Stack>
      </Center>
    )
  }
  if (recipeIds.length === 0 || !result?.plan) {
    return (
      <Alert color='blue' title='No crafting stages selected' m='md'>
        Select a base item to calculate its ingredients.
      </Alert>
    )
  }

  const renderList = (values: typeof result.plan.terminal) => (
    <List spacing='xs'>
      {values.map(({ ingredient, quantity }) => (
        <List.Item key={ingredient.id}>
          <Group component='span' justify='space-between' wrap='nowrap'>
            <Text component='span' size='sm'>
              {ingredient.name}
            </Text>
            <Badge component='span' variant='light' color='gray'>
              ×{quantity}
            </Badge>
          </Group>
        </List.Item>
      ))}
    </List>
  )

  return (
    <Stack gap='lg' p='md'>
      <Stack gap='xs'>
        <Title order={3} size='h5'>
          Terminal materials
        </Title>
        {result.plan.terminal.length ? (
          renderList(result.plan.terminal)
        ) : (
          <Text c='dimmed'>No terminal materials.</Text>
        )}
      </Stack>
      <Stack gap='xs'>
        <Title order={3} size='h5'>
          Crafted components
        </Title>
        {result.plan.crafted.length ? renderList(result.plan.crafted) : <Text c='dimmed'>No crafted components.</Text>}
      </Stack>
    </Stack>
  )
}

export default IngredientsTool
