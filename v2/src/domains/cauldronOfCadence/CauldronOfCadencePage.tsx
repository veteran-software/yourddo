import {
  Alert,
  Anchor,
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
import {
  type CauldronRecipes,
  findRecipeByItem,
  findRecipeBySetBonus,
  findSelectedRecipe,
  formatEffect,
  getEffectOptions,
  getItemOptions,
  getRequiredItemName,
  InvalidCauldronRecipesError,
  loadCauldronRecipes
} from './recipes.ts'

type RecipesState =
  | { status: 'loading' }
  | { status: 'loaded'; recipes: CauldronRecipes }
  | { status: 'error'; cause: unknown }
  | { status: 'invalid' }

const formatBinding = ({ type, to, from }: CauldronRecipes[number]['binding']): string =>
  `${type}${to ? ` to ${to}` : ''}${from ? ` on ${from}` : ''}`

const CauldronOfCadencePage = () => {
  const [recipesState, setRecipesState] = useState<RecipesState>({ status: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedSetBonus, setSelectedSetBonus] = useState<string | null>(null)

  const recipes = useMemo(() => (recipesState.status === 'loaded' ? recipesState.recipes : []), [recipesState])
  const itemOptions = useMemo(() => getItemOptions(recipes, selectedItem), [recipes, selectedItem])
  const effectOptions = useMemo(() => getEffectOptions(recipes, selectedItem), [recipes, selectedItem])
  const selectedRecipe =
    selectedItem && selectedSetBonus ? findSelectedRecipe(recipes, selectedItem, selectedSetBonus) : undefined

  useEffect(() => {
    let active = true

    loadCauldronRecipes()
      .then((loadedRecipes) => {
        if (!active) return

        setRecipesState({ status: 'loaded', recipes: loadedRecipes })
        setSelectedItem(null)
        setSelectedSetBonus(null)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setRecipesState(
          cause instanceof InvalidCauldronRecipesError ? { status: 'invalid' } : { status: 'error', cause }
        )
      })

    return () => {
      active = false
    }
  }, [loadAttempt])

  const clearSelection = () => {
    setSelectedItem(null)
    setSelectedSetBonus(null)
  }

  const changeItem = (value: string | null) => {
    if (value === null) {
      clearSelection()
      return
    }

    setSelectedItem(value)
    setSelectedSetBonus(null)
  }

  const changeEffect = (value: string | null) => {
    if (value === null) {
      clearSelection()
      return
    }

    const recipe = findRecipeBySetBonus(recipes, value)
    setSelectedSetBonus(value)
    setSelectedItem(recipe ? getRequiredItemName(recipe) : selectedItem)
  }

  const retry = () => {
    clearSelection()
    setRecipesState({ status: 'loading' })
    setLoadAttempt((attempt) => attempt + 1)
  }

  return (
    <ToolLayout>
      <Stack gap='xs'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Title order={1}>Cauldron of Cadence</Title>
          <Anchor
            href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Cauldron%20of%20Cadence%22'
            target='_blank'
            rel='noreferrer'
            size='sm'
          >
            Known issues / bug reports
          </Anchor>
        </Group>
        <Text c='dimmed'>Choose an item you have or an effect you want to find its Cauldron set augment recipe.</Text>
      </Stack>

      <Alert color='blue' title='Minimum level 30'>
        All Cauldron set augments are Minimum Level 30 and require a three-piece set.
      </Alert>

      {recipesState.status === 'loading' ? (
        <Center mih={180} role='status' aria-live='polite'>
          <Stack gap='xs' align='center'>
            <Loader size='sm' />
            <Text c='dimmed' size='sm'>
              Loading Cauldron recipes…
            </Text>
          </Stack>
        </Center>
      ) : recipesState.status === 'error' ? (
        <Alert color='red' title='Cauldron recipes are unavailable'>
          <Stack gap='sm' align='flex-start'>
            <Text size='sm'>We could not load the recipe data. Check your connection and try again.</Text>
            {import.meta.env.DEV && (
              <Text c='dimmed' size='xs'>
                {recipesState.cause instanceof Error ? recipesState.cause.message : String(recipesState.cause)}
              </Text>
            )}
            <Button size='sm' variant='light' onClick={retry}>
              Retry
            </Button>
          </Stack>
        </Alert>
      ) : recipesState.status === 'invalid' ? (
        <Alert color='red' title='Cauldron recipe data is invalid'>
          <Stack gap='sm' align='flex-start'>
            <Text size='sm'>The loaded data does not match the expected Cauldron recipe format.</Text>
            <Button size='sm' variant='light' onClick={retry}>
              Retry
            </Button>
          </Stack>
        </Alert>
      ) : recipes.length === 0 ? (
        <Alert color='yellow' title='No Cauldron recipes found'>
          The loaded recipe data is empty. Try again later.
        </Alert>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'lg', md: 'xl' }}>
            <Stack gap='xs'>
              <Title order={2} size='h3'>
                Item Selection
              </Title>
              <Text c='dimmed' size='sm'>
                Select the named item required by a Cauldron recipe.
              </Text>
              <Select
                label='Required item'
                placeholder='Select an item…'
                data={itemOptions}
                value={selectedItem}
                onChange={changeItem}
                searchable
                clearable
              />
            </Stack>

            <Stack gap='xs'>
              <Title order={2} size='h3'>
                Upgrade Effect Selection
              </Title>
              <Text c='dimmed' size='sm'>
                Choose an effect directly, or select an item first to show its available effect.
              </Text>
              <Select
                label='Set bonus effect'
                placeholder='Select an effect…'
                data={effectOptions}
                value={selectedSetBonus}
                onChange={changeEffect}
                searchable
                clearable
              />
            </Stack>
          </SimpleGrid>

          <Divider />

          <Paper withBorder p={{ base: 'md', sm: 'xl' }} shadow='sm'>
            {selectedRecipe ? (
              <Stack gap='lg'>
                <Group justify='space-between' align='flex-start' wrap='wrap'>
                  <Stack gap={4}>
                    <Title order={2}>{selectedRecipe.name}</Title>
                    <Text c='dimmed' size='sm'>
                      {selectedRecipe.description}
                    </Text>
                  </Stack>
                  <Button variant='subtle' size='sm' onClick={clearSelection}>
                    Clear selection
                  </Button>
                </Group>

                <Group gap='xs'>
                  <Badge variant='light'>{selectedRecipe.augmentType}</Badge>
                  <Badge variant='light'>Minimum Level {selectedRecipe.minimumLevel}</Badge>
                  <Badge variant='outline'>{formatBinding(selectedRecipe.binding)}</Badge>
                  <Badge variant='outline'>Crafted in {selectedRecipe.craftedIn}</Badge>
                </Group>

                <Divider />

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'lg', md: 'xl' }}>
                  <Stack gap='sm'>
                    <Title order={3} size='h4'>
                      Set Bonus
                    </Title>
                    {selectedRecipe.setBonus.map((setBonus) => (
                      <Stack key={setBonus.name} gap='xs'>
                        <Group gap='xs'>
                          <Text fw={700}>{setBonus.name}</Text>
                          <Badge variant='light'>{setBonus.numPiecesEquipped} pieces</Badge>
                        </Group>
                        <List spacing='xs' size='sm'>
                          {setBonus.enhancements.map((effect) => (
                            <List.Item key={`${effect.name}-${String(effect.modifier)}-${effect.bonus ?? ''}`}>
                              {formatEffect(effect)}
                            </List.Item>
                          ))}
                        </List>
                      </Stack>
                    ))}
                  </Stack>

                  <Stack gap='sm'>
                    <Title order={3} size='h4'>
                      Required Items
                    </Title>
                    <List spacing='sm'>
                      {selectedRecipe.requirements.map((requirement) => (
                        <List.Item key={requirement.name}>
                          <Group component='span' gap='xs' wrap='nowrap'>
                            <Text component='span' size='sm'>
                              {requirement.name}
                            </Text>
                            <Badge variant='light' color='gray' size='sm'>
                              ×{requirement.quantity}
                            </Badge>
                          </Group>
                        </List.Item>
                      ))}
                    </List>
                  </Stack>
                </SimpleGrid>
              </Stack>
            ) : selectedItem && selectedSetBonus ? (
              <Alert color='red' title='Invalid selection'>
                <Stack gap='sm' align='flex-start'>
                  <Text size='sm'>The selected item and effect do not belong to the same Cauldron recipe.</Text>
                  <Button size='sm' variant='light' onClick={clearSelection}>
                    Reset selection
                  </Button>
                </Stack>
              </Alert>
            ) : selectedItem ? (
              <Stack gap='xs'>
                <Title order={2} size='h3'>
                  Select an upgrade effect
                </Title>
                <Text c='dimmed'>
                  {findRecipeByItem(recipes, selectedItem)
                    ? `Choose the available effect for ${selectedItem} to view its set augment recipe.`
                    : 'The selected item is not available in the loaded recipe data.'}
                </Text>
              </Stack>
            ) : (
              <Stack gap='xs'>
                <Title order={2} size='h3'>
                  Select an item or effect
                </Title>
                <Text c='dimmed'>Choose either selection above to begin.</Text>
              </Stack>
            )}
          </Paper>
        </>
      )}
    </ToolLayout>
  )
}

export default CauldronOfCadencePage
