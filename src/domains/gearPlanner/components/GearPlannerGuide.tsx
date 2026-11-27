import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip
} from '@mantine/core'
import { IconAdjustments, IconDeviceFloppy, IconInfoCircle, IconListDetails, IconSword } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { PlannerEditingHelp } from '../../../shared/layout/PlannerEditActions'
import { usePlannerShortcuts } from '../../../shared/layout/usePlannerShortcuts'
import { GEAR_PLANNER_STORAGE_KEY } from '../plannerStorage'

const tutorialSeenKey = 'yourddo:gear-planner:tutorial-seen'
const guideDismissedKey = 'yourddo:gear-planner:guide-dismissed'
let tutorialSeenInSession = false

const tutorial = [
  {
    title: 'Set up your character',
    icon: IconAdjustments,
    body: (
      <>
        Open <strong>Character setup</strong> to choose your classes and level range. Add focus stats in priority order
        to rank gear and augment recommendations around the bonuses you need.
      </>
    )
  },
  {
    title: 'Equip gear',
    icon: IconSword,
    body: (
      <>
        Select an equipment slot to browse items for it. Search by item name or enchantment, then choose
        <strong> Equip</strong> on a result. Use <strong>Find gear</strong> to search across slots.
      </>
    )
  },
  {
    title: 'Check your bonuses',
    icon: IconListDetails,
    body: (
      <>
        Open <strong>Enchantments</strong> to see which bonuses stack and <strong>Set Bonuses</strong> to see what
        you’ve activated. Select an equipped item to manage its augments, filigrees, or available upgrades.
      </>
    )
  },
  {
    title: 'Save and share your setup',
    icon: IconDeviceFloppy,
    body: (
      <>
        The planner saves your setups in this browser. Use <strong>Import / Export</strong> to download a backup or open{' '}
        <strong>Sharing</strong> and choose <strong>Copy Permalink</strong> to share your active setup.
      </>
    )
  }
]

type GuideView = { type: 'about' } | { type: 'tutorial'; step: number } | null

function initialView(): GuideView {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  if (url.searchParams.has('gp') || new URLSearchParams(url.hash.slice(1)).has('gp')) return null

  try {
    const dismissed = localStorage.getItem(guideDismissedKey) ?? localStorage.getItem('gearPlannerInfoDismissed')
    if (dismissed === 'true' || localStorage.getItem(tutorialSeenKey) || localStorage.getItem(GEAR_PLANNER_STORAGE_KEY))
      return null
  } catch {
    if (tutorialSeenInSession) return null
  }
  return { type: 'tutorial', step: 0 }
}

export default function GearPlannerGuide() {
  const [view, setView] = useState<GuideView>(initialView)
  const step = view?.type === 'tutorial' ? view.step : undefined
  const isTutorial = step !== undefined
  const stepContent = step === undefined ? undefined : tutorial[step]
  const StepIcon = stepContent?.icon
  const openAbout = () => {
    setView({ type: 'about' })
  }
  const startTutorial = () => {
    setView({ type: 'tutorial', step: 0 })
  }
  const close = () => {
    setView(null)
  }

  useEffect(() => {
    if (!isTutorial) return
    try {
      localStorage.setItem(tutorialSeenKey, 'true')
    } catch {
      tutorialSeenInSession = true
    }
  }, [isTutorial])

  usePlannerShortcuts({ help: openAbout })

  return (
    <>
      <Tooltip label='About and backup guide'>
        <ActionIcon variant='subtle' aria-label='About and backup guide' aria-haspopup='dialog' onClick={openAbout}>
          <IconInfoCircle size={23} aria-hidden />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={view !== null}
        onClose={close}
        title={isTutorial ? 'Gear Planner tutorial' : 'About the Gear Planner'}
        closeButtonProps={{ 'aria-label': isTutorial ? 'Close tutorial' : 'Close planner guide' }}
        centered
        size='md'
      >
        {step !== undefined && stepContent && StepIcon ? (
          <Stack gap='md'>
            <Stack gap={5}>
              <Text size='xs' c='dimmed'>
                Step {step + 1} of {tutorial.length}
              </Text>
              <Progress value={((step + 1) / tutorial.length) * 100} aria-label='Tutorial progress' size='xs' />
            </Stack>
            <Group gap='sm' align='center' wrap='nowrap'>
              <ThemeIcon variant='light' size='lg'>
                <StepIcon size={21} aria-hidden />
              </ThemeIcon>
              <Title order={3} size='h4' aria-live='polite'>
                {stepContent.title}
              </Title>
            </Group>
            <Text size='sm'>{stepContent.body}</Text>
            <Group justify='space-between' gap='xs'>
              <Button size='compact-sm' variant='subtle' onClick={close}>
                Skip tutorial
              </Button>
              <Group gap='xs'>
                {step > 0 && (
                  <Button
                    size='compact-sm'
                    variant='default'
                    onClick={() => {
                      setView({ type: 'tutorial', step: step - 1 })
                    }}
                  >
                    Back
                  </Button>
                )}
                {step === tutorial.length - 1 ? (
                  <Button size='compact-sm' onClick={close}>
                    Start planning
                  </Button>
                ) : (
                  <Button
                    size='compact-sm'
                    onClick={() => {
                      setView({ type: 'tutorial', step: step + 1 })
                    }}
                  >
                    Next
                  </Button>
                )}
              </Group>
            </Group>
          </Stack>
        ) : view?.type === 'about' ? (
          <Stack gap='md'>
            <Text size='sm'>
              Choose your classes in <strong>Character setup</strong> to filter equipment and unlock companion slots for
              an Artificer or Druid. Select a slot to browse gear. <strong>Enchantments</strong> shows which bonuses
              stack or overlap. <strong>Set Bonuses</strong> shows how many pieces you need for the next bonus.
            </Text>
            <PlannerEditingHelp />
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
                To share a single setup, open Sharing and use <strong>Copy Permalink</strong>. Opening the link adds it
                to the recipient’s planner.
              </Text>
            </Stack>
            <Divider />
            <Group justify='space-between'>
              <Button variant='light' onClick={startTutorial}>
                Start tutorial
              </Button>
              <Button onClick={close}>Got it</Button>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </>
  )
}
