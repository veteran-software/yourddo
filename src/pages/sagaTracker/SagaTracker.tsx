import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Stack
} from 'react-bootstrap'
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

// Authoritative fixed list from JSON (no completion fields in file)
const fixedSagas: Omit<SagaItem, 'completed' | 'turnedIn'>[] = sagas as unknown as {
  id: string
  name: string
  levelRange: string
  npc: string
}[]

interface QuestDef {
  id: string
  name: string
  sagas: string[]
}

const allQuests: QuestDef[] = questsData as unknown as QuestDef[]

// Read statuses from localStorage and merge onto the authoritative JSON list

const SagaTracker = () => {
  const [items, setItems] = useState<SagaItem[]>(() => loadInitial(fixedSagas, STORAGE_KEY_V2) as SagaItem[])
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // quest last completion timestamp (epoch ms). Applies globally across sagas
  //eslint-disable-next-line sonarjs/cognitive-complexity
  const [questDoneAt, setQuestDoneAt] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_QUESTS_V1)
      if (!raw) return {}

      const arr = JSON.parse(raw) as { id?: unknown; lastDoneAt?: unknown }[]
      const map: Record<string, number> = {}

      if (Array.isArray(arr)) {
        for (const e of arr) {
          const id = typeof e.id === 'string' ? e.id : undefined
          const t = typeof e.lastDoneAt === 'number' ? e.lastDoneAt : 0
          if (id && Number.isFinite(t)) map[id] = t
        }
      }

      // prune unknown quests
      const known = new Set(allQuests.map((q) => q.id))
      for (const k of Object.keys(map)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        if (!known.has(k)) delete map[k]
      }

      return map
    } catch {
      return {}
    }
  })

  // per-saga turned-in time, used to determine if a quest counts for that saga
  //eslint-disable-next-line sonarjs/cognitive-complexity
  const [turnedInAt, setTurnedInAt] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TURNED_IN_AT_V1)
      if (!raw) return {}
      const arr = JSON.parse(raw) as { id?: unknown; turnedInAt?: unknown }[]
      const map: Record<string, number> = {}
      if (Array.isArray(arr)) {
        for (const e of arr) {
          const id = typeof e.id === 'string' ? e.id : undefined
          const t = typeof e.turnedInAt === 'number' ? e.turnedInAt : 0
          if (id && Number.isFinite(t)) map[id] = t
        }
      }

      // prune unknown sagas
      const known = new Set(fixedSagas.map((s) => s.id))
      for (const k of Object.keys(map)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        if (!known.has(k)) delete map[k]
      }

      return map
    } catch {
      return {}
    }
  })

  // expand/collapse state per saga row
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // One-time: request persistent storage and migrate from localStorage to IndexedDB if needed.
  useEffect(() => {
    //eslint-disable-next-line sonarjs/cognitive-complexity
    ;(async () => {
      await requestPersistentStorage()

      try {
        const [dbItems, dbQuests, dbTurned] = await Promise.all([
          idbGetSagaItems(),
          idbGetQuestDoneAt(),
          idbGetTurnedInAt()
        ])

        // Items: if IndexedDB empty, migrate from localStorage compact array
        if (!dbItems) {
          try {
            const raw = localStorage.getItem(STORAGE_KEY_V2)
            if (raw) {
              const arr = JSON.parse(raw) as { id?: unknown; completed?: unknown; turnedIn?: unknown }[]
              if (Array.isArray(arr)) {
                const compact = arr
                  .map((e) => ({
                    id: typeof e.id === 'string' ? e.id : undefined,
                    completed: !!e.completed,
                    turnedIn: !!e.turnedIn
                  }))
                  .filter((e) => !!e.id) as { id: string; completed: boolean; turnedIn: boolean }[]
                await idbSetSagaItems(compact)
              }
            }
          } catch {
            // ignore
          }
        }

        // Quests map migration
        if (!dbQuests) {
          try {
            const raw = localStorage.getItem(STORAGE_KEY_QUESTS_V1)
            if (raw) {
              const arr = JSON.parse(raw) as { id?: unknown; lastDoneAt?: unknown }[]
              const map: Record<string, number> = {}
              if (Array.isArray(arr)) {
                for (const e of arr) {
                  const id = typeof e.id === 'string' ? e.id : undefined
                  const t = typeof e.lastDoneAt === 'number' ? e.lastDoneAt : 0
                  if (id && Number.isFinite(t)) map[id] = t
                }
              }
              await idbSetQuestDoneAt(map)
            }
          } catch {
            // ignore
          }
        }

        // Turned-in map migration
        if (!dbTurned) {
          try {
            const raw = localStorage.getItem(STORAGE_KEY_TURNED_IN_AT_V1)
            if (raw) {
              const arr = JSON.parse(raw) as { id?: unknown; turnedInAt?: unknown }[]
              const map: Record<string, number> = {}
              if (Array.isArray(arr)) {
                for (const e of arr) {
                  const id = typeof e.id === 'string' ? e.id : undefined
                  const t = typeof e.turnedInAt === 'number' ? e.turnedInAt : 0
                  if (id && Number.isFinite(t)) map[id] = t
                }
              }
              await idbSetTurnedInAt(map)
            }
          } catch {
            // ignore
          }
        }

        // Now, load from IndexedDB (may be newly migrated) and hydrate state
        const [newDbItems, newDbQuests, newDbTurned] = await Promise.all([
          idbGetSagaItems(),
          idbGetQuestDoneAt(),
          idbGetTurnedInAt()
        ])

        if (newDbItems && Array.isArray(newDbItems)) {
          const status = new Map(newDbItems.map((e) => [e.id, e]))
          setItems(
            fixedSagas.map((s) => ({
              ...s,
              completed: !!status.get(s.id)?.completed,
              turnedIn: !!status.get(s.id)?.turnedIn
            }))
          )
        }

        if (newDbQuests) setQuestDoneAt(newDbQuests)
        if (newDbTurned) setTurnedInAt(newDbTurned)
      } catch {
        // ignore any IDB errors
      }
    })().catch(console.error)
  }, [])

  useEffect(() => {
    // Persist a compact representation containing only statuses by id.
    try {
      const compact = items.map(({ id, completed, turnedIn }) => ({ id, completed, turnedIn }))
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(compact))
      // Also persist to IndexedDB (more durable)
      idbSetSagaItems(compact).catch(console.error)
    } catch {
      // ignore storage errors
    }
  }, [items])

  // One-time sync: if a saga is already marked turnedIn (from older saves) but
  // we have no timestamp for it, initialize a cutoff so past quest runs don't count.
  useEffect(() => {
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
    // run only on the initial mount with initial items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      const compact = Object.entries(questDoneAt).map(([id, lastDoneAt]) => ({ id, lastDoneAt }))
      localStorage.setItem(STORAGE_KEY_QUESTS_V1, JSON.stringify(compact))
      idbSetQuestDoneAt(questDoneAt).catch(console.error)
    } catch {
      // ignore
    }
  }, [questDoneAt])

  useEffect(() => {
    try {
      const compact = Object.entries(turnedInAt).map(([id, t]) => ({ id, turnedInAt: t }))
      localStorage.setItem(STORAGE_KEY_TURNED_IN_AT_V1, JSON.stringify(compact))
      idbSetTurnedInAt(turnedInAt).catch(console.error)
    } catch {
      // ignore
    }
  }, [turnedInAt])

  const completedCount = useMemo(() => items.filter((i) => i.completed).length, [items])

  const toggle = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)))

    // If marking the saga as completed, also mark all of its quests as completed (globally)
    const quests = questsBySaga[id] ?? []
    if (quests.length > 0) {
      // Determine if it is being set to "completed" now by peeking at the current state
      const nowCompleted = !items.find((it) => it.id === id)?.completed
      if (nowCompleted) {
        const now = Date.now()

        setQuestDoneAt((m) => {
          const next = { ...m }
          for (const q of quests) next[q.id] = now
          return next
        })
      }
    }
  }

  const toggleTurnedIn = (id: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) {
          return i
        }

        const nowTurnedIn = !i.turnedIn
        // update timestamp map to reflect turn-in point for this saga
        // eslint-disable-next-line sonarjs/no-nested-functions
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
        return { ...i, turnedIn: nowTurnedIn }
      })
    )
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

  // fuzzy-ish case-insensitive match (substring on normalized text)
  const normalize = (s: string) => s.toLowerCase().trim()
  const questMatches = (qName: string, query: string) => {
    const nq = normalize(query)

    if (!nq) {
      return true
    }

    return normalize(qName).includes(nq)
  }

  // When pressing the search button or Enter, auto-expand sagas that have matching quests
  const runSearch = () => {
    const q = searchQuery.trim()

    if (!q) {
      return
    }

    setExpanded((prev) => {
      const next = { ...prev }

      for (const s of fixedSagas) {
        const quests = questsBySaga[s.id] ?? []

        if (quests.some((qq) => questMatches(qq.name, q))) {
          next[s.id] = true
        }
      }

      return next
    })
  }

  // Export/Import support
  const exportSagaData = () => {
    try {
      const payload = {
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

  const onImportClick = () => fileInputRef.current?.click()
  const onImportFile = async (file?: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text) as {
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
            completed: !!status.get(s.id)?.completed,
            turnedIn: !!status.get(s.id)?.turnedIn
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

  // Auto-check a saga as completed when all its quests are completed (since its last turn-in).
  useEffect(() => {
    setItems((prev) => {
      let changed = false

      const next = prev.map((it) => {
        const quests = questsBySaga[it.id] ?? []

        if (quests.length === 0) return it // no auto-check for sagas without quests
        const allDone = quests.every((q) => isQuestDoneForSaga(it.id, q.id))

        if (allDone !== it.completed) {
          changed = true
          return { ...it, completed: allDone }
        }
        return it
      })

      return changed ? next : prev
    })
  }, [questDoneAt, turnedInAt, questsBySaga, isQuestDoneForSaga])

  return (
    <Stack gap={3} className='p-2 p-md-3'>
      <h2 className='mb-0'>Saga Tracker</h2>
      <div className='text-secondary'>Track your DDO saga completion.</div>

      <Card>
        <Card.Body className='d-flex justify-content-between align-items-center'>
          <div className='flex-grow-1 me-2'>
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

          <div className='d-flex gap-2 flex-shrink-0'>
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
            <Stack gap={2}>
              {/* Header row for columns (visible md+) */}
              <Row className='text-secondary small fw-semibold d-none d-md-flex align-items-center saga-header-row'>
                <Col md={1}>Done</Col>
                <Col md={5}>Saga</Col>
                <Col md={2}>Level Range</Col>
                <Col md={2}>Turned in</Col>
                <Col md={2} className='text-end'>
                  Actions
                </Col>
              </Row>
              {items.map((item, idx) => (
                <Fragment key={item.id}>
                  <Row className={`align-items-center gy-2 ${idx % 2 === 1 ? 'saga-row-stripe' : ''}`}>
                    {/* Completed checkbox */}
                    <Col xs={6} md={1} className='d-flex align-items-center my-1'>
                      {(() => {
                        const quests = questsBySaga[item.id] ?? []
                        const total = quests.length
                        const done = quests.filter((q) => isQuestDoneForSaga(item.id, q.id)).length
                        const partial = total > 0 && done > 0 && done < total

                        return (
                          <IndeterminateCheck
                            checked={item.completed}
                            indeterminate={partial}
                            onChange={() => {
                              toggle(item.id)
                            }}
                            ariaLabel={`Mark ${item.name} as completed`}
                            label={<span className='d-md-none'>Done</span>}
                          />
                        )
                      })()}
                    </Col>

                    {/* Saga name (no strikethrough when completed) */}
                    <Col xs={12} md={5} className='my-1'>
                      <div className='d-flex flex-column'>
                        <span>{item.name}</span>
                        <span className='text-secondary small ms-4'>Contact: {item.npc}</span>
                      </div>
                    </Col>

                    {/* Level range in its own column (badge) */}
                    <Col xs={6} md={2} className='d-flex align-items-center my-1'>
                      <Badge bg='secondary' title='Level range' className='w-auto'>
                        {item.levelRange}
                      </Badge>
                    </Col>

                    {/* "Turned in" checkbox */}
                    <Col xs={6} md={2} className='d-flex align-items-center my-1'>
                      <Form.Check
                        type='checkbox'
                        aria-label={`Mark ${item.name} as turned in`}
                        checked={item.turnedIn}
                        onChange={() => {
                          toggleTurnedIn(item.id)
                        }}
                        label={<span className='d-md-none'>Turned in</span>}
                      />
                    </Col>

                    {/* Actions: Show/Hide quests and per-saga reset */}
                    <Col xs={12} md={2} className='d-flex align-items-center justify-content-md-end gap-2 mt-2 mt-md-0'>
                      {questsBySaga[item.id].length ? (
                        <Button
                          size='sm'
                          variant='outline-info'
                          onClick={() => {
                            setExpanded((e) => ({ ...e, [item.id]: !e[item.id] }))
                          }}
                          title={expanded[item.id] ? 'Hide quests for this saga' : 'Show quests for this saga'}
                        >
                          {expanded[item.id] ? 'Hide quests' : 'Show quests'}
                        </Button>
                      ) : null}
                      <Button
                        size='sm'
                        variant='outline-secondary'
                        onClick={() => {
                          resetOne(item.id)
                        }}
                        title='Reset this saga (uncheck Completed and Turned in)'
                      >
                        Reset
                      </Button>
                    </Col>
                  </Row>

                  {expanded[item.id] && questsBySaga[item.id].length ? (
                    <Row className='pb-2'>
                      <Col xs={12} md={{ span: 10, offset: 1 }}>
                        <Card className='mt-2'>
                          <Card.Body>
                            <Stack gap={1}>
                              {questsBySaga[item.id]
                                .filter((q) => questMatches(q.name, searchQuery))
                                .map((q) => (
                                  <div key={q.id} className='d-flex align-items-center justify-content-between'>
                                    <div className='d-flex align-items-center gap-2'>
                                      <Form.Check
                                        type='checkbox'
                                        checked={isQuestDoneForSaga(item.id, q.id)}
                                        onChange={() => {
                                          toggleQuestForSaga(item.id, q.id)
                                        }}
                                        aria-label={`Mark quest ${q.name} as done for ${item.name}`}
                                      />
                                      <span>{q.name}</span>
                                    </div>
                                  </div>
                                ))}
                              {!questsBySaga[item.id].filter((q) => questMatches(q.name, searchQuery)).length && (
                                <div className='text-secondary small'>No quests defined.</div>
                              )}
                            </Stack>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  ) : null}
                </Fragment>
              ))}
            </Stack>
          )}
        </Card.Body>
      </Card>
    </Stack>
  )
}

export default SagaTracker
