import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Box,
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
  Text,
  Title
} from '@mantine/core'
import { IconFileInfo, IconListCheck } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { UnsupportedManifestSchemaError } from '../../shared/data/loadDataset.ts'
import type { WorkspaceTool } from '../../shared/layout/WorkspaceLayout.tsx'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import IconImage from '../../shared/ui/IconImage.tsx'
import { InvalidDinosaurBoneDataError, loadDinosaurBoneData } from './data.ts'
import type {
  ClassifiedDinosaurBoneItem,
  CumulativeIngredient,
  DinosaurBoneAugment,
  DinosaurBoneData,
  FinishedDinosaurBoneItem,
  ItemFamily,
  SelectedAugments
} from './dinosaurBone.types'
import {
  calculateCumulativeIngredients,
  calculateFinishedItem,
  filterRecords,
  formatEffect,
  getAugmentEffectNames,
  getAvailableSlots,
  getCompatibleAugments,
  getEffectNames,
  getFamilyLabel,
  getFilterOptions,
  getItemsForFamily,
  getSelectedAugments,
  itemFamilies
} from './logic.ts'

type DataState =
  { status: 'loading' } | { status: 'loaded'; data: DinosaurBoneData } | { status: 'error'; cause: unknown }

const initialFamily: ItemFamily = 'crafted-weapons'
const knownIssuesUrl =
  'https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Dinosaur%20Bone%22'

const ItemIcon = ({ item, size, alt = '' }: { item: ClassifiedDinosaurBoneItem; size: number; alt?: string }) => (
  <IconImage alt={alt} name={item.name} source={item.icon ?? item.image} size={size} />
)

const EffectList = ({ effects, empty = 'None published.' }: { effects: readonly string[]; empty?: string }) =>
  effects.length > 0 ? (
    <List spacing='xs' size='sm'>
      {effects.map((effect, index) => (
        <List.Item key={`${effect}-${String(index)}`} style={{ overflowWrap: 'anywhere' }}>
          {effect}
        </List.Item>
      ))}
    </List>
  ) : (
    <Text c='dimmed' size='sm'>
      {empty}
    </Text>
  )

const formatBinding = (binding: Readonly<Record<string, string>> | undefined) =>
  binding ? Object.values(binding).join(' · ') : undefined

const ItemSummary = ({ item }: { item: ClassifiedDinosaurBoneItem }) => {
  const metadata = [
    item.type,
    item.minLevel !== undefined ? `Minimum level ${String(item.minLevel)}` : undefined,
    formatBinding(item.binding),
    item.material,
    item.craftedIn
  ].filter((value): value is string => Boolean(value))
  return (
    <Paper withBorder p='md'>
      <Stack gap='sm'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Group align='flex-start' wrap='nowrap' style={{ minWidth: 0 }}>
            <ItemIcon item={item} size={72} alt={`${item.name} icon`} />
            <Box style={{ minWidth: 0 }}>
              <Title order={2} size='h3' style={{ overflowWrap: 'anywhere' }}>
                {item.name}
              </Title>
              <Text c='dimmed' size='sm'>
                {metadata.join(' · ')}
              </Text>
            </Box>
          </Group>
          <Badge variant='light'>{getFamilyLabel(item.family)}</Badge>
        </Group>
        {item.description ? <Text size='sm'>{item.description}</Text> : null}
        <Divider />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Box>
            <Text fw={600} size='sm' mb={4}>
              Base effects
            </Text>
            <EffectList effects={[...(item.effectsAdded ?? []), ...(item.enchantments ?? [])].map(formatEffect)} />
          </Box>
          <Stack gap={4}>
            <Text size='sm'>Configurable slots: {String(item.augments.length)}</Text>
            {item.restrictions?.map((restriction) => (
              <Text size='sm' key={restriction}>
                Restriction: {restriction}
              </Text>
            ))}
            {item.notes?.map((note) => (
              <Text size='sm' key={note}>
                Note: {note}
              </Text>
            ))}
          </Stack>
        </SimpleGrid>
      </Stack>
    </Paper>
  )
}

