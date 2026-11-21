import { createCraftingSelection } from '../../shared/layout/craftingSession'
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Center,
  Checkbox,
  Grid,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { IconCrown } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import BonusDetails from './BonusDetails.tsx'
import DiscrepancyList from './DiscrepancyList.tsx'
import EffectList from '../../shared/items/EffectList.tsx'
import WorkspaceHeader from '../../shared/layout/WorkspaceHeader'
import styles from '../../shared/layout/workspace.module.css'
import type { WorkspaceTool } from '../../shared/layout/WorkspaceLayout.tsx'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import { InvalidLgsDataError, loadLgsData } from './data.ts'
import type { LgsActiveAugment, LgsBaseItem, LgsData, LgsPlan, LgsTierAugment } from './legendaryGreenSteel.types.ts'
import {
  getLgsOptions,
  weaponBonusResult,
  reconcileLgsPlan,
  fitsSlot,
  emptyLgsPlan,
  expandLgsRequirements,
  groupLgsBaseItems
} from './logic.ts'
import { decodeLgsPermalink, LGS_PERMALINK_QUERY_PARAMETER, validateLgsBuild } from './sharing.ts'
import CraftingBreakdownTool from './tools/CraftingBreakdownTool.tsx'
import DetailsTool from './tools/DetailsTool.tsx'
import IngredientsTool from './tools/IngredientsTool.tsx'
import SharingTool from './tools/SharingTool.tsx'
import { lgsWorkspaceToolDefinitions } from './workspaceTools.ts'

type DataState = { status: 'loading' } | { status: 'loaded'; data: LgsData } | { status: 'error'; cause: unknown }

const selected = <T extends { name: string }>(values: readonly T[] | undefined, name: string | null): T | undefined =>
  values?.find((value) => value.name === name)

const TierBadges = ({ tier }: { tier: LgsTierAugment }) => (
  <Group gap={6} wrap='wrap'>
    {tier.focuses.map((focus, index) => (
      <Badge key={index} variant='light'>
        {focus}
      </Badge>
    ))}
    <Badge variant='outline' color='gray'>
      {tier.essence}
    </Badge>
    <Badge variant='outline' color='gray'>
      {tier.gem}
    </Badge>
  </Group>
)

