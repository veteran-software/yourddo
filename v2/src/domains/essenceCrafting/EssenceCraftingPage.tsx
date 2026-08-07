import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { IconBasket, IconFileExport, IconListDetails } from '@tabler/icons-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import WorkspaceLayout, { type WorkspaceTool } from '../../shared/layout/WorkspaceLayout.tsx'
import { InvalidEssenceCraftingDataError, loadEssenceCraftingData } from './data.ts'
import { EQUIPMENT_SLOTS, type EquipmentSlotId } from './equipment.ts'
import type { EssenceCraftingData } from './essenceCrafting.types.ts'
import ExportTool from './ExportTool.tsx'
import IngredientsTool from './IngredientsTool.tsx'
import { calculatePlanMaterials } from './materialCalculations.ts'
import { PlannedItemEditor } from './PlannedItemEditor.tsx'
import type { EssencePlanState } from './plannerState.ts'
import { loadEssenceCraftingPlan, saveEssenceCraftingPlan } from './plannerStorage.ts'
import { type EssencePlanAction, transitionEssencePlan } from './plannerTransitions.ts'
import RecipesTool from './RecipesTool.tsx'

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

const EssenceCraftingPage = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [confirmation, setConfirmation] = useState<Confirmation>(null)
  const [binding, setBinding] = useState<'bound' | 'unbound'>('bound')
  const hydrationCompleteRef = useRef(false)
  const minimumLevelOptions = useMemo(() => {
    if (dataState.status !== 'loaded') return []

    const { minimum, maximum } = dataState.data.rules.supportedItemLevels
    return Array.from({ length: maximum - minimum + 1 }, (_, index) => {
      const minimumLevel = minimum + index
      return { value: String(minimumLevel), label: String(minimumLevel) }
    })
  }, [dataState])
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
              id: 'export',
              label: 'Export',
              icon: <IconFileExport stroke={2} />,
              content: (
                <ExportTool
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
        const { plan } = loadEssenceCraftingPlan(data)
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

  const dispatch = (action: EssencePlanAction) => {
    setDataState((current) =>
      current.status === 'loaded'
        ? { ...current, plan: transitionEssencePlan(current.data, current.plan, action) }
        : current
    )
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
    <WorkspaceLayout tools={tools}>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap='lg'>
          <Stack gap={4}>
            <Title order={1}>Essence Crafting</Title>
            <Text c='dimmed'>Choose equipment slots, then configure the eligible affixes for each planned item.</Text>
          </Stack>

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
              <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
                <Stack gap='md'>
                  <Title order={2} size='h3'>
                    Plan settings
                  </Title>
                  <Group align='end' justify='space-between' wrap='wrap'>
                    <Select
                      label='Master minimum level'
                      data={minimumLevelOptions}
                      value={String(dataState.plan.masterMinimumLevel)}
                      onChange={(value) => {
                        const minimumLevel = Number(value)
                        if (Number.isInteger(minimumLevel)) {
                          dispatch({ type: 'set-master-minimum-level', minimumLevel })
                        }
                      }}
                      allowDeselect={false}
                      w={{ base: '100%', sm: 260 }}
                    />
                    <Button
                      color='red'
                      variant='light'
                      disabled={dataState.plan.activeSlotIds.length === 0}
                      onClick={() => {
                        setConfirmation({ type: 'reset-plan' })
                      }}
                    >
                      Reset plan
                    </Button>
                  </Group>
                </Stack>
              </Paper>

              <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
                <Stack gap='md'>
                  <Stack gap={4}>
                    <Title order={2} size='h3'>
                      Equipment slots
                    </Title>
                    <Text c='dimmed' size='sm'>
                      Select every equipment position you want to plan. Each position has an independent item.
                    </Text>
                  </Stack>
                  <SimpleGrid
                    cols={{ base: 2, xs: 3, sm: 4, lg: 5 }}
                    spacing='xs'
                    data-testid='equipment-slot-selector'
                  >
                    {EQUIPMENT_SLOTS.map((slot) => {
                      const active = dataState.plan.activeSlotIds.includes(slot.id)
                      return (
                        <Button
                          key={slot.id}
                          variant={active ? 'filled' : 'light'}
                          aria-label={`${active ? 'Remove' : 'Plan'} ${slot.label}`}
                          aria-pressed={active}
                          onClick={() => {
                            if (active) {
                              setConfirmation({ type: 'deactivate-equipment-slot', equipmentSlotId: slot.id })
                            } else {
                              dispatch({ type: 'activate-equipment-slot', equipmentSlotId: slot.id })
                            }
                          }}
                        >
                          {slot.label}
                        </Button>
                      )
                    })}
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Stack gap='md' data-testid='active-planned-items'>
                {dataState.plan.activeSlotIds.length === 0 ? (
                  <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
                    <Text c='dimmed'>Select an equipment slot to begin crafting.</Text>
                  </Paper>
                ) : null}

                {dataState.plan.activeSlotIds.map((equipmentSlotId) => {
                  const item = dataState.plan.itemsBySlotId[equipmentSlotId]
                  if (!item) return null

                  return (
                    <PlannedItemEditor
                      key={equipmentSlotId}
                      data={dataState.data}
                      equipmentSlotId={equipmentSlotId}
                      item={item}
                      masterMinimumLevel={dataState.plan.masterMinimumLevel}
                      collapsed={dataState.plan.collapsedSlotIds.includes(equipmentSlotId)}
                      onAction={dispatch}
                      onRequestDeactivate={(slotId) => {
                        setConfirmation({ type: 'deactivate-equipment-slot', equipmentSlotId: slotId })
                      }}
                    />
                  )
                })}
              </Stack>
            </>
          ) : null}
        </Stack>
      </Box>

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
