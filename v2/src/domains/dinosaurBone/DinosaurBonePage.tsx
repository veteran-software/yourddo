import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Button,
  Center,
  Container,
  Divider,
  Group,
  List,
  Loader,
  MultiSelect,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title
} from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { UnsupportedManifestSchemaError } from '../../shared/data/loadDataset.ts'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import { InvalidDinosaurBoneDataError, loadDinosaurBoneData } from './data.ts'
import type {
  ClassifiedDinosaurBoneItem,
  DinosaurBoneAugment,
  DinosaurBoneData,
  ItemFamily,
  SelectedAugments
} from './dinosaurBone.types'
import {
  filterItems,
  formatEffect,
  getAugmentEffectNames,
  getAvailableSlots,
  getCompatibleAugments,
  getCumulativeIngredients,
  getEffectNames,
  getFamilyLabel,
  getFilterOptions,
  getFinishedEffects,
  getItemsForFamily,
  getSelectedAugments,
  itemFamilies,
  retainSelectedAugments
} from './logic.ts'

type DataState =
  { status: 'loading' } | { status: 'loaded'; data: DinosaurBoneData } | { status: 'error'; cause: unknown }

const knownIssuesUrl =
  'https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Dinosaur%20Bone%22'

const formatItemMetadata = (item: ClassifiedDinosaurBoneItem): string[] =>
  [
    item.type,
    item.minLevel !== undefined ? `Minimum level ${String(item.minLevel)}` : '',
    item.material ?? '',
    item.craftedIn ?? ''
  ].filter(Boolean)

const EffectList = ({ effects, empty = 'None' }: { effects: string[]; empty?: string }) =>
  effects.length > 0 ? (
    <List spacing='xs' size='sm'>
      {effects.map((effect) => (
        <List.Item key={effect}>{effect}</List.Item>
      ))}
    </List>
  ) : (
    <Text c='dimmed' size='sm'>
      {empty}
    </Text>
  )

const ItemSummary = ({ item }: { item: ClassifiedDinosaurBoneItem }) => (
  <Paper withBorder p='md'>
    <Stack gap='sm'>
      <Group justify='space-between' align='flex-start' wrap='wrap'>
        <Stack gap={4}>
          <Title order={2} size='h3'>
            {item.name}
          </Title>
          <Text c='dimmed' size='sm'>
            {formatItemMetadata(item).join(' · ')}
          </Text>
        </Stack>
        <Badge variant='light'>{getFamilyLabel(item.family)}</Badge>
      </Group>
      {item.description && <Text size='sm'>{item.description}</Text>}
      <Divider />
      <Stack gap='xs'>
        <Title order={3} size='h4'>
          Base effects
        </Title>
        <EffectList effects={getEffectNames(item)} />
      </Stack>
    </Stack>
  </Paper>
)

