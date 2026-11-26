import { hasDatasetFile, loadDatasetFile, loadManualPayload } from '../../shared/data/loadDataset.ts'
import type { QuestDefinition, SagaCategory, SagaDefinition, SagaTrackerData } from './sagaTracker.types.ts'

import { canonicalQuestId, canonicalSagaId } from './withCompatibleSagaIds.ts'

export const SAGA_LIST_PAYLOAD = 'saga.sagaList'
export const QUEST_LIST_PAYLOAD = 'saga.questList'

export class InvalidSagaTrackerDataError extends Error {
  constructor(message: string) {
    super(`Invalid Saga Tracker data: ${message}`)
    this.name = 'InvalidSagaTrackerDataError'
  }
}

const record = (value: unknown, label: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new InvalidSagaTrackerDataError(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

const nonEmptyString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new InvalidSagaTrackerDataError(`${label} must be a non-empty string`)
  }
  return value
}

export const parseSagas = (value: unknown): Omit<SagaDefinition, 'levelRange'>[] => {
  if (!Array.isArray(value)) throw new InvalidSagaTrackerDataError('saga payload must be an array')
  const ids = new Set<string>()

  return value.map((entry, index) => {
    const item = record(entry, `saga ${index.toString()}`)
    const id = nonEmptyString(item.id, `saga ${index.toString()} ID`)
    if (ids.has(id)) throw new InvalidSagaTrackerDataError(`duplicate saga ID: ${id}`)
    ids.add(id)
    if (!Array.isArray(item.npcs) || item.npcs.length === 0) {
      throw new InvalidSagaTrackerDataError(`saga ${id} NPCs must be a non-empty array`)
    }
    return {
      id,
      name: nonEmptyString(item.name, `saga ${id} name`),
      npcs: item.npcs.map((npc) => nonEmptyString(npc, `saga ${id} NPC`)),
      ...(item.tier === undefined ? {} : { tier: sagaTier(item.tier) })
    }
  })
}

export const parseQuests = (value: unknown, sagaIds: ReadonlySet<string>): QuestDefinition[] => {
  if (!Array.isArray(value)) throw new InvalidSagaTrackerDataError('quest payload must be an array')
  const ids = new Set<string>()

  return value.map((entry, index) => {
    const item = record(entry, `quest ${index.toString()}`)
    const id = nonEmptyString(item.id, `quest ${index.toString()} ID`)
    if (ids.has(id)) throw new InvalidSagaTrackerDataError(`duplicate quest ID: ${id}`)
    ids.add(id)
    if (!Array.isArray(item.sagas) || !item.sagas.every((sagaId) => typeof sagaId === 'string')) {
      throw new InvalidSagaTrackerDataError(`quest ${id} sagas must be an array of strings`)
    }
    const sagas = item.sagas
    const uniqueReferences = new Set(sagas)
    if (uniqueReferences.size !== sagas.length) {
      throw new InvalidSagaTrackerDataError(`quest ${id} contains duplicate saga references`)
    }
    for (const sagaId of sagas) {
      if (!sagaIds.has(sagaId)) {
        throw new InvalidSagaTrackerDataError(`quest ${id} references unknown saga: ${sagaId}`)
      }
    }
    if (typeof item.level !== 'number' || !Number.isInteger(item.level) || item.level <= 0) {
      throw new InvalidSagaTrackerDataError(`quest ${id} level must be a positive integer`)
    }
    return {
      id,
      name: nonEmptyString(item.name, `quest ${id} name`),
      level: item.level,
      ...(item.chain === undefined ? {} : { chain: nonEmptyString(item.chain, `quest ${id} chain`) }),
      sagas: [...sagas]
    }
  })
}

function withLevelRanges(sagas: Omit<SagaDefinition, 'levelRange'>[], quests: QuestDefinition[]): SagaTrackerData {
  return {
    sagas: sagas.map((saga) => {
      const levels = quests.filter((quest) => quest.sagas.includes(saga.id)).map(({ level }) => level)
      if (levels.length === 0) throw new InvalidSagaTrackerDataError(`saga ${saga.id} has no quests`)
      const min = Math.min(...levels)
      const max = Math.max(...levels)
      return { ...saga, levelRange: min === max ? min.toString() : `${min.toString()}-${max.toString()}` }
    }),
    quests
  }
}

const sagaManifest = 'sagas/manifest.json'
const tierSuffix: Readonly<Record<SagaCategory, string>> = { heroic: 'H', epic: 'E', legendary: 'L' }

function list(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new InvalidSagaTrackerDataError(`${label} must be an array`)
  return value
}

function positiveInteger(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw new InvalidSagaTrackerDataError(`${label} must be a positive integer`)
  }
  return value
}

