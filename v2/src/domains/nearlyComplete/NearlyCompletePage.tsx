import {
  Alert,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  List,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import ToolLayout from '../../shared/layout/ToolLayout.tsx'
import { getNearlyCompleteItems, loadNearlyCompleteItems, type NearlyCompleteDataset } from './data.ts'
import {
  getRecipeCategories,
  getRecipes,
  loadNearlyCompleteRecipes,
  type NearlyCompleteRecipes,
  type RecipeTier
} from './recipes.ts'

type ItemsState =
  { status: 'loading' } | { status: 'loaded'; items: NearlyCompleteDataset } | { status: 'error'; cause: unknown }

type RecipesState =
  { status: 'loading' } | { status: 'loaded'; recipes: NearlyCompleteRecipes } | { status: 'error'; cause: unknown }

const NearlyCompletePage = () => {
  const [tier, setTier] = useState<RecipeTier>('Heroic')
  const [category, setCategory] = useState('')
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [recipesState, setRecipesState] = useState<RecipesState>({ status: 'loading' })
  const [itemsState, setItemsState] = useState<ItemsState>({ status: 'loading' })
  const [recipeLoadAttempt, setRecipeLoadAttempt] = useState(0)
  const [loadAttempt, setLoadAttempt] = useState(0)

  const recipeDataset = useMemo(() => (recipesState.status === 'loaded' ? recipesState.recipes : []), [recipesState])
  const categories = useMemo(() => getRecipeCategories(recipeDataset, tier), [recipeDataset, tier])
  const recipes = useMemo(() => getRecipes(recipeDataset, tier, category), [category, recipeDataset, tier])
  const eligibleItems = useMemo(
    () => (itemsState.status === 'loaded' ? getNearlyCompleteItems(itemsState.items, tier, category) : []),
    [category, itemsState, tier]
  )
  const selectedRecipe = recipes.find((recipe) => recipe.name === selectedName)

  useEffect(() => {
    let active = true

    loadNearlyCompleteRecipes()
      .then((loadedRecipes) => {
        if (!active) return

        setRecipesState({ status: 'loaded', recipes: loadedRecipes })
        setCategory(getRecipeCategories(loadedRecipes, 'Heroic')[0] ?? '')
        setSelectedName(null)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setRecipesState({ status: 'error', cause })
      })

    return () => {
      active = false
    }
  }, [recipeLoadAttempt])

  useEffect(() => {
    let active = true

    loadNearlyCompleteItems()
      .then((loadedItems) => {
        if (active) setItemsState({ status: 'loaded', items: loadedItems })
      })
      .catch((cause: unknown) => {
        if (!active) return
        setItemsState({ status: 'error', cause })
      })

    return () => {
      active = false
    }
  }, [loadAttempt])

  const changeTier = (value: string | null) => {
    if ((value !== 'Heroic' && value !== 'Legendary') || recipesState.status !== 'loaded') return

    const nextCategories = getRecipeCategories(recipesState.recipes, value)
    setTier(value)
    setCategory(nextCategories[0] ?? '')
    setSelectedName(null)
  }

  return (
    <ToolLayout>
      <Stack gap='xs'>
        <Title order={1}>Nearly Complete</Title>
        <Text c='dimmed'>
          Choose a Nearly Complete property and completed effect to view its Duergar Completion Forge recipe.
        </Text>
      </Stack>

      {recipesState.status === 'loading' ? (
        <Center mih={160} role='status' aria-live='polite'>
          <Stack gap='xs' align='center'>
            <Loader size='sm' />
            <Text c='dimmed' size='sm'>
              Loading recipes…
            </Text>
          </Stack>
        </Center>
      ) : recipesState.status === 'error' ? (
        <Alert color='red' title='Recipes are unavailable'>
          <Stack gap='sm' align='flex-start'>
            <Text size='sm'>We could not load the recipe data. Check your connection and try again.</Text>
            {import.meta.env.DEV && (
              <Text c='dimmed' size='xs'>
                {recipesState.cause instanceof Error ? recipesState.cause.message : String(recipesState.cause)}
              </Text>
            )}
            <Button
              size='sm'
              variant='light'
              onClick={() => {
                setRecipesState({ status: 'loading' })
                setRecipeLoadAttempt((attempt) => attempt + 1)
              }}
            >
              Retry
            </Button>
          </Stack>
        </Alert>
      ) : (
        <>
          <Stack gap='md'>
            <Title order={2} size='h3'>
              Select a Recipe
            </Title>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
              <Select
                label='Item Tier'
                data={['Heroic', 'Legendary']}
                value={tier}
                onChange={changeTier}
                allowDeselect={false}
              />

              <Select
                label='Nearly Complete Property'
                data={categories}
                value={category}
                onChange={(value) => {
                  setCategory(value ?? '')
                  setSelectedName(null)
                }}
                allowDeselect={false}
              />

              <Select
                label='Completed Property'
                placeholder='Select a property…'
                data={recipes.map((recipe) => recipe.name)}
                value={selectedName}
                onChange={setSelectedName}
                searchable
                clearable
              />
            </SimpleGrid>
          </Stack>

          <Paper withBorder p={{ base: 'md', sm: 'xl' }} shadow='sm'>
            {selectedRecipe ? (
              <Stack gap='lg'>
                <Group justify='space-between' align='flex-start'>
                  <Stack gap={4}>
                    <Title order={2}>{selectedRecipe.name}</Title>
                    <Text c='dimmed' size='sm'>
                      Crafted in: {selectedRecipe.craftedIn}
                    </Text>
                  </Stack>

                  <Group gap='xs'>
                    <Badge variant='light'>{tier}</Badge>
                    <Badge variant='outline'>{category}</Badge>
                  </Group>
                </Group>

                <Divider />

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'lg', md: 'xl' }}>
                  <Stack gap='sm'>
                    <Title order={3} size='h4'>
                      Recipe Requirements
                    </Title>
                    <List spacing='sm'>
                      {selectedRecipe.requirements.map((requirement) => (
                        <List.Item key={requirement.name}>
                          <Text component='span' size='sm'>
                            {requirement.name}
                          </Text>{' '}
                          <Badge variant='light' color='gray' size='sm'>
                            ×{requirement.quantity ?? 1}
                          </Badge>
                        </List.Item>
                      ))}
                    </List>
                  </Stack>

                  <Stack gap='sm'>
                    <Title order={3} size='h4'>
                      Resulting Effects
                    </Title>
                    <List spacing='sm'>
                      {selectedRecipe.effectsAdded.map((effect) => (
                        <List.Item key={`${effect.name}-${effect.modifier ?? ''}-${effect.bonus ?? ''}`}>
                          <Text component='span' size='sm'>
                            {effect.name}
                          </Text>{' '}
                          <Badge variant='light' size='sm'>
                            {effect.modifier != null ? `+${effect.modifier}` : '—'}
                          </Badge>{' '}
                          {effect.bonus && (
                            <Badge variant='outline' color='gray' size='sm'>
                              {effect.bonus}
                            </Badge>
                          )}
                        </List.Item>
                      ))}
                    </List>
                  </Stack>
                </SimpleGrid>
              </Stack>
            ) : (
              <Stack gap='xs'>
                <Title order={2} size='h3'>
                  Select a completed property
                </Title>
                <Text c='dimmed'>
                  Select a Completed Property above to view its requirements and resulting effects.
                </Text>
              </Stack>
            )}
          </Paper>

          <Divider />

          <Stack gap='sm'>
            <Title order={2} size='h3'>
              Eligible Items
            </Title>
            <Text c='dimmed' size='sm'>
              Items matching the selected tier and Nearly Complete property.
            </Text>

            {itemsState.status === 'loading' ? (
              <Center mih={104} role='status' aria-live='polite'>
                <Stack gap='xs' align='center'>
                  <Loader size='sm' />
                  <Text c='dimmed' size='sm'>
                    Loading eligible items…
                  </Text>
                </Stack>
              </Center>
            ) : itemsState.status === 'error' ? (
              <Alert color='red' title='Eligible items are unavailable'>
                <Stack gap='sm' align='flex-start'>
                  <Text size='sm'>
                    We could not load the data needed to find eligible items. Check your connection and try again.
                  </Text>
                  {import.meta.env.DEV && (
                    <Text c='dimmed' size='xs'>
                      {itemsState.cause instanceof Error ? itemsState.cause.message : String(itemsState.cause)}
                    </Text>
                  )}
                  <Button
                    size='sm'
                    variant='light'
                    onClick={() => {
                      setItemsState({ status: 'loading' })
                      setLoadAttempt((attempt) => attempt + 1)
                    }}
                  >
                    Retry
                  </Button>
                </Stack>
              </Alert>
            ) : eligibleItems.length === 0 ? (
              <Alert color='yellow' title='No eligible items found'>
                The loaded item data does not contain a {tier} item with Nearly Complete: {category}. Try another item
                tier or property.
              </Alert>
            ) : (
              <List spacing='xs' size='sm'>
                {eligibleItems.map((item) => (
                  <List.Item key={`${item.pageTitle}-${item.minLevel}`}>
                    {item.name} — {item.type}, minimum level {item.minLevel}
                  </List.Item>
                ))}
              </List>
            )}
          </Stack>
        </>
      )}
    </ToolLayout>
  )
}

export default NearlyCompletePage
