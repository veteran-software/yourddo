import { ActionIcon, Button, Checkbox, Divider, Group, Modal, Stack, Text, Title, Tooltip } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useState } from 'react'

const preferenceKey = 'yourddo:gear-planner:guide-dismissed'

function readDismissed() {
  try {
    return (localStorage.getItem(preferenceKey) ?? localStorage.getItem('gearPlannerInfoDismissed')) === 'true'
  } catch {
    return false
  }
}

export default function GearPlannerGuide() {
  const [dismissed, setDismissed] = useState(readDismissed)
  const [opened, setOpened] = useState(() => {
    const url = new URL(window.location.href)
    return !dismissed && !url.searchParams.has('gp') && !new URLSearchParams(url.hash.slice(1)).has('gp')
  })

  return (
    <>
      <Tooltip label='About and backup guide'>
        <ActionIcon
          variant='subtle'
          aria-label='About and backup guide'
          aria-haspopup='dialog'
          onClick={() => {
            setOpened(true)
          }}
        >
          <IconInfoCircle size={19} aria-hidden />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false)
        }}
        title='About the Gear Planner'
        closeButtonProps={{ 'aria-label': 'Close planner guide' }}
        centered
        size='md'
      >
        <Stack gap='md'>
          <Text size='sm'>
            Choose your classes in <strong>Character setup</strong> to filter equipment and unlock companion slots for
            an Artificer or Druid. Select a slot to browse gear. <strong>Enchantments</strong> shows which bonuses stack
            or overlap. <strong>Set Bonuses</strong> shows how many pieces you need for the next bonus.
          </Text>
          <Divider />
          <Stack gap={4}>
            <Title order={3} size='h5'>
              Back up your setups
            </Title>
            <Text size='sm'>
              Your setups are saved in this browser. Clearing site data removes that copy. Open{' '}
              <strong>Import / Export</strong> and choose <strong>Download JSON</strong> to save every setup in one
              file.
            </Text>
          </Stack>
          <Stack gap={4}>
            <Title order={3} size='h5'>
              Restore a backup
            </Title>
            <Text size='sm'>
              Restoring replaces all current setups. To keep a copy, download them first. In{' '}
              <strong>Import / Export</strong>, under <strong>Import JSON</strong>, select your backup file, or paste
              its contents and choose <strong>Review backup</strong>. Confirm with <strong>Replace setups</strong>.
            </Text>
            <Text size='sm' c='dimmed'>
              To share a single setup, open Sharing and use <strong>Copy Permalink</strong>. Opening the link adds it to
              the recipient’s planner.
            </Text>
          </Stack>
          <Divider />
          <Group justify='space-between'>
            <Checkbox
              label='Don’t show again on startup'
              checked={dismissed}
              onChange={(event) => {
                const next = event.currentTarget.checked
                setDismissed(next)
                try {
                  localStorage.setItem(preferenceKey, String(next))
                } catch {
                  // The preference still applies in this session when browser storage is unavailable.
                }
              }}
            />
            <Button
              onClick={() => {
                setOpened(false)
              }}
            >
              Got it
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