function sagaTier(value: unknown): SagaCategory {
  if (value === 'heroic' || value === 'epic' || value === 'legendary') return value
  throw new InvalidSagaTrackerDataError(`unsupported saga tier: ${String(value)}`)
}

function chainNames(value: unknown): ReadonlyMap<string, string> {
  const names = new Map<string, string>()
  for (const entry of list(value, 'chains')) {
    const chain = record(entry, 'chain')
    const name = nonEmptyString(chain.name, 'chain name')
    for (const row of list(chain.members, `${name} members`)) {
      const member = record(row, 'chain member')
      const id = positiveInteger(member.questId, 'chain member quest ID')
      const key = member.tier === undefined ? String(id) : `${id.toString()}-${sagaTier(member.tier)}`
      if (!names.has(key)) names.set(key, name)
    }
  }
  return names
}

function addNativeQuest(
  id: number,
  tier: SagaCategory,
  sagaId: string,
  source: ReadonlyMap<number, Record<string, unknown>>,
  chains: ReadonlyMap<string, string>,
  quests: Map<string, QuestDefinition>
) {
  const key = `${id.toString()}-${tier}`
  const existing = quests.get(key)
  if (existing) {
    existing.sagas.push(sagaId)
    return
  }
  const quest = source.get(id)
  if (!quest) throw new InvalidSagaTrackerDataError(`saga ${sagaId} references unknown quest: ${String(id)}`)
  const name = nonEmptyString(tier === 'heroic' ? quest.name : (quest.epicName ?? quest.name), `quest ${key} name`)
  const level = positiveInteger(tier === 'heroic' ? quest.heroicLevel : quest.epicLevel, `quest ${key} level`)
  const chain = chains.get(key) ?? chains.get(String(id))
  quests.set(key, { id: key, name: `${name} (${tierSuffix[tier]})`, level, chain, sagas: [sagaId] })
}

async function loadPublishedSagas(): Promise<SagaTrackerData> {
  const manifest = record(await loadDatasetFile<unknown>(sagaManifest), 'saga manifest')
  if (manifest.system !== 'sagas') throw new InvalidSagaTrackerDataError('unexpected saga manifest system')
  const resources = record(manifest.resources, 'saga resources')
  const read = (key: string) => loadDatasetFile<unknown>('sagas/' + nonEmptyString(resources[key], key))
  const [sagaPayload, questPayload, chainPayload] = await Promise.all([read('sagas'), read('quests'), read('chains')])

  const source = new Map<number, Record<string, unknown>>()
  for (const entry of list(questPayload, 'quests')) {
    const quest = record(entry, 'quest')
    const id = positiveInteger(quest.id, 'quest ID')
    if (source.has(id)) throw new InvalidSagaTrackerDataError(`duplicate quest ID: ${String(id)}`)
    source.set(id, quest)
  }
  const chains = chainNames(chainPayload)
  const quests = new Map<string, QuestDefinition>()
  const sagas = parseSagas(
    list(sagaPayload, 'sagas').map((entry) => {
      const saga = record(entry, 'saga')
      const id = String(positiveInteger(saga.id, 'saga ID'))
      const tier = sagaTier(saga.tier)
      const name = nonEmptyString(saga.name, `saga ${id} name`)
      const questIds = list(saga.questIds, `saga ${id} quests`).map((questId) => positiveInteger(questId, 'quest ID'))
      if (new Set(questIds).size !== questIds.length) {
        throw new InvalidSagaTrackerDataError(`saga ${id} contains duplicate quest references`)
      }
      for (const questId of questIds) addNativeQuest(questId, tier, id, source, chains, quests)
      const npcs = list(saga.givers, `saga ${id} contacts`).map((giver) => record(giver, 'contact').name)
      return { id, name: `${name} (${tierSuffix[tier]})`, npcs, tier }
    })
  )
  return withLevelRanges(sagas, [...quests.values()])
}

export async function loadSagaTrackerData(): Promise<SagaTrackerData> {
  if (await hasDatasetFile(sagaManifest)) return loadPublishedSagas()

  const [sagaPayload, questPayload] = await Promise.all([
    loadManualPayload<unknown>(SAGA_LIST_PAYLOAD),
    loadManualPayload<unknown>(QUEST_LIST_PAYLOAD)
  ])
  const sagas = parseSagas(sagaPayload)
  const quests = parseQuests(questPayload, new Set(sagas.map(({ id }) => id)))
  return withLevelRanges(
    sagas.map((saga) => ({ ...saga, id: canonicalSagaId(saga.id) })),
    quests.map((quest) => ({ ...quest, id: canonicalQuestId(quest.id), sagas: quest.sagas.map(canonicalSagaId) }))
  )
}
