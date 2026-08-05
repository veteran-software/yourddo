import type {
  QuestDefinition,
  SagaCategory,
  SagaCompletionState,
  SagaDefinition,
  SagaStatusMap,
  TimestampMap
} from './sagaTracker.types.ts'

export const normalizeSearch = (query: string): string => query.trim().toLocaleLowerCase()
export const isSearchActive = (query: string): boolean => normalizeSearch(query).length >= 3

export const categorizeSaga = (levelRange: string): SagaCategory => {
  const match = /\d+/.exec(levelRange)
  const startingLevel = match ? Number.parseInt(match[0], 10) : Number.NaN
  if (!Number.isFinite(startingLevel)) return 'heroic'
  if (startingLevel < 20) return 'heroic'
  if (startingLevel <= 30) return 'epic'
  return 'legendary'
}

export const categorizeSagas = (sagas: readonly SagaDefinition[]): Record<SagaCategory, SagaDefinition[]> => ({
  heroic: sagas.filter((saga) => categorizeSaga(saga.levelRange) === 'heroic'),
  epic: sagas.filter((saga) => categorizeSaga(saga.levelRange) === 'epic'),
  legendary: sagas.filter((saga) => categorizeSaga(saga.levelRange) === 'legendary')
})

export const groupQuestsBySaga = (
  sagas: readonly SagaDefinition[],
  quests: readonly QuestDefinition[]
): Record<string, QuestDefinition[]> => {
  const grouped = Object.fromEntries(sagas.map(({ id }) => [id, [] as QuestDefinition[]]))
  for (const quest of quests) {
    for (const sagaId of quest.sagas) grouped[sagaId].push(quest)
  }
  for (const sagaQuests of Object.values(grouped)) {
    sagaQuests.sort((left, right) => left.name.localeCompare(right.name))
  }
  return grouped
}

export const questCountsForSaga = (
  sagaId: string,
  questId: string,
  questDoneAt: Readonly<TimestampMap>,
  turnedInAt: Readonly<TimestampMap>
): boolean => (questDoneAt[questId] ?? 0) > (turnedInAt[sagaId] ?? 0)

export const getSagaCompletionState = (
  sagaId: string,
  quests: readonly QuestDefinition[],
  questDoneAt: Readonly<TimestampMap>,
  turnedInAt: Readonly<TimestampMap>
): SagaCompletionState => {
  const completed = quests.filter(({ id }) => questCountsForSaga(sagaId, id, questDoneAt, turnedInAt)).length
  if (quests.length > 0 && completed === quests.length) return 'complete'
  if (completed > 0) return 'indeterminate'
  return 'incomplete'
}

export const toggleQuest = (questDoneAt: Readonly<TimestampMap>, questId: string, checked: boolean, now: number) => {
  if (checked) return { ...questDoneAt, [questId]: now }
  return Object.fromEntries(Object.entries(questDoneAt).filter(([id]) => id !== questId))
}

export const toggleSagaQuests = (
  questDoneAt: Readonly<TimestampMap>,
  quests: readonly QuestDefinition[],
  checked: boolean,
  now: number
): TimestampMap => {
  if (checked) return { ...questDoneAt, ...Object.fromEntries(quests.map(({ id }) => [id, now])) }
  const questIds = new Set(quests.map(({ id }) => id))
  return Object.fromEntries(Object.entries(questDoneAt).filter(([id]) => !questIds.has(id)))
}

export const toggleTurnedIn = (
  status: Readonly<SagaStatusMap>,
  cutoffs: Readonly<TimestampMap>,
  sagaId: string,
  checked: boolean,
  now: number
) => ({
  sagaStatus: { ...status, [sagaId]: { ...(status[sagaId] ?? { completed: false }), turnedIn: checked } },
  turnedInAt: { ...cutoffs, [sagaId]: checked ? now : 0 }
})

export const startNewRun = (
  status: Readonly<SagaStatusMap>,
  cutoffs: Readonly<TimestampMap>,
  sagaId: string,
  now: number
) => ({
  sagaStatus: { ...status, [sagaId]: { completed: false, turnedIn: false } },
  turnedInAt: { ...cutoffs, [sagaId]: now }
})

export const resetProgress = (sagas: readonly SagaDefinition[]) => ({
  sagaStatus: Object.fromEntries(sagas.map(({ id }) => [id, { completed: false, turnedIn: false }])),
  questDoneAt: {},
  turnedInAt: {}
})

export const sagaMatchesSearch = (saga: SagaDefinition, quests: readonly QuestDefinition[], query: string) => {
  const normalized = normalizeSearch(query)
  if (normalized.length < 3) return true
  return (
    saga.name.toLocaleLowerCase().includes(normalized) ||
    quests.some(({ name }) => name.toLocaleLowerCase().includes(normalized))
  )
}

export interface HighlightPart {
  text: string
  match: boolean
}

export const getHighlightParts = (text: string, query: string): HighlightPart[] => {
  const normalized = normalizeSearch(query)
  if (normalized.length < 3) return [{ text, match: false }]
  const lowerText = text.toLocaleLowerCase()
  const parts: HighlightPart[] = []
  let start = 0
  let index = lowerText.indexOf(normalized, start)
  while (index >= 0) {
    if (index > start) parts.push({ text: text.slice(start, index), match: false })
    parts.push({ text: text.slice(index, index + normalized.length), match: true })
    start = index + normalized.length
    index = lowerText.indexOf(normalized, start)
  }
  if (start < text.length) parts.push({ text: text.slice(start), match: false })
  return parts.length > 0 ? parts : [{ text, match: false }]
}
