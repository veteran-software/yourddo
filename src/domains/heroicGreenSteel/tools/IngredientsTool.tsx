import RecipeDetails from '../../../shared/items/RecipeDetails'
import { heroicRecipeParts } from '../logic'
import { useIngredientLocations } from '../../../shared/items/useIngredientLocations'
import { BuildHeader, MaterialRow } from '../../../shared/layout/GreenSteelBuildParts'
import styles from '../../../shared/layout/craftingTools.module.css'
import { Alert, Button, Center, Loader, Stack, Text } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { loadHeroicGreenSteelRecipeData } from '../data.ts'
import type { HgsBaseItem, HgsRecipeData } from '../heroicGreenSteel.types.ts'
import { expandIngredientRequirements } from '../logic.ts'

const IngredientsTool = ({ baseItem, recipeIds }: { baseItem?: HgsBaseItem; recipeIds: readonly number[] }) => {
  const location = useIngredientLocations()
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

  const renderList = (values: readonly ((typeof result.plan.terminal)[number] & { producerRecipeId?: number })[]) => (
    <ul className={styles.costs}>
      {values.map(({ ingredient, quantity, producerRecipeId }) => (
        <MaterialRow
          key={producerRecipeId ?? ingredient.id}
          name={ingredient.name}
          quantity={quantity}
          location={location(ingredient.name)}
        >
          {producerRecipeId !== undefined && (
            <RecipeDetails
              name={ingredient.name}
              count={quantity}
              recipeKey={producerRecipeId}
              lookup={heroicRecipeParts(data)}
            />
          )}
        </MaterialRow>
      ))}
    </ul>
  )

  return (
    <Stack gap='lg' p='md'>
      {baseItem && <BuildHeader item={baseItem} tiers={recipeIds.length - 1} />}
      <Stack component='section' className={styles.stage} gap='xs'>
        <h3>Terminal materials</h3>
        {result.plan.terminal.length ? (
          renderList(result.plan.terminal)
        ) : (
          <Text c='dimmed'>No terminal materials.</Text>
        )}
      </Stack>
      <Stack component='section' className={styles.stage} gap='xs'>
        <h3>Crafted components</h3>
        {result.plan.crafted.length ? renderList(result.plan.crafted) : <Text c='dimmed'>No crafted components.</Text>}
      </Stack>
    </Stack>
  )
}

export default IngredientsTool
