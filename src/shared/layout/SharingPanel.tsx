import { Alert, Button, Divider, FileInput, NativeSelect, Notification, Stack, Text, Textarea } from '@mantine/core'
import { IconAlertTriangle, IconCheck, IconCopy, IconDownload, IconLink, IconUpload } from '@tabler/icons-react'
import { type ReactNode, useContext, useState } from 'react'
import { copyText, downloadTextFile, readTextFile } from '../serialization/browser.ts'

import { BackupOnly } from './plannerView'

interface SharingPanelProps {
  permalink?: string
  discord: string
  forum: string
  shareHint?: string
  disableText?: boolean
  preview?: boolean
  downloads?: { discord: string; forum: string }
  jsonExport?: { text: () => string; filename: string; hint?: string }
  jsonImport?: {
    label: string
    load: (text: string) => ReactNode
    disabled?: boolean
    hint?: string
    button?: string
  }
}

export default function SharingPanel({
  permalink,
  discord,
  forum,
  shareHint,
  disableText,
  preview,
  downloads,
  jsonExport,
  jsonImport
}: Readonly<SharingPanelProps>) {
  const backupOnly = useContext(BackupOnly)
  const [status, setStatus] = useState<{
    section: 'share' | 'export' | 'import'
    error?: boolean
    message: ReactNode
    manualText?: string
  } | null>(null)
  const [input, setInput] = useState('')
  const [previewFormat, setPreviewFormat] = useState(permalink ? 'Permalink' : 'Forum BBCode')
  const outputs = [
    ...(permalink ? [{ label: 'Permalink', text: permalink }] : []),
    { label: 'Discord Markdown', text: discord },
    { label: 'Forum BBCode', text: forum }
  ]

  const copy = async (text: string, format: string, section: 'share' | 'export' = 'share') => {
    try {
      await copyText(text)
      setStatus({ section, message: format + ' copied.' })
    } catch {
      setStatus({
        section,
        error: true,
        message: 'Copy failed. Select the text below to copy it manually.',
        manualText: text
      })
    }
  }
  const download = (text: string, filename: string, section: 'share' | 'export') => {
    try {
      downloadTextFile(text, filename, section === 'export' ? 'application/json' : 'text/plain;charset=utf-8')
      setStatus({ section, message: 'Downloaded ' + filename + '.' })
    } catch {
      setStatus({ section, error: true, message: 'Download failed. Please try again.' })
    }
  }
  const load = (text: string) => {
    if (!jsonImport || jsonImport.disabled) return
    try {
      setStatus({ section: 'import', message: jsonImport.load(text) })
    } catch (cause) {
      setStatus({ section: 'import', error: true, message: cause instanceof Error ? cause.message : 'Invalid JSON.' })
    }
  }
  const loadFile = async (file: File | null) => {
    if (!file) return
    try {
      const text = await readTextFile(file)
      setInput(text)
      load(text)
    } catch {
      setStatus({ section: 'import', error: true, message: 'Could not read that JSON file.' })
    }
  }

  const feedback =
    status &&
    (status.error ? (
      <Alert icon={<IconAlertTriangle size={18} />} color='red' role='alert'>
        {status.message}
        {status.manualText && (
          <Textarea
            mt='xs'
            label='Text to copy'
            value={status.manualText}
            readOnly
            rows={4}
            onFocus={(e) => {
              e.currentTarget.select()
            }}
          />
        )}
      </Alert>
    ) : (
      <Notification
        icon={<IconCheck size={18} />}
        color='green'
        withCloseButton={false}
        role='status'
        aria-live='polite'
      >
        {status.message}
      </Notification>
    ))
  return (
    <Stack gap='lg' p={backupOnly ? 0 : 'md'}>
      {!backupOnly && (
        <Stack gap='xs'>
          <Text fw={600}>Share</Text>
          {shareHint && (
            <Text size='sm' c='dimmed'>
              {shareHint}
            </Text>
          )}
          {permalink && (
            <Button leftSection={<IconLink size={18} />} onClick={() => void copy(permalink, 'Permalink')}>
              Copy Permalink
            </Button>
          )}
          <Button
            leftSection={<IconCopy size={18} />}
            disabled={disableText}
            onClick={() => void copy(discord, 'Discord Markdown')}
          >
            Copy Discord
          </Button>
          <Button
            leftSection={<IconCopy size={18} />}
            disabled={disableText}
            onClick={() => void copy(forum, 'Forum BBCode')}
          >
            Copy Forum
          </Button>
          {preview && (
            <details>
              <summary>Preview share text</summary>
              <Stack gap='xs' mt='xs'>
                <NativeSelect
                  label='Preview format'
                  data={outputs.map((o) => o.label)}
                  value={previewFormat}
                  onChange={(e) => {
                    setPreviewFormat(e.currentTarget.value)
                  }}
                />
                <Textarea
                  label='Share preview'
                  readOnly
                  rows={5}
                  value={outputs.find((o) => o.label === previewFormat)?.text ?? ''}
                  onFocus={(e) => {
                    e.currentTarget.select()
                  }}
                />
              </Stack>
            </details>
          )}
          {downloads && (
            <details>
              <summary>Download share text</summary>
              <Stack gap='xs' mt='xs'>
                <Button
                  variant='light'
                  leftSection={<IconDownload size={18} />}
                  onClick={() => {
                    download(discord, downloads.discord, 'share')
                  }}
                >
                  Download Discord Markdown
                </Button>
                <Button
                  variant='light'
                  leftSection={<IconDownload size={18} />}
                  onClick={() => {
                    download(forum, downloads.forum, 'share')
                  }}
                >
                  Download Forum BBCode
                </Button>
              </Stack>
            </details>
          )}
          {downloads && discord.length > 2000 && (
            <Text size='xs' c='dimmed'>
              This setup exceeds 2,000 characters. Download the Discord Markdown to share it as an attachment.
            </Text>
          )}
          {status?.section === 'share' && feedback}
        </Stack>
      )}
      {jsonExport && (
        <>
          {!backupOnly && <Divider />}
          <Stack gap='xs'>
            <Text fw={600}>Export JSON</Text>
            {jsonExport.hint && (
              <Text size='sm' c='dimmed'>
                {jsonExport.hint}
              </Text>
            )}
            <Button leftSection={<IconCopy size={18} />} onClick={() => void copy(jsonExport.text(), 'JSON', 'export')}>
              Copy JSON
            </Button>
            <Button
              leftSection={<IconDownload size={18} />}
              onClick={() => {
                download(jsonExport.text(), jsonExport.filename, 'export')
              }}
            >
              Download JSON
            </Button>
            {status?.section === 'export' && feedback}
          </Stack>
        </>
      )}
      {jsonImport && (
        <>
          <Divider />
          <Stack gap='xs'>
            <Text fw={600}>Import JSON</Text>
            {jsonImport.hint && (
              <Text size='sm' c='dimmed'>
                {jsonImport.hint}
              </Text>
            )}
            <Textarea
              label={jsonImport.label}
              value={input}
              onChange={(e) => {
                setInput(e.currentTarget.value)
              }}
              rows={5}
            />
            <Button
              leftSection={<IconUpload size={18} />}
              disabled={jsonImport.disabled}
              onClick={() => {
                load(input)
              }}
            >
              {jsonImport.button ?? 'Load Build'}
            </Button>
            <FileInput
              label='Or select a JSON file'
              clearable
              accept='application/json,.json'
              disabled={jsonImport.disabled}
              onChange={(file) => void loadFile(file)}
            />
            {status?.section === 'import' && feedback}
          </Stack>
        </>
      )}
    </Stack>
  )
}
