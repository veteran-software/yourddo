import {
  Alert,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Image,
  List,
  Loader,
  MultiSelect,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Timeline,
  Title
} from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { UnsupportedManifestSchemaError } from '../../shared/data/loadDataset.ts'
import ToolLayout from '../../shared/layout/ToolLayout.tsx'
import {
  type AltarRecipe,
  type IncrediblePotentialData,
  type IncrediblePotentialRing,
  InvalidIncrediblePotentialDataError,
  loadIncrediblePotentialData
} from './data.ts'
import {
  buildCraftingPlan,
  CyclicAltarRecipeError,
  DuplicateAltarRecipeError,
  filterItems,
  type FilterMode,
  formatEffect,
  getFilterOptions,
  getRingFilterValues,
  getRingUpgrades,
  getUpgradeFilterValues,
  InvalidCalculatedQuantityError,
  MissingAltarRecipeError,
  MissingUpgradeIngredientError,
  ringIconUrl,
  unknownIconUrl,
  validateIncrediblePotentialData
} from './incrediblePotential.logic.ts'

type DataErrorKind = 'load' | 'unsupported-schema' | 'invalid' | 'missing-dependency' | 'cycle'

type DataState =
  | { status: 'loading' }
  | { status: 'loaded'; data: IncrediblePotentialData }
  | { status: 'error'; kind: DataErrorKind; cause: unknown }

const getErrorKind = (cause: unknown): DataErrorKind => {
  if (cause instanceof UnsupportedManifestSchemaError) return 'unsupported-schema'
  if (cause instanceof CyclicAltarRecipeError) return 'cycle'
  if (cause instanceof MissingAltarRecipeError || cause instanceof MissingUpgradeIngredientError) {
    return 'missing-dependency'
  }
  if (
    cause instanceof InvalidIncrediblePotentialDataError ||
    cause instanceof DuplicateAltarRecipeError ||
    cause instanceof InvalidCalculatedQuantityError
  ) {
    return 'invalid'
  }
  return 'load'
}

const errorContent: Record<DataErrorKind, { title: string; message: string }> = {
  load: {
    title: 'Crafting data is unavailable',
    message: 'We could not load the crafting data. Check your connection and try again.'
  },
  'unsupported-schema': {
    title: 'Unsupported crafting data version',
    message: 'The published data uses a schema this version of YourDDO does not support.'
  },
  invalid: {
    title: 'Incredible Potential data is invalid',
    message: 'The published data does not match the required Incredible Potential structure.'
  },
  'missing-dependency': {
    title: 'A crafting recipe is missing',
    message: 'A required crafted ingredient does not have an Altar of Subjugation recipe.'
  },
  cycle: {
    title: 'Cyclic recipe dependency detected',
    message: 'The published recipes contain a dependency cycle and cannot be calculated safely.'
  }
}

const MaterialList = ({
  materials,
  showAcquisition = false
}: {
  materials: { name: string; quantity: number; foundIn: string[] }[]
  showAcquisition?: boolean
}) => (
  <List spacing='sm'>
    {materials.map(({ name, quantity, foundIn }) => (
      <List.Item key={name}>
        <Group component='span' gap='xs'>
          <Text component='span' size='sm'>
            {name}
          </Text>
          <Badge variant='light' color='gray' size='sm'>
            ×{quantity}
          </Badge>
        </Group>
        {showAcquisition && foundIn.length > 0 && (
          <Text c='dimmed' size='xs' mt={2}>
            Found in: {foundIn.join(', ')}
          </Text>
        )}
      </List.Item>
    ))}
  </List>
)

const ringSummary = (ring: IncrediblePotentialRing): string =>
  [...ring.enchantments.filter(({ name }) => name !== 'Incredible Potential').map(formatEffect), ring.setName].join(
    ', '
  )

const upgradeSummary = (upgrade: AltarRecipe): string => upgrade.added?.map(formatEffect).join(', ') ?? upgrade.name

