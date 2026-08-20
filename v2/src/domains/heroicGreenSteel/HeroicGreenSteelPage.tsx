import {
  Alert,
  Anchor,
  Button,
  Center,
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
  HgsTier3Mode,
  HgsTierOption
} from './heroicGreenSteel.types.ts'
import {
  emptyHgsSelection,
  getCompatibleTier1,
  getCompatibleTier2,
  getCompatibleTier3Basic,
  getCompatibleTier3Focused,
  resolveEffects,
  resolveSpell,
  selectBaseItem,
  selectTier1,
  selectTier2,
  selectTier3Mode
} from './logic.ts'
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
  const effects = option.effectIds
    .map((id) => data.effectById.get(id)?.displayName)
    .filter(Boolean)
    .join(', ')
  return `${option.focus} · ${option.essence} · ${option.gem}${option.aspect ? ` · ${option.aspect}` : ''}${effects ? ` — ${effects}` : ''}`
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
    if (selection.selectedTier1Id === null || tier2State.status === 'loaded') return
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
  }, [selection.selectedTier1Id, tier2Attempt, tier2State.status])

  useEffect(() => {
    if (selection.selectedTier2Id === null || tier3State.status === 'loaded') return
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
  }, [selection.selectedTier2Id, tier3Attempt, tier3State.status])

  const tier1Options = useMemo(
    () => (initial && baseItem ? getCompatibleTier1(initial.tier1, baseItem) : []),
    [baseItem, initial]
  )
  const tier2Options = useMemo(
    () => (tier2Data && tier1 ? getCompatibleTier2(tier2Data.tier2, tier1) : []),
    [tier1, tier2Data]
  )
  const basicOptions = useMemo(
    () => (tier3Data && tier2 ? getCompatibleTier3Basic(tier3Data.tier3Basic, tier2) : []),
    [tier2, tier3Data]
  )
  const focusedOptions = useMemo(
    () => (tier3Data && tier2 ? getCompatibleTier3Focused(tier3Data.tier3Focused, tier2) : []),
    [tier2, tier3Data]
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

  const setTier3Mode = (mode: HgsTier3Mode) => {
    const options = mode === 'basic' ? basicOptions : focusedOptions
    setSelection((current) => selectTier3Mode(current, mode, new Set(options.map(({ id }) => id))))
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
            disabled={!baseItem}
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
                  data={[
                    {
                      group: 'Weapons',
                      items: initial.baseItems
                        .filter(({ type }) => type === 'weapon')
                        .map((item) => ({
                          value: item.id.toString(),
                          label: `${item.name} — ${item.weaponType ?? 'Weapon'}`
                        }))
                    },
                    {
                      group: 'Equipment',
                      items: initial.baseItems
                        .filter(({ type }) => type === 'equipment')
                        .map((item) => ({
                          value: item.id.toString(),
                          label: item.name
                        }))
                    }
                  ]}
                  value={selection.selectedBaseItemId?.toString() ?? null}
                  onChange={(value) => {
                    setSelection((current) => selectBaseItem(current, value ? Number(value) : null))
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

            <Text c='dimmed' ta='center' aria-hidden>
              ↓
            </Text>
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
                    data={tier1Options.map((option) => ({
                      value: option.id.toString(),
                      label: optionLabel(option, initial)
                    }))}
                    value={selection.selectedTier1Id?.toString() ?? null}
                    onChange={(value) => {
                      setSelection((current) => selectTier1(current, value ? Number(value) : null))
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

            <Text c='dimmed' ta='center' aria-hidden>
              ↓
            </Text>
            <Paper component='section' aria-labelledby='hgs-tier2-title' withBorder p='md'>
              <Stack gap='sm'>
                <Title order={2} size='h3' id='hgs-tier2-title'>
                  3. Tier 2
                </Title>
                {!tier1 ? (
                  <Text c='dimmed' size='sm'>
                    Select a Tier 1 upgrade first.
                  </Text>
                ) : tier2State.status === 'loading' || tier2State.status === 'idle' ? (
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
                ) : tier2Options.length === 0 ? (
                  <Alert color='yellow'>No compatible Tier 2 options were published for this Tier 1 focus.</Alert>
                ) : (
                  <Select
                    label='Tier 2 upgrade'
                    placeholder='Choose a compatible upgrade…'
                    searchable
                    clearable
                    data={tier2Options.map((option) => ({
                      value: option.id.toString(),
                      label: optionLabel(option, initial)
                    }))}
                    value={selection.selectedTier2Id?.toString() ?? null}
                    onChange={(value) => {
                      setSelection((current) => selectTier2(current, value ? Number(value) : null))
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

            <Text c='dimmed' ta='center' aria-hidden>
              ↓
            </Text>
            <Paper component='section' aria-labelledby='hgs-tier3-title' withBorder p='md'>
              <Stack gap='sm'>
                <Title order={2} size='h3' id='hgs-tier3-title'>
                  4. Tier 3
                </Title>
                {!tier2 ? (
                  <Text c='dimmed' size='sm'>
                    Select a Tier 2 upgrade first.
                  </Text>
                ) : tier3State.status === 'loading' || tier3State.status === 'idle' ? (
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
                ) : (
                  <>
                    <SegmentedControl
                      aria-label='Tier 3 mode'
                      value={selection.selectedTier3Mode ?? ''}
                      onChange={(value) => {
                        if (value === 'basic' || value === 'focused') setTier3Mode(value)
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
                        data={tier3Options.map((option) => ({
                          value: option.id.toString(),
                          label: optionLabel(option, initial)
                        }))}
                        value={selection.selectedTier3Id?.toString() ?? null}
                        onChange={(value) => {
                          setSelection((current) => ({ ...current, selectedTier3Id: value ? Number(value) : null }))
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
          </Stack>
        ) : null}
      </Stack>
    </WorkspaceLayout>
  )
}

export default HeroicGreenSteelPage
