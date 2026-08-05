import { Alert, Button, Notification, Select, Stack, Text, Textarea } from '@mantine/core'
import { IconAlertTriangle, IconCheck, IconCopy } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { type ExportFormat, formatViktraniumExport } from '../export.ts'
import type { FinishedViktraniumItem, IngredientCalculation } from '../viktranium.types.ts'

const ExportTool = ({
  finished,
  ingredients
}: {
  finished: FinishedViktraniumItem
  ingredients: IngredientCalculation
}) => {
  const [format, setFormat] = useState<ExportFormat>('forum')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const text = useMemo(() => formatViktraniumExport(format, finished, ingredients), [finished, format, ingredients])
  if (!finished.item)
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to export the current build.
      </Alert>
    )
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('success')
    } catch {
      setCopyStatus('error')
    }
  }
  return (
    <Stack gap='md' p='md'>
      <Select
        label='Export format'
        value={format}
        allowDeselect={false}
        data={[
          { value: 'forum', label: 'Forums (BBCode)' },
          { value: 'discord', label: 'Discord (Markdown)' }
        ]}
        onChange={(value) => {
          if (value === 'forum' || value === 'discord') {
            setFormat(value)
            setCopyStatus('idle')
          }
        }}
      />
      <Textarea label='Export preview' value={text} readOnly autosize minRows={12} maxRows={22} />
      <Button leftSection={<IconCopy size={18} />} onClick={() => void copy()}>
        Copy export
      </Button>
      {copyStatus === 'success' ? (
        <Notification
          icon={<IconCheck size={18} />}
          color='green'
          withCloseButton={false}
          role='status'
          aria-live='polite'
        >
          <Text size='sm'>Build copied to the clipboard.</Text>
        </Notification>
      ) : null}
      {copyStatus === 'error' ? (
        <Notification icon={<IconAlertTriangle size={18} />} color='red' withCloseButton={false} role='alert'>
          <Text size='sm'>Copy failed. Select the preview text and copy it manually.</Text>
        </Notification>
      ) : null}
    </Stack>
  )
}

export default ExportTool
