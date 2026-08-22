import { Alert, Button, Divider, FileInput, Notification, Stack, Text, Textarea } from '@mantine/core'
import { IconAlertTriangle, IconCheck, IconCopy, IconDownload, IconLink, IconUpload } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { copyText, downloadTextFile, readTextFile } from '../../../shared/serialization/browser.ts'
import type {
  HgsInitialData,
  HgsSelection,
  HgsTier2Data,
  HgsTier3Data,
  HgsValidCombination
} from '../heroicGreenSteel.types.ts'
import {
  buildHgsPermalinkUrl,
  formatHgsBbCode,
  formatHgsDiscordMarkdown,
  formatHgsJsonBuild,
  HGS_JSON_FILENAME,
  parseHgsJsonBuild,
  resolveHgsBuildView,
  validateHgsBuild
} from '../sharing.ts'

interface SharingToolProps {
  selection: HgsSelection
  initial: HgsInitialData
  tier2?: HgsTier2Data
  tier3?: HgsTier3Data
  combinations?: readonly HgsValidCombination[]
  onImport: (selection: HgsSelection) => void
}

const SharingTool = ({ selection, initial, tier2, tier3, combinations, onImport }: SharingToolProps) => {
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const [jsonInput, setJsonInput] = useState('')
  const json = useMemo(() => formatHgsJsonBuild(selection), [selection])
  const view = useMemo(
    () => (tier2 && tier3 ? resolveHgsBuildView(selection, { initial, tier2, tier3 }) : null),
    [initial, selection, tier2, tier3]
  )
  const humanView = view ?? { altars: [] }
  const canPresent = Boolean(view?.baseItem)
  const canImport = Boolean(tier2 && tier3 && combinations)

  const copy = async (text: string, message: string) => {
    try {
      await copyText(text)
      setStatus({ kind: 'success', message })
    } catch {
      setStatus({ kind: 'error', message: 'Copy failed. Please try again.' })
    }
  }
  const importJson = (text: string) => {
    if (!tier2 || !tier3 || !combinations) {
      setStatus({ kind: 'error', message: 'Select a base item and wait for HGS data before importing.' })
      return
    }
    try {
      const next = validateHgsBuild(parseHgsJsonBuild(text), { initial, tier2, tier3, combinations })
      onImport(next)
      setStatus({ kind: 'success', message: 'HGS build loaded.' })
    } catch (cause) {
      setStatus({ kind: 'error', message: cause instanceof Error ? cause.message : 'Invalid HGS JSON' })
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
          onClick={() => void copy(buildHgsPermalinkUrl(selection), 'Permalink copied.')}
        >
          Copy Permalink
        </Button>
        <Button
          leftSection={<IconCopy size={18} />}
          disabled={!canPresent}
          onClick={() => void copy(formatHgsDiscordMarkdown(humanView), 'Discord Markdown copied.')}
        >
          Copy Discord
        </Button>
        <Button
          leftSection={<IconCopy size={18} />}
          disabled={!canPresent}
          onClick={() => void copy(formatHgsBbCode(humanView), 'Forum BBCode copied.')}
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
            downloadTextFile(json, HGS_JSON_FILENAME)
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
          label='Paste HGS JSON'
          value={jsonInput}
          onChange={(event) => {
            setJsonInput(event.currentTarget.value)
          }}
          minRows={5}
        />
        <Button
          leftSection={<IconUpload size={18} />}
          disabled={!canImport}
          onClick={() => {
            importJson(jsonInput)
          }}
        >
          Load Build
        </Button>
        <FileInput
          label='Or select a JSON file'
          accept='application/json,.json'
          disabled={!canImport}
          onChange={(file) => void loadFile(file)}
        />
        {!canImport ? (
          <Text size='xs' c='dimmed'>
            Select a base item to load the current HGS catalog for validation.
          </Text>
        ) : null}
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

export default SharingTool