const focusLabel = (tier: LgsTierAugment) => [tier.focuses.join(' / '), tier.essence, tier.gem].join(' · ')

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
        label: `${option.effects.join('; ') || option.name} · ${focusLabel(option)}`
      }))}
      searchable
      clearable
      nothingFoundMessage='No compatible augment found.'
      renderOption={({ option }) => {
        const augment = optionByName.get(option.value)
        return augment ? (
          <Stack gap={1}>
            <Text size='sm'>{augment.effects.join('; ') || augment.name}</Text>
            <Text size='xs' c='dimmed'>
              {focusLabel(augment)}
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
  <Paper className={styles.surface} component='section' aria-labelledby={titleId} withBorder p='md'>
    <Stack gap='sm'>
      <Title order={2} size='h3' id={titleId}>
        {label}
      </Title>
      {options.length ? (
        <TierSelect label={label} value={value} options={options} onChange={onChange} />
      ) : (
        <Alert color='yellow'>No {label} options are compatible with the current selections.</Alert>
      )}
      {tier && (
        <>
          <TierBadges tier={tier} />
          <EffectList effects={[...tier.effects, ...tier.details]} empty='No published effects.' />
          <DiscrepancyList notes={tier.discrepancies} />
        </>
      )}
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

const bonusPlaceholders = { equipment: 'Search equipment sets…', weapon: 'Search weapon bonuses…' } as const

const usePlan = createCraftingSelection<LgsPlan>(emptyLgsPlan)

const LegendaryGreenSteelPage = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [plan, setPlan] = usePlan()
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
  }, [data, permalink, setPlan])
  const baseItem = selected(data?.baseItems, plan.baseItemName)
  const bonusEffect = selected(data?.bonusEffects, plan.bonusEffectName)
  const options = data ? getLgsOptions(data, plan, baseItem) : undefined
  const weaponResult = data ? weaponBonusResult(data, plan) : undefined
  const heart = plan.useImmortalsHeart ? data?.immortalsHeart : undefined
  const tier1 = selected(data?.tier1, plan.tier1Name)
  const tier2 = selected(data?.tier2, plan.tier2Name)
  const tier3 = selected(data?.tier3, plan.tier3Name)
  const activeAugment = selected(data?.activeAugments, plan.activeAugmentName)
  const hasSelection = Object.values(plan).some((value) => value !== null)
  const ingredientPlan = useMemo(
    () =>
      data
        ? expandLgsRequirements(
            [baseItem, tier1, tier2, tier3, activeAugment, heart].flatMap((recipe) => (recipe ? [recipe] : [])),
            data.craftingComponents
          )
        : { rawMaterials: [], craftedMaterials: [] },
    [activeAugment, baseItem, heart, data, tier1, tier2, tier3]
  )
  const tools = useMemo<readonly WorkspaceTool[]>(() => {
    if (!data) return []
    const tool = (definition: (typeof lgsWorkspaceToolDefinitions)[number], content: ReactNode): WorkspaceTool => {
      const Icon = definition.Icon
      return { id: definition.id, label: definition.label, icon: <Icon size={20} />, content }
    }
    return [
      tool(lgsWorkspaceToolDefinitions[0], <SharingTool plan={plan} data={data} onImport={setPlan} />),
      tool(
        lgsWorkspaceToolDefinitions[1],
        <DetailsTool
          baseItem={baseItem}
          tier1={tier1}
          tier2={tier2}
          tier3={tier3}
          bonusEffect={bonusEffect}
          weaponResult={weaponResult}
          activeAugment={activeAugment}
          heart={heart?.name}
        />
      ),
      tool(
        lgsWorkspaceToolDefinitions[2],
        <IngredientsTool components={data.craftingComponents} plan={ingredientPlan} />
      ),
      tool(
        lgsWorkspaceToolDefinitions[3],
        <CraftingBreakdownTool
          stages={[
            { label: 'Base Item', recipe: baseItem },
            { label: 'Tier 1', recipe: tier1 },
            { label: 'Tier 2', recipe: tier2 },
            { label: 'Tier 3', recipe: tier3 },
            { label: 'Active Augment', recipe: activeAugment, displayName: activeAugment?.displayName },
            { label: 'Cleansing', recipe: heart }
          ]}
          components={data.craftingComponents}
        />
      )
    ]
  }, [
    activeAugment,
    baseItem,
    heart,
    bonusEffect,
    weaponResult,
    data,
    ingredientPlan,
    plan,
    tier1,
    tier2,
    tier3,
    setPlan
  ])
  const updatePlan = <Field extends keyof LgsPlan>(field: Field, value: LgsPlan[Field]) => {
    if (!data) return
    setPlan((current) => reconcileLgsPlan(data, { ...current, [field]: value }))
  }
  const retry = () => {
    setDataState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  return (
    <WorkspaceLayout tools={tools}>
      <Stack gap='lg' p={{ base: 'md', sm: 'lg' }} maw={1100} mx='auto'>
        <WorkspaceHeader
          title='Legendary Green Steel'
          icon={IconCrown}
          description='Plan crafting tiers, bonus effects, active augments, and materials.'
          actions={
            <>
              <Anchor
                size='sm'
                href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Legendary%20Green%20Steel%22'
                target='_blank'
                rel='noreferrer'
              >
                Known issues and bug reports ↗
              </Anchor>
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
            </>
          }
        />

        {dataState.status === 'loading' && (
          <Center mih={120} role='status' aria-live='polite'>
            <Stack align='center' gap='xs'>
              <Loader size='sm' />
              <Text c='dimmed' size='sm'>
                Loading Legendary Green Steel crafting data…
              </Text>
            </Stack>
          </Center>
        )}
        {dataState.status === 'error' && (
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
              {import.meta.env.DEV && dataState.cause instanceof Error && (
                <Text component='code' size='xs' style={{ overflowWrap: 'anywhere' }}>
                  {dataState.cause.message}
                </Text>
              )}
              <Button size='sm' variant='light' onClick={retry}>
                Retry
              </Button>
            </Stack>
          </Alert>
        )}
        {data && (
          <Stack gap='md'>
            {permalinkError && (
              <Alert color='red' title='Build link could not be loaded'>
                {permalinkError}
              </Alert>
            )}
            <Paper className={styles.surface} component='section' aria-labelledby='lgs-base-title' withBorder p='md'>
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
                    updatePlan('baseItemName', baseItemName)
                  }}
                  searchable
                  clearable
                  w='100%'
                  maw={520}
                />
                {baseItem ? (
                  <Text size='sm'>{baseItem.type === 'weapon' ? 'Weapon' : 'Accessory'}</Text>
                ) : (
                  <Text c='dimmed' size='sm'>
                    Select a Legendary Green Steel base item to begin.
                  </Text>
                )}
                {fitsSlot(baseItem, data.immortalsHeart) && (
                  <Checkbox
                    label={`Cleanse with ${data.immortalsHeart.name}`}
                    checked={Boolean(heart)}
                    onChange={(event) => {
                      updatePlan('useImmortalsHeart', event.currentTarget.checked || undefined)
                    }}
                  />
                )}
                {baseItem && <DiscrepancyList notes={baseItem.discrepancies} />}
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
                      options={options?.tier1 ?? []}
                      tier={tier1}
                      onChange={(tier1Name) => {
                        updatePlan('tier1Name', tier1Name)
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TierSection
                      label='Tier 2'
                      titleId='lgs-tier2-title'
                      value={plan.tier2Name}
                      options={options?.tier2 ?? []}
                      tier={tier2}
                      onChange={(tier2Name) => {
                        updatePlan('tier2Name', tier2Name)
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TierSection
                      label='Tier 3'
                      titleId='lgs-tier3-title'
                      value={plan.tier3Name}
                      options={options?.tier3 ?? []}
                      tier={tier3}
                      onChange={(tier3Name) => {
                        updatePlan('tier3Name', tier3Name)
                      }}
                    />
                  </Grid.Col>
                </>
              ) : (
                <Grid.Col span={12}>
                  <Paper className={styles.surface} withBorder p='md'>
                    <Text c='dimmed' size='sm'>
                      Select a base item first.
                    </Text>
                  </Paper>
                </Grid.Col>
              )}
            </Grid>

            <Grid gap='md'>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper
                  className={styles.surface}
                  component='section'
                  aria-labelledby='lgs-bonus-title'
                  withBorder
                  h='100%'
                  p='md'
                >
                  <Stack gap='md'>
                    <Title order={2} size='h3' id='lgs-bonus-title'>
                      Bonus Effect
                    </Title>
                    <Select
                      aria-labelledby='lgs-bonus-title'
                      placeholder={baseItem ? bonusPlaceholders[baseItem.type] : 'Search bonuses…'}
                      data={(['Weapon bonuses', 'Equipment sets'] as const)
                        .map((group) => ({
                          group,
                          items: (options?.bonuses ?? [])
                            .filter((b) => b.group === group)
                            .map((b) => b.name)
                            .sort((left, right) => left.localeCompare(right))
                        }))
                        .filter((group) => group.items.length)}
                      value={plan.bonusEffectName}
                      onChange={(bonusEffectName) => {
                        updatePlan('bonusEffectName', bonusEffectName)
                      }}
                      searchable
                      clearable
                    />
                    {weaponResult && (
                      <Text size='sm' role='status'>
                        {weaponResult}
                      </Text>
                    )}
                    {bonusEffect && <BonusDetails key={bonusEffect.name} bonus={bonusEffect} />}
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper
                  className={styles.surface}
                  component='section'
                  aria-labelledby='lgs-active-title'
                  withBorder
                  h='100%'
                  p='md'
                >
                  <Stack gap='md'>
                    <Title order={2} size='h3' id='lgs-active-title'>
                      Active Augment
                    </Title>
                    <Select
                      aria-labelledby='lgs-active-title'
                      placeholder='Search active augments…'
                      data={activeData(data.activeAugments.filter((a) => !baseItem || fitsSlot(baseItem, a)))}
                      value={plan.activeAugmentName}
                      onChange={(activeAugmentName) => {
                        updatePlan('activeAugmentName', activeAugmentName)
                      }}
                      searchable
                      clearable
                    />
                    {activeAugment?.spellDetails && (
                      <Text c='dimmed' size='sm'>
                        {activeAugment.spellDetails}
                      </Text>
                    )}
                    {activeAugment?.description && (
                      <Text size='sm' style={{ whiteSpace: 'pre-line' }}>
                        {activeAugment.description}
                      </Text>
                    )}
                    {activeAugment && <DiscrepancyList notes={activeAugment.discrepancies} />}
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        )}
      </Stack>
    </WorkspaceLayout>
  )
}

export default LegendaryGreenSteelPage
