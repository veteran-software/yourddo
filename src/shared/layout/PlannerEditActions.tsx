import { ActionIcon, Alert, Button, Group, Kbd, List, Stack, Text } from '@mantine/core'
import { IconArrowBackUp, IconArrowForwardUp } from '@tabler/icons-react'
import type { PlannerHistoryEntry } from './usePlannerHistory'
import { unsavedPlannerMessage } from './usePlannerAutosave'
import styles from './PlannerWorkspace.module.css'

interface EditControls {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
}

const historyDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' })

export function PlannerEditActions({ canUndo, canRedo, undo, redo }: Readonly<EditControls>) {
  return (
    <div className={styles.viewToolbar} role='group' aria-label='Plan editing history'>
      <ActionIcon
        variant='light'
        title='Undo (Ctrl or Cmd + Z)'
        aria-label='Undo plan edit'
        aria-keyshortcuts='Control+Z Meta+Z'
        disabled={!canUndo}
        onClick={undo}
      >
        <IconArrowBackUp size={19} aria-hidden />
      </ActionIcon>
      <ActionIcon
        variant='light'
        title='Redo (Ctrl or Cmd + Shift + Z)'
        aria-label='Redo plan edit'
        aria-keyshortcuts='Control+Shift+Z Meta+Shift+Z Control+Y'
        disabled={!canRedo}
        onClick={redo}
      >
        <IconArrowForwardUp size={19} aria-hidden />
      </ActionIcon>
    </div>
  )
}

export function PlannerHistoryTool({ entries }: Readonly<{ entries: readonly PlannerHistoryEntry[] }>) {
  return (
    <Stack gap='sm' p='md'>
      <Text size='sm' c='dimmed'>
        Recent changes appear newest first. Undo and redo are available while this planner is open.
      </Text>
      {entries.length ? (
        <List listStyleType='none' spacing='sm'>
          {entries.map(({ id, at, description }) => (
            <List.Item key={id}>
              <Text size='sm' fw={500}>
                {description}
              </Text>
              <Text component='time' dateTime={at} size='xs' c='dimmed'>
                {historyDate.format(new Date(at))}
              </Text>
            </List.Item>
          ))}
        </List>
      ) : (
        <Text size='sm'>No edits yet.</Text>
      )}
    </Stack>
  )
}

export function PlannerEditingHelp() {
  return (
    <Text size='sm'>
      Use <Kbd>Ctrl</Kbd> or <Kbd>Cmd</Kbd> + <Kbd>Z</Kbd> to undo, and add <Kbd>Shift</Kbd> to redo. Press <Kbd>?</Kbd>{' '}
      for help. Use the toolbar buttons on touch screens.
    </Text>
  )
}

export function PlannerSaveWarning({ retry }: Readonly<{ retry: () => void }>) {
  return (
    <Alert color='yellow' title='Plan changes are unsaved' role='alert'>
      <Group gap='xs' justify='space-between'>
        <Text size='sm'>{unsavedPlannerMessage} Backups are available in Sharing.</Text>
        <Button size='compact-xs' variant='default' onClick={retry}>
          Retry save
        </Button>
      </Group>
    </Alert>
  )
}

export function RevealFilteredResults({
  count,
  revealed,
  onToggle
}: Readonly<{
  count: number
  revealed: boolean
  onToggle: () => void
}>) {
  if (!count) return null
  return (
    <Button size='compact-xs' variant='subtle' aria-pressed={revealed} onClick={onToggle}>
      {revealed ? 'Hide filtered results' : `Show ${count.toLocaleString()} hidden by filters`}
    </Button>
  )
}
