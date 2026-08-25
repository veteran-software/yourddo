import { Alert, Badge, Button, Center, Grid, Group, Loader, Paper, Select, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import EffectList from '../../shared/items/EffectList.tsx'
import type { WorkspaceTool } from '../../shared/layout/WorkspaceLayout.tsx'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import { InvalidLgsDataError, loadLgsData } from './data.ts'
import type { LgsActiveAugment, LgsBaseItem, LgsData, LgsPlan, LgsTierAugment } from './legendaryGreenSteel.types.ts'
import {
  compatibleTierOptions,
  emptyLgsPlan,
  expandLgsRequirements,
  formatLgsEffect,
  groupLgsBaseItems,
  reconcileLgsPlan
} from './logic.ts'
import { decodeLgsPermalink, LGS_PERMALINK_QUERY_PARAMETER, validateLgsBuild } from './sharing.ts'
import CraftingBreakdownTool from './tools/CraftingBreakdownTool.tsx'
import DetailsTool from './tools/DetailsTool.tsx'
import IngredientsTool from './tools/IngredientsTool.tsx'
import ToolsTool from './tools/ToolsTool.tsx'
import { lgsWorkspaceToolDefinitions } from './workspaceTools.ts'

type DataState = { status: 'loading' } | { status: 'loaded'; data: LgsData } | { status: 'error'; cause: unknown }

const selected = <T extends { name: string }>(values: readonly T[], name: string | null): T | undefined =>
  values.find((value) => value.name === name)

const TierBadges = ({ tier }: { tier: LgsTierAugment }) => (
  <Group gap={6} wrap='wrap'>
    <Badge variant='light'>{tier.primaryFocus}</Badge>
    {tier.secondaryFocus ? (
      <Badge variant='outline' color='gray'>
        {tier.secondaryFocus}
      </Badge>
    ) : null}
    <Badge variant='outline' color='gray'>
      {tier.essence}
    </Badge>
    <Badge variant='outline' color='gray'>
      {tier.gem}
    </Badge>
  </Group>
)

const TierSelect = ({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string | null
  options: readonly LgsTierAugment[]
  onChange: (value: string | null) => void
}) => {
  const optionByName = useMemo(() => new Map(options.map((option) => [option.name, option])), [options])
  return (
    <Select
      label={`${label} upgrade`}
      placeholder='Choose focus, essence, and gem…'
      value={value}
      onChange={onChange}
      data={options.map((option) => ({
        value: option.name,
        label: option.effectsAdded.map(formatLgsEffect).join('; ')
      }))}
      searchable
      clearable
      nothingFoundMessage='No compatible augment found.'
      renderOption={({ option }) => {
        const augment = optionByName.get(option.value)
        return augment ? (
          <Stack gap={1}>
            <Text size='sm'>{option.label}</Text>
            <Text size='xs' c='dimmed'>
              {augment.primaryFocus} · {augment.essence} · {augment.gem}
            </Text>
          </Stack>
        ) : (
          option.label
        )
      }}
    />
  )
}

const TierSection = ({
  label,
  options,
  tier,
  value,
  onChange,
  titleId
}: {
  label: string
  options: readonly LgsTierAugment[]
  tier: LgsTierAugment | undefined
  value: string | null
  onChange: (value: string | null) => void
  titleId: string
}) => (
  <Paper component='section' aria-labelledby={titleId} withBorder p='md'>
    <Stack gap='sm'>
      <Title order={2} size='h3' id={titleId}>
        {label}
      </Title>
      {options.length ? (
        <TierSelect label={label} value={value} options={options} onChange={onChange} />
      ) : (
        <Alert color='yellow'>No {label} options are compatible with the current selections.</Alert>
      )}
      {tier ? (
        <>
          <TierBadges tier={tier} />
          <EffectList effects={tier.effectsAdded.map(formatLgsEffect)} empty='No published effects.' />
        </>
      ) : null}
    </Stack>
  </Paper>
)

const baseData = (items: readonly LgsBaseItem[]) =>
  groupLgsBaseItems(items).map(({ label, items: group }) => ({
    group: label,
    items: group.map(({ name }) => ({ value: name, label: name }))
  }))

const activeData = (augments: readonly LgsActiveAugment[]) =>
  [...augments]
    .sort((left, right) => left.displayName.localeCompare(right.displayName))
    .map(({ name, displayName }) => ({ value: name, label: displayName }))

const LegendaryGreenSteelPage = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [plan, setPlan] = useState<LgsPlan>(emptyLgsPlan)
  const [attempt, setAttempt] = useState(0)
  const [permalinkError, setPermalinkError] = useState<string | null>(null)
  const handledPermalink = useRef<string | null>(null)
  const permalink =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get(LGS_PERMALINK_QUERY_PARAMETER)

  useEffect(() => {
    let active = true
    loadLgsData()
      .then((data) => {
        if (active) setDataState({ status: 'loaded', data })
      })
      .catch((cause: unknown) => {
        if (active) setDataState({ status: 'error', cause })
      })
    return () => {
      active = false
    }
  }, [attempt])

  const data = dataState.status === 'loaded' ? dataState.data : undefined
  useEffect(() => {
    if (!permalink || handledPermalink.current === permalink || !data) return
    handledPermalink.current = permalink
    try {
      setPlan(validateLgsBuild(decodeLgsPermalink(permalink), data))
    } catch (cause) {
      setPermalinkError(cause instanceof Error ? cause.message : 'Invalid LGS permalink')
    }
  }, [data, permalink])
  const baseItem = data ? selected(data.baseItems, plan.baseItemName) : undefined
  const bonusEffect = data ? selected(data.bonusEffects, plan.bonusEffectName) : undefined
  const tier1Options = data ? compatibleTierOptions(data.tier1, baseItem?.ingredientType, bonusEffect) : []
  const tier2Options = data ? compatibleTierOptions(data.tier2, baseItem?.ingredientType, bonusEffect) : []
  const tier3Options = data ? compatibleTierOptions(data.tier3, baseItem?.ingredientType, bonusEffect) : []
  const tier1 = selected(tier1Options, plan.tier1Name)
  const tier2 = selected(tier2Options, plan.tier2Name)
  const tier3 = selected(tier3Options, plan.tier3Name)
  const activeAugment = data ? selected(data.activeAugments, plan.activeAugmentName) : undefined
  const hasSelection = Object.values(plan).some((value) => value !== null)
  const ingredientPlan = useMemo(
    () =>
      data
        ? expandLgsRequirements(
            [baseItem, tier1, tier2, tier3, activeAugment].flatMap((recipe) => (recipe ? [recipe] : [])),
            data.craftingComponents
          )
        : { rawMaterials: [], craftedMaterials: [] },
    [activeAugment, baseItem, data, tier1, tier2, tier3]
  )
  const tools = useMemo<readonly WorkspaceTool[]>(() => {
    if (!data) return []
    const tool = (definition: (typeof lgsWorkspaceToolDefinitions)[number], content: ReactNode): WorkspaceTool => {
      const Icon = definition.Icon
      return { id: definition.id, label: definition.label, icon: <Icon size={20} />, content }
    }
    return [
      tool(lgsWorkspaceToolDefinitions[0], <ToolsTool plan={plan} data={data} onImport={setPlan} />),
      tool(
        lgsWorkspaceToolDefinitions[1],
        <DetailsTool
          baseItem={baseItem}
          tier1={tier1}
          tier2={tier2}
          tier3={tier3}
          bonusEffect={bonusEffect}
          activeAugment={activeAugment}
        />
      ),
      tool(lgsWorkspaceToolDefinitions[2], <IngredientsTool plan={ingredientPlan} />),
      tool(
        lgsWorkspaceToolDefinitions[3],
        <CraftingBreakdownTool
          stages={[
            { label: 'Base Item', recipe: baseItem },
            { label: 'Tier 1', recipe: tier1 },
            { label: 'Tier 2', recipe: tier2 },
            { label: 'Tier 3', recipe: tier3 },
            { label: 'Active Augment', recipe: activeAugment, displayName: activeAugment?.displayName }
          ]}
          components={data.craftingComponents}
        />
      )
    ]
  }, [activeAugment, baseItem, bonusEffect, data, ingredientPlan, plan, tier1, tier2, tier3])
  const updatePlan = (change: Partial<LgsPlan>) => {
    if (!data) return
    setPlan((current) => reconcileLgsPlan(data, { ...current, ...change }))
  }
  const retry = () => {
    setDataState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  return (
    <WorkspaceLayout tools={tools}>
      <Stack gap='lg' p={{ base: 'md', sm: 'lg' }} maw={1100} mx='auto'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={4}>
            <Title order={1}>Legendary Green Steel</Title>
            <Text c='dimmed'>Plan crafting tiers, bonus effects, active augments, and materials.</Text>
          </Stack>
          <Button
            variant='subtle'
            color='gray'
            disabled={!hasSelection}
            onClick={() => {
              setPlan(emptyLgsPlan())
            }}
          >
            Reset plan
          </Button>
        </Group>

        {dataState.status === 'loading' ? (
          <Center mih={120} role='status' aria-live='polite'>
            <Stack align='center' gap='xs'>
              <Loader size='sm' />
              <Text c='dimmed' size='sm'>
                Loading Legendary Green Steel base options…
              </Text>
            </Stack>
          </Center>
        ) : null}
        {dataState.status === 'error' ? (
          <Alert
            color='red'
            title={
              dataState.cause instanceof InvalidLgsDataError
                ? 'Legendary Green Steel data is invalid'
                : 'Legendary Green Steel data is unavailable'
            }
          >
            <Stack gap='sm' align='flex-start'>
              <Text size='sm'>Crafting data could not be loaded. Try again.</Text>
              {import.meta.env.DEV && dataState.cause instanceof Error ? (
                <Text component='code' size='xs' style={{ overflowWrap: 'anywhere' }}>
                  {dataState.cause.message}
                </Text>
              ) : null}
              <Button size='sm' variant='light' onClick={retry}>
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : null}
        {data ? (
          <Stack gap='md'>
            {permalinkError ? (
              <Alert color='red' title='Build link could not be loaded'>
                {permalinkError}
              </Alert>
            ) : null}
            <Paper component='section' aria-labelledby='lgs-base-title' withBorder p='md'>
              <Stack gap='sm'>
                <Title order={2} size='h3' id='lgs-base-title'>
                  Base Item
                </Title>
                <Select
                  label='Legendary Green Steel base item'
                  placeholder='Search weapons and accessories…'
                  data={baseData(data.baseItems)}
                  value={plan.baseItemName}
                  onChange={(baseItemName) => {
                    updatePlan({ baseItemName })
                  }}
                  searchable
                  clearable
                  w='100%'
                  maw={520}
                />
                {baseItem ? (
                  <Text size='sm'>{baseItem.ingredientType}</Text>
                ) : (
                  <Text c='dimmed' size='sm'>
                    Select a Legendary Green Steel base item to begin.
                  </Text>
                )}
              </Stack>
            </Paper>

            <Grid gap='md' data-testid='lgs-tier-grid'>
              {baseItem ? (
                <>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TierSection
                      label='Tier 1'
                      titleId='lgs-tier1-title'
                      value={plan.tier1Name}
                      options={tier1Options}
                      tier={tier1}
                      onChange={(tier1Name) => {
                        updatePlan({ tier1Name })
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TierSection
                      label='Tier 2'
                      titleId='lgs-tier2-title'
                      value={plan.tier2Name}
                      options={tier2Options}
                      tier={tier2}
                      onChange={(tier2Name) => {
                        updatePlan({ tier2Name })
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TierSection
                      label='Tier 3'
                      titleId='lgs-tier3-title'
                      value={plan.tier3Name}
                      options={tier3Options}
                      tier={tier3}
                      onChange={(tier3Name) => {
                        updatePlan({ tier3Name })
                      }}
                    />
                  </Grid.Col>
                </>
              ) : (
                <Grid.Col span={12}>
                  <Paper withBorder p='md'>
                    <Text c='dimmed' size='sm'>
                      Select a base item first.
                    </Text>
                  </Paper>
                </Grid.Col>
              )}
            </Grid>

            <Grid gap='md'>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper component='section' aria-labelledby='lgs-bonus-title' withBorder p='md'>
                  <Stack gap='sm'>
                    <Title order={2} size='h3' id='lgs-bonus-title'>
                      Bonus Effect
                    </Title>
                    <Select
                      label='Bonus Effect'
                      placeholder='Search bonus effects…'
                      data={[...data.bonusEffects]
                        .sort((left, right) => left.name.localeCompare(right.name))
                        .map(({ name }) => ({ value: name, label: name }))}
                      value={plan.bonusEffectName}
                      onChange={(bonusEffectName) => {
                        updatePlan({ bonusEffectName })
                      }}
                      searchable
                      clearable
                    />
                    {bonusEffect ? <Text size='sm'>{bonusEffect.description}</Text> : null}
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper component='section' aria-labelledby='lgs-active-title' withBorder p='md'>
                  <Stack gap='sm'>
                    <Title order={2} size='h3' id='lgs-active-title'>
                      Active Augment
                    </Title>
                    <Select
                      label='Active Augment'
                      placeholder='Search active augments…'
                      data={activeData(data.activeAugments)}
                      value={plan.activeAugmentName}
                      onChange={(activeAugmentName) => {
                        updatePlan({ activeAugmentName })
                      }}
                      searchable
                      clearable
                    />
                    {activeAugment?.type ? (
                      <Text c='dimmed' size='sm'>
                        {activeAugment.type}
                      </Text>
                    ) : null}
                    {activeAugment?.description ? <Text size='sm'>{activeAugment.description}</Text> : null}
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

export default LegendaryGreenSteelPage
