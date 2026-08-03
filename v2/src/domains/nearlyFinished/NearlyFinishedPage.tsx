import {
  Alert,
  Anchor,
  Badge,
  Button,
  Center,
  Divider,
  Drawer,
  Group,
  List,
  Loader,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { loadManualPayload, UnsupportedManifestSchemaError } from '../../shared/data/loadDataset.ts'
import ToolLayout from '../../shared/layout/ToolLayout.tsx'
import {
  buildCraftingPlan,
  buildShoppingListTotals,
  CyclicRecipeDependencyError,
  getEntriesByCategory,
  getNearlyFinishedEntries,
  InvalidNearlyFinishedDatasetError,
  MissingIngredientRecipeError,
  nearlyFinishedPayloadName,
  parseNearlyFinishedDataset,
  UnsupportedNearlyFinishedSchemaError
} from './nearlyFinished.logic.ts'
import type {
  IngredientTotal,
  ItemCategory,
  NearlyFinishedDataset,
  NearlyFinishedRequirement
} from './nearlyFinished.types.ts'

type DatasetErrorKind = 'load' | 'unsupported-schema' | 'invalid' | 'cycle' | 'missing-recipe'

type DatasetState =
  | { status: 'loading' }
  | { status: 'loaded'; dataset: NearlyFinishedDataset }
  | { status: 'error'; kind: DatasetErrorKind; cause: unknown }

const categories: ItemCategory[] = ['Heroic', 'Legendary', 'Raid']

const knownIssuesUrl =
  'https://github.com/veteran-software/yourddo/issues?q=state%3Aopen%20label%3A%22Nearly%20Finished%22'

const getErrorKind = (cause: unknown): DatasetErrorKind => {
  if (cause instanceof UnsupportedManifestSchemaError || cause instanceof UnsupportedNearlyFinishedSchemaError) {
    return 'unsupported-schema'
  }
  if (cause instanceof CyclicRecipeDependencyError) return 'cycle'
  if (cause instanceof MissingIngredientRecipeError) return 'missing-recipe'
  if (cause instanceof InvalidNearlyFinishedDatasetError) return 'invalid'
  return 'load'
}

const errorContent: Record<DatasetErrorKind, { title: string; message: string }> = {
  load: {
    title: 'Nearly Finished recipes are unavailable',
    message: 'We could not load the recipe data. Check your connection and try again.'
  },
  'unsupported-schema': {
    title: 'Unsupported recipe data version',
    message: 'The published recipe data uses a schema this version of YourDDO does not support.'
  },
  invalid: {
    title: 'Nearly Finished recipe data is invalid',
    message: 'The published data does not match the required Nearly Finished recipe structure.'
  },
  cycle: {
    title: 'Cyclic recipe dependency detected',
    message: 'The published melting recipes contain a dependency cycle and cannot be calculated safely.'
  },
  'missing-recipe': {
    title: 'A crafted ingredient recipe is missing',
    message: 'A referenced crafted ingredient has no melting recipe and is not a known raw material.'
  }
}

const RequirementList = ({ requirements }: { requirements: NearlyFinishedRequirement[] }) => (
  <List spacing='xs' size='sm'>
    {requirements.map(({ name, quantity }, index) => (
      <List.Item key={`${name}-${String(index)}`}>
        <Group component='span' gap='xs'>
          <Text component='span' size='sm'>
            {name}
          </Text>
          <Badge variant='light' color='gray' size='sm'>
            ×{quantity}
          </Badge>
        </Group>
      </List.Item>
    ))}
  </List>
)

const MaterialList = ({ materials, emptyMessage }: { materials: IngredientTotal[]; emptyMessage: string }) =>
  materials.length > 0 ? (
    <List spacing='sm'>
      {materials.map(({ name, quantity }) => (
        <List.Item key={name}>
          <Group component='span' gap='xs'>
            <Text component='span' size='sm'>
              {name}
            </Text>
            <Badge variant='light' color='gray' size='sm'>
              ×{quantity}
            </Badge>
          </Group>
        </List.Item>
      ))}
    </List>
  ) : (
    <Text c='dimmed' size='sm'>
      {emptyMessage}
    </Text>
  )

const NearlyFinishedPage = () => {
  const [datasetState, setDatasetState] = useState<DatasetState>({ status: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [category, setCategory] = useState<ItemCategory | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [shoppingListOpened, setShoppingListOpened] = useState(false)

  const dataset = datasetState.status === 'loaded' ? datasetState.dataset : null
  const nearlyFinishedEntries = useMemo(() => (dataset ? getNearlyFinishedEntries(dataset) : []), [dataset])
  const categoryEntries = useMemo(
    () => (dataset && category ? getEntriesByCategory(dataset, category) : []),
    [category, dataset]
  )
  const selectedEntry = selectedItem ? nearlyFinishedEntries.find(({ item }) => item === selectedItem) : undefined
  const plan = useMemo(
    () => (dataset && selectedEntry ? buildCraftingPlan(selectedEntry, dataset.meltingStation) : null),
    [dataset, selectedEntry]
  )
  const shoppingTotals = useMemo(() => (plan ? buildShoppingListTotals(plan) : null), [plan])
  const choices = selectedEntry?.choices ?? []

  useEffect(() => {
    let active = true

    loadManualPayload<unknown>(nearlyFinishedPayloadName)
      .then((value) => {
        if (!active) return
        setDatasetState({ status: 'loaded', dataset: parseNearlyFinishedDataset(value) })
      })
      .catch((cause: unknown) => {
        if (!active) return
        setDatasetState({ status: 'error', kind: getErrorKind(cause), cause })
      })

    return () => {
      active = false
    }
  }, [loadAttempt])

  const reset = () => {
    setCategory(null)
    setSelectedItem(null)
    setSelectedChoice(null)
    setShoppingListOpened(false)
  }

  const retry = () => {
    reset()
    setDatasetState({ status: 'loading' })
    setLoadAttempt((attempt) => attempt + 1)
  }

  const changeCategory = (value: string | null) => {
    if (value !== 'Heroic' && value !== 'Legendary' && value !== 'Raid') {
      reset()
      return
    }

    setCategory(value)
    setSelectedItem(null)
    setSelectedChoice(null)
    setShoppingListOpened(false)
  }

  const changeItem = (value: string | null) => {
    setSelectedItem(value)
    setSelectedChoice(null)
    setShoppingListOpened(false)
  }

  return (
    <ToolLayout>
      <Stack gap='xs'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={4}>
            <Title order={1}>Nearly Finished Crafting</Title>
            <Text c='dimmed'>
              Plan Nearly Finished upgrades for Project Nemesis, Too Hot to Handle, and eligible Sharn items.
            </Text>
          </Stack>

          <Anchor href={knownIssuesUrl} target='_blank' rel='noreferrer' size='sm'>
            Known issues / bug reports
          </Anchor>
        </Group>

        <Group justify='flex-end' gap='xs'>
          <Button variant='subtle' color='gray' onClick={reset}>
            Reset
          </Button>
          <Button
            disabled={!selectedEntry || !plan}
            onClick={() => {
              setShoppingListOpened(true)
            }}
          >
            Shopping List
          </Button>
        </Group>
      </Stack>

      {datasetState.status === 'loading' ? (
        <Center mih={240} role='status' aria-live='polite'>
          <Stack gap='xs' align='center'>
            <Loader size='sm' />
            <Text c='dimmed' size='sm'>
              Loading Nearly Finished recipes…
            </Text>
          </Stack>
        </Center>
      ) : datasetState.status === 'error' ? (
        <Alert color='red' title={errorContent[datasetState.kind].title} aria-live='assertive'>
          <Stack gap='sm' align='flex-start'>
            <Text size='sm'>{errorContent[datasetState.kind].message}</Text>
            {import.meta.env.DEV && (
              <Text c='dimmed' size='xs'>
                {datasetState.cause instanceof Error ? datasetState.cause.message : String(datasetState.cause)}
              </Text>
            )}
            <Button size='sm' variant='light' onClick={retry}>
              Retry
            </Button>
          </Stack>
        </Alert>
      ) : nearlyFinishedEntries.length === 0 ? (
        <Alert color='yellow' title='No Nearly Finished recipes found'>
          The loaded dataset does not contain any Nearly Finished reforging entries.
        </Alert>
      ) : (
        <>
          <Stack gap='md'>
            <Title order={2} size='h3'>
              Select an Item
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
              <Select
                label='Item category'
                placeholder='Select a category…'
                data={categories}
                value={category}
                onChange={changeCategory}
                allowDeselect
              />
              <Select
                label='Item'
                placeholder={
                  !category
                    ? 'Select a category first'
                    : categoryEntries.length > 0
                      ? 'Search for an item…'
                      : `No ${category} items available`
                }
                data={categoryEntries.map(({ item }) => item)}
                value={selectedItem}
                onChange={changeItem}
                disabled={!category || categoryEntries.length === 0}
                searchable
                clearable
              />
            </SimpleGrid>

            {choices.length > 1 && (
              <Select
                label='Property choice'
                description='Optional for planning; the material cost is the same for every property.'
                placeholder='Select one option…'
                data={choices.map(({ name }) => name)}
                value={selectedChoice}
                onChange={setSelectedChoice}
                clearable
              />
            )}
          </Stack>

          {!category ? (
            <Paper withBorder p={{ base: 'md', sm: 'xl' }}>
              <Title order={2} size='h3'>
                Select an item category
              </Title>
              <Text c='dimmed'>Choose Heroic, Legendary, or Raid to begin.</Text>
            </Paper>
          ) : categoryEntries.length === 0 ? (
            <Alert color='yellow' title={`No ${category} items found`}>
              The loaded dataset does not contain any Nearly Finished items in this category.
            </Alert>
          ) : !selectedItem ? (
            <Paper withBorder p={{ base: 'md', sm: 'xl' }}>
              <Title order={2} size='h3'>
                Select an item
              </Title>
              <Text c='dimmed'>Search the {category} item list to view its complete crafting plan.</Text>
            </Paper>
          ) : !selectedEntry || !plan ? (
            <Alert color='red' title='No matching recipe'>
              The selected item does not have a Nearly Finished reforging recipe in the loaded dataset.
            </Alert>
          ) : (
            <Stack gap='xl'>
              <Paper withBorder p={{ base: 'md', sm: 'xl' }} shadow='sm'>
                <Stack gap='lg'>
                  <Group justify='space-between' align='flex-start' wrap='wrap'>
                    <Stack gap={4}>
                      <Title order={2}>{selectedEntry.item}</Title>
                      <Group gap='xs'>
                        <Badge variant='light'>{category}</Badge>
                        <Badge variant='outline'>Nearly Finished</Badge>
                      </Group>
                    </Stack>
                    {choices.length > 1 && (
                      <Stack gap={2} align='flex-end'>
                        <Text size='xs' c='dimmed'>
                          Property choice
                        </Text>
                        <Text fw={700}>{selectedChoice ?? 'Not selected'}</Text>
                      </Stack>
                    )}
                  </Group>

                  <Divider />

                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing='xl'>
                    <Stack gap='sm'>
                      <Title order={3} size='h4'>
                        Direct Reforging Cost
                      </Title>
                      <RequirementList requirements={selectedEntry.cost} />
                    </Stack>

                    <Stack gap='sm'>
                      <Title order={3} size='h4'>
                        Effects Added
                      </Title>
                      {selectedEntry.effectsAdded.length > 0 ? (
                        <List spacing='xs' size='sm'>
                          {selectedEntry.effectsAdded.map((effect) => (
                            <List.Item key={effect.name}>{effect.name}</List.Item>
                          ))}
                        </List>
                      ) : (
                        <Text c='dimmed' size='sm'>
                          No automatic effects. Choose a property when options are available.
                        </Text>
                      )}
                    </Stack>

                    <Stack gap='sm'>
                      <Title order={3} size='h4'>
                        Augment Slots Added
                      </Title>
                      {selectedEntry.augments && selectedEntry.augments.length > 0 ? (
                        <List spacing='xs' size='sm'>
                          {selectedEntry.augments
                            .flatMap((augment, augmentIndex) =>
                              Object.keys(augment).map((slot, slotIndex) => ({ augmentIndex, slot, slotIndex }))
                            )
                            .map(({ augmentIndex, slot, slotIndex }) => (
                              <List.Item key={`${slot}-${String(augmentIndex)}-${String(slotIndex)}`}>
                                {slot.charAt(0).toUpperCase() + slot.slice(1)} slot
                              </List.Item>
                            ))}
                        </List>
                      ) : (
                        <Text c='dimmed' size='sm'>
                          No augment slots are added by this step.
                        </Text>
                      )}
                    </Stack>
                  </SimpleGrid>
                </Stack>
              </Paper>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'xl', md: '3rem' }}>
                <Stack gap='sm'>
                  <Group gap='xs'>
                    <Title order={2} size='h3'>
                      Gather Raw Materials
                    </Title>
                    <Badge variant='light' color='gray'>
                      {plan.rawMaterials.length}
                    </Badge>
                  </Group>
                  <Text c='dimmed' size='sm'>
                    Farm or obtain these base materials before using the melting station.
                  </Text>
                  <MaterialList materials={plan.rawMaterials} emptyMessage='No raw materials are required.' />
                </Stack>

                <Stack gap='sm'>
                  <Group gap='xs'>
                    <Title order={2} size='h3'>
                      Ordered Crafting Sequence
                    </Title>
                    <Badge variant='light'>{plan.craftedMaterials.length + 1}</Badge>
                  </Group>
                  <Text c='dimmed' size='sm'>
                    Complete each crafted dependency before the operation that consumes it.
                  </Text>
                  <List type='ordered' spacing='lg'>
                    {plan.craftedMaterials.map((step) => (
                      <List.Item key={step.name}>
                        <Stack gap={4}>
                          <Group gap='xs'>
                            <Text fw={700}>{step.name}</Text>
                            <Badge variant='light' color='gray' size='sm'>
                              Craft ×{step.quantity}
                            </Badge>
                          </Group>
                          <Text c='dimmed' size='xs'>
                            Components:{' '}
                            {step.requirements.map(({ name, quantity }) => `${name} ×${String(quantity)}`).join(', ')}
                          </Text>
                        </Stack>
                      </List.Item>
                    ))}
                    <List.Item>
                      <Stack gap={4}>
                        <Group gap='xs'>
                          <Text fw={700}>Final reforging: {plan.finalStep.item}</Text>
                          <Badge variant='filled' size='sm'>
                            Reforge ×1
                          </Badge>
                        </Group>
                        <Text c='dimmed' size='xs'>
                          Uses the direct reforging cost shown above.
                        </Text>
                      </Stack>
                    </List.Item>
                  </List>
                </Stack>
              </SimpleGrid>
            </Stack>
          )}
        </>
      )}

      <Drawer
        opened={shoppingListOpened}
        onClose={() => {
          setShoppingListOpened(false)
        }}
        title={selectedEntry ? `Shopping List — ${selectedEntry.item}` : 'Shopping List'}
        position='right'
        size='md'
      >
        <ScrollArea h='calc(100dvh - 6rem)' type='auto'>
          {shoppingTotals ? (
            <Stack gap='xl' pr='sm'>
              <Alert color='blue' title='Required totals'>
                Trove inventory comparison is not yet available in YourDDO v2. These totals show required quantities
                only.
              </Alert>
              <Stack gap='sm'>
                <Title order={2} size='h4'>
                  Raw Materials
                </Title>
                <MaterialList materials={shoppingTotals.rawMaterials} emptyMessage='No raw materials are required.' />
              </Stack>
              <Divider />
              <Stack gap='sm'>
                <Title order={2} size='h4'>
                  Crafted Materials
                </Title>
                <MaterialList
                  materials={shoppingTotals.craftedMaterials}
                  emptyMessage='No melting-station materials are required.'
                />
              </Stack>
            </Stack>
          ) : (
            <Text c='dimmed'>Select an item to build a shopping list.</Text>
          )}
        </ScrollArea>
      </Drawer>
    </ToolLayout>
  )
}

export default NearlyFinishedPage
