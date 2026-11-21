import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button, Card, Col, Form, InputGroup, Row, Stack, Tab, Tabs } from 'react-bootstrap'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import IndeterminateCheck from './components/IndeterminateCheck'
import { loadInitial } from './components/loadInitial'
import questsData from './quests.json'
import sagas from './sagas.json'
import './SagaTracker.css'
import {
  getQuestDoneAt as idbGetQuestDoneAt,
  getSagaItems as idbGetSagaItems,
  getTurnedInAt as idbGetTurnedInAt,
  requestPersistentStorage,
  setQuestDoneAt as idbSetQuestDoneAt,
  setSagaItems as idbSetSagaItems,
  setTurnedInAt as idbSetTurnedInAt
} from './storage/sagaStore'

interface SagaItem {
  id: string
  name: string
  levelRange: string
  npc: string
  completed: boolean
  turnedIn: boolean
}

const STORAGE_KEY_V2 = 'yourddo:saga-tracker:v2'
const STORAGE_KEY_QUESTS_V1 = 'yourddo:saga-tracker:quests:v1'
const STORAGE_KEY_TURNED_IN_AT_V1 = 'yourddo:saga-tracker:turnedInAt:v1'
const STORAGE_KEY_ACTIVE_TAB = 'yourddo:saga-tracker:activeTab:v1'

const readLocalStorageItem = (key: string): string | null => {
  if (typeof localStorage === 'undefined') return null

  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeLocalStorageItem = (key: string, value: string) => {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore storage errors
  }
}

// Authoritative fixed list from JSON (no completion fields in file)
const fixedSagas: Omit<SagaItem, 'completed' | 'turnedIn'>[] = sagas

interface QuestDef {
  id: string
  name: string
  sagas: string[]
}

const allQuests: QuestDef[] = questsData

interface StoredTimestampEntry {
  id?: unknown
  lastDoneAt?: unknown
  turnedInAt?: unknown
}

const buildTimestampMap = (entries: unknown, valueKey: 'lastDoneAt' | 'turnedInAt'): Record<string, number> => {
  if (!Array.isArray(entries)) {
    return {}
  }

  const map: Record<string, number> = {}

  for (const entry of entries) {
    const item = entry as StoredTimestampEntry
    const id = typeof item.id === 'string' ? item.id : undefined
    const value = typeof item[valueKey] === 'number' ? item[valueKey] : 0
    if (id && Number.isFinite(value)) {
      map[id] = value
    }
  }

  return map
}

const loadTimestampMap = (storageKey: string, valueKey: 'lastDoneAt' | 'turnedInAt'): Record<string, number> => {
  const raw = readLocalStorageItem(storageKey)
  if (!raw) {
    return {}
  }

  try {
    return buildTimestampMap(JSON.parse(raw), valueKey)
  } catch {
    return {}
  }
}

const pruneTimestampMap = (map: Record<string, number>, validIds: Set<string>): Record<string, number> =>
  Object.fromEntries(Object.entries(map).filter(([id]) => validIds.has(id)))

const loadSagaItemsFromLocalStorage = (): { id: string; completed: boolean; turnedIn: boolean }[] | null => {
  const raw = readLocalStorageItem(STORAGE_KEY_V2)
  if (!raw) {
    return null
  }

  try {
    const arr = JSON.parse(raw) as { id?: unknown; completed?: unknown; turnedIn?: unknown }[]
    if (!Array.isArray(arr)) {
      return null
    }

    return arr
      .map((e) => ({
        id: typeof e.id === 'string' ? e.id : undefined,
        completed: Boolean(e.completed),
        turnedIn: Boolean(e.turnedIn)
      }))
      .filter((e) => Boolean(e.id)) as { id: string; completed: boolean; turnedIn: boolean }[]
  } catch {
    return null
  }
}

// Read statuses from localStorage and merge onto the authoritative JSON list

