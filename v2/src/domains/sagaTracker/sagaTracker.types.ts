export interface SagaDefinition {
  id: string
  name: string
  levelRange: string
  npc: string
}

export interface QuestDefinition {
  id: string
  name: string
  sagas: string[]
}

export interface SagaTrackerData {
  sagas: SagaDefinition[]
  quests: QuestDefinition[]
}

export interface SagaStatus {
  completed: boolean
  turnedIn: boolean
}

export type SagaStatusMap = Partial<Record<string, SagaStatus>>
export type TimestampMap = Partial<Record<string, number>>

export interface SagaTrackerProgress {
  sagaStatus: SagaStatusMap
  questDoneAt: TimestampMap
  turnedInAt: TimestampMap
}

export type SagaCategory = 'heroic' | 'epic' | 'legendary'
export type SagaCompletionState = 'incomplete' | 'indeterminate' | 'complete'
