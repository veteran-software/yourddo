import { Alert, Stack } from '@mantine/core'
import { getSagaCompletionState, isSearchActive, normalizeSearch, questCountsForSaga } from '../logic.ts'
import type { QuestDefinition, SagaDefinition, SagaStatusMap, TimestampMap } from '../sagaTracker.types.ts'
import SagaRow from './SagaRow.tsx'

interface SagaListProps {
  sagas: SagaDefinition[]
  questsBySaga: Record<string, QuestDefinition[]>
  sagaStatus: SagaStatusMap
  questDoneAt: TimestampMap
  turnedInAt: TimestampMap
  expandedSagaIds: ReadonlySet<string>
  query: string
  onToggleExpanded: (sagaId: string) => void
  onToggleSaga: (sagaId: string, checked: boolean) => void
  onToggleTurnedIn: (sagaId: string, checked: boolean) => void
  onToggleQuest: (questId: string, checked: boolean) => void
  onNewRun: (sagaId: string) => void
}

const SagaList = ({
  sagas,
  questsBySaga,
  sagaStatus,
  questDoneAt,
  turnedInAt,
  expandedSagaIds,
  query,
  onToggleExpanded,
  onToggleSaga,
  onToggleTurnedIn,
  onToggleQuest,
  onNewRun
}: SagaListProps) => {
  if (sagas.length === 0) {
    return <Alert color='blue'>No sagas match this category and search.</Alert>
  }
  const activeSearch = isSearchActive(query)
  const normalizedQuery = normalizeSearch(query)

  return (
    <Stack gap='sm'>
      {sagas.map((saga) => {
        const quests = questsBySaga[saga.id] ?? []
        const matchingQuests = activeSearch
          ? quests.filter(({ name }) => name.toLocaleLowerCase().includes(normalizedQuery))
          : quests
        const searchExpanded = activeSearch && matchingQuests.length > 0
        const expanded = searchExpanded || (!activeSearch && expandedSagaIds.has(saga.id))
        return (
          <SagaRow
            key={saga.id}
            saga={saga}
            quests={quests}
            visibleQuests={matchingQuests}
            completionState={getSagaCompletionState(saga.id, quests, questDoneAt, turnedInAt)}
            turnedIn={sagaStatus[saga.id]?.turnedIn ?? false}
            expanded={expanded}
            query={query}
            isQuestComplete={(questId) => questCountsForSaga(saga.id, questId, questDoneAt, turnedInAt)}
            onToggleSaga={(checked) => {
              onToggleSaga(saga.id, checked)
            }}
            onToggleTurnedIn={(checked) => {
              onToggleTurnedIn(saga.id, checked)
            }}
            onToggleQuest={onToggleQuest}
            onToggleExpanded={() => {
              onToggleExpanded(saga.id)
            }}
            onNewRun={() => {
              onNewRun(saga.id)
            }}
          />
        )
      })}
    </Stack>
  )
}

export default SagaList
