import { Alert, Button, Divider, FileInput, Notification, Stack, Text, Textarea } from '@mantine/core'
import { IconAlertTriangle, IconCheck, IconCopy, IconDownload, IconLink, IconUpload } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { copyText, downloadTextFile, readTextFile } from '../../../shared/serialization/browser.ts'
import type { LgsData, LgsPlan } from '../legendaryGreenSteel.types.ts'
import {
  buildLgsPermalinkUrl,
  formatLgsBbCode,
  formatLgsDiscordMarkdown,
  formatLgsJsonBuild,
  LGS_JSON_FILENAME,
  parseLgsJsonBuild,
  resolveLgsBuildView,
  validateLgsBuild
} from '../sharing.ts'

const ToolsTool = ({ plan, data, onImport }: { plan: LgsPlan; data: LgsData; onImport: (plan: LgsPlan) => void }) => {
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const [jsonInput, setJsonInput] = useState('')
  const json = useMemo(() => formatLgsJsonBuild(plan), [plan])
  const view = useMemo(() => resolveLgsBuildView(plan, data), [data, plan])
  const canPresent = Boolean(view.baseItem)

  const copy = async (text: string, message: string) => {
    try {
      await copyText(text)
      setStatus({ kind: 'success', message })
    } catch {
      setStatus({ kind: 'error', message: 'Copy failed. Please try again.' })
    }
  }
  const importJson = (text: string) => {
    try {
      onImport(validateLgsBuild(parseLgsJsonBuild(text), data))
      setStatus({ kind: 'success', message: 'LGS build loaded.' })
    } catch (cause) {
      setStatus({ kind: 'error', message: cause instanceof Error ? cause.message : 'Invalid LGS JSON' })
    }
  }
  const loadFile = async (file: File | null) => {
    if (!file) return
    try {
      const text = await readTextFile(file)
      setJsonInput(text)
      importJson(text)
    } catch {
      setStatus({ kind: 'error', message: 'Could not read that JSON file.' })
    }
  }

  return (
    <Stack gap='lg' p='md'>
      <Stack gap='xs'>
        <Text fw={600}>Share</Text>
        <Button
          leftSection={<IconLink size={18} />}
          onClick={() => void copy(buildLgsPermalinkUrl(plan), 'Permalink copied.')}
        >
          Copy Permalink
        </Button>
        <Button
          leftSection={<IconCopy size={18} />}
          disabled={!canPresent}
          onClick={() => void copy(formatLgsDiscordMarkdown(view), 'Discord Markdown copied.')}
        >
          Copy Discord
        </Button>
        <Button
          leftSection={<IconCopy size={18} />}
          disabled={!canPresent}
          onClick={() => void copy(formatLgsBbCode(view), 'Forum BBCode copied.')}
        >
          Copy Forum
        </Button>
        {!canPresent ? (
          <Text size='xs' c='dimmed'>
            Select a base item before creating a human-readable export.
          </Text>
        ) : null}
      </Stack>

      <Divider />
      <Stack gap='xs'>
        <Text fw={600}>Export JSON</Text>
        <Button leftSection={<IconCopy size={18} />} onClick={() => void copy(json, 'JSON copied.')}>
          Copy JSON
        </Button>
        <Button
          leftSection={<IconDownload size={18} />}
          onClick={() => {
            downloadTextFile(json, LGS_JSON_FILENAME)
            setStatus({ kind: 'success', message: 'JSON downloaded.' })
          }}
        >
          Download JSON
        </Button>
      </Stack>

      <Divider />
      <Stack gap='xs'>
        <Text fw={600}>Import JSON</Text>
        <Textarea
          label='Paste LGS JSON'
          value={jsonInput}
          onChange={(event) => {
            setJsonInput(event.currentTarget.value)
          }}
          minRows={5}
        />
        <Button
          leftSection={<IconUpload size={18} />}
          onClick={() => {
            importJson(jsonInput)
          }}
        >
          Load Build
        </Button>
        <FileInput
          label='Or select a JSON file'
          accept='application/json,.json'
          onChange={(file) => {
            void loadFile(file)
          }}
        />
      </Stack>

      {status?.kind === 'success' ? (
        <Notification
          icon={<IconCheck size={18} />}
          color='green'
          withCloseButton={false}
          role='status'
          aria-live='polite'
        >
          {status.message}
        </Notification>
      ) : null}
      {status?.kind === 'error' ? (
        <Alert icon={<IconAlertTriangle size={18} />} color='red' role='alert'>
          {status.message}
        </Alert>
      ) : null}
    </Stack>
  )
}

export default ToolsTool
