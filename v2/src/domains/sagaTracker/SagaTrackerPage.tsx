import { Alert, Button, Center, CloseButton, Group, Loader, Modal, Stack, Tabs, Text, TextInput } from '@mantine/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import TrackerLayout from '../../shared/layout/TrackerLayout.tsx'
import { createBackup, downloadBackup, parseBackup } from './backup.ts'
import SagaList from './components/SagaList.tsx'
import { InvalidSagaTrackerDataError, loadSagaTrackerData } from './data.ts'
import {
  categorizeSagas,
  getSagaCompletionState,
  groupQuestsBySaga,
  isSearchActive,
  resetProgress,
  sagaMatchesSearch,
  startNewRun,
  toggleQuest,
  toggleSagaQuests,
  toggleTurnedIn
} from './logic.ts'
import type {
  SagaCategory,
  SagaStatusMap,
  SagaTrackerData,
  SagaTrackerProgress,
  TimestampMap
} from './sagaTracker.types.ts'
import { loadProgress, readActiveTab, saveProgress, writeActiveTab } from './storage.ts'

type InitializationState =
  | { status: 'loading' }
  | { status: 'error'; cause: unknown }
  | { status: 'ready'; data: SagaTrackerData; storageAvailable: boolean }

interface Feedback {
  color: 'green' | 'red'
  message: string
}

