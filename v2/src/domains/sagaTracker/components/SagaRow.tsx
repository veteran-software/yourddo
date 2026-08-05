import { Badge, Button, Checkbox, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import type { QuestDefinition, SagaCompletionState, SagaDefinition } from '../sagaTracker.types.ts'
import HighlightedText from './HighlightedText.tsx'

interface SagaRowProps {
  saga: SagaDefinition
  quests: QuestDefinition[]
  visibleQuests: QuestDefinition[]
  completionState: SagaCompletionState
  turnedIn: boolean
  expanded: boolean
  query: string
  isQuestComplete: (questId: string) => boolean
  onToggleSaga: (checked: boolean) => void
  onToggleTurnedIn: (checked: boolean) => void
  onToggleQuest: (questId: string, checked: boolean) => void
  onToggleExpanded: () => void
  onNewRun: () => void
}

const SagaRow = ({
  saga,
  quests,
  visibleQuests,
  completionState,
  turnedIn,
  expanded,
  query,
  isQuestComplete,
  onToggleSaga,
  onToggleTurnedIn,
  onToggleQuest,
  onToggleExpanded,
  onNewRun
}: SagaRowProps) => {
  const completedQuests = quests.filter(({ id }) => isQuestComplete(id)).length

  return (
    <Paper withBorder p={{ base: 'md', sm: 'sm' }}>
      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing={{ base: 'sm', sm: 'md' }} verticalSpacing='sm'>
        <Group wrap='nowrap' align='flex-start'>
          <Checkbox
            id={`saga-complete-${saga.id}`}
            mt={3}
            checked={completionState === 'complete'}
            indeterminate={completionState === 'indeterminate'}
            onChange={(event) => {
              onToggleSaga(event.currentTarget.checked)
            }}
            aria-label={`Mark ${saga.name} as completed`}
          />
          <Stack gap={2} miw={0}>
            <Text fw={600} style={{ overflowWrap: 'anywhere' }}>
              <HighlightedText text={saga.name} query={query} />
            </Text>
            <Text size='sm' c='dimmed' style={{ overflowWrap: 'anywhere' }}>
              Contact: {saga.npc}
            </Text>
          </Stack>
        </Group>

        <Stack gap={4}>
          <Text size='xs' c='dimmed' hiddenFrom='sm'>
            Level range
          </Text>
          <Badge variant='light' color='gray' w='fit-content'>
            {saga.levelRange}
          </Badge>
        </Stack>

        <Stack gap={6}>
          <Text size='sm'>
            {completedQuests} / {quests.length} quests
          </Text>
          <Checkbox
            id={`saga-turned-in-${saga.id}`}
            checked={turnedIn}
            onChange={(event) => {
              onToggleTurnedIn(event.currentTarget.checked)
            }}
            label='Turned In'
            aria-label={`Mark ${saga.name} as turned in`}
          />
        </Stack>

        <Group justify='flex-end' align='center' wrap='wrap'>
          {quests.length > 0 && (
            <Button
              variant='light'
              size='sm'
              onClick={onToggleExpanded}
              aria-expanded={expanded}
              aria-controls={`saga-quests-${saga.id}`}
            >
              {expanded ? 'Hide Quests' : 'Show Quests'}
            </Button>
          )}
          <Button variant='default' size='sm' onClick={onNewRun}>
            New Run
          </Button>
        </Group>
      </SimpleGrid>

      {expanded && quests.length > 0 && (
        <Stack id={`saga-quests-${saga.id}`} gap='xs' mt='md' pl={{ sm: 'xl' }}>
          {visibleQuests.length > 0 ? (
            visibleQuests.map((quest) => (
              <Checkbox
                key={quest.id}
                id={`quest-complete-${saga.id}-${quest.id}`}
                checked={isQuestComplete(quest.id)}
                onChange={(event) => {
                  onToggleQuest(quest.id, event.currentTarget.checked)
                }}
                label={<HighlightedText text={quest.name} query={query} />}
                aria-label={`Mark quest ${quest.name} as completed`}
                styles={{ label: { overflowWrap: 'anywhere' } }}
              />
            ))
          ) : (
            <Text size='sm' c='dimmed'>
              No quests match your search.
            </Text>
          )}
        </Stack>
      )}
    </Paper>
  )
}

export default SagaRow
