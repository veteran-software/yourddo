import { Button, Notification, Stack, Text } from '@mantine/core'
import { IconAlertTriangle, IconCheck, IconCopy, IconDownload } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import type { EssenceBinding, EssenceCraftingData } from './essenceCrafting.types.ts'
import type { EssencePlanMaterials } from './materialCalculations.ts'
import {
  ESSENCE_PLAN_BACKUP_FILENAME,
  formatEssencePlanBbCode,
  formatEssencePlanDiscordMarkdown,
  formatEssencePlanJsonBackup
} from './planExport.ts'
import type { EssencePlanState } from './plannerState.ts'

interface ExportToolProps {
  binding: EssenceBinding
  data: EssenceCraftingData
  plan: EssencePlanState
  planMaterials: EssencePlanMaterials
}

type ExportAction =
  'JSON backup downloaded.' | 'BBCode copied to the clipboard.' | 'Discord Markdown copied to the clipboard.'

const ExportTool = ({ binding, data, plan, planMaterials }: ExportToolProps) => {
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const jsonBackup = useMemo(() => formatEssencePlanJsonBackup(data, plan, binding), [binding, data, plan])
  const bbCode = useMemo(
    () => formatEssencePlanBbCode(data, plan, binding, planMaterials),
    [binding, data, plan, planMaterials]
  )
  const discordMarkdown = useMemo(
    () => formatEssencePlanDiscordMarkdown(data, plan, binding, planMaterials),
    [binding, data, plan, planMaterials]
  )

  const copy = async (text: string, message: Exclude<ExportAction, 'JSON backup downloaded.'>) => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus({ kind: 'success', message })
    } catch {
      setStatus({ kind: 'error', message: 'Copy failed. Please try again.' })
    }
  }

  const downloadJson = () => {
    const url = URL.createObjectURL(new Blob([jsonBackup], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = ESSENCE_PLAN_BACKUP_FILENAME
    link.click()
    URL.revokeObjectURL(url)
    setStatus({ kind: 'success', message: 'JSON backup downloaded.' })
  }

  return (
    <Stack gap='lg' p='md'>
      <Stack gap={4}>
        <Text fw={600}>JSON Backup</Text>
        <Text c='dimmed' size='sm'>
          Download a machine-readable snapshot of your current planner selections.
        </Text>
        <Button leftSection={<IconDownload size={18} />} onClick={downloadJson} w='fit-content'>
          Download JSON
        </Button>
      </Stack>

      <Stack gap={4}>
        <Text fw={600}>BBCode</Text>
        <Text c='dimmed' size='sm'>
          Copy a forum-friendly plan for DDO forums and similar sites.
        </Text>
        <Button
          leftSection={<IconCopy size={18} />}
          onClick={() => void copy(bbCode, 'BBCode copied to the clipboard.')}
          w='fit-content'
        >
          Copy BBCode
        </Button>
      </Stack>

      <Stack gap={4}>
        <Text fw={600}>Discord Markdown</Text>
        <Text c='dimmed' size='sm'>
          Copy a readable plan formatted for direct pasting into Discord.
        </Text>
        <Button
          leftSection={<IconCopy size={18} />}
          onClick={() => void copy(discordMarkdown, 'Discord Markdown copied to the clipboard.')}
          w='fit-content'
        >
          Copy Discord Markdown
        </Button>
      </Stack>

      {status?.kind === 'success' ? (
        <Notification
          icon={<IconCheck size={18} />}
          color='green'
          withCloseButton={false}
          role='status'
          aria-live='polite'
        >
          <Text size='sm'>{status.message}</Text>
        </Notification>
      ) : null}
      {status?.kind === 'error' ? (
        <Notification icon={<IconAlertTriangle size={18} />} color='red' withCloseButton={false} role='alert'>
          <Text size='sm'>{status.message}</Text>
        </Notification>
      ) : null}
    </Stack>
  )
}

export default ExportTool