const SagaTrackerPage = () => {
  const [initialization, setInitialization] = useState<InitializationState>({ status: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [sagaStatus, setSagaStatus] = useState<SagaStatusMap>({})
  const [questDoneAt, setQuestDoneAt] = useState<TimestampMap>({})
  const [turnedInAt, setTurnedInAt] = useState<TimestampMap>({})
  const [activeTab, setActiveTab] = useState<SagaCategory>(readActiveTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSagaIds, setExpandedSagaIds] = useState<Set<string>>(() => new Set())
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [resetOpened, setResetOpened] = useState(false)
  const [storageWarning, setStorageWarning] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  const data = initialization.status === 'ready' ? initialization.data : null
  const questsBySaga = useMemo(() => (data ? groupQuestsBySaga(data.sagas, data.quests) : {}), [data])
  const categorizedSagas = useMemo(() => (data ? categorizeSagas(data.sagas) : null), [data])
  const effectiveSagaStatus = useMemo(() => {
    if (!data) return sagaStatus
    return Object.fromEntries(
      data.sagas.map(({ id }) => {
        const quests = questsBySaga[id] ?? []
        const completed =
          quests.length > 0
            ? getSagaCompletionState(id, quests, questDoneAt, turnedInAt) === 'complete'
            : (sagaStatus[id]?.completed ?? false)
        return [id, { completed, turnedIn: sagaStatus[id]?.turnedIn ?? false }]
      })
    )
  }, [data, questDoneAt, questsBySaga, sagaStatus, turnedInAt])
  const progress = useMemo<SagaTrackerProgress>(
    () => ({ sagaStatus: effectiveSagaStatus, questDoneAt, turnedInAt }),
    [effectiveSagaStatus, questDoneAt, turnedInAt]
  )
  const completedCount = Object.values(effectiveSagaStatus).filter((status) => status?.completed).length

  useEffect(() => {
    let active = true
    loadSagaTrackerData()
      .then(async (loadedData) => {
        const loadedProgress = await loadProgress(loadedData.sagas, loadedData.quests)
        if (!active) return
        setSagaStatus(loadedProgress.progress.sagaStatus)
        setQuestDoneAt(loadedProgress.progress.questDoneAt)
        setTurnedInAt(loadedProgress.progress.turnedInAt)
        setStorageWarning(!loadedProgress.storageAvailable)
        setInitialization({ status: 'ready', data: loadedData, storageAvailable: loadedProgress.storageAvailable })
      })
      .catch((cause: unknown) => {
        if (active) setInitialization({ status: 'error', cause })
      })
    return () => {
      active = false
    }
  }, [loadAttempt])

  useEffect(() => {
    if (!data) return
    let active = true
    void saveProgress(data.sagas, progress)
      .then((saved) => {
        if (active && !saved) setStorageWarning(true)
      })
      .catch(() => {
        if (active) setStorageWarning(true)
      })
    return () => {
      active = false
    }
  }, [data, progress])

  const retry = () => {
    setFeedback(null)
    setInitialization({ status: 'loading' })
    setLoadAttempt((attempt) => attempt + 1)
  }

  const changeTab = (value: string | null) => {
    const category = value === 'epic' || value === 'legendary' ? value : 'heroic'
    setActiveTab(category)
    writeActiveTab(category)
  }

  const toggleExpanded = (sagaId: string) => {
    setExpandedSagaIds((previous) => {
      const next = new Set(previous)
      if (next.has(sagaId)) next.delete(sagaId)
      else next.add(sagaId)
      return next
    })
  }

  const handleImport = async (file: File | undefined) => {
    if (!file || !data) return
    try {
      const parsed = JSON.parse(await file.text()) as unknown
      const imported = parseBackup(parsed, data.sagas, data.quests)
      const saved = await saveProgress(data.sagas, imported)
      setSagaStatus(imported.sagaStatus)
      setQuestDoneAt(imported.questDoneAt)
      setTurnedInAt(imported.turnedInAt)
      setStorageWarning(!saved)
      setFeedback({ color: 'green', message: 'Saga Tracker backup imported successfully.' })
    } catch (cause) {
      setFeedback({
        color: 'red',
        message: cause instanceof Error ? cause.message : 'The selected backup could not be imported.'
      })
    } finally {
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  const actions = data ? (
    <>
      <Button
        variant='default'
        onClick={() => {
          try {
            downloadBackup(createBackup(data.sagas, progress))
            setFeedback({ color: 'green', message: 'Saga Tracker backup exported successfully.' })
          } catch {
            setFeedback({ color: 'red', message: 'The Saga Tracker backup could not be exported.' })
          }
        }}
      >
        Export
      </Button>
      <Button
        variant='default'
        onClick={() => {
          importInputRef.current?.click()
        }}
      >
        Import
      </Button>
      <input
        ref={importInputRef}
        type='file'
        accept='application/json,.json'
        aria-label='Import Saga Tracker backup'
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}
        onChange={(event) => {
          void handleImport(event.currentTarget.files?.[0])
        }}
      />
      <Button
        color='red'
        variant='light'
        onClick={() => {
          setResetOpened(true)
        }}
        disabled={data.sagas.length === 0}
      >
        Reset Progress
      </Button>
    </>
  ) : undefined

  const controls = data ? (
    <TextInput
      label='Search sagas and quests'
      placeholder='Enter at least 3 characters'
      value={searchQuery}
      onChange={(event) => {
        setSearchQuery(event.currentTarget.value)
      }}
      rightSection={
        searchQuery ? (
          <CloseButton
            aria-label='Clear search'
            onClick={() => {
              setSearchQuery('')
            }}
            size='sm'
          />
        ) : null
      }
    />
  ) : undefined

  let content
  if (initialization.status === 'loading') {
    content = (
      <Center mih={240} role='status' aria-live='polite'>
        <Stack gap='xs' align='center'>
          <Loader size='sm' />
          <Text c='dimmed'>Loading Saga Tracker…</Text>
        </Stack>
      </Center>
    )
  } else if (initialization.status === 'error') {
    const invalid = initialization.cause instanceof InvalidSagaTrackerDataError
    content = (
      <Alert color='red' title={invalid ? 'Published Saga Tracker data is invalid' : 'Saga Tracker is unavailable'}>
        <Stack gap='sm' align='flex-start'>
          <Text size='sm'>
            {invalid
              ? 'The published saga data does not match the required structure.'
              : 'We could not load the Saga Tracker data. Check your connection and try again.'}
          </Text>
          <Button size='sm' variant='light' onClick={retry}>
            Retry
          </Button>
        </Stack>
      </Alert>
    )
  } else if (initialization.data.sagas.length === 0) {
    content = <Alert color='blue'>No sagas are currently published.</Alert>
  } else {
    const activeSearch = isSearchActive(searchQuery)
    const visibleSagas = (categorizedSagas?.[activeTab] ?? []).filter((saga) =>
      activeSearch ? sagaMatchesSearch(saga, questsBySaga[saga.id] ?? [], searchQuery) : true
    )
    content = (
      <Stack gap='md'>
        {storageWarning && (
          <Alert color='yellow' title='Progress could not be saved'>
            The tracker remains usable in this tab, but browser storage is currently unavailable.
          </Alert>
        )}
        {feedback && (
          <Alert color={feedback.color} role={feedback.color === 'red' ? 'alert' : 'status'} aria-live='polite'>
            {feedback.message}
          </Alert>
        )}
        <Tabs value={activeTab} onChange={changeTab} keepMounted={false}>
          <Tabs.List grow aria-label='Saga categories'>
            <Tabs.Tab value='heroic'>Heroic</Tabs.Tab>
            <Tabs.Tab value='epic'>Epic</Tabs.Tab>
            <Tabs.Tab value='legendary'>Legendary</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value={activeTab} pt='md'>
            <SagaList
              sagas={visibleSagas}
              questsBySaga={questsBySaga}
              sagaStatus={effectiveSagaStatus}
              questDoneAt={questDoneAt}
              turnedInAt={turnedInAt}
              expandedSagaIds={expandedSagaIds}
              query={searchQuery}
              onToggleExpanded={toggleExpanded}
              onToggleSaga={(sagaId, checked) => {
                const now = Date.now()
                setQuestDoneAt((current) => toggleSagaQuests(current, questsBySaga[sagaId] ?? [], checked, now))
              }}
              onToggleTurnedIn={(sagaId, checked) => {
                const next = toggleTurnedIn(sagaStatus, turnedInAt, sagaId, checked, Date.now())
                setSagaStatus(next.sagaStatus)
                setTurnedInAt(next.turnedInAt)
              }}
              onToggleQuest={(questId, checked) => {
                setQuestDoneAt((current) => toggleQuest(current, questId, checked, Date.now()))
              }}
              onNewRun={(sagaId) => {
                const next = startNewRun(sagaStatus, turnedInAt, sagaId, Date.now())
                setSagaStatus(next.sagaStatus)
                setTurnedInAt(next.turnedInAt)
              }}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    )
  }

  return (
    <>
      <TrackerLayout
        title='Saga Tracker'
        description='Track your DDO saga completion.'
        summary={data ? `${completedCount.toString()} / ${data.sagas.length.toString()} completed` : undefined}
        controls={controls}
        actions={actions}
      >
        {content}
      </TrackerLayout>
      <Modal
        opened={resetOpened}
        onClose={() => {
          setResetOpened(false)
        }}
        title='Reset all Saga Tracker progress?'
        centered
      >
        <Stack>
          <Text size='sm'>
            This clears every quest completion and saga cutoff. Your selected category is preserved.
          </Text>
          <Group justify='flex-end'>
            <Button
              variant='default'
              onClick={() => {
                setResetOpened(false)
              }}
            >
              Cancel
            </Button>
            <Button
              color='red'
              onClick={() => {
                if (data) {
                  const reset = resetProgress(data.sagas)
                  setSagaStatus(reset.sagaStatus)
                  setQuestDoneAt(reset.questDoneAt)
                  setTurnedInAt(reset.turnedInAt)
                  setFeedback({ color: 'green', message: 'Saga Tracker progress was reset.' })
                }
                setResetOpened(false)
              }}
            >
              Reset Progress
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export default SagaTrackerPage
