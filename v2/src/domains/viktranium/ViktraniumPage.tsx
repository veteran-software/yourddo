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
  Loader,
  MultiSelect,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { IconFileExport, IconFileInfo, IconListCheck, IconListDetails } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import AugmentSelect from '../../shared/augments/AugmentSelect.tsx'
import { UnsupportedManifestSchemaError } from '../../shared/data/loadDataset.ts'
import EffectList from '../../shared/items/EffectList.tsx'
import ItemIcon from '../../shared/items/ItemIcon.tsx'
import type { WorkspaceTool } from '../../shared/layout/WorkspaceLayout.tsx'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import ViktraniumItemSummary from './components/ViktraniumItemSummary.tsx'
import { InvalidViktraniumDataError, loadViktraniumData } from './data.ts'
import {
  buildComplete,
  calculateFinishedItem,
  calculateIngredients,
  filterRecords,
  formatEffect,
  getAugmentEffectNames,
  getCompatibleAugments,
  getFamilyLabel,
  getFilterOptions,
  getItemEffectNames,
  getSelectedAugments,
  itemFamilies
} from './logic.ts'
import CraftingBreakdownTool from './tools/CraftingBreakdownTool.tsx'
import ExportTool from './tools/ExportTool.tsx'
import FinishedItemTool from './tools/FinishedItemTool.tsx'
import IngredientsTool from './tools/IngredientsTool.tsx'
import type { SelectedAugments, ViktraniumData, ViktraniumFamily } from './viktranium.types.ts'

type DataState =
  { status: 'loading' } | { status: 'loaded'; data: ViktraniumData } | { status: 'error'; cause: unknown }

const initialFamily: ViktraniumFamily = 'heroic-crafted-weapons'
const knownIssuesUrl =
  'https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Viktranium%20Experiment%22'

const errorTitle = (cause: unknown): string => {
  if (cause instanceof UnsupportedManifestSchemaError) return 'Unsupported data release'
  if (cause instanceof InvalidViktraniumDataError) return 'Viktranium data is invalid'
  return 'Viktranium data is unavailable'
}

const modeData = [
  { label: 'OR', value: 'OR' },
  { label: 'AND', value: 'AND' }
]

