import RecipeDetails from '../../../shared/items/RecipeDetails'
import { heroicRecipeParts } from '../logic'
import { BuildHeader, MaterialRow } from '../../../shared/layout/GreenSteelBuildParts'
import styles from '../../../shared/layout/craftingTools.module.css'
import { Alert, Button, Center, Loader, Stack, Text } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { loadHeroicGreenSteelRecipeData } from '../data.ts'
import type { HgsBaseItem, HgsDevice, HgsRecipeData } from '../heroicGreenSteel.types.ts'
import { expandIngredientRequirements, selectedRecipes, stripDdoMarkup } from '../logic.ts'

const CraftingBreakdownTool = ({
  baseItem,
  recipeIds,
  devices
}: {
  baseItem?: HgsBaseItem
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
      {baseItem && <BuildHeader item={baseItem} tiers={recipeIds.length - 1} />}
      {result.recipes.map((recipe) => (
        <section key={recipe.id} className={styles.stage}>
          <Stack gap='xs'>
            <h3>{{ base: 'Base item', tier1: 'Tier 1', tier2: 'Tier 2', tier3: 'Tier 3' }[recipe.device]}</h3>
            <Text size='sm' fw={600}>
              {recipe.name}
            </Text>
            <Text c='dimmed' size='sm'>
              {devices[recipe.device].name}
            </Text>
            {recipe.description ? <Text size='sm'>{stripDdoMarkup(recipe.description)}</Text> : null}
            <ul className={styles.costs}>
              {recipe.ingredients.map((relation, ingredientIndex) => {
                const name = data.ingredientById.get(relation.ingredientId)?.name ?? 'Missing ingredient'
                return (
                  <MaterialRow
                    key={`${relation.ingredientId.toString()}-${ingredientIndex.toString()}`}
                    name={name}
                    quantity={relation.quantity}
                  >
                    {relation.producerRecipeId !== undefined && (
                      <RecipeDetails
                        name={name}
                        count={relation.quantity}
                        recipeKey={relation.producerRecipeId}
                        lookup={heroicRecipeParts(data)}
                      />
                    )}
                  </MaterialRow>
                )
              })}
            </ul>
          </Stack>
        </section>
      ))}
    </Stack>
  )
}

export default CraftingBreakdownTool