// fuzzy-ish case-insensitive match (substring on normalized text)
const normalize = (s: string) => s.toLowerCase().trim()
const questMatches = (qName: string, query: string) => {
  const nq = normalize(query)

  if (nq.length < 3) {
    return true
  }

  return normalize(qName).includes(nq)
}

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  const nq = normalize(query)
  if (nq.length < 3) return <>{text}</>
  const escapedQuery = query.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) => {
        const key = `${part}-${String(i)}`
        return part.toLowerCase() === nq ? (
          <mark key={key} className='bg-warning text-dark p-0'>
            {part}
          </mark>
        ) : (
          part
        )
      })}
    </>
  )
}

const SagaRow = ({
  def,
  idx,
  item,
  quests,
  isExpanded,
  onToggleExpand,
  onToggleSaga,
  onToggleTurnedIn,
  onResetOne,
  isQuestDone,
  onToggleQuest,
  searchQuery
}: {
  def: (typeof fixedSagas)[0]
  idx: number
  item: SagaItem
  quests: QuestDef[]
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleSaga: () => void
  onToggleTurnedIn: () => void
  onResetOne: () => void
  isQuestDone: (sagaId: string, questId: string) => boolean
  onToggleQuest: (sagaId: string, questId: string) => void
  searchQuery: string
}) => {
  const total = quests.length
  const done = quests.filter((q) => isQuestDone(def.id, q.id)).length
  const partial = total > 0 && done > 0 && done < total

  return (
    <Fragment>
      <Row
        className={`align-items-center py-2 px-1 px-md-0 mx-0 rounded saga-data-row ${idx % 2 === 1 ? 'saga-row-stripe' : ''}`}
      >
        {/* Done checkbox (order 1 on desktop) */}
        <Col
          xs={6}
          md={1}
          className='d-flex align-items-center justify-content-start justify-content-md-center my-1 order-3 order-md-1'
        >
          <IndeterminateCheck
            checked={item.completed}
            indeterminate={partial}
            onChange={onToggleSaga}
            className='mb-0'
            ariaLabel={`Mark ${item.name} as completed`}
            label={<span className='d-md-none ms-2'>Done</span>}
          />
        </Col>

        {/* Saga Name (order 2 on desktop) */}
        <Col
          xs={8}
          md={4}
          className='d-flex flex-column mb-1 mb-md-0 order-1 order-md-2 text-start justify-content-md-center'
        >
          <span className='fw-bold fw-md-normal'>
            <HighlightedText text={item.name} query={searchQuery} />
          </span>
          <span className='text-secondary small ms-4'>Contact: {item.npc}</span>
        </Col>

        {/* Level Range (order 3 on desktop) */}
        <Col
          xs={4}
          md={2}
          className='d-flex align-items-center justify-content-end justify-content-md-start mb-1 mb-md-0 order-2 order-md-3'
        >
          <Badge bg='secondary' title='Level range' className='w-auto'>
            {item.levelRange}
          </Badge>
        </Col>

        {/* Turned in (order 4 on desktop) */}
        <Col
          xs={6}
          md={2}
          className='d-flex align-items-center justify-content-start justify-content-md-center my-1 order-4 order-md-4'
        >
          <Form.Check
            type='checkbox'
            className='mb-0'
            id={`turned-in-${item.id}`}
            aria-label={`Mark ${item.name} as turned in`}
            checked={item.turnedIn}
            onChange={onToggleTurnedIn}
            label={<span className='d-md-none'>Turned in</span>}
          />
        </Col>

        {/* Actions (order 5 on desktop) */}
        <Col
          xs={12}
          md={3}
          className='d-flex align-items-center justify-content-end gap-2 mt-2 mt-md-0 order-5 order-md-5'
        >
          {quests.length ? (
            <Button
              size='sm'
              variant='outline-info'
              className='flex-grow-1 flex-md-grow-0'
              onClick={onToggleExpand}
              title={isExpanded ? 'Hide quests for this saga' : 'Show quests for this saga'}
            >
              {isExpanded ? 'Hide quests' : 'Show quests'}
            </Button>
          ) : null}
          <Button
            size='sm'
            variant='outline-secondary'
            className='flex-grow-1 flex-md-grow-0'
            onClick={onResetOne}
            title='Reset this saga for a new run (archiving previous completions)'
          >
            New Run
          </Button>
        </Col>
      </Row>

      {isExpanded && quests.length ? (
        <Row className='pb-2 mx-0'>
          <Col xs={12} md={{ span: 11, offset: 1 }}>
            <Card className='mt-1 border-0 bg-light-subtle'>
              <Card.Body className='py-2 px-3'>
                <Stack gap={1}>
                  {quests
                    .filter((q) => questMatches(q.name, searchQuery))
                    .map((q) => (
                      <div
                        key={q.id}
                        className='d-flex align-items-center justify-content-between py-1 border-bottom border-secondary-subtle last-child-no-border'
                      >
                        <div className='d-flex align-items-center gap-2'>
                          <Form.Check
                            type='checkbox'
                            className='mb-0'
                            id={`quest-${item.id}-${q.id}`}
                            checked={isQuestDone(item.id, q.id)}
                            onChange={() => {
                              onToggleQuest(item.id, q.id)
                            }}
                            label={<HighlightedText text={q.name} query={searchQuery} />}
                            aria-label={`Mark quest ${q.name} as done for ${item.name}`}
                          />
                        </div>
                      </div>
                    ))}
                  {!quests.filter((q) => questMatches(q.name, searchQuery)).length && (
                    <div className='text-secondary small'>No quests matching search.</div>
                  )}
                </Stack>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : null}
    </Fragment>
  )
}

const SagaList = ({
  items,
  listDefs,
  questsBySaga,
  expanded,
  onToggleExpand,
  toggle,
  toggleTurnedIn,
  resetOne,
  isQuestDoneForSaga,
  toggleQuestForSaga,
  searchQuery
}: {
  items: SagaItem[]
  listDefs: typeof fixedSagas
  questsBySaga: Record<string, QuestDef[]>
  expanded: Record<string, boolean>
  onToggleExpand: (id: string) => void
  toggle: (id: string) => void
  toggleTurnedIn: (id: string) => void
  resetOne: (id: string) => void
  isQuestDoneForSaga: (sagaId: string, questId: string) => boolean
  toggleQuestForSaga: (sagaId: string, questId: string) => void
  searchQuery: string
}) => (
  <Stack gap={1}>
    {/* Header row for columns (visible md+) */}
    <Row className='text-secondary small fw-semibold d-none d-md-flex saga-header-row px-1 px-md-0 mx-0 mb-1'>
      <Col md={1} className='d-flex justify-content-md-center'>
        Done
      </Col>
      <Col md={4} className='d-flex justify-content-md-start'>
        Saga
      </Col>
      <Col md={2} className='d-flex justify-content-md-start'>
        Level Range
      </Col>
      <Col md={2} className='d-flex justify-content-md-center'>
        Turned in
      </Col>
      <Col md={3} className='d-flex justify-content-md-end'>
        Actions
      </Col>
    </Row>
    {listDefs.map((def, idx) => {
      const item = items.find((i) => i.id === def.id) ?? { ...def, completed: false, turnedIn: false }
      return (
        <SagaRow
          key={def.id}
          def={def}
          idx={idx}
          item={item}
          quests={questsBySaga[def.id] ?? []}
          isExpanded={expanded[def.id]}
          onToggleExpand={() => {
            onToggleExpand(def.id)
          }}
          onToggleSaga={() => {
            toggle(def.id)
          }}
          onToggleTurnedIn={() => {
            toggleTurnedIn(def.id)
          }}
          onResetOne={() => {
            resetOne(def.id)
          }}
          isQuestDone={isQuestDoneForSaga}
          onToggleQuest={toggleQuestForSaga}
          searchQuery={searchQuery}
        />
      )
    })}
  </Stack>
)

const SagaTracker = () => {
  const [items, setItems] = useState<SagaItem[]>(() => loadInitial(fixedSagas, STORAGE_KEY_V2) as SagaItem[])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>(() => {
    return readLocalStorageItem(STORAGE_KEY_ACTIVE_TAB) ?? 'heroic'
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // quest last completion timestamp (epoch ms). Applies globally across sagas
  const [questDoneAt, setQuestDoneAt] = useState<Record<string, number>>(() =>
    pruneTimestampMap(loadTimestampMap(STORAGE_KEY_QUESTS_V1, 'lastDoneAt'), new Set(allQuests.map((q) => q.id)))
  )

  // per-saga turned-in time, used to determine if a quest counts for that saga
  const [turnedInAt, setTurnedInAt] = useState<Record<string, number>>(() =>
    pruneTimestampMap(loadTimestampMap(STORAGE_KEY_TURNED_IN_AT_V1, 'turnedInAt'), new Set(fixedSagas.map((s) => s.id)))
  )

  // expand/collapse state per saga row
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const migrateSagaStorage = async () => {
    await requestPersistentStorage()

    try {
      let dbItems = await idbGetSagaItems()
      let dbQuests = await idbGetQuestDoneAt()
      let dbTurned = await idbGetTurnedInAt()

      if (!dbItems) {
        const localItems = loadSagaItemsFromLocalStorage()
        if (localItems) {
          dbItems = localItems
          await idbSetSagaItems(localItems)
        }
      }

      if (!dbQuests) {
        dbQuests = loadTimestampMap(STORAGE_KEY_QUESTS_V1, 'lastDoneAt')
        if (Object.keys(dbQuests).length > 0) {
          await idbSetQuestDoneAt(dbQuests)
        }
      }

      if (!dbTurned) {
        dbTurned = loadTimestampMap(STORAGE_KEY_TURNED_IN_AT_V1, 'turnedInAt')
        if (Object.keys(dbTurned).length > 0) {
          await idbSetTurnedInAt(dbTurned)
        }
      }

      if (dbItems && Array.isArray(dbItems)) {
        const status = new Map(dbItems.map((e) => [e.id, e]))
        setItems(
          fixedSagas.map((s) => ({
            ...s,
            completed: Boolean(status.get(s.id)?.completed),
            turnedIn: Boolean(status.get(s.id)?.turnedIn)
          }))
        )
      }

      if (Object.keys(dbQuests).length > 0) setQuestDoneAt(dbQuests)
      if (Object.keys(dbTurned).length > 0) setTurnedInAt(dbTurned)
    } catch (e) {
      console.error('IDB load/migration failed, relying on localStorage initial state', e)
    }
  }

  // One-time: request persistent storage and migrate from localStorage to IndexedDB if needed.
  useEffect(() => {
    migrateSagaStorage().catch(console.error)
  }, [])

  useEffect(() => {
    // Persist a compact representation containing only statuses by id.
    try {
      const compact = items.map(({ id, completed, turnedIn }) => ({ id, completed, turnedIn }))
      // Primary: IndexedDB
      idbSetSagaItems(compact).catch(console.error)
      // Fallback/Mirror: localStorage
      writeLocalStorageItem(STORAGE_KEY_V2, JSON.stringify(compact))
    } catch {
      // ignore storage errors
    }
  }, [items])

  // One-time sync: if a saga is already marked turnedIn (from older saves) but
  // we have no timestamp for it, initialize a cutoff so past quest runs don't count.
  const initialSyncRef = useRef(false)

  useEffect(() => {
    if (initialSyncRef.current) return
    initialSyncRef.current = true

    // Use a small delay to avoid synchronous state update in effect
    const timeoutId = setTimeout(() => {
      setTurnedInAt((prev) => {
        let changed = false
        const next = { ...prev }

        for (const it of items) {
          if (it.turnedIn && (!Number.isFinite(prev[it.id]) || (prev[it.id] ?? 0) === 0)) {
            next[it.id] = Date.now()
            changed = true
          }
        }

        return changed ? next : prev
      })
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [items])

  useEffect(() => {
    try {
      const compact = Object.entries(questDoneAt).map(([id, lastDoneAt]) => ({ id, lastDoneAt }))
      idbSetQuestDoneAt(questDoneAt).catch(console.error)
      writeLocalStorageItem(STORAGE_KEY_QUESTS_V1, JSON.stringify(compact))
    } catch {
      // ignore
    }
  }, [questDoneAt])

  useEffect(() => {
    try {
      const compact = Object.entries(turnedInAt).map(([id, t]) => ({ id, turnedInAt: t }))
      idbSetTurnedInAt(turnedInAt).catch(console.error)
      writeLocalStorageItem(STORAGE_KEY_TURNED_IN_AT_V1, JSON.stringify(compact))
    } catch {
      // ignore
    }
  }, [turnedInAt])

  useEffect(() => {
    if (activeTab) {
      writeLocalStorageItem(STORAGE_KEY_ACTIVE_TAB, activeTab)
    }
  }, [activeTab])

  const completedCount = useMemo(() => items.filter((i) => i.completed).length, [items])

  const categorizedSagas = useMemo(() => {
    const heroic: typeof fixedSagas = []
    const epic: typeof fixedSagas = []
    const legendary: typeof fixedSagas = []

    for (const item of fixedSagas) {
      const match = /(\d+)/.exec(item.levelRange)
      if (match) {
        const lv = Number.parseInt(match[1], 10)
        if (lv < 20) {
          heroic.push(item)
        } else if (lv <= 30) {
          epic.push(item)
        } else {
          legendary.push(item)
        }
      } else {
        // Default to heroic if no level found, or handle as needed
        heroic.push(item)
      }
    }

    return { heroic, epic, legendary }
  }, []) // Stable categories, only depends on fixed list

  const toggle = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    const nowCompleted = !item.completed

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: nowCompleted } : i)))

    // Also update all quests for this saga
    const quests = questsBySaga[id] ?? []
    if (quests.length > 0) {
      const now = nowCompleted ? Date.now() : 0

      setQuestDoneAt((m) => {
        const next = { ...m }
        for (const q of quests) {
          next[q.id] = now
        }
        return next
      })
    }
  }

  const toggleTurnedIn = (id: string) => {
    let nowTurnedIn = false

    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) {
          return i
        }

        nowTurnedIn = !i.turnedIn
        return { ...i, turnedIn: nowTurnedIn }
      })
    )

    // update timestamp map to reflect turn-in point for this saga
    setTurnedInAt((m) => {
      const copy = { ...m }
      if (nowTurnedIn) {
        copy[id] = Date.now()
      } else {
        // clearing turned in re-allows all previously completed quests to count
        copy[id] = 0
      }
      return copy
    })
  }

  const resetChecks = () => {
    setItems((prev) => prev.map((i) => ({ ...i, completed: false, turnedIn: false })))
    // clear all timestamps
    setTurnedInAt({})
    setQuestDoneAt({})
  }

  const resetOne = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: false, turnedIn: false } : i)))
    // Set cutoff to now so previously completed quests no longer count toward this saga
    setTurnedInAt((m) => ({ ...m, [id]: Date.now() }))
  }

  // derived: saga -> quests belonging to it
  const questsBySaga = useMemo(() => {
    const map: Record<string, QuestDef[]> = {}
    for (const s of fixedSagas) map[s.id] = []
    for (const q of allQuests) {
      for (const sid of q.sagas) {
        if (sid in map) map[sid].push(q)
      }
    }

    // sort alphabetically by name for stability
    for (const sid of Object.keys(map)) {
      map[sid].sort((a, b) => a.name.localeCompare(b.name))
    }

    return map
  }, [])

  // quest completion for a specific saga based on timestamps
  const isQuestDoneForSaga = useCallback(
    (sagaId: string, questId: string): boolean => {
      const qTime = questDoneAt[questId] ?? 0
      const tTime = turnedInAt[sagaId] ?? 0

      return qTime > tTime
    },
    [questDoneAt, turnedInAt]
  )

  const toggleQuestForSaga = (sagaId: string, questId: string) => {
    const checked = isQuestDoneForSaga(sagaId, questId)
    if (checked) {
      // unchecking clears globally
      setQuestDoneAt((m) => ({ ...m, [questId]: 0 }))
    } else {
      setQuestDoneAt((m) => ({ ...m, [questId]: Date.now() }))
    }
  }

  // When pressing the search button or Enter, auto-expand sagas that have matching quests or names
  const lastProcessedQueryRef = useRef('')

  const updateExpanded = useCallback(
    (nq: string) => {
      setExpanded((prev) => {
        if (nq.length < 3) {
          return Object.keys(prev).length === 0 ? prev : {}
        }

        const next: Record<string, boolean> = {}
        for (const s of fixedSagas) {
          const qs = questsBySaga[s.id] ?? []
          next[s.id] = qs.some((qq) => normalize(qq.name).includes(nq))
        }

        return compareExpanded(prev, next)
      })
    },
    [questsBySaga]
  )

  useEffect(() => {
    const nq = normalize(searchQuery)
    if (nq === lastProcessedQueryRef.current) return
    lastProcessedQueryRef.current = nq

    // Use a small delay to avoid synchronous state update in effect
    const timeoutId = setTimeout(() => {
      updateExpanded(nq)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [searchQuery, updateExpanded])

  const runSearch = () => {
    // Legacy function, now handled by useEffect for auto-expansion
  }

  // Export/Import support
  const exportSagaData = () => {
    try {
      const payload = {
        version: 2,
        items: items.map(({ id, completed, turnedIn }) => ({ id, completed, turnedIn })),
        questDoneAt,
        turnedInAt
      }
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'yourddo-saga-backup.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }

  const onToggleExpand = (id: string) => {
    setExpanded((e) => ({ ...e, [id]: !e[id] }))
  }

  const onImportClick = () => fileInputRef.current?.click()
  const onImportFile = async (file?: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text) as {
        version?: number
        items?: { id: string; completed: boolean; turnedIn: boolean }[]
        questDoneAt?: Record<string, number>
        turnedInAt?: Record<string, number>
      }
      if (Array.isArray(data.items)) {
        // write both to state and idb
        const status = new Map(data.items.map((e) => [e.id, e]))
        setItems(
          fixedSagas.map((s) => ({
            ...s,
            completed: Boolean(status.get(s.id)?.completed),
            turnedIn: Boolean(status.get(s.id)?.turnedIn)
          }))
        )
        idbSetSagaItems(data.items).catch(console.error)
      }
      if (data.questDoneAt && typeof data.questDoneAt === 'object') {
        setQuestDoneAt(data.questDoneAt)
        idbSetQuestDoneAt(data.questDoneAt).catch(console.error)
      }
      if (data.turnedInAt && typeof data.turnedInAt === 'object') {
        setTurnedInAt(data.turnedInAt)
        idbSetTurnedInAt(data.turnedInAt).catch(console.error)
      }
    } catch {
      // ignore
    }
  }

  const updateSagaItems = useCallback(() => {
    setItems((prevItems) => {
      let hasChanges = false
      const nextItems: SagaItem[] = []

      for (const it of prevItems) {
        const quests = questsBySaga[it.id] as QuestDef[] | undefined
        let nextIt = it

        if (quests && quests.length > 0) {
          const tTime = turnedInAt[it.id] ?? 0
          const allDone = quests.every((q) => (questDoneAt[q.id] ?? 0) > tTime)
          if (allDone !== it.completed) {
            hasChanges = true
            nextIt = { ...it, completed: allDone }
          }
        }

        nextItems.push(nextIt)
      }

      return hasChanges ? nextItems : prevItems
    })
  }, [questsBySaga, questDoneAt, turnedInAt])

  // Auto-check a saga as completed when all its quests are completed (since its last turn-in).
  useEffect(() => {
    const timeoutId = setTimeout(updateSagaItems, 0)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [updateSagaItems])

  function compareExpanded(prev: Record<string, boolean>, next: Record<string, boolean>) {
    const prevKeys = Object.keys(prev)
    const nextKeys = Object.keys(next)
    let innerChanged = prevKeys.length !== nextKeys.length

    if (!innerChanged) {
      for (const k of nextKeys) {
        if (next[k] !== prev[k]) {
          innerChanged = true
          break
        }
      }
    }

    return innerChanged ? next : prev
  }

  return (
    <Stack gap={3} className='p-2 p-md-3'>
      <h1 className='mb-0 h2'>Saga Tracker</h1>
      <div className='text-secondary'>Track your DDO saga completion.</div>

      <Card>
        <Card.Body className='d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3'>
          <div className='flex-grow-1'>
            <InputGroup>
              <Form.Control
                placeholder='Search quests...'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch()
                }}
                aria-label='Search quests'
              />
              <Button
                variant='outline-secondary'
                onClick={runSearch}
                title='Search and expand sagas with matching quests'
              >
                <FaMagnifyingGlass />
              </Button>
            </InputGroup>
          </div>

          <div className='d-flex gap-2 flex-shrink-0 flex-wrap'>
            <Button variant='outline-secondary' onClick={resetChecks} disabled={items.length === 0} title='Uncheck all'>
              Reset Progress
            </Button>
            <Button
              variant='outline-secondary'
              onClick={() => {
                exportSagaData()
              }}
              title='Download a backup JSON'
            >
              Export
            </Button>
            <input
              ref={fileInputRef}
              type='file'
              accept='application/json'
              className='d-none'
              onChange={(e) => {
                onImportFile(e.target.files?.[0]).catch(console.error)
              }}
            />
            <Button variant='outline-secondary' onClick={onImportClick} title='Restore from a backup JSON'>
              Import
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className='d-flex justify-content-between align-items-center'>
          <div>Tracked Sagas</div>
          <div className='text-secondary small'>
            {completedCount} / {items.length} completed
          </div>
        </Card.Header>
        <Card.Body>
          {items.length === 0 ? (
            <div className='text-secondary'>No sagas found.</div>
          ) : (
            <Tabs
              id='saga-tabs'
              activeKey={activeTab}
              onSelect={(k) => {
                setActiveTab(k ?? 'heroic')
              }}
              className='mb-3'
              fill
            >
              <Tab eventKey='heroic' title='Heroic (1-20)'>
                <SagaList
                  items={items}
                  listDefs={categorizedSagas.heroic}
                  questsBySaga={questsBySaga}
                  expanded={expanded}
                  onToggleExpand={onToggleExpand}
                  toggle={toggle}
                  toggleTurnedIn={toggleTurnedIn}
                  resetOne={resetOne}
                  isQuestDoneForSaga={isQuestDoneForSaga}
                  toggleQuestForSaga={toggleQuestForSaga}
                  searchQuery={searchQuery}
                />
              </Tab>
              <Tab eventKey='epic' title='Epic (21-30)'>
                <SagaList
                  items={items}
                  listDefs={categorizedSagas.epic}
                  questsBySaga={questsBySaga}
                  expanded={expanded}
                  onToggleExpand={onToggleExpand}
                  toggle={toggle}
                  toggleTurnedIn={toggleTurnedIn}
                  resetOne={resetOne}
                  isQuestDoneForSaga={isQuestDoneForSaga}
                  toggleQuestForSaga={toggleQuestForSaga}
                  searchQuery={searchQuery}
                />
              </Tab>
              <Tab eventKey='legendary' title='Legendary (31+)'>
                <SagaList
                  items={items}
                  listDefs={categorizedSagas.legendary}
                  questsBySaga={questsBySaga}
                  expanded={expanded}
                  onToggleExpand={onToggleExpand}
                  toggle={toggle}
                  toggleTurnedIn={toggleTurnedIn}
                  resetOne={resetOne}
                  isQuestDoneForSaga={isQuestDoneForSaga}
                  toggleQuestForSaga={toggleQuestForSaga}
                  searchQuery={searchQuery}
                />
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>
    </Stack>
  )
}

export default SagaTracker
