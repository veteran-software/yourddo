import SharingPanel from '../../shared/layout/SharingPanel'
import { buildEssenceCraftingPermalinkUrl, encodeEssenceCraftingPermalink } from './permalink'
import type { EssenceBinding, EssenceCraftingData } from './essenceCrafting.types.ts'
import type { EssencePlanMaterials } from './materialCalculations.ts'
import {
  ESSENCE_PLAN_BACKUP_FILENAME,
  formatEssencePlanBbCode,
  formatEssencePlanDiscordMarkdown,
  formatEssencePlanJsonBackup
} from './planExport.ts'
import type { EssencePlanState } from './plannerState.ts'

interface SharingToolProps {
  binding: EssenceBinding
  data: EssenceCraftingData
  plan: EssencePlanState
  planMaterials: EssencePlanMaterials
}

export default function SharingTool({ binding, data, plan, planMaterials }: Readonly<SharingToolProps>) {
  return (
    <SharingPanel
      permalink={buildEssenceCraftingPermalinkUrl(encodeEssenceCraftingPermalink(data, plan))}
      discord={formatEssencePlanDiscordMarkdown(data, plan, binding, planMaterials)}
      forum={formatEssencePlanBbCode(data, plan, binding, planMaterials)}
      jsonExport={{
        filename: ESSENCE_PLAN_BACKUP_FILENAME,
        text: () => formatEssencePlanJsonBackup(data, plan, binding)
      }}
      preview
    />
  )
}
