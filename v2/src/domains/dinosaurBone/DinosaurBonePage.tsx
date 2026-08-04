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
import { IconFileInfo, IconListCheck, IconListDetails } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import AugmentSelect from '../../shared/augments/AugmentSelect.tsx'
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
  DinosaurBoneEffect,
  DinosaurBoneRequirement,
  FinishedDinosaurBoneItem,
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
  getColorAugmentMinimumLevelIncrease,
  getCompatibleAugments,
  getEffectNames,
  getFamilyLabel,
  getFilterOptions,
  getItemsForFamily,
  getSelectedAugments,
  isAbilityScoreEffect,
  isArtifactItem,
  isColorSlot,
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

const ArtifactAbilityScoreNotice = ({
  item,
  effects
}: {
  item: ClassifiedDinosaurBoneItem
  effects: readonly DinosaurBoneEffect[]
}) => {
  const abilityScores = [
    ...new Set(
      effects
        .filter(isAbilityScoreEffect)
        .map(({ name }) => name.split(' +')[0])
        .filter((name): name is string => Boolean(name))
    )
  ]
  if (!isArtifactItem(item) || abilityScores.length === 0) return null

  return (
    <Alert
      color='yellow'
      variant='light'
      title='Artifact ability score bonus'
      role='status'
      p='xs'
      styles={{ title: { fontSize: 'var(--mantine-font-size-sm)' } }}
    >
      <Text size='xs'>
        This {item.artifactType} Artifact increases {abilityScores.join(', ')} by 1. The adjusted value is shown below.
      </Text>
    </Alert>
  )
}

const ColorAugmentLevelNotice = ({
  item,
  slots
}: {
  item: ClassifiedDinosaurBoneItem
  slots: FinishedDinosaurBoneItem['slots']
}) => {
  const increase = getColorAugmentMinimumLevelIncrease(item, slots)
  if (!increase) return null

  return (
    <Alert
      color='blue'
      variant='light'
      title='Color augment minimum level'
      role='status'
      p='xs'
      styles={{ title: { fontSize: 'var(--mantine-font-size-sm)' } }}
    >
      <Text size='xs'>
        A selected color augment raises the item’s minimum level from {String(increase.itemLevel)} to{' '}
        {String(increase.minimumLevel)}.
      </Text>
    </Alert>
  )
}

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
          <Group gap='xs'>
            <Badge variant='light'>{getFamilyLabel(item.family)}</Badge>
            {isArtifactItem(item) ? (
              <Badge variant='light' color='grape'>
                {item.artifactType} Artifact
              </Badge>
            ) : null}
          </Group>
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
  const selectedUpgradeEffects = finished.slots.flatMap(({ augment }) => augment?.effectsAdded ?? [])
  const minimumLevelIncrease = getColorAugmentMinimumLevelIncrease(finished.item, finished.slots)
  const displayedMinimumLevel = minimumLevelIncrease?.minimumLevel ?? finished.item.minLevel
  return (
    <Stack gap='md' p='md'>
      <Box>
        <Title order={3} style={{ overflowWrap: 'anywhere' }}>
          {finished.item.name}
        </Title>
        <Text c='dimmed' size='sm'>
          {finished.item.type}
          {displayedMinimumLevel !== undefined ? ` · Minimum level ${String(displayedMinimumLevel)}` : ''}
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
        <Stack gap='xs'>
          <ArtifactAbilityScoreNotice item={finished.item} effects={selectedUpgradeEffects} />
          <ColorAugmentLevelNotice item={finished.item} slots={finished.slots} />
        </Stack>
        {finished.slots.some(({ augment }) => augment) ? (
          <Stack
            gap='md'
            mt={
              (isArtifactItem(finished.item) && selectedUpgradeEffects.some(isAbilityScoreEffect)) ||
              minimumLevelIncrease
                ? 'sm'
                : 0
            }
          >
            {finished.slots
              .filter(({ augment }) => augment)
              .map(({ slot, augment }) => (
                <Box key={slot.id}>
                  <Text fw={600} size='sm' style={{ overflowWrap: 'anywhere' }}>
                    {slot.label}: {augment?.name}
                  </Text>
                  <EffectList
                    effects={(augment?.effectsAdded ?? []).map((effect) =>
                      formatEffect(adjustEffectForArtifact(effect, finished.item))
                    )}
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

const RequirementList = ({ requirements }: { requirements: readonly DinosaurBoneRequirement[] }) => {
  if (requirements.length === 0) {
    return (
      <Text c='dimmed' size='xs'>
        No published crafting requirements.
      </Text>
    )
  }

  return (
    <List spacing='xs' size='sm'>
      {requirements.map((requirement, index) => (
        <List.Item key={`${requirement.name}-${String(index)}`}>
          <Group component='span' justify='space-between' align='flex-start' wrap='nowrap'>
            <Box component='span' style={{ minWidth: 0 }}>
              <Text component='span' size='sm' style={{ overflowWrap: 'anywhere' }}>
                {requirement.name}
              </Text>
              {requirement.foundIn?.map((location) => (
                <Text component='span' display='block' c='dimmed' size='xs' key={location}>
                  {location}
                </Text>
              ))}
            </Box>
            <Badge component='span' variant='light' color='gray'>
              ×{String(requirement.quantity)}
            </Badge>
          </Group>
          {requirement.requirements && requirement.requirements.length > 0 ? (
            <Box mt='xs' ml='sm'>
              <Text c='dimmed' size='xs' mb={4}>
                Component requirements
              </Text>
              <RequirementList requirements={requirement.requirements} />
            </Box>
          ) : null}
        </List.Item>
      ))}
    </List>
  )
}

const CraftingBreakdownTool = ({ finished }: { finished: FinishedDinosaurBoneItem }) => {
  if (!finished.item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review individual crafting requirements.
      </Alert>
    )
  }

  const recipes = [
    {
      id: 'base-item',
      name: finished.item.name,
      label: 'Base item',
      requirements: finished.item.requirements,
      craftedIn: finished.item.craftedIn
    },
    ...finished.slots.flatMap(({ slot, augment }) =>
      augment && (augment.requirements.length > 0 || augment.craftedIn)
        ? [
            {
              id: slot.id,
              name: augment.name,
              label: slot.label,
              requirements: augment.requirements,
              craftedIn: augment.craftedIn
            }
          ]
        : []
    )
  ]

  return (
    <Stack gap='md' p='md'>
      <Text size='sm'>Requirements are kept separate for each crafted part of this build.</Text>
      {recipes.map((recipe) => (
        <Paper component='section' aria-label={`${recipe.name} requirements`} withBorder p='sm' key={recipe.id}>
          <Stack gap='xs'>
            <Group justify='space-between' align='flex-start' wrap='nowrap'>
              <Title order={4} size='h5' style={{ overflowWrap: 'anywhere' }}>
                {recipe.name}
              </Title>
              <Badge variant='light' color={recipe.id === 'base-item' ? 'blue' : 'gray'}>
                {recipe.label}
              </Badge>
            </Group>
            {recipe.craftedIn ? (
              <Text c='dimmed' size='xs'>
                Crafted at {recipe.craftedIn}
              </Text>
            ) : null}
            <RequirementList requirements={recipe.requirements} />
          </Stack>
        </Paper>
      ))}
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
