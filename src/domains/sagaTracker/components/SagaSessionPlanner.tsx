import { ActionIcon, Badge, Button, Checkbox, Group, Paper, Select, Stack, Text, Title } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { IconArrowBackUp, IconCheck, IconListCheck, IconPlus, IconRoute, IconX } from '@tabler/icons-react'
import { useId, useMemo, useRef, useState } from 'react'
import { buildSagaSession, categorizeSaga } from '../logic'
import type { SagaTrackerData, SagaTrackerProgress } from '../sagaTracker.types'
import classes from './SagaSessionPlanner.module.css'

interface Completion {
  id: string
  name: string
  previous: number | undefined
  recorded: number
}

const tiers = { heroic: 'Heroic', epic: 'Epic', legendary: 'Legendary' }

function readSelection(raw: string | undefined): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? 'null')
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string'))] : []
  } catch {
    return []
  }
}

export default function SagaSessionPlanner({
  data,
  progress,
  onQuestUpdate
}: Readonly<{
  data: SagaTrackerData
  progress: SagaTrackerProgress
  onQuestUpdate: (id: string, completedAt: number | undefined, expected?: number) => void
}>) {
  const [selection, setSelection] = useLocalStorage<string[]>({
    key: 'yourddo:saga-tracker:session:v1',
    defaultValue: [],
    deserialize: readSelection
  })
  const [search, setSearch] = useState('')
  const [lastCompletion, setLastCompletion] = useState<Completion>()
  const pickerRef = useRef<HTMLInputElement>(null)
  const queueHeading = useRef<HTMLHeadingElement>(null)
  const plannerId = useId()
  const sagasById = useMemo(() => new Map(data.sagas.map((saga) => [saga.id, saga])), [data.sagas])
  const { sagaStatus, questDoneAt, turnedInAt } = progress
  const selected = selection.flatMap((id) => sagasById.get(id) ?? [])
  const active = new Set(selected.filter(({ id }) => !sagaStatus[id]?.turnedIn).map(({ id }) => id))
  const { queue, remainingBySaga, sharedCount } = buildSagaSession(data.quests, active, questDoneAt, turnedInAt)
  const selectedIds = new Set(selection)
  const choices = data.sagas.filter(({ id }) => !selectedIds.has(id)).sort((a, b) => a.name.localeCompare(b.name))
  const groupedChoices = Map.groupBy(choices, (saga) => saga.tier ?? categorizeSaga(saga.levelRange))
  const options = (['heroic', 'epic', 'legendary'] as const).flatMap((tier) => {
    const items = groupedChoices.get(tier)
    return items?.length
      ? [
          {
            group: tiers[tier],
            items: items.map(({ id, name }) => ({
              value: id,
              label: sagaStatus[id]?.turnedIn ? name + ' · Turned in' : name
            }))
          }
        ]
      : []
  })
  const questInputId = (questId: string) => plannerId + '-quest-' + questId
  const canUndo = lastCompletion && questDoneAt[lastCompletion.id] === lastCompletion.recorded

  return (
    <div className={classes.layout}>
      <Paper withBorder p='md' className={classes.selection}>
        <Stack gap='md'>
          <div>
            <Title order={2} size='h4'>
              Sagas for this session
            </Title>
            <Text size='sm' c='dimmed' mt={4}>
              Add the sagas you want to work on together.
            </Text>
          </div>
          <Select
            ref={pickerRef}
            aria-label='Add a saga to this session'
            placeholder={options.length ? 'Find a saga…' : 'All sagas added'}
            leftSection={<IconPlus size={16} />}
            data={options}
            value={null}
            searchable
            searchValue={search}
            onSearchChange={setSearch}
            onChange={(id) => {
              if (id && sagasById.has(id)) setSelection((previous) => [...new Set([...previous, id])])
              setSearch('')
            }}
            nothingFoundMessage='No matching sagas'
            disabled={!options.length}
          />
          {selected.length > 0 && (
            <ul className={classes.sagas} aria-label='Selected sagas'>
              {selected.map((saga) => {
                const remaining = remainingBySaga.get(saga.id) ?? 0
                const turnedIn = sagaStatus[saga.id]?.turnedIn
                return (
                  <li key={saga.id}>
                    <div>
                      <Text size='sm' fw={600}>
                        {saga.name}
                      </Text>
                      <Text size='xs' c={remaining || turnedIn ? 'dimmed' : 'teal'}>
                        {turnedIn ? 'Turned in' : remaining ? remaining.toString() + ' left' : 'Ready to turn in'}
                      </Text>
                    </div>
                    <ActionIcon
                      variant='subtle'
                      color='gray'
                      size='lg'
                      aria-label={'Remove ' + saga.name + ' from session'}
                      onClick={() => {
                        setSelection((previous) => previous.filter((id) => id !== saga.id))
                        // Enable the picker first when every saga was selected.
                        requestAnimationFrame(() => pickerRef.current?.focus())
                      }}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </li>
                )
              })}
            </ul>
          )}
        </Stack>
      </Paper>
      <Paper withBorder className={classes.checklist} component='section' aria-labelledby={plannerId + '-title'}>
        <header className={classes.header}>
          <div className={classes.heading}>
            <IconListCheck size={22} aria-hidden />
            <div>
              <Title ref={queueHeading} order={2} size='h4' id={plannerId + '-title'} tabIndex={-1}>
                Quest checklist
              </Title>
              <Text size='sm' c='dimmed' mt={4}>
                Quests that count toward more of your sagas come first.
              </Text>
            </div>
          </div>
          {active.size > 0 && (
            <Group gap='xs' mt='sm'>
              <Badge variant='light' size='lg' color='gray'>
                {queue.length} {queue.length === 1 ? 'quest' : 'quests'} left
              </Badge>
              {sharedCount > 0 && (
                <Badge variant='light' size='lg' color='teal'>
                  {sharedCount} shared
                </Badge>
              )}
            </Group>
          )}
        </header>

        {canUndo && (
          <div className={classes.receipt}>
            <Text role='status' size='sm'>
              Completed {lastCompletion.name}
            </Text>
            <Button
              size='compact-sm'
              variant='subtle'
              leftSection={<IconArrowBackUp size={16} />}
              onClick={() => {
                onQuestUpdate(lastCompletion.id, lastCompletion.previous, lastCompletion.recorded)
                setLastCompletion(undefined)
                requestAnimationFrame(() => {
                  const target = document.getElementById(questInputId(lastCompletion.id)) ?? queueHeading.current
                  target?.focus()
                })
              }}
            >
              Undo
            </Button>
          </div>
        )}

        {queue.length ? (
          <ol className={classes.quests}>
            {queue.map(({ quest, neededBy }, index) => (
              <li key={quest.id} className={classes.quest}>
                <Checkbox
                  className={classes.check}
                  id={questInputId(quest.id)}
                  aria-label={'Complete ' + quest.name}
                  checked={false}
                  color='teal'
                  size='md'
                  label={
                    <Text component='span' size='sm' fw={650}>
                      {quest.name}
                    </Text>
                  }
                  onChange={(event) => {
                    if (!event.currentTarget.checked) return
                    const neighbor = queue[index + 1] ?? queue[index - 1]
                    const target =
                      (neighbor && document.getElementById(questInputId(neighbor.quest.id))) ?? queueHeading.current
                    target?.focus()
                    const recorded = Math.max(Date.now(), ...neededBy.map((id) => (turnedInAt[id] ?? 0) + 1))
                    setLastCompletion({ id: quest.id, name: quest.name, previous: questDoneAt[quest.id], recorded })
                    onQuestUpdate(quest.id, recorded)
                  }}
                />
                <div className={classes.questDetails}>
                  <Text size='xs' c='dimmed'>
                    Level {quest.level}
                    {quest.chain && ' · ' + quest.chain}
                  </Text>
                  <Group gap={5}>
                    {neededBy.map((id) => (
                      <span className={classes.coverage} data-shared={neededBy.length > 1 || undefined} key={id}>
                        {sagasById.get(id)?.name}
                      </span>
                    ))}
                  </Group>
                </div>
                {neededBy.length > 1 && (
                  <Badge variant='light' color='teal' size='sm' className={classes.shared}>
                    {neededBy.length} sagas
                  </Badge>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <div className={classes.empty}>
            {active.size ? <IconCheck size={26} aria-hidden /> : <IconRoute size={26} aria-hidden />}
            <Text fw={600}>
              {active.size
                ? 'Your session checklist is complete'
                : selected.length
                  ? 'No active saga runs'
                  : 'Choose your sagas to begin'}
            </Text>
            <Text c='dimmed' size='sm'>
              {active.size
                ? 'Open Saga progress when you’re ready to record your turn-ins.'
                : selected.length
                  ? 'Start a new run in Saga progress to bring a turned-in saga back into the checklist.'
                  : 'Quests shared by the sagas you choose will appear here together.'}
            </Text>
          </div>
        )}
      </Paper>
    </div>
  )
}
