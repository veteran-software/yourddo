import { keyedEntries } from '../../../shared/ui/keyedEntries'
import { useState } from 'react'
import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import SharingPanel from '../../../shared/layout/SharingPanel'
import type { EssenceCraftingData } from '../../essenceCrafting/essenceCrafting.types'
import type { GearPlannerEffectSource } from '../effects'
import type { GearOwner } from '../character'
import type { GearPlannerData } from '../gearPlanner.types'
import {
  createGearPlannerExport,
  GEAR_PLANNER_EXPORT_FILENAME,
  importGearPlannerState,
  type GearPlannerRestoreIssue
} from '../plannerStorage'
import type { GearPlannerSetState } from '../sets'
import { activeGearPlannerSetup, type GearPlannerSetupsState } from '../setups'
import { formatGearSetup, gearPlannerPermalink } from '../sharing'

export function ImportDetails({ issues }: Readonly<{ issues?: readonly GearPlannerRestoreIssue[] }>) {
  if (!issues?.length) return null
  return (
    <details>
      <summary>Import details</summary>
      <Stack gap={2} mah='8rem' style={{ overflowY: 'auto' }}>
        {keyedEntries(issues).map(({ key, value: issue }) => (
          <Text key={key} size='xs'>
            {issue.message}
          </Text>
        ))}
      </Stack>
    </details>
  )
}

export default function SharingTool({
  state,
  effects,
  ownerSets,
  data,
  essenceData,
  onRestore
}: Readonly<{
  state: GearPlannerSetupsState
  effects: readonly GearPlannerEffectSource[]
  ownerSets: Partial<Record<GearOwner, GearPlannerSetState>>
  data: GearPlannerData
  essenceData: EssenceCraftingData
  onRestore: (state: GearPlannerSetupsState) => void
}>) {
  const [pending, setPending] = useState<ReturnType<typeof importGearPlannerState> | null>(null)
  const setup = activeGearPlannerSetup(state)
  const permalink = gearPlannerPermalink(setup, window.location.href)
  return (
    <>
      <SharingPanel
        permalink={permalink}
        discord={formatGearSetup(setup, effects, ownerSets, 'Discord Markdown', permalink)}
        forum={formatGearSetup(setup, effects, ownerSets, 'Forum BBCode', permalink)}
        shareHint={`Share “${setup.name}”. Opening the link adds this setup to the recipient’s planner.`}
        preview
        downloads={{ discord: 'gear-setup.md', forum: 'gear-setup.bbcode.txt' }}
        jsonExport={{
          filename: GEAR_PLANNER_EXPORT_FILENAME,
          hint: 'Back up all of your setups in one file.',
          text: () => JSON.stringify(createGearPlannerExport(state), null, 2)
        }}
        jsonImport={{
          label: 'Paste Gear Planner JSON',
          button: 'Review backup',
          hint: 'Importing a v2 or legacy save replaces all current setups.',
          load: (text) => {
            const restored = importGearPlannerState(text, data, essenceData)
            setPending(restored)
            return 'Backup file validated.'
          }
        }}
      />
      <Modal
        opened={pending !== null}
        title='Replace current setups?'
        centered
        onClose={() => {
          setPending(null)
        }}
      >
        {pending && (
          <Stack>
            <Text>
              The backup contains {pending.state.setups.length} {pending.state.setups.length === 1 ? 'setup' : 'setups'}
              . Restoring it replaces all {state.setups.length} current {state.setups.length === 1 ? 'setup' : 'setups'}
              .
            </Text>
            <ImportDetails issues={pending.issues} />
            <Group justify='flex-end'>
              <Button
                variant='default'
                data-autofocus
                onClick={() => {
                  setPending(null)
                }}
              >
                Cancel
              </Button>
              <Button
                color='red'
                onClick={() => {
                  onRestore(pending.state)
                  setPending(null)
                }}
              >
                Replace setups
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  )
}