const ViktraniumPage = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [family, setFamily] = useState<ViktraniumFamily>(initialFamily)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [itemFilters, setItemFilters] = useState<string[]>([])
  const [itemFilterMode, setItemFilterMode] = useState<'OR' | 'AND'>('AND')
  const [selectedAugments, setSelectedAugments] = useState<SelectedAugments>({})
  const [augmentFilters, setAugmentFilters] = useState<string[]>([])
  const [augmentFilterMode, setAugmentFilterMode] = useState<'OR' | 'AND'>('OR')

  useEffect(() => {
    let active = true
    loadViktraniumData()
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
  const familyItems = useMemo(() => data?.indexes.itemsByFamily.get(family) ?? [], [data, family])
  const itemFilterOptions = useMemo(() => getFilterOptions(familyItems, getItemEffectNames), [familyItems])
  const filteredItems = useMemo(
    () => filterRecords(familyItems, itemFilters, itemFilterMode, getItemEffectNames),
    [familyItems, itemFilterMode, itemFilters]
  )
  const selectedItem = selectedItemId ? data?.indexes.itemById.get(selectedItemId) : undefined
  const selectedItemFilteredOut = Boolean(selectedItem && !filteredItems.includes(selectedItem))
  const itemSelectOptions = useMemo(() => {
    const values = selectedItemFilteredOut && selectedItem ? [selectedItem, ...filteredItems] : filteredItems
    return values.map((item) => ({
      value: item.id,
      label: `${item.displayName} · ${item.category} · ML ${String(item.minimumLevel)}`
    }))
  }, [filteredItems, selectedItem, selectedItemFilteredOut])
  const compatibleBySlot = useMemo(() => {
    if (!data || !selectedItem) return new Map<string, ReturnType<typeof getCompatibleAugments>>()
    return new Map(selectedItem.slots.map((slot) => [slot.id, getCompatibleAugments(slot, data)]))
  }, [data, selectedItem])
  const augmentFilterOptions = useMemo(
    () => getFilterOptions([...compatibleBySlot.values()].flat(), getAugmentEffectNames),
    [compatibleBySlot]
  )
  const filteredBySlot = useMemo(
    () =>
      new Map(
        [...compatibleBySlot].map(([slotId, options]) => [
          slotId,
          filterRecords(options, augmentFilters, augmentFilterMode, getAugmentEffectNames)
        ])
      ),
    [augmentFilterMode, augmentFilters, compatibleBySlot]
  )
  const selectedAugmentObjects = useMemo(
    () => (data ? getSelectedAugments(selectedItem, selectedAugments, data) : {}),
    [data, selectedAugments, selectedItem]
  )
  const finished = useMemo(
    () =>
      data
        ? calculateFinishedItem(selectedItem, selectedAugments, data)
        : { baseEffects: [], slots: [], emptySlots: [], warnings: [], incompleteRecipeWarnings: [] },
    [data, selectedAugments, selectedItem]
  )
  const ingredients = useMemo(
    () => (data ? calculateIngredients(selectedItem, selectedAugmentObjects, data) : { ingredients: [], warnings: [] }),
    [data, selectedAugmentObjects, selectedItem]
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
        content: <IngredientsTool item={selectedItem} calculation={ingredients} />
      },
      {
        id: 'crafting-breakdown',
        label: 'Crafting Breakdown',
        icon: <IconListDetails stroke={2} />,
        content: <CraftingBreakdownTool item={selectedItem} slots={finished.slots} />
      },
      {
        id: 'export',
        label: 'Export',
        icon: <IconFileExport stroke={2} />,
        content: <ExportTool finished={finished} ingredients={ingredients} />
      }
    ],
    [finished, ingredients, selectedItem]
  )

  const reset = () => {
    setFamily(initialFamily)
    setSelectedItemId(null)
    setItemFilters([])
    setItemFilterMode('AND')
    setSelectedAugments({})
    setAugmentFilters([])
    setAugmentFilterMode('OR')
  }
  const changeFamily = (value: string | null) => {
    if (!value || !itemFamilies.includes(value as ViktraniumFamily)) return
    const next = value as ViktraniumFamily
    setFamily(next)
    if (selectedItem?.family !== next) {
      setSelectedItemId(null)
      setSelectedAugments({})
    }
  }
  const changeItem = (value: string | null) => {
    setSelectedItemId(value)
    setSelectedAugments({})
  }

  return (
    <WorkspaceLayout tools={tools} toolPanelWidth='24rem'>
      <Container size='xl' py={{ base: 'md', sm: 'lg' }} px={{ base: 'md', sm: 'lg' }}>
        <Stack gap='lg'>
          <Group justify='space-between' align='flex-start' wrap='wrap'>
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Title order={1}>Viktranium Experiment Crafting</Title>
              <Text c='dimmed'>Choose an item, configure every slot, and review or export the finished build.</Text>
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
                  Loading Viktranium data…
                </Text>
              </Stack>
            </Center>
          ) : dataState.status === 'error' ? (
            <Alert color='red' title={errorTitle(dataState.cause)} role='alert'>
              <Stack gap='sm' align='flex-start'>
                <Text size='sm'>
                  The published Viktranium data could not be loaded or validated. Try again shortly.
                </Text>
                {import.meta.env.DEV && dataState.cause instanceof Error ? (
                  <Text component='code' size='xs'>
                    {dataState.cause.message}
                  </Text>
                ) : null}
                <Button
                  size='sm'
                  variant='light'
                  onClick={() => {
                    setDataState({ status: 'loading' })
                    setLoadAttempt((value) => value + 1)
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
                      data={itemSelectOptions}
                      value={selectedItemId}
                      onChange={changeItem}
                      searchable
                      clearable
                      maxDropdownHeight={300}
                      nothingFoundMessage='No items match this search and filter selection.'
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <MultiSelect
                      label='Item effect filters'
                      placeholder='Choose effects…'
                      data={itemFilterOptions}
                      value={itemFilters}
                      onChange={setItemFilters}
                      searchable
                      clearable
                      maxDropdownHeight={260}
                    />
                    <Box>
                      <Text component='label' display='block' size='sm' fw={500} mb={4}>
                        Item filter mode
                      </Text>
                      <SegmentedControl
                        fullWidth
                        data={modeData}
                        value={itemFilterMode}
                        onChange={(value) => {
                          setItemFilterMode(value as 'OR' | 'AND')
                        }}
                      />
                    </Box>
                  </SimpleGrid>
                  {filteredItems.length === 0 ? (
                    <Alert color='blue'>No items match the active effect filters.</Alert>
                  ) : null}
                  {selectedItemFilteredOut ? (
                    <Alert color='yellow'>
                      The selected item is retained but does not match the active discovery filters.
                    </Alert>
                  ) : null}
                </Stack>
              </Paper>

              {selectedItem ? (
                <>
                  <ViktraniumItemSummary item={selectedItem} />
                  <Paper withBorder p='md'>
                    <Stack gap='md'>
                      <Group justify='space-between' align='center'>
                        <Title order={2} size='h3'>
                          Configure augment slots
                        </Title>
                        <Badge color={buildComplete(finished) ? 'green' : 'gray'}>
                          {buildComplete(finished) ? 'Complete' : `${String(finished.emptySlots.length)} empty`}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <MultiSelect
                          label='Augment effect filters'
                          placeholder='Choose effects…'
                          data={augmentFilterOptions}
                          value={augmentFilters}
                          onChange={setAugmentFilters}
                          searchable
                          clearable
                          maxDropdownHeight={260}
                        />
                        <Box>
                          <Text component='label' display='block' size='sm' fw={500} mb={4}>
                            Augment filter mode
                          </Text>
                          <SegmentedControl
                            fullWidth
                            data={modeData}
                            value={augmentFilterMode}
                            onChange={(value) => {
                              setAugmentFilterMode(value as 'OR' | 'AND')
                            }}
                          />
                        </Box>
                      </SimpleGrid>
                      <Accordion key={selectedItem.id} defaultValue={selectedItem.slots[0]?.id} variant='separated'>
                        {selectedItem.slots.map((slot) => {
                          const allOptions = compatibleBySlot.get(slot.id) ?? []
                          const filteredOptions = filteredBySlot.get(slot.id) ?? []
                          const selectedId = selectedAugments[slot.id] ?? slot.filledAugmentId ?? null
                          const selected = selectedId ? data?.indexes.augmentById.get(selectedId) : undefined
                          const outsideFilters = Boolean(selected && !filteredOptions.includes(selected))
                          const shownOptions =
                            outsideFilters && selected ? [selected, ...filteredOptions] : filteredOptions
                          return (
                            <Accordion.Item value={slot.id} key={slot.id}>
                              <Accordion.Control>
                                <Group justify='space-between' wrap='nowrap' pr='sm'>
                                  <Text fw={600}>{slot.label}</Text>
                                  <Badge color={selected ? 'green' : 'gray'} variant='light'>
                                    {selected ? 'Configured' : 'Empty'}
                                  </Badge>
                                </Group>
                              </Accordion.Control>
                              <Accordion.Panel>
                                <Stack gap='sm'>
                                  <AugmentSelect
                                    label={`${slot.label} augment`}
                                    slotType={slot.augmentType}
                                    options={shownOptions.map((augment) => ({
                                      value: augment.id,
                                      label: augment.name,
                                      augmentType: augment.augmentType,
                                      minimumLevel: augment.minimumLevel
                                    }))}
                                    value={selectedId}
                                    onChange={(value) => {
                                      setSelectedAugments((current) => ({ ...current, [slot.id]: value }))
                                    }}
                                    nothingFoundMessage={
                                      allOptions.length
                                        ? 'No compatible augments match the active filters.'
                                        : 'No compatible augments are published.'
                                    }
                                  />
                                  {outsideFilters ? (
                                    <Alert color='yellow'>
                                      The selected augment is retained but does not match the active discovery filters.
                                    </Alert>
                                  ) : null}
                                  {selected ? (
                                    <Group align='flex-start' wrap='nowrap'>
                                      <ItemIcon item={selected} size={48} alt={`${selected.name} icon`} />
                                      <Box style={{ minWidth: 0 }}>
                                        <Text fw={600}>{selected.name}</Text>
                                        <Text c='dimmed' size='xs'>
                                          Minimum level {String(selected.minimumLevel)}
                                          {selected.recipes.length ? ` · ${selected.recipes[0].device}` : ''}
                                        </Text>
                                        <EffectList
                                          effects={selected.effects.map(formatEffect)}
                                          empty='No effect text published.'
                                        />
                                      </Box>
                                    </Group>
                                  ) : null}
                                </Stack>
                              </Accordion.Panel>
                            </Accordion.Item>
                          )
                        })}
                      </Accordion>
                    </Stack>
                  </Paper>
                </>
              ) : (
                <Alert color='blue' title='No item selected'>
                  Choose one item to begin configuring its published slots.
                </Alert>
              )}
            </>
          )}
        </Stack>
      </Container>
    </WorkspaceLayout>
  )
}

export default ViktraniumPage
