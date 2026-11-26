import { ActionIcon, Alert, Anchor, Button, Center, Group, List, Loader, Modal, Stack, Tabs, Text } from '@mantine/core'
import { IconSparkles, IconBasket, IconShare, IconListDetails, IconQuestionMark, IconSearch } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import WorkspaceHeader from '../../shared/layout/WorkspaceHeader'
import layout from '../../shared/layout/PlannerWorkspace.module.css'
import WorkspaceLayout, { type WorkspaceTool } from '../../shared/layout/WorkspaceLayout.tsx'
import { InvalidEssenceCraftingDataError, loadEssenceCraftingData } from './data.ts'
import { EQUIPMENT_SLOTS, type EquipmentSlotId } from './equipment.ts'
import type { EssenceCraftingData } from './essenceCrafting.types.ts'
import SharingTool from './SharingTool.tsx'
import IngredientsTool from './IngredientsTool.tsx'
import { calculatePlanMaterials } from './materialCalculations.ts'
import {
  decodeEssenceCraftingPermalink,
  type EssenceCraftingPermalinkDecodeFailure,
  readEssenceCraftingPermalinkFromSearch,
  removeEssenceCraftingPermalinkFromCurrentUrl
} from './permalink.ts'
import EssencePlanWorkspace from './EssencePlanWorkspace'
import type { EssencePlanState } from './plannerState.ts'
import { loadEssenceCraftingPlan, saveEssenceCraftingPlan } from './plannerStorage.ts'
import {
  describeEquipmentBlockers,
  type EquipmentChange,
  type EssencePlanAction,
  getEquipmentBlockers,
  transitionEssencePlan
} from './plannerTransitions.ts'
import RecipesTool from './RecipesTool.tsx'
import ShardLookup from './ShardLookup'
import lookupStyles from './ShardLookup.module.css'

type DataState =
  | { status: 'loading' }
  | { status: 'loaded'; data: EssenceCraftingData; plan: EssencePlanState }
  | { status: 'error'; kind: 'load' | 'invalid'; cause: unknown }

type Confirmation =
  { type: 'deactivate-equipment-slot'; equipmentSlotId: EquipmentSlotId } | { type: 'reset-plan' } | null

const getErrorContent = (kind: Extract<DataState, { status: 'error' }>['kind']) =>
  kind === 'invalid'
    ? {
        title: 'Essence Crafting data is invalid',
        message: 'The published data does not match the structure required by this version of YourDDO.'
      }
    : {
        title: 'Essence Crafting data is unavailable',
        message: 'We could not load the crafting data. Check your connection and try again.'
      }

const getPermalinkErrorMessage = (reason: EssenceCraftingPermalinkDecodeFailure): string =>
  reason === 'unsupported-version'
    ? 'This Essence Crafting link uses a permalink version that is not supported. Your current plan was kept.'
    : 'This Essence Crafting link is invalid or damaged. Your current plan was kept.'

interface EquipmentConflict {
  change: EquipmentChange
  onApplied?: () => void
}

