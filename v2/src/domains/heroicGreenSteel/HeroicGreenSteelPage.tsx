import {
  Alert,
  Anchor,
  Button,
  Center,
  Grid,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { IconFileInfo, IconListCheck, IconListDetails } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import { EffectDetails, OptionBadges, SpellDetails } from './components/EffectDetails.tsx'
import {
  loadHeroicGreenSteelInitialData,
  loadHeroicGreenSteelTier2Data,
  loadHeroicGreenSteelTier3Data
} from './data.ts'
import type {
  HgsInitialData,
  HgsSelection,
  HgsTier2Data,
  HgsTier3Data,
  HgsTierOption
} from './heroicGreenSteel.types.ts'
import {
  applyHgsSelection,
  createHgsValidCombinations,
  emptyHgsSelection,
  getAvailableHgsOptionIds,
  resolveEffects,
  resolveSpell
} from './logic.ts'
import { toHgsSelectOptions } from './selectOptions.ts'
import BuildSummaryTool from './tools/BuildSummaryTool.tsx'
import CraftingBreakdownTool from './tools/CraftingBreakdownTool.tsx'
import IngredientsTool from './tools/IngredientsTool.tsx'

type LoadState<T> = { status: 'idle' | 'loading' } | { status: 'loaded'; data: T } | { status: 'error'; cause: unknown }

const issuesUrl =
  'https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Heroic%20Green%20Steel%22'

const Loading = ({ children }: { children: string }) => (
  <Center mih={120} role='status' aria-live='polite'>
    <Stack align='center' gap='xs'>
      <Loader size='sm' />
      <Text c='dimmed' size='sm'>
        {children}
      </Text>
    </Stack>
  </Center>
)

const LoadError = ({ message, cause, retry }: { message: string; cause: unknown; retry: () => void }) => (
  <Alert color='red' title='Crafting data is unavailable' aria-live='assertive'>
    <Stack gap='sm' align='flex-start'>
      <Text size='sm'>{message}</Text>
      {import.meta.env.DEV ? (
        <Text c='dimmed' size='xs'>
          {cause instanceof Error ? cause.message : String(cause)}
        </Text>
      ) : null}
      <Button size='sm' variant='light' onClick={retry}>
        Retry
      </Button>
    </Stack>
  </Alert>
)

const optionLabel = (option: HgsTierOption, data: HgsInitialData) => {
  return option.effectIds
    .map((id) => data.effectById.get(id)?.displayName)
    .filter(Boolean)
    .join(', ')
}

const HeroicGreenSteelPage = () => {
  const [initialState, setInitialState] = useState<LoadState<HgsInitialData>>({ status: 'loading' })
  const [tier2State, setTier2State] = useState<LoadState<HgsTier2Data>>({ status: 'idle' })
  const [tier3State, setTier3State] = useState<LoadState<HgsTier3Data>>({ status: 'idle' })
  const [initialAttempt, setInitialAttempt] = useState(0)
  const [tier2Attempt, setTier2Attempt] = useState(0)
  const [tier3Attempt, setTier3Attempt] = useState(0)
  const [selection, setSelection] = useState<HgsSelection>(emptyHgsSelection)

  const initial = initialState.status === 'loaded' ? initialState.data : null
  const tier2Data = tier2State.status === 'loaded' ? tier2State.data : null
  const tier3Data = tier3State.status === 'loaded' ? tier3State.data : null
  const baseItem = initial?.baseItemById.get(selection.selectedBaseItemId ?? -1)
  const tier1 = initial?.tier1ById.get(selection.selectedTier1Id ?? -1)
  const tier2 = tier2Data?.tier2ById.get(selection.selectedTier2Id ?? -1)
  const tier3 =
    selection.selectedTier3Mode === 'basic'
      ? tier3Data?.tier3BasicById.get(selection.selectedTier3Id ?? -1)
      : tier3Data?.tier3FocusedById.get(selection.selectedTier3Id ?? -1)
  const hasSelection = Object.values(selection).some((value) => value !== null)

  useEffect(() => {
    let active = true
    loadHeroicGreenSteelInitialData()
      .then((data) => {
        if (active) setInitialState({ status: 'loaded', data })
      })
      .catch((cause: unknown) => {
        if (active) setInitialState({ status: 'error', cause })
      })
    return () => {
      active = false
    }
  }, [initialAttempt])

  useEffect(() => {
    if (selection.selectedBaseItemId === null || tier2State.status === 'loaded') return
    let active = true
    setTier2State({ status: 'loading' })
    loadHeroicGreenSteelTier2Data()
      .then((data) => {
        if (active) setTier2State({ status: 'loaded', data })
      })
      .catch((cause: unknown) => {
        if (active) setTier2State({ status: 'error', cause })
      })
    return () => {
      active = false
    }
  }, [selection.selectedBaseItemId, tier2Attempt, tier2State.status])

  useEffect(() => {
    if (selection.selectedBaseItemId === null || tier3State.status === 'loaded') return
    let active = true
    setTier3State({ status: 'loading' })
    loadHeroicGreenSteelTier3Data()
      .then((data) => {
        if (active) setTier3State({ status: 'loaded', data })
      })
      .catch((cause: unknown) => {
        if (active) setTier3State({ status: 'error', cause })
      })
    return () => {
      active = false
    }
  }, [selection.selectedBaseItemId, tier3Attempt, tier3State.status])

  const validCombinations = useMemo(
    () =>
      initial && tier2Data && tier3Data
        ? createHgsValidCombinations(initial.tier1, tier2Data.tier2, tier3Data.tier3Basic, tier3Data.tier3Focused)
        : null,
    [initial, tier2Data, tier3Data]
  )
  const availableOptionIds = useMemo(
    () =>
      initial && validCombinations
        ? getAvailableHgsOptionIds(validCombinations, selection, initial.baseItemById)
        : null,
    [initial, selection, validCombinations]
  )
  const tier1Options = useMemo(
    () =>
      initial && baseItem
        ? initial.tier1.filter(
            (option) =>
              option.type === baseItem.type && (!availableOptionIds || availableOptionIds.tier1.has(option.id))
          )
        : [],
    [availableOptionIds, baseItem, initial]
  )
  const tier2Options = useMemo(
    () =>
      tier2Data && availableOptionIds
        ? tier2Data.tier2.filter((option) => availableOptionIds.tier2.has(option.id))
        : [],
    [availableOptionIds, tier2Data]
  )
  const basicOptions = useMemo(
    () =>
      tier3Data && availableOptionIds
        ? tier3Data.tier3Basic.filter((option) => availableOptionIds.tier3.has(option.id))
        : [],
    [availableOptionIds, tier3Data]
  )
  const focusedOptions = useMemo(
    () =>
      tier3Data && availableOptionIds
        ? tier3Data.tier3Focused.filter((option) => availableOptionIds.tier3.has(option.id))
        : [],
    [availableOptionIds, tier3Data]
  )
  const tier3Options = selection.selectedTier3Mode === 'basic' ? basicOptions : focusedOptions

  const tier1Effects = initial && tier1 ? resolveEffects(tier1.effectIds, initial.effectById) : []
  const tier2Effects = initial && tier2 ? resolveEffects(tier2.effectIds, initial.effectById) : []
  const tier3Effects = initial && tier3 ? resolveEffects(tier3.effectIds, initial.effectById) : []
  const spell = tier2Data && tier2 ? resolveSpell(tier2.spellId, tier2Data.spellById) : undefined
  const recipeIds = useMemo(
    () =>
      [baseItem?.recipeId, tier1?.recipeId, tier2?.recipeId, tier3?.recipeId].filter(
        (id): id is number => id !== undefined
      ),
    [baseItem, tier1, tier2, tier3]
  )

  const updateSelection = <K extends keyof HgsSelection>(field: K, value: HgsSelection[K]) => {
    setSelection((current) =>
      initial && validCombinations
        ? applyHgsSelection(current, field, value, validCombinations, initial.baseItemById)
        : { ...current, [field]: value }
    )
  }

  const tools = initial
    ? [
        {
          id: 'summary',
          label: 'Build Summary',
          icon: <IconFileInfo size={20} />,
          content: (
            <BuildSummaryTool
              baseItem={baseItem}
              tier1={tier1}
              tier1Effects={tier1Effects}
              tier2={tier2}
              tier2Effects={tier2Effects}
              spell={spell}
              tier3Mode={selection.selectedTier3Mode}
              tier3={tier3}
              tier3Effects={tier3Effects}
            />
          )
        },
        {
          id: 'ingredients',
          label: 'Ingredients',
          icon: <IconListCheck size={20} />,
          content: <IngredientsTool recipeIds={recipeIds} />
        },
        {
          id: 'breakdown',
          label: 'Crafting Breakdown',
          icon: <IconListDetails size={20} />,
          content: <CraftingBreakdownTool recipeIds={recipeIds} devices={initial.manifest.devices} />
        }
      ]
    : []

  return (
    <WorkspaceLayout tools={tools}>
      <Stack gap='lg' p={{ base: 'md', sm: 'lg' }} maw={1100} mx='auto'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={4}>
            <Title order={1}>Heroic Green Steel Crafting</Title>
            <Text c='dimmed'>Build a Heroic Green Steel item through each Shroud altar.</Text>
            <Anchor href={issuesUrl} target='_blank' rel='noreferrer' size='sm'>
              Known issues / bug reports
            </Anchor>
          </Stack>
          <Button
            variant='subtle'
            color='gray'
            disabled={!hasSelection}
            onClick={() => {
              setSelection(emptyHgsSelection)
            }}
          >
            Reset build
          </Button>
        </Group>

        {initialState.status === 'loading' ? (
          <Loading>Loading Heroic Green Steel base options…</Loading>
        ) : initialState.status === 'error' ? (
          <LoadError
            message='We could not load the Heroic Green Steel catalog. Check your connection and try again.'
            cause={initialState.cause}
            retry={() => {
              setSelection(emptyHgsSelection)
              setInitialState({ status: 'loading' })
              setInitialAttempt((value) => value + 1)
            }}
          />
        ) : initial ? (
          <Stack gap='md'>
            <Paper component='section' aria-labelledby='hgs-base-title' withBorder p='md'>
              <Stack gap='sm'>
                <Title order={2} size='h3' id='hgs-base-title'>
                  1. Base Item
                </Title>
                <Select
                  label='Green Steel base item'
                  placeholder='Search weapons and equipment…'
                  searchable
                  clearable
                  w='100%'
                  maw={520}
                  data={[
                    {
                      group: 'Weapons',
                      items: toHgsSelectOptions(
                        initial.baseItems.filter(({ type }) => type === 'weapon'),
                        (item) => item.name
                      )
                    },
                    {
                      group: 'Equipment',
                      items: toHgsSelectOptions(
                        initial.baseItems.filter(({ type }) => type === 'equipment'),
                        (item) => item.name
                      )
                    }
                  ]}
                  value={selection.selectedBaseItemId?.toString() ?? null}
                  onChange={(value) => {
                    updateSelection('selectedBaseItemId', value ? Number(value) : null)
                  }}
                />
                {baseItem ? (
                  <Text size='sm'>{baseItem.description}</Text>
                ) : (
                  <Text c='dimmed' size='sm'>
                    Select a Green Steel base item to begin.
                  </Text>
                )}
              </Stack>
            </Paper>

            <Grid gap='md' data-testid='hgs-tier-grid'>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper component='section' aria-labelledby='hgs-tier1-title' withBorder p='md'>
                  <Stack gap='sm'>
                    <Title order={2} size='h3' id='hgs-tier1-title'>
                      2. Tier 1
                    </Title>
                    {!baseItem ? (
                      <Text c='dimmed' size='sm'>
                        Select a base item first.
                      </Text>
                    ) : tier1Options.length === 0 ? (
                      <Alert color='yellow'>No compatible Tier 1 options were published for this item.</Alert>
                    ) : (
                      <Select
                        label='Tier 1 upgrade'
                        placeholder='Choose focus, essence, and gem…'
                        searchable
                        clearable
                        data={toHgsSelectOptions(tier1Options, (option) => optionLabel(option, initial))}
                        value={selection.selectedTier1Id?.toString() ?? null}
                        onChange={(value) => {
                          updateSelection('selectedTier1Id', value ? Number(value) : null)
                        }}
                      />
                    )}
                    {tier1 ? (
                      <>
                        <OptionBadges option={tier1} />
                        <EffectDetails effects={tier1Effects} />
                      </>
                    ) : null}
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper component='section' aria-labelledby='hgs-tier2-title' withBorder p='md'>
                  <Stack gap='sm'>
                    <Title order={2} size='h3' id='hgs-tier2-title'>
                      3. Tier 2
                    </Title>
                    {!baseItem ? (
                      <Text c='dimmed' size='sm'>
                        Select a base item first.
                      </Text>
                    ) : tier2State.status === 'loading' ||
                      tier2State.status === 'idle' ||
                      tier3State.status === 'loading' ||
                      tier3State.status === 'idle' ? (
                      <Loading>Loading Tier 2 upgrades and spells…</Loading>
                    ) : tier2State.status === 'error' ? (
                      <LoadError
                        message='Tier 2 upgrades could not be loaded.'
                        cause={tier2State.cause}
                        retry={() => {
                          setTier2State({ status: 'loading' })
                          setTier2Attempt((value) => value + 1)
                        }}
                      />
                    ) : tier3State.status === 'error' ? (
                      <Alert color='yellow'>Tier 2 compatibility is unavailable until Tier 3 data loads.</Alert>
                    ) : tier2Options.length === 0 ? (
                      <Alert color='yellow'>No Tier 2 options are compatible with the current selections.</Alert>
                    ) : (
                      <Select
                        label='Tier 2 upgrade'
                        placeholder='Choose a compatible upgrade…'
                        searchable
                        clearable
                        data={toHgsSelectOptions(tier2Options, (option) => optionLabel(option, initial))}
                        value={selection.selectedTier2Id?.toString() ?? null}
                        onChange={(value) => {
                          updateSelection('selectedTier2Id', value ? Number(value) : null)
                        }}
                      />
                    )}
                    {tier2 ? (
                      <>
                        <OptionBadges option={tier2} />
                        <EffectDetails effects={tier2Effects} />
                        {spell ? (
                          <Paper withBorder p='sm'>
                            <SpellDetails spell={spell} />
                          </Paper>
                        ) : (
                          <Text c='dimmed' size='sm'>
                            No associated spell.
                          </Text>
                        )}
                      </>
                    ) : null}
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={12}>
                <Paper component='section' aria-labelledby='hgs-tier3-title' withBorder p='md'>
                  <Stack gap='sm'>
                    <Title order={2} size='h3' id='hgs-tier3-title'>
                      4. Tier 3
                    </Title>
                    {!baseItem ? (
                      <Text c='dimmed' size='sm'>
                        Select a base item first.
                      </Text>
                    ) : tier3State.status === 'loading' ||
                      tier3State.status === 'idle' ||
                      tier2State.status === 'loading' ||
                      tier2State.status === 'idle' ? (
                      <Loading>Loading Tier 3 upgrades…</Loading>
                    ) : tier3State.status === 'error' ? (
                      <LoadError
                        message='Tier 3 upgrades could not be loaded.'
                        cause={tier3State.cause}
                        retry={() => {
                          setTier3State({ status: 'loading' })
                          setTier3Attempt((value) => value + 1)
                        }}
                      />
                    ) : tier2State.status === 'error' ? (
                      <Alert color='yellow'>Tier 3 compatibility is unavailable until Tier 2 data loads.</Alert>
                    ) : (
                      <>
                        <SegmentedControl
                          aria-label='Tier 3 mode'
                          value={selection.selectedTier3Mode ?? ''}
                          onChange={(value) => {
                            if (value === 'basic' || value === 'focused') updateSelection('selectedTier3Mode', value)
                          }}
                          data={[
                            { label: 'Basic', value: 'basic' },
                            { label: 'Focused', value: 'focused' }
                          ]}
                          fullWidth
                        />
                        {!selection.selectedTier3Mode ? (
                          <Text c='dimmed' size='sm'>
                            Choose Basic or Focused to see compatible Tier 3 upgrades.
                          </Text>
                        ) : tier3Options.length === 0 ? (
                          <Alert color='yellow'>No compatible Tier 3 options were published for this mode.</Alert>
                        ) : (
                          <Select
                            label={`Tier 3 ${selection.selectedTier3Mode === 'basic' ? 'Basic' : 'Focused'} upgrade`}
                            placeholder='Choose a final upgrade…'
                            searchable
                            clearable
                            data={toHgsSelectOptions(tier3Options, (option) => optionLabel(option, initial))}
                            value={selection.selectedTier3Id?.toString() ?? null}
                            onChange={(value) => {
                              updateSelection('selectedTier3Id', value ? Number(value) : null)
                            }}
                          />
                        )}
                      </>
                    )}
                    {tier3 ? (
                      <>
                        <OptionBadges option={tier3} />
                        <EffectDetails effects={tier3Effects} />
                      </>
                    ) : null}
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        ) : null}
      </Stack>
    </WorkspaceLayout>
  )
}

export default HeroicGreenSteelPage