const ItemPreview = ({
  item,
  selectedAugments
}: {
  item: ClassifiedDinosaurBoneItem
  selectedAugments: Record<string, DinosaurBoneAugment>
}) => {
  const finished = getFinishedEffects(item, selectedAugments)
  return (
    <Paper withBorder p='md'>
      <Stack gap='sm'>
        <Title order={2} size='h3'>
          Finished item
        </Title>
        <Text fw={600}>{item.name}</Text>
        <Stack gap='xs'>
          <Title order={3} size='h4'>
            Base effects
          </Title>
          <EffectList effects={finished.base.map(formatEffect)} />
        </Stack>
        <Stack gap='xs'>
          <Title order={3} size='h4'>
            Selected augments
          </Title>
          {finished.selected.length > 0 ? (
            <Stack gap='sm'>
              {finished.selected.map(({ slot, augment }) => (
                <Stack key={slot} gap={2}>
                  <Text size='sm' fw={600}>
                    {slot}: {augment.name}
                  </Text>
                  <EffectList effects={(augment.effectsAdded ?? []).map(formatEffect)} />
                </Stack>
              ))}
            </Stack>
          ) : (
            <Text c='dimmed' size='sm'>
              No augments selected.
            </Text>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}

const IngredientSummary = ({
  item,
  selectedAugments
}: {
  item: ClassifiedDinosaurBoneItem
  selectedAugments: Record<string, DinosaurBoneAugment>
}) => {
  const ingredients = getCumulativeIngredients(item, selectedAugments)
  return (
    <Paper withBorder p='md'>
      <Stack gap='sm'>
        <Title order={2} size='h3'>
          Ingredients
        </Title>
        {ingredients.length === 0 ? (
          <Text c='dimmed' size='sm'>
            No ingredient requirements are published for this configuration.
          </Text>
        ) : (
          <List spacing='xs'>
            {ingredients.map(({ name, quantity }) => (
              <List.Item key={name}>
                <Group component='span' gap='xs'>
                  <Text component='span' size='sm'>
                    {name}
                  </Text>
                  <Badge component='span' variant='light' color='gray' size='sm'>
                    ×{quantity}
                  </Badge>
                </Group>
              </List.Item>
            ))}
          </List>
        )}
      </Stack>
    </Paper>
  )
}

const InspectorContent = ({
  item,
  selectedAugments,
  activeTab,
  onTabChange
}: {
  item: ClassifiedDinosaurBoneItem | undefined
  selectedAugments: Record<string, DinosaurBoneAugment>
  activeTab: 'finished' | 'ingredients'
  onTabChange: (value: 'finished' | 'ingredients') => void
}) => {
  if (!item) {
    return (
      <Alert color='blue' title='Build summary'>
        Select an item to preview the finished build and required ingredients.
      </Alert>
    )
  }

  return (
    <Tabs
      value={activeTab}
      onChange={(value) => {
        if (value === 'finished' || value === 'ingredients') onTabChange(value)
      }}
      keepMounted={false}
    >
      <Tabs.List>
        <Tabs.Tab value='finished'>Finished Item</Tabs.Tab>
        <Tabs.Tab value='ingredients'>Ingredients</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value='finished' pt='md'>
        <ItemPreview item={item} selectedAugments={selectedAugments} />
      </Tabs.Panel>
      <Tabs.Panel value='ingredients' pt='md'>
        <IngredientSummary item={item} selectedAugments={selectedAugments} />
      </Tabs.Panel>
    </Tabs>
  )
}

const DinosaurBonePage = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [family, setFamily] = useState<ItemFamily>('crafted-weapons')
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null)
  const [itemFilters, setItemFilters] = useState<string[]>([])
  const [itemFilterMode, setItemFilterMode] = useState<'OR' | 'AND'>('AND')
  const [selectedAugments, setSelectedAugments] = useState<SelectedAugments>({})
  const [augmentFilters, setAugmentFilters] = useState<string[]>([])
  const [augmentFilterMode, setAugmentFilterMode] = useState<'OR' | 'AND'>('OR')
  const [activeInspectorTab, setActiveInspectorTab] = useState<'finished' | 'ingredients'>('finished')

  useEffect(() => {
    let active = true
    loadDinosaurBoneData()
      .then((data) => {
        if (active) setDataState({ status: 'loaded', data })
      })
      .catch((cause: unknown) => {
        if (active) setDataState({ status: 'error', cause })
      })
    return () => {
      active = false
    }
  }, [loadAttempt])

  const data = dataState.status === 'loaded' ? dataState.data : undefined
  const familyItems = useMemo(() => (data ? getItemsForFamily(data.items, family) : []), [data, family])
  const itemFilterOptions = useMemo(() => getFilterOptions(familyItems, getEffectNames), [familyItems])
  const filteredItems = useMemo(
    () => filterItems(familyItems, itemFilters, itemFilterMode, getEffectNames),
    [familyItems, itemFilterMode, itemFilters]
  )
  const selectedItem = data?.items.find((item) => item.name === selectedItemName)
  const slots = useMemo(() => (selectedItem ? getAvailableSlots(selectedItem) : []), [selectedItem])
  const optionsBySlot = useMemo(() => {
    if (!data || !selectedItem) return new Map<string, DinosaurBoneAugment[]>()
    return new Map(slots.map((slot) => [slot, getCompatibleAugments(slot, data.dinosaurAugments, data.colorAugments)]))
  }, [data, selectedItem, slots])
  const filteredOptionsBySlot = useMemo(() => {
    const result = new Map<string, DinosaurBoneAugment[]>()
    optionsBySlot.forEach((options, slot) => {
      result.set(slot, filterItems(options, augmentFilters, augmentFilterMode, getAugmentEffectNames))
    })
    return result
  }, [augmentFilterMode, augmentFilters, optionsBySlot])
  const retainedAugments = useMemo(
    () => retainSelectedAugments(selectedItem, selectedAugments, optionsBySlot),
    [optionsBySlot, selectedAugments, selectedItem]
  )
  const augmentByName = useMemo(() => {
    const values = [...(data?.dinosaurAugments ?? []), ...(data?.colorAugments ?? [])]
    return new Map(values.map((augment) => [augment.name, augment]))
  }, [data])
  const selectedAugmentObjects = useMemo(
    () => getSelectedAugments(slots, retainedAugments, augmentByName),
    [augmentByName, retainedAugments, slots]
  )
  const augmentFilterOptions = useMemo(
    () => getFilterOptions([...optionsBySlot.values()].flat(), getAugmentEffectNames),
    [optionsBySlot]
  )
  const isComplete = slots.length > 0 && slots.every((slot) => Boolean(retainedAugments[slot]))

  const reset = () => {
    setFamily('crafted-weapons')
    setSelectedItemName(null)
    setItemFilters([])
    setItemFilterMode('AND')
    setSelectedAugments({})
    setAugmentFilters([])
    setAugmentFilterMode('OR')
  }

  const changeFamily = (value: string | null) => {
    if (!value || !itemFamilies.includes(value as ItemFamily)) return
    setFamily(value as ItemFamily)
    setSelectedItemName(null)
    setSelectedAugments({})
  }

  const changeItem = (value: string | null) => {
    setSelectedItemName(value)
    setSelectedAugments({})
  }

  const inspector =
    dataState.status === 'loaded' ? (
      <InspectorContent
        item={selectedItem}
        selectedAugments={selectedAugmentObjects}
        activeTab={activeInspectorTab}
        onTabChange={setActiveInspectorTab}
      />
    ) : undefined

  return (
    <WorkspaceLayout inspector={inspector} inspectorTitle='Build summary'>
      <Container size='xl' py='lg'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={4}>
            <Title order={1}>Dinosaur Bone Crafting</Title>
            <Text c='dimmed'>Configure a Dinosaur Bone item and review its finished effects and materials.</Text>
            <Anchor href={knownIssuesUrl} target='_blank' rel='noreferrer' size='sm'>
              Known issues and bug reports ↗
            </Anchor>
          </Stack>
          <Button variant='subtle' size='sm' onClick={reset}>
            Reset
          </Button>
        </Group>

        {dataState.status === 'loading' ? (
          <Center mih={180} role='status' aria-live='polite'>
            <Stack align='center' gap='xs'>
              <Loader size='sm' />
              <Text c='dimmed' size='sm'>
                Loading Dinosaur Bone data…
              </Text>
            </Stack>
          </Center>
        ) : dataState.status === 'error' ? (
          <Alert
            color='red'
            title={
              dataState.cause instanceof UnsupportedManifestSchemaError
                ? 'Unsupported data version'
                : dataState.cause instanceof InvalidDinosaurBoneDataError
                  ? 'Dinosaur Bone data is invalid'
                  : 'Dinosaur Bone data is unavailable'
            }
          >
            <Stack gap='sm' align='flex-start'>
              <Text size='sm'>
                The published Dinosaur Bone data could not be loaded. Check your connection and try again.
              </Text>
              <Button
                size='sm'
                variant='light'
                onClick={() => {
                  setDataState({ status: 'loading' })
                  setLoadAttempt((attempt) => attempt + 1)
                }}
              >
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : data?.items.length === 0 ? (
          <Alert color='yellow' title='No Dinosaur Bone items published'>
            No selectable Dinosaur Bone items are available.
          </Alert>
        ) : (
          <>
            <Paper withBorder p='md'>
              <Stack gap='md'>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Select
                    label='Item family'
                    data={itemFamilies.map((value) => ({ value, label: getFamilyLabel(value) }))}
                    value={family}
                    onChange={changeFamily}
                    allowDeselect={false}
                  />
                  <Select
                    label='Item'
                    placeholder='Search for an item…'
                    data={filteredItems.map((item) => item.name)}
                    value={selectedItemName}
                    onChange={changeItem}
                    searchable
                    clearable
                    nothingFoundMessage='No matching items'
                  />
                </SimpleGrid>
                <MultiSelect
                  label='Item effect filters'
                  placeholder='Filter by effects'
                  data={itemFilterOptions}
                  value={itemFilters}
                  onChange={setItemFilters}
                  searchable
                  clearable
                  hidePickedOptions
                />
                <Group gap='xs' role='group' aria-label='Item filter mode'>
                  <Button
                    variant={itemFilterMode === 'OR' ? 'filled' : 'default'}
                    size='compact-sm'
                    onClick={() => {
                      setItemFilterMode('OR')
                    }}
                  >
                    OR
                  </Button>
                  <Button
                    variant={itemFilterMode === 'AND' ? 'filled' : 'default'}
                    size='compact-sm'
                    onClick={() => {
                      setItemFilterMode('AND')
                    }}
                  >
                    AND
                  </Button>
                  <Text size='xs' c='dimmed'>
                    {filteredItems.length} matching items
                  </Text>
                </Group>
              </Stack>
            </Paper>

            {!selectedItem ? (
              <Alert color='blue' title='Select an item'>
                Choose an item to configure its augment slots.
              </Alert>
            ) : (
              <>
                <ItemSummary item={selectedItem} />
                <Paper withBorder p='md'>
                  <Stack gap='md'>
                    <Group justify='space-between' align='flex-start' wrap='wrap'>
                      <Stack gap={4}>
                        <Title order={2} size='h3'>
                          Augment slots
                        </Title>
                        <Text c='dimmed' size='sm'>
                          Select one compatible option for each slot.
                        </Text>
                      </Stack>
                      {isComplete && <Badge color='green'>Configuration complete</Badge>}
                    </Group>
                    <MultiSelect
                      label='Augment effect filters'
                      placeholder='Filter compatible augments'
                      data={augmentFilterOptions}
                      value={augmentFilters}
                      onChange={setAugmentFilters}
                      searchable
                      clearable
                      hidePickedOptions
                    />
                    <Group gap='xs' role='group' aria-label='Augment filter mode'>
                      <Button
                        variant={augmentFilterMode === 'OR' ? 'filled' : 'default'}
                        size='compact-sm'
                        onClick={() => {
                          setAugmentFilterMode('OR')
                        }}
                      >
                        OR
                      </Button>
                      <Button
                        variant={augmentFilterMode === 'AND' ? 'filled' : 'default'}
                        size='compact-sm'
                        onClick={() => {
                          setAugmentFilterMode('AND')
                        }}
                      >
                        AND
                      </Button>
                    </Group>
                    {slots.length === 0 ? (
                      <Text c='dimmed' size='sm'>
                        No configurable augment slots are published for this item.
                      </Text>
                    ) : (
                      <Accordion variant='separated' multiple defaultValue={slots.slice(0, 1)}>
                        {slots.map((slot) => {
                          const options = filteredOptionsBySlot.get(slot) ?? []
                          const allOptions = optionsBySlot.get(slot) ?? []
                          return (
                            <Accordion.Item key={slot} value={slot}>
                              <Accordion.Control>
                                {slot}
                                {retainedAugments[slot] ? ` — ${retainedAugments[slot]}` : ''}
                              </Accordion.Control>
                              <Accordion.Panel>
                                <Select
                                  aria-label={`${slot} augment`}
                                  placeholder={`Select ${slot}`}
                                  data={options.map((augment) => ({ value: augment.name, label: augment.name }))}
                                  value={retainedAugments[slot]}
                                  onChange={(value) => {
                                    setSelectedAugments((current) => ({ ...current, [slot]: value }))
                                  }}
                                  searchable
                                  clearable
                                  nothingFoundMessage={
                                    allOptions.length === 0 ? 'No compatible options published' : 'No matching augments'
                                  }
                                />
                                {retainedAugments[slot] && (
                                  <Text size='sm' mt='xs'>
                                    {(augmentByName.get(retainedAugments[slot])?.effectsAdded ?? [])
                                      .map(formatEffect)
                                      .join(', ') || 'No effects listed.'}
                                  </Text>
                                )}
                              </Accordion.Panel>
                            </Accordion.Item>
                          )
                        })}
                      </Accordion>
                    )}
                  </Stack>
                </Paper>
              </>
            )}
          </>
        )}
      </Container>
    </WorkspaceLayout>
  )
}

export default DinosaurBonePage
