import { Button, Notification, Stack, Text, TextInput } from '@mantine/core'
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import type { EssenceCraftingData } from './essenceCrafting.types.ts'
import { buildEssenceCraftingPermalinkUrl, encodeEssenceCraftingPermalink } from './permalink.ts'
import type { EssencePlanState } from './plannerState.ts'

interface PermalinkToolProps {
  data: EssenceCraftingData
  plan: EssencePlanState
}

const PermalinkTool = ({ data, plan }: PermalinkToolProps) => {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const permalink = useMemo(
    () => buildEssenceCraftingPermalinkUrl(encodeEssenceCraftingPermalink(data, plan)),
    [data, plan]
  )

  const copyPermalink = async () => {
    try {
      await navigator.clipboard.writeText(permalink)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <Stack gap='md'>
      <Text size='sm' c='dimmed'>
        This link restores the compact planner state shown in the workspace.
      </Text>
      <TextInput
        label='Essence Crafting permalink'
        value={permalink}
        readOnly
        onFocus={(event) => {
          event.currentTarget.select()
        }}
      />
      <Button onClick={() => void copyPermalink()}>Copy permalink</Button>
      {copyState === 'copied' ? (
        <Notification icon={<IconCheck size={18} />} color='green' withCloseButton={false} role='status'>
          Permalink copied.
        </Notification>
      ) : null}
      {copyState === 'error' ? (
        <Notification icon={<IconAlertTriangle size={18} />} color='red' withCloseButton={false} role='alert'>
          The permalink could not be copied. Select the link and copy it manually.
        </Notification>
      ) : null}
    </Stack>
  )
}

export default PermalinkTool
