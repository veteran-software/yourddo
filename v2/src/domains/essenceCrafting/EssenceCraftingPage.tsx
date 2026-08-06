import { Alert, Box, Button, Center, Loader, Paper, Select, Stack, Text, Title } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import { InvalidEssenceCraftingDataError, loadEssenceCraftingData } from './data.ts'
import type { EssenceCraftingData } from './essenceCrafting.types.ts'
import PlannedItemEditor from './PlannedItemEditor.tsx'
import { createEmptyEssencePlan, type EssencePlanState } from './plannerState.ts'
import { type EssencePlanAction, transitionEssencePlan } from './plannerTransitions.ts'

type DataState =
  | { status: 'loading' }
  | { status: 'loaded'; data: EssenceCraftingData; plan: EssencePlanState }
  | { status: 'error'; kind: 'load' | 'invalid'; cause: unknown }

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
  const minimumLevelOptions = useMemo(() => {
    if (dataState.status !== 'loaded') return []

    const { minimum, maximum } = dataState.data.rules.supportedItemLevels
    return Array.from({ length: maximum - minimum + 1 }, (_, index) => {
      const minimumLevel = minimum + index
      return { value: String(minimumLevel), label: String(minimumLevel) }
    })
  }, [dataState])

  useEffect(() => {
    let active = true

    loadEssenceCraftingData()
      .then((data) => {
        if (!active) return
        setDataState({ status: 'loaded', data, plan: createEmptyEssencePlan(data) })
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

  const mainHandItem = dataState.status === 'loaded' ? dataState.plan.itemsBySlotId['main-hand'] : undefined

  return (
    <WorkspaceLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap='lg'>
          <Stack gap={4}>
            <Title order={1}>Essence Crafting</Title>
            <Text c='dimmed'>Plan one crafted item by choosing its minimum level and eligible affixes.</Text>
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
                    Item minimum level
                  </Title>
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
                  />
                </Stack>
              </Paper>

              {mainHandItem ? (
                <PlannedItemEditor
                  data={dataState.data}
                  item={mainHandItem}
                  masterMinimumLevel={dataState.plan.masterMinimumLevel}
                  onAction={dispatch}
                />
              ) : (
                <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
                  <Stack gap='sm' align='flex-start'>
                    <Title order={2} size='h3'>
                      Start a planned item
                    </Title>
                    <Text c='dimmed' size='sm'>
                      This first slice intentionally supports only a Main Hand item.
                    </Text>
                    <Button
                      onClick={() => {
                        dispatch({ type: 'activate-equipment-slot', equipmentSlotId: 'main-hand' })
                      }}
                    >
                      Plan a Main Hand
                    </Button>
                  </Stack>
                </Paper>
              )}
            </>
          ) : null}
        </Stack>
      </Box>
    </WorkspaceLayout>
  )
}

export default EssenceCraftingPage