const FinishedItemTool = ({ finished }: { finished: FinishedDinosaurBoneItem }) => {
  if (!finished.item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review the finished build.
      </Alert>
    )
  }
  return (
    <Stack gap='md' p='md'>
      <Box>
        <Title order={3} style={{ overflowWrap: 'anywhere' }}>
          {finished.item.name}
        </Title>
        <Text c='dimmed' size='sm'>
          {finished.item.type}
          {finished.item.minLevel !== undefined ? ` · Minimum level ${String(finished.item.minLevel)}` : ''}
        </Text>
      </Box>
      {finished.warnings.length > 0 ? (
        <Alert color='red' title='Build validation' role='alert'>
          <EffectList effects={finished.warnings} />
        </Alert>
      ) : null}
      <Box>
        <Text fw={600} mb='xs'>
          Original effects
        </Text>
        <EffectList effects={finished.originalEffects.map(formatEffect)} />
      </Box>
      <Divider />
      <Box>
        <Text fw={600} mb='xs'>
          Crafted additions by slot
        </Text>
        {finished.slots.some(({ augment }) => augment) ? (
          <Stack gap='md'>
            {finished.slots
              .filter(({ augment }) => augment)
              .map(({ slot, augment }) => (
                <Box key={slot.id}>
                  <Text fw={600} size='sm' style={{ overflowWrap: 'anywhere' }}>
                    {slot.label}: {augment?.name}
                  </Text>
                  <EffectList
                    effects={(augment?.effectsAdded ?? []).map(formatEffect)}
                    empty='No effect text published.'
                  />
                </Box>
              ))}
          </Stack>
        ) : (
          <Text c='dimmed' size='sm'>
            No augments selected.
          </Text>
        )}
      </Box>
      {finished.setBonuses.length > 0 ? (
        <Box>
          <Text fw={600} mb='xs'>
            Set bonuses
          </Text>
          <List size='sm'>
            {finished.setBonuses.map((bonus, index) => (
              <List.Item key={`${bonus.name}-${String(index)}`}>{bonus.name}</List.Item>
            ))}
          </List>
        </Box>
      ) : null}
      <Box>
        <Text fw={600} mb='xs'>
          Empty configurable slots
        </Text>
        {finished.emptySlots.length > 0 ? (
          <List size='sm'>
            {finished.emptySlots.map((slot) => (
              <List.Item key={slot.id}>{slot.label}</List.Item>
            ))}
          </List>
        ) : (
          <Text size='sm'>All configurable slots are filled.</Text>
        )}
      </Box>
      {[...(finished.item.restrictions ?? []), ...(finished.item.notes ?? [])].map((note) => (
        <Text key={note} size='sm'>
          {note}
        </Text>
      ))}
    </Stack>
  )
}