const IncrediblePotentialPage = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [selectedRingName, setSelectedRingName] = useState<string | null>(null)
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<string | null>(null)
  const [ringFilters, setRingFilters] = useState<string[]>([])
  const [upgradeFilters, setUpgradeFilters] = useState<string[]>([])
  const [filterMode, setFilterMode] = useState<FilterMode>('OR')

  const data = dataState.status === 'loaded' ? dataState.data : null
  const rings = useMemo(() => data?.rings ?? [], [data])
  const upgrades = useMemo(() => (data ? getRingUpgrades(data.recipes) : []), [data])
  const selectedRing = rings.find(({ name }) => name === selectedRingName)
  const selectedUpgrade = upgrades.find(({ recipeId }) => recipeId.toString() === selectedUpgradeId)

  const ringFilterGroups = useMemo(
    () => [
      {
        group: 'Item effects',
        items: getFilterOptions(rings, (ring) => ring.enchantments.map(({ name }) => name))
      },
      {
        group: 'Item sets',
        items: getFilterOptions(rings, (ring) => [ring.setName])
      }
    ],
    [rings]
  )
  const upgradeFilterOptions = useMemo(() => getFilterOptions(upgrades, getUpgradeFilterValues), [upgrades])
  const filteredRings = useMemo(
    () => filterItems(rings, ringFilters, filterMode, getRingFilterValues),
    [filterMode, ringFilters, rings]
  )
  const filteredUpgrades = useMemo(
    () => filterItems(upgrades, upgradeFilters, filterMode, getUpgradeFilterValues),
    [filterMode, upgradeFilters, upgrades]
  )
  const planResult = useMemo(() => {
    if (!data || !selectedUpgrade) return null

    try {
      return { plan: buildCraftingPlan(selectedUpgrade, data.recipes, data.ingredients), cause: null }
    } catch (cause) {
      return { plan: null, cause }
    }
  }, [data, selectedUpgrade])

  useEffect(() => {
    let active = true

    loadIncrediblePotentialData()
      .then((loadedData) => {
        if (!active) return
        validateIncrediblePotentialData(loadedData)
        setDataState({ status: 'loaded', data: loadedData })
      })
      .catch((cause: unknown) => {
        if (!active) return
        setDataState({
          status: 'error',
          kind: getErrorKind(cause),
          cause
        })
      })

    return () => {
      active = false
    }
  }, [loadAttempt])

  const reset = () => {
    setSelectedRingName(null)
    setSelectedUpgradeId(null)
    setRingFilters([])
    setUpgradeFilters([])
    setFilterMode('OR')
  }

  const retry = () => {
    reset()
    setDataState({ status: 'loading' })
    setLoadAttempt((attempt) => attempt + 1)
  }

  return (
    <ToolLayout>
      <Stack gap={4}>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={4}>
            <Title order={1}>Incredible Potential Crafting</Title>
            <Text c='dimmed'>Tower of Despair Rings</Text>
            <Text size='sm'>Choose a ring and an upgrade effect to plan every Altar of Subjugation step.</Text>
          </Stack>
          {dataState.status === 'loaded' && (
            <Button variant='subtle' color='gray' onClick={reset}>
              Reset
            </Button>
          )}
        </Group>
      </Stack>

      {dataState.status === 'loading' ? (
        <Center mih={240} role='status' aria-live='polite'>
          <Stack gap='xs' align='center'>
            <Loader size='sm' />
            <Text c='dimmed' size='sm'>
              Loading Incredible Potential data…
            </Text>
          </Stack>
        </Center>
      ) : dataState.status === 'error' ? (
        <Alert color='red' title={errorContent[dataState.kind].title} aria-live='assertive'>
          <Stack gap='sm' align='flex-start'>
            <Text size='sm'>{errorContent[dataState.kind].message}</Text>
            {import.meta.env.DEV && (
              <Text c='dimmed' size='xs'>
                {dataState.cause instanceof Error ? dataState.cause.message : String(dataState.cause)}
              </Text>
            )}
            <Button size='sm' variant='light' onClick={retry}>
              Retry
            </Button>
          </Stack>
        </Alert>
      ) : rings.length === 0 ? (
        <Alert color='yellow' title='No Tower of Despair rings found'>
          The loaded ring dataset is empty. Try again after the data is updated.
        </Alert>
      ) : upgrades.length === 0 ? (
        <Alert color='yellow' title='No Incredible Potential upgrades found'>
          The loaded Altar of Subjugation dataset does not contain any ring upgrades.
        </Alert>
      ) : (
        <>
          <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
            <Stack gap='lg'>
              <Group justify='space-between' align='flex-end' wrap='wrap'>
                <Stack gap={4}>
                  <Text component='label' fw={500} id='filter-mode-label'>
                    Filter matching
                  </Text>
                  <Text c='dimmed' size='xs'>
                    One mode applies to both ring and upgrade filters.
                  </Text>
                </Stack>
                <SegmentedControl
                  aria-labelledby='filter-mode-label'
                  value={filterMode}
                  onChange={(value) => {
                    setFilterMode(value)
                  }}
                  data={[
                    { label: 'Match any', value: 'OR' },
                    { label: 'Match all', value: 'AND' }
                  ]}
                />
              </Group>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
                <Stack gap='xs'>
                  <Title order={2} size='h3'>
                    Base Ring
                  </Title>
                  <MultiSelect
                    label='Ring effects and item sets'
                    placeholder='Filter rings…'
                    data={ringFilterGroups}
                    value={ringFilters}
                    onChange={setRingFilters}
                    searchable
                    clearable
                  />
                  <Text c='dimmed' size='xs' role='status' aria-live='polite'>
                    {filteredRings.length} of {rings.length} rings shown.
                  </Text>
                  {filteredRings.length === 0 ? (
                    <Alert color='yellow' title='No rings match'>
                      Clear a ring filter or change the matching mode.
                    </Alert>
                  ) : (
                    <Select
                      label='Base ring'
                      placeholder='Select a ring…'
                      data={filteredRings.map((ring) => ({
                        value: ring.name,
                        label: `${ring.name} — ${ringSummary(ring)}`
                      }))}
                      value={selectedRingName}
                      onChange={setSelectedRingName}
                      searchable
                      clearable
                    />
                  )}
                </Stack>

                <Stack gap='xs'>
                  <Title order={2} size='h3'>
                    Ring Upgrade
                  </Title>
                  {!selectedRing ? (
                    <Text c='dimmed' size='sm'>
                      Select a base ring to choose its Incredible Potential effect.
                    </Text>
                  ) : (
                    <>
                      <MultiSelect
                        label='Upgrade effects'
                        placeholder='Filter upgrades…'
                        data={upgradeFilterOptions}
                        value={upgradeFilters}
                        onChange={setUpgradeFilters}
                        searchable
                        clearable
                      />
                      <Text c='dimmed' size='xs' role='status' aria-live='polite'>
                        {filteredUpgrades.length} of {upgrades.length} upgrades shown.
                      </Text>
                      {filteredUpgrades.length === 0 ? (
                        <Alert color='yellow' title='No upgrades match'>
                          Clear an upgrade filter or change the matching mode.
                        </Alert>
                      ) : (
                        <>
                          {upgradeFilters.length > 0 && filteredUpgrades.length > 1 && (
                            <Text c='dimmed' size='sm'>
                              Multiple upgrades match. Refine the filters or choose one from the list.
                            </Text>
                          )}
                          <Select
                            label='Upgrade effect'
                            placeholder='Select an effect…'
                            data={filteredUpgrades.map((upgrade) => ({
                              value: upgrade.recipeId.toString(),
                              label: `${upgradeSummary(upgrade)} — ${upgrade.name}`
                            }))}
                            value={selectedUpgradeId}
                            onChange={setSelectedUpgradeId}
                            searchable
                            clearable
                          />
                        </>
                      )}
                    </>
                  )}
                </Stack>
              </SimpleGrid>
            </Stack>
          </Paper>

          {selectedRing && (
            <Paper withBorder p={{ base: 'md', sm: 'xl' }} shadow='sm'>
              <Stack gap='lg'>
                <Group align='flex-start' wrap='wrap'>
                  <Image src={ringIconUrl} fallbackSrc={unknownIconUrl} alt='' w={72} h={72} fit='contain' />
                  <Stack gap='xs'>
                    <Title order={2}>{selectedRing.name}</Title>
                    <Group gap='xs'>
                      <Badge variant='light'>Minimum Level {selectedRing.minLevel}</Badge>
                      <Badge variant='outline'>Exclusive</Badge>
                    </Group>
                  </Stack>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
                  <Text size='sm'>Item type: {selectedRing.type}</Text>
                  <Text size='sm'>Slots: First Finger, Second Finger</Text>
                  <Text size='sm'>Ingredient type: Ring of Incredible Potential</Text>
                  <Text size='sm'>Binding: Bound to Character on Acquisition</Text>
                  <Text size='sm'>Item set: {selectedRing.setName}</Text>
                </SimpleGrid>

                <Divider />

                <Stack gap='xs'>
                  <Title order={3} size='h4'>
                    Existing Enchantments
                  </Title>
                  <List spacing='xs'>
                    {selectedRing.enchantments
                      .filter(({ name }) => name !== 'Incredible Potential')
                      .map((effect) => (
                        <List.Item key={formatEffect(effect)}>{formatEffect(effect)}</List.Item>
                      ))}
                  </List>
                </Stack>

                <Stack gap='xs'>
                  <Title order={3} size='h4'>
                    Incredible Potential Upgrade
                  </Title>
                  {selectedUpgrade ? (
                    <>
                      <Text c='dimmed' size='sm'>
                        {selectedUpgrade.name}
                      </Text>
                      <List spacing='xs'>
                        {selectedUpgrade.added?.map((effect) => (
                          <List.Item key={`${selectedUpgrade.recipeId.toString()}-${formatEffect(effect)}`}>
                            {formatEffect(effect)}
                            {effect.notes && (
                              <Text c='dimmed' size='xs'>
                                {effect.notes}
                              </Text>
                            )}
                          </List.Item>
                        ))}
                      </List>
                    </>
                  ) : (
                    <Text c='dimmed' size='sm'>
                      Incredible Potential is unresolved. Choose an upgrade effect to replace it.
                    </Text>
                  )}
                </Stack>
              </Stack>
            </Paper>
          )}

          {selectedRing && selectedUpgrade && planResult?.cause && (
            <Alert color='red' title='This recipe cannot be calculated' aria-live='assertive'>
              The published recipe dependencies are invalid. Choose another upgrade or try again after the data is
              fixed.
            </Alert>
          )}

          {selectedRing && selectedUpgrade && planResult?.plan && (
            <>
              <Paper withBorder p={{ base: 'md', sm: 'xl' }}>
                <Stack gap='lg'>
                  <Title order={2}>Total Shopping List</Title>
                  <Text c='dimmed' size='sm'>
                    The selected ring is listed directly instead of legacy Enchanted Accessory or Enchanted Weapon
                    placeholders. Medium Energy Cells are gatherable materials and are not expanded into other recipes.
                  </Text>
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing='xl'>
                    <Stack gap='sm'>
                      <Title order={3} size='h4'>
                        Bring to the Altar
                      </Title>
                      <List spacing='sm'>
                        <List.Item>
                          <Group component='span' gap='xs'>
                            <Text component='span' size='sm'>
                              {selectedRing.name}
                            </Text>
                            <Badge variant='light' color='gray' size='sm'>
                              ×1
                            </Badge>
                          </Group>
                        </List.Item>
                      </List>
                      <MaterialList materials={planResult.plan.rawMaterials} showAcquisition />
                    </Stack>

                    <Stack gap='sm'>
                      <Title order={3} size='h4'>
                        Craft Along the Way
                      </Title>
                      <MaterialList materials={planResult.plan.craftedMaterials} />
                    </Stack>
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper withBorder p={{ base: 'md', sm: 'xl' }}>
                <Stack gap='md'>
                  <Title order={2}>Crafting Steps</Title>
                  <Text c='dimmed' size='sm'>
                    The Focus, Gem, and Essence can be crafted in any order.
                  </Text>
                  <Timeline active={planResult.plan.steps.length} bulletSize={24} lineWidth={2}>
                    {planResult.plan.steps.map((step, index) => (
                      <Timeline.Item key={`${step.name}-${index.toString()}`} title={step.name}>
                        <Stack gap='xs' mt='xs'>
                          <MaterialList materials={step.requirements} />
                          {index === planResult.plan.steps.length - 1 && (
                            <Text size='sm'>Apply the upgrade to {selectedRing.name} at the Altar of Subjugation.</Text>
                          )}
                        </Stack>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Stack>
              </Paper>
            </>
          )}
        </>
      )}
    </ToolLayout>
  )
}

export default IncrediblePotentialPage
