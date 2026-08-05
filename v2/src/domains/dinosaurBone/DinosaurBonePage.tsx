import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Input,
  Loader,
  MultiSelect,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title
} from '@mantine/core'
import {
  IconFileInfo,
  IconListCheck,
  IconListDetails
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import AugmentSelect from '../../shared/augments/AugmentSelect.tsx'
import {
  UnsupportedManifestSchemaError
} from '../../shared/data/loadDataset.ts'
import EffectList from '../../shared/items/EffectList.tsx'
import ItemIcon from '../../shared/items/ItemIcon.tsx'
import type { WorkspaceTool } from '../../shared/layout/WorkspaceLayout.tsx'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import {
  ArtifactAbilityScoreNotice,
  ColorAugmentLevelNotice
} from './components/BuildNotices.tsx'
import ItemSummary from './components/ItemSummary.tsx'
import { InvalidDinosaurBoneDataError, loadDinosaurBoneData } from './data.ts'
import type {
  DinosaurBoneAugment,
  DinosaurBoneData,
  ItemFamily,
  SelectedAugments
} from './dinosaurBone.types'
import {
  adjustEffectForArtifact,
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
  isColorSlot,
  itemFamilies
} from './logic.ts'
import CraftingBreakdownTool from './tools/CraftingBreakdownTool.tsx'
import FinishedItemTool from './tools/FinishedItemTool.tsx'
import IngredientsTool from './tools/IngredientsTool.tsx'
import Error = Input.Error

type DataState =
  { status: 'loading' } | { status: 'loaded'; data: DinosaurBoneData } | { status: 'error'; cause: unknown }

const initialFamily: ItemFamily = 'crafted-weapons'
const knownIssuesUrl =
  'https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Dinosaur%20Bone%22'

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
  const [iodAugmentFilters, setIodAugmentFilters] = useState<string[]>([])
  const [iodAugmentFilterMode, setIodAugmentFilterMode] = useState<'OR' | 'AND'>('OR')
  const [colorAugmentFilters, setColorAugmentFilters] = useState<string[]>([])
  const [colorAugmentFilterMode, setColorAugmentFilterMode] = useState<'OR' | 'AND'>('OR')

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
  const iodSlots = useMemo(() => slots.filter(({ augmentType }) => !isColorSlot(augmentType)), [slots])
  const colorSlots = useMemo(() => slots.filter(({ augmentType }) => isColorSlot(augmentType)), [slots])
  const iodAugmentFilterOptions = useMemo(
    () =>
      getFilterOptions(
        iodSlots.flatMap(({ id }) => optionsBySlot.get(id) ?? []),
        getAugmentEffectNames
      ),
    [iodSlots, optionsBySlot]
  )
  const colorAugmentFilterOptions = useMemo(
    () =>
      getFilterOptions(
        colorSlots.flatMap(({ id }) => optionsBySlot.get(id) ?? []),
        getAugmentEffectNames
      ),
    [colorSlots, optionsBySlot]
  )
  const filteredOptionsBySlot = useMemo(
    () =>
      new Map(
        slots.map((slot) => {
          const options = optionsBySlot.get(slot.id) ?? []
          const colorSlot = isColorSlot(slot.augmentType)
          return [
            slot.id,
            filterRecords(
              options,
              colorSlot ? colorAugmentFilters : iodAugmentFilters,
              colorSlot ? colorAugmentFilterMode : iodAugmentFilterMode,
              getAugmentEffectNames
            )
          ] as const
        })
      ),
    [colorAugmentFilterMode, colorAugmentFilters, iodAugmentFilterMode, iodAugmentFilters, optionsBySlot, slots]
  )
  const selectedAugmentObjects = useMemo(
    () => (data ? getSelectedAugments(selectedItem, selectedAugments, data.indexes) : {}),
    [data, selectedAugments, selectedItem]
  )
  const selectedUpgradeEffects = useMemo(
    () => Object.values(selectedAugmentObjects).flatMap(({ effectsAdded }) => effectsAdded ?? []),
    [selectedAugmentObjects]
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
      },
      {
        id: 'crafting-breakdown',
        label: 'Crafting Breakdown',
        icon: <IconListDetails stroke={2} />,
        content: <CraftingBreakdownTool finished={finished} />
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
    setIodAugmentFilters([])
    setIodAugmentFilterMode('OR')
    setColorAugmentFilters([])
    setColorAugmentFilterMode('OR')
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
                          <SimpleGrid cols={{ base: 1, md: 2 }}>
                            {iodSlots.length > 0 ? (
                              <Paper withBorder p='sm'>
                                <Stack gap='xs'>
                                  <Box>
                                    <Text fw={600}>Isle of Dread (IoD) augment filters</Text>
                                    <Text c='dimmed' size='xs'>
                                      Applies only to IoD crafting slots.
                                    </Text>
                                  </Box>
                                  <MultiSelect
                                    label='IoD augment effect filters'
                                    placeholder='Filter IoD augments'
                                    data={iodAugmentFilterOptions}
                                    value={iodAugmentFilters}
                                    onChange={setIodAugmentFilters}
                                    searchable
                                    clearable
                                    hidePickedOptions
                                    maxDropdownHeight={260}
                                  />
                                  <Group gap='xs' role='group' aria-label='IoD augment filter mode'>
                                    {(['OR', 'AND'] as const).map((mode) => (
                                      <Button
                                        key={mode}
                                        variant={iodAugmentFilterMode === mode ? 'filled' : 'default'}
                                        size='compact-sm'
                                        aria-pressed={iodAugmentFilterMode === mode}
                                        onClick={() => {
                                          setIodAugmentFilterMode(mode)
                                        }}
                                      >
                                        {mode}
                                      </Button>
                                    ))}
                                  </Group>
                                </Stack>
                              </Paper>
                            ) : null}
                            {colorSlots.length > 0 ? (
                              <Paper withBorder p='sm'>
                                <Stack gap='xs'>
                                  <Box>
                                    <Text fw={600}>Color augment filters</Text>
                                    <Text c='dimmed' size='xs'>
                                      Applies only to color augment slots.
                                    </Text>
                                  </Box>
                                  <MultiSelect
                                    label='Color augment effect filters'
                                    placeholder='Filter color augments'
                                    data={colorAugmentFilterOptions}
                                    value={colorAugmentFilters}
                                    onChange={setColorAugmentFilters}
                                    searchable
                                    clearable
                                    hidePickedOptions
                                    maxDropdownHeight={260}
                                  />
                                  <Group gap='xs' role='group' aria-label='Color augment filter mode'>
                                    {(['OR', 'AND'] as const).map((mode) => (
                                      <Button
                                        key={mode}
                                        variant={colorAugmentFilterMode === mode ? 'filled' : 'default'}
                                        size='compact-sm'
                                        aria-pressed={colorAugmentFilterMode === mode}
                                        onClick={() => {
                                          setColorAugmentFilterMode(mode)
                                        }}
                                      >
                                        {mode}
                                      </Button>
                                    ))}
                                  </Group>
                                </Stack>
                              </Paper>
                            ) : null}
                          </SimpleGrid>
                          <Stack gap='xs'>
                            <ArtifactAbilityScoreNotice item={selectedItem} effects={selectedUpgradeEffects} />
                            <ColorAugmentLevelNotice item={selectedItem} slots={finished.slots} />
                          </Stack>
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
                                      <AugmentSelect
                                        label={`${slot.label} augment`}
                                        slotType={slot.augmentType}
                                        placeholder={`Search ${slot.label} options…`}
                                        options={options}
                                        value={selectedName}
                                        onChange={(value) => {
                                          setSelectedAugments((current) => ({ ...current, [slot.id]: value }))
                                        }}
                                        nothingFoundMessage='No compatible augments match these filters.'
                                      />
                                      {selectedAugment ? (
                                        <Box>
                                          <Text size='sm' fw={600} style={{ overflowWrap: 'anywhere' }}>
                                            {selectedAugment.name}
                                          </Text>
                                          <EffectList
                                            effects={(selectedAugment.effectsAdded ?? []).map((effect) =>
                                              formatEffect(adjustEffectForArtifact(effect, selectedItem))
                                            )}
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