const IngredientsTool = ({
  item,
  ingredients
}: {
  item?: ClassifiedDinosaurBoneItem
  ingredients: CumulativeIngredient[]
}) => {
  if (!item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review cumulative ingredients.
      </Alert>
    )
  }
  return (
    <Stack gap='md' p='md'>
      <Text size='sm'>Cumulative requirements for {item.name} and all selected augments.</Text>
      {ingredients.length === 0 ? (
        <Alert color='green' title='No material cost'>
          This valid configuration has no published material requirements.
        </Alert>
      ) : (
        <List spacing='sm'>
          {ingredients.map((ingredient) => (
            <List.Item key={ingredient.name}>
              <Group component='span' justify='space-between' align='flex-start' wrap='nowrap'>
                <Box component='span' style={{ minWidth: 0 }}>
                  <Text component='span' size='sm' style={{ overflowWrap: 'anywhere' }}>
                    {ingredient.name}
                  </Text>
                  {ingredient.foundIn?.map((location) => (
                    <Text component='span' display='block' c='dimmed' size='xs' key={location}>
                      {location}
                    </Text>
                  ))}
                </Box>
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

const errorTitle = (cause: unknown) => {
  if (cause instanceof UnsupportedManifestSchemaError) return 'Unsupported data version'
  if (cause instanceof InvalidDinosaurBoneDataError) return 'Dinosaur Bone data is invalid'
  return 'Dinosaur Bone data is unavailable'
}

const DinosaurBonePage = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [family, setFamily] = useState<ItemFamily>(initialFamily)
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null)
  const [itemFilters, setItemFilters] = useState<string[]>([])
  const [itemFilterMode, setItemFilterMode] = useState<'OR' | 'AND'>('AND')
  const [selectedAugments, setSelectedAugments] = useState<SelectedAugments>({})
  const [augmentFilters, setAugmentFilters] = useState<string[]>([])
  const [augmentFilterMode, setAugmentFilterMode] = useState<'OR' | 'AND'>('OR')

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
  const familyItems = useMemo(() => (data ? getItemsForFamily(data.indexes, family) : []), [data, family])
  const itemFilterOptions = useMemo(() => getFilterOptions(familyItems, getEffectNames), [familyItems])
  const filteredItems = useMemo(
    () => filterRecords(familyItems, itemFilters, itemFilterMode, getEffectNames),
    [familyItems, itemFilterMode, itemFilters]
  )
  const selectedItem = selectedItemName ? data?.indexes.itemByName.get(selectedItemName) : undefined
  const slots = useMemo(() => (selectedItem ? getAvailableSlots(selectedItem) : []), [selectedItem])
  const optionsBySlot = useMemo(() => {
    if (!data || !selectedItem) return new Map<string, readonly DinosaurBoneAugment[]>()
    return new Map(slots.map((slot) => [slot.id, getCompatibleAugments(slot.augmentType, data.indexes)]))
  }, [data, selectedItem, slots])
  const augmentFilterOptions = useMemo(
    () => getFilterOptions([...optionsBySlot.values()].flat(), getAugmentEffectNames),
    [optionsBySlot]
  )
  const filteredOptionsBySlot = useMemo(
    () =>
      new Map(
        [...optionsBySlot.entries()].map(([slotId, options]) => [
          slotId,
          filterRecords(options, augmentFilters, augmentFilterMode, getAugmentEffectNames)
        ])
      ),
    [augmentFilterMode, augmentFilters, optionsBySlot]
  )
  const selectedAugmentObjects = useMemo(
    () => (data ? getSelectedAugments(selectedItem, selectedAugments, data.indexes) : {}),
    [data, selectedAugments, selectedItem]
  )
  const finished = useMemo(
    () =>
      data
        ? calculateFinishedItem(selectedItem, selectedAugments, data.indexes)
        : { originalEffects: [], slots: [], emptySlots: [], setBonuses: [], warnings: [] },
    [data, selectedAugments, selectedItem]
  )
  const ingredients = useMemo(
    () => calculateCumulativeIngredients(selectedItem, selectedAugmentObjects),
    [selectedAugmentObjects, selectedItem]
  )
  const tools = useMemo<readonly WorkspaceTool[]>(
    () => [
      {
        id: 'finished-item',
        label: 'Finished Item',
        icon: selectedItem ? <ItemIcon item={selectedItem} size={20} /> : <IconFileInfo stroke={2} />,
        content: <FinishedItemTool finished={finished} />
      },
      {
        id: 'ingredients',
        label: 'Ingredients',
        icon: <IconListCheck stroke={2} />,
        content: <IngredientsTool item={selectedItem} ingredients={ingredients} />
      }
    ],
    [finished, ingredients, selectedItem]
  )

  const reset = () => {
    setFamily(initialFamily)
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

  const isComplete = slots.length > 0 && slots.every(({ id }) => Boolean(selectedAugments[id]))

  return (
    <WorkspaceLayout tools={tools} toolPanelWidth='24rem'>
      <Container size='xl' py={{ base: 'md', sm: 'lg' }} px={{ base: 'md', sm: 'lg' }}>
        <Stack gap='lg'>
          <Group justify='space-between' align='flex-start' wrap='wrap'>
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Title order={1}>Dinosaur Bone Crafting</Title>
              <Text c='dimmed'>Choose an item, configure its slots, and review the finished build and materials.</Text>
              <Anchor href={knownIssuesUrl} target='_blank' rel='noreferrer' size='sm'>
                Known issues and bug reports ↗
              </Anchor>
            </Stack>
            <Button variant='subtle' size='sm' onClick={reset}>
              Reset build
            </Button>
          </Group>

          {dataState.status === 'loading' ? (
            <Center mih={220} role='status' aria-live='polite'>
              <Stack align='center' gap='xs'>
                <Loader size='sm' />
                <Text c='dimmed' size='sm'>
                  Loading Dinosaur Bone data…
                </Text>
              </Stack>
            </Center>
          ) : dataState.status === 'error' ? (
            <Alert color='red' title={errorTitle(dataState.cause)} role='alert'>
              <Stack gap='sm' align='flex-start'>
                <Text size='sm'>The published Dinosaur Bone data could not be loaded. Try again shortly.</Text>
                {import.meta.env.DEV && dataState.cause instanceof Error ? (
                  <Text component='code' size='xs' style={{ overflowWrap: 'anywhere' }}>
                    {dataState.cause.message}
                  </Text>
                ) : null}
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
                      data={filteredItems.map(({ name }) => ({ value: name, label: name }))}
                      value={selectedItemName}
                      onChange={changeItem}
                      searchable
                      clearable
                      maxDropdownHeight={300}
                      nothingFoundMessage='No items match this search and filter selection.'
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
                    maxDropdownHeight={260}
                  />
                  <Group gap='xs' role='group' aria-label='Item filter mode'>
                    {(['OR', 'AND'] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant={itemFilterMode === mode ? 'filled' : 'default'}
                        size='compact-sm'
                        aria-pressed={itemFilterMode === mode}
                        onClick={() => {
                          setItemFilterMode(mode)
                        }}
                      >
                        {mode}
                      </Button>
                    ))}
                    <Text size='xs' c='dimmed' aria-live='polite'>
                      {String(filteredItems.length)} matching items
                    </Text>
                    {filteredItems.length === 0 ? (
                      <Text size='xs' c='dimmed'>
                        Clear filters to see this family’s items.
                      </Text>
                    ) : null}
                  </Group>
                </Stack>
              </Paper>

              {!selectedItem ? (
                <Alert color='blue' title='Select an item'>
                  Choose an item to review its base properties and configure its crafting slots.
                </Alert>
              ) : (
                <>
                  <ItemSummary item={selectedItem} />
                  <Paper withBorder p='md'>
                    <Stack gap='md'>
                      <Group justify='space-between' align='flex-start' wrap='wrap'>
                        <Box>
                          <Title order={2} size='h3'>
                            Crafting slots
                          </Title>
                          <Text c='dimmed' size='sm'>
                            Search and select one compatible augment for each available slot.
                          </Text>
                        </Box>
                        {isComplete ? <Badge color='green'>Configuration complete</Badge> : null}
                      </Group>
                      {slots.length === 0 ? (
                        <Alert color='blue' title='No configurable slots'>
                          This item has no configurable Dinosaur Bone slots.
                        </Alert>
                      ) : (
                        <>
                          <MultiSelect
                            label='Augment effect filters'
                            placeholder='Filter compatible augments'
                            data={augmentFilterOptions}
                            value={augmentFilters}
                            onChange={setAugmentFilters}
                            searchable
                            clearable
                            hidePickedOptions
                            maxDropdownHeight={260}
                          />
                          <Group gap='xs' role='group' aria-label='Augment filter mode'>
                            {(['OR', 'AND'] as const).map((mode) => (
                              <Button
                                key={mode}
                                variant={augmentFilterMode === mode ? 'filled' : 'default'}
                                size='compact-sm'
                                aria-pressed={augmentFilterMode === mode}
                                onClick={() => {
                                  setAugmentFilterMode(mode)
                                }}
                              >
                                {mode}
                              </Button>
                            ))}
                          </Group>
                          <Accordion variant='separated' multiple defaultValue={slots.slice(0, 1).map(({ id }) => id)}>
                            {slots.map((slot) => {
                              const options = filteredOptionsBySlot.get(slot.id) ?? []
                              const selectedName = selectedAugments[slot.id]
                              const selectedAugment = selectedName
                                ? data?.indexes.augmentByName.get(selectedName)
                                : undefined
                              return (
                                <Accordion.Item key={slot.id} value={slot.id}>
                                  <Accordion.Control>
                                    <Group justify='space-between' wrap='nowrap' pr='sm'>
                                      <Text fw={600} style={{ overflowWrap: 'anywhere' }}>
                                        {slot.label}
                                      </Text>
                                      <Badge variant='light' color={selectedName ? 'green' : 'gray'}>
                                        {selectedName ? 'Configured' : 'Empty'}
                                      </Badge>
                                    </Group>
                                  </Accordion.Control>
                                  <Accordion.Panel>
                                    <Stack gap='xs'>
                                      <Select
                                        label={`${slot.label} augment`}
                                        placeholder={`Search ${slot.label} options…`}
                                        data={options.map(({ name }) => ({ value: name, label: name }))}
                                        value={selectedName}
                                        onChange={(value) => {
                                          setSelectedAugments((current) => ({ ...current, [slot.id]: value }))
                                        }}
                                        searchable
                                        clearable
                                        maxDropdownHeight={300}
                                        nothingFoundMessage='No compatible augments match these filters.'
                                      />
                                      {selectedAugment ? (
                                        <Box>
                                          <Text size='sm' fw={600} style={{ overflowWrap: 'anywhere' }}>
                                            {selectedAugment.name}
                                          </Text>
                                          <EffectList
                                            effects={(selectedAugment.effectsAdded ?? []).map(formatEffect)}
                                            empty='No effect text published.'
                                          />
                                          {selectedAugment.description ? (
                                            <Text size='sm' mt='xs'>
                                              {selectedAugment.description}
                                            </Text>
                                          ) : null}
                                        </Box>
                                      ) : null}
                                    </Stack>
                                  </Accordion.Panel>
                                </Accordion.Item>
                              )
                            })}
                          </Accordion>
                        </>
                      )}
                    </Stack>
                  </Paper>
                </>
              )}
            </>
          )}
        </Stack>
      </Container>
    </WorkspaceLayout>
  )
}

export default DinosaurBonePage