function EquipmentConflictDialog({
  equipmentConflict,
  plan,
  dispatch,
  onClose
}: {
  equipmentConflict: EquipmentConflict | null
  plan: EssencePlanState
  dispatch: (action: EssencePlanAction) => void
  onClose: () => void
}) {
  const blockers = equipmentConflict ? getEquipmentBlockers(plan, equipmentConflict.change) : []
  const conflictTargetId =
    equipmentConflict?.change.type === 'activate-equipment-slot' ? equipmentConflict.change.equipmentSlotId : undefined
  const conflictTarget = EQUIPMENT_SLOTS.find(({ id }) => id === conflictTargetId)

  return (
    <Modal opened={equipmentConflict !== null} onClose={onClose} title='Equipment conflict' centered>
      {equipmentConflict && (
        <Stack gap='md'>
          <Text>
            Unequip <strong>{describeEquipmentBlockers(plan, blockers)}</strong>{' '}
            {conflictTarget ? (
              <>
                to add <strong>{conflictTarget.label}</strong>?
              </>
            ) : (
              <>
                to use a <strong>two-handed Main Hand weapon</strong>?
              </>
            )}
          </Text>
          <Text size='sm' c='dimmed'>
            Unequipping removes the blocking item and its selections from this plan.
          </Text>
          <Group justify='flex-end'>
            <Button variant='default' onClick={onClose}>
              Cancel
            </Button>
            <Button
              color='red'
              onClick={() => {
                dispatch({ type: 'resolve-equipment-conflict', change: equipmentConflict.change, blockers })
                equipmentConflict.onApplied?.()
                onClose()
              }}
            >
              Unequip and continue
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  )
}

const EssenceCraftingPage = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [confirmation, setConfirmation] = useState<Confirmation>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [equipmentConflict, setEquipmentConflict] = useState<EquipmentConflict | null>(null)
  const [binding, setBinding] = useState<'bound' | 'unbound'>('bound')
  const [view, setView] = useState<string | null>('plan')
  const [permalinkError, setPermalinkError] = useState<string | null>(null)
  const permalinkToImportRef = useRef(readEssenceCraftingPermalinkFromSearch())
  const hydrationCompleteRef = useRef(false)
  const planMaterials = useMemo(
    () => (dataState.status === 'loaded' ? calculatePlanMaterials(dataState.data, dataState.plan, binding) : undefined),
    [binding, dataState]
  )
  const tools = useMemo<readonly WorkspaceTool[]>(
    () =>
      dataState.status === 'loaded' && planMaterials
        ? [
            {
              id: 'recipes',
              label: 'Recipes',
              icon: <IconListDetails stroke={2} />,
              content: (
                <RecipesTool
                  binding={binding}
                  data={dataState.data}
                  plan={dataState.plan}
                  planMaterials={planMaterials}
                  onBindingChange={setBinding}
                />
              )
            },
            {
              id: 'ingredients',
              label: 'Ingredients',
              icon: <IconBasket stroke={2} />,
              content: (
                <IngredientsTool
                  binding={binding}
                  data={dataState.data}
                  plan={dataState.plan}
                  planMaterials={planMaterials}
                  onBindingChange={setBinding}
                />
              )
            },
            {
              id: 'sharing',
              label: 'Sharing',
              icon: <IconShare stroke={2} />,
              content: (
                <SharingTool
                  onRestore={({ plan, binding: restoredBinding }) => {
                    setBinding(restoredBinding)
                    setDataState((current) => (current.status === 'loaded' ? { ...current, plan } : current))
                  }}
                  binding={binding}
                  data={dataState.data}
                  plan={dataState.plan}
                  planMaterials={planMaterials}
                />
              )
            }
          ]
        : [],
    [binding, dataState, planMaterials]
  )

  useEffect(() => {
    let active = true

    loadEssenceCraftingData()
      .then((data) => {
        if (!active) return
        const storedPlan = loadEssenceCraftingPlan(data).plan
        const encodedPermalink = permalinkToImportRef.current
        const decodedPermalink = encodedPermalink ? decodeEssenceCraftingPermalink(data, encodedPermalink) : undefined
        const plan = decodedPermalink?.ok ? decodedPermalink.plan : storedPlan
        if (decodedPermalink?.ok) {
          removeEssenceCraftingPermalinkFromCurrentUrl()
          setPermalinkError(null)
        } else if (decodedPermalink) {
          setPermalinkError(getPermalinkErrorMessage(decodedPermalink.reason))
        }
        hydrationCompleteRef.current = true
        setDataState({ status: 'loaded', data, plan })
      })
      .catch((cause: unknown) => {
        if (!active) return
        setDataState({
          status: 'error',
          kind: cause instanceof InvalidEssenceCraftingDataError ? 'invalid' : 'load',
          cause
        })
      })

    return () => {
      active = false
    }
  }, [loadAttempt])

  useEffect(() => {
    if (dataState.status !== 'loaded' || !hydrationCompleteRef.current) return
    saveEssenceCraftingPlan(dataState.plan)
  }, [dataState])

  const dispatch = useCallback((action: EssencePlanAction) => {
    setDataState((current) =>
      current.status === 'loaded'
        ? { ...current, plan: transitionEssencePlan(current.data, current.plan, action) }
        : current
    )
  }, [])

  const requestDeactivate = useCallback((equipmentSlotId: EquipmentSlotId) => {
    setConfirmation({ type: 'deactivate-equipment-slot', equipmentSlotId })
  }, [])

  const requestEquipmentChange = (change: EquipmentChange, onApplied?: () => void) => {
    if (dataState.status !== 'loaded') return
    if (getEquipmentBlockers(dataState.plan, change).length) {
      setEquipmentConflict({ change, onApplied })
    } else {
      dispatch(change)
      onApplied?.()
    }
  }

  const retry = () => {
    setDataState({ status: 'loading' })
    setLoadAttempt((attempt) => attempt + 1)
  }

  const confirm = () => {
    if (confirmation?.type === 'deactivate-equipment-slot') {
      dispatch({ type: 'deactivate-equipment-slot', equipmentSlotId: confirmation.equipmentSlotId })
    }
    if (confirmation?.type === 'reset-plan') dispatch({ type: 'reset-plan' })
    setConfirmation(null)
  }

  const confirmationSlot =
    confirmation?.type === 'deactivate-equipment-slot'
      ? EQUIPMENT_SLOTS.find(({ id }) => id === confirmation.equipmentSlotId)
      : undefined

  return (
    <WorkspaceLayout tools={view === 'plan' ? tools : []} scrollMain={false}>
      <Stack className={layout.planner} gap='sm' p={{ base: 'xs', sm: 'md' }}>
        <WorkspaceHeader
          title='Essence Crafting'
          icon={IconSparkles}
          description='Plan your crafted gear or look up shard effects, compatible slots, and recipes.'
          actions={
            <Group gap='sm'>
              <ActionIcon
                variant='light'
                size='lg'
                aria-label='Essence Crafting help'
                aria-haspopup='dialog'
                title='Essence Crafting help'
                onClick={() => {
                  setHelpOpen(true)
                }}
              >
                <IconQuestionMark size={19} aria-hidden />
              </ActionIcon>
              <Anchor
                size='sm'
                href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Essence%20Crafting%22'
                target='_blank'
                rel='noreferrer'
              >
                Known issues and bug reports ↗
              </Anchor>
            </Group>
          }
        />

        {dataState.status === 'loading' ? (
          <Center mih={160} role='status' aria-live='polite'>
            <Stack gap='xs' align='center'>
              <Loader size='sm' />
              <Text c='dimmed' size='sm'>
                Loading Essence Crafting data…
              </Text>
            </Stack>
          </Center>
        ) : null}

        {dataState.status === 'error' ? (
          <Alert color='red' title={getErrorContent(dataState.kind).title}>
            <Stack gap='sm' align='flex-start'>
              <Text size='sm'>{getErrorContent(dataState.kind).message}</Text>
              {import.meta.env.DEV ? (
                <Text c='dimmed' size='xs'>
                  {dataState.cause instanceof Error ? dataState.cause.message : String(dataState.cause)}
                </Text>
              ) : null}
              <Button size='sm' variant='light' onClick={retry}>
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {dataState.status === 'loaded' ? (
          <>
            {permalinkError ? (
              <Alert color='yellow' title='Permalink could not be loaded' role='status'>
                {permalinkError}
              </Alert>
            ) : null}

            <Tabs
              value={view}
              onChange={setView}
              className={lookupStyles.tabs}
              classNames={{ panel: lookupStyles.panel }}
            >
              <Tabs.List aria-label='Essence Crafting views'>
                <Tabs.Tab value='plan' leftSection={<IconListDetails size={16} />}>
                  Crafting Plan
                </Tabs.Tab>
                <Tabs.Tab value='lookup' leftSection={<IconSearch size={16} />}>
                  Master Shard Lookup
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value='plan' data-active={view === 'plan' || undefined}>
                <EssencePlanWorkspace
                  tools={tools}
                  data={dataState.data}
                  plan={dataState.plan}
                  onAction={(action) => {
                    if (action.type === 'set-two-handed') requestEquipmentChange(action)
                    else dispatch(action)
                  }}
                  onRequestActivate={(equipmentSlotId, onActivated) => {
                    requestEquipmentChange({ type: 'activate-equipment-slot', equipmentSlotId }, onActivated)
                  }}
                  onRequestDeactivate={requestDeactivate}
                  onRequestReset={() => {
                    setConfirmation({ type: 'reset-plan' })
                  }}
                />
              </Tabs.Panel>
              <Tabs.Panel value='lookup' data-active={view === 'lookup' || undefined}>
                <ShardLookup data={dataState.data} plan={dataState.plan} onAction={dispatch} />
              </Tabs.Panel>
            </Tabs>
            <EquipmentConflictDialog
              equipmentConflict={equipmentConflict}
              plan={dataState.plan}
              dispatch={dispatch}
              onClose={() => {
                setEquipmentConflict(null)
              }}
            />
          </>
        ) : null}
      </Stack>

      <Modal
        opened={helpOpen}
        onClose={() => {
          setHelpOpen(false)
        }}
        title='Essence Crafting help'
        closeButtonProps={{ 'aria-label': 'Close Essence Crafting help' }}
        size='lg'
        centered
      >
        <Stack gap='md'>
          <Alert title='Search for what the effect does' icon={<IconSearch size={18} />}>
            Looking for <strong>Deception</strong>? Search for <strong>Sneak Attack</strong> in Master Shard Lookup. The
            catalog lists the underlying effects that improve sneak attacks. If a search comes up empty, try the stat or
            mechanic you want to improve.
          </Alert>
          <List type='ordered' spacing='sm' size='sm'>
            <List.Item>
              Set <strong>Master ML</strong> to choose the default minimum level for the plan. You can override it for
              an individual item.
            </List.Item>
            <List.Item>
              Choose an <strong>equipment slot</strong>, then pick its prefix and suffix. The Mark of House Cannith lets
              you apply an extra effect on eligible items.
            </List.Item>
            <List.Item>
              Use <strong>Master Shard Lookup</strong> to preview effects and compare bound and unbound recipes. Click a
              compatible equipment slot in the shard details to apply the effect to your plan.
            </List.Item>
            <List.Item>
              Open <strong>Recipes</strong> for the crafting steps, <strong>Ingredients</strong> for the plan totals, or{' '}
              <strong>Sharing</strong> to copy a plan link.
            </List.Item>
          </List>
        </Stack>
      </Modal>

      <Modal
        opened={confirmation !== null}
        onClose={() => {
          setConfirmation(null)
        }}
        title={
          confirmation?.type === 'reset-plan'
            ? 'Reset the entire plan?'
            : `Remove ${confirmationSlot?.label ?? 'item'}?`
        }
        centered
      >
        <Stack gap='md'>
          <Text>
            {confirmation?.type === 'reset-plan'
              ? 'This removes every planned item and all of their selections.'
              : `This removes the ${confirmationSlot?.label ?? 'selected'} item and all of its selections.`}
          </Text>
          <Group justify='flex-end'>
            <Button
              variant='default'
              onClick={() => {
                setConfirmation(null)
              }}
            >
              Cancel
            </Button>
            <Button color='red' onClick={confirm}>
              {confirmation?.type === 'reset-plan' ? 'Reset plan' : 'Remove item'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </WorkspaceLayout>
  )
}

export default EssenceCraftingPage
