import { Button, Group, Modal, Text } from '@mantine/core'
import { useState } from 'react'
import SharingPanel from '../../shared/layout/SharingPanel'
import { buildEssenceCraftingPermalinkUrl, encodeEssenceCraftingPermalink } from './permalink'
import type { EssenceBinding, EssenceCraftingData } from './essenceCrafting.types.ts'
import type { EssencePlanMaterials } from './materialCalculations.ts'
import {
  readEssencePlanBackup,
  ESSENCE_PLAN_BACKUP_FILENAME,
  formatEssencePlanBbCode,
  formatEssencePlanDiscordMarkdown,
  formatEssencePlanJsonBackup
} from './planExport.ts'
import type { EssencePlanState } from './plannerState.ts'

interface SharingToolProps {
  onRestore: (backup: ReturnType<typeof readEssencePlanBackup>) => void
  binding: EssenceBinding
  data: EssenceCraftingData
  plan: EssencePlanState
  planMaterials: EssencePlanMaterials
}

export default function SharingTool({ binding, data, plan, planMaterials, onRestore }: Readonly<SharingToolProps>) {
  const [pending, setPending] = useState<ReturnType<typeof readEssencePlanBackup> | null>(null)
  return (
    <>
      <SharingPanel
        permalink={buildEssenceCraftingPermalinkUrl(encodeEssenceCraftingPermalink(data, plan))}
        discord={formatEssencePlanDiscordMarkdown(data, plan, binding, planMaterials)}
        forum={formatEssencePlanBbCode(data, plan, binding, planMaterials)}
        jsonExport={{
          filename: ESSENCE_PLAN_BACKUP_FILENAME,
          text: () => formatEssencePlanJsonBackup(data, plan, binding)
        }}
        jsonImport={{
          label: 'Paste Essence Crafting JSON',
          button: 'Review backup',
          load: (text) => {
            setPending(readEssencePlanBackup(data, text))
            return 'Backup validated.'
          }
        }}
        preview
      />
      <Modal
        opened={!!pending}
        centered
        title='Replace current crafting plan?'
        onClose={() => {
          setPending(null)
        }}
      >
        {pending && (
          <>
            <Text>Restore {pending.plan.activeSlotIds.length} planned items from this backup?</Text>
            <Group justify='flex-end' mt='md'>
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
                onClick={() => {
                  onRestore(pending)
                  setPending(null)
                }}
              >
                Restore plan
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </>
  )
}
