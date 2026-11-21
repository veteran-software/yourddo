import SharingPanel from '../../../shared/layout/SharingPanel'
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

const SharingTool = ({ plan, data, onImport }: { plan: LgsPlan; data: LgsData; onImport: (plan: LgsPlan) => void }) => {
  const view = resolveLgsBuildView(plan, data)
  return (
    <SharingPanel
      permalink={buildLgsPermalinkUrl(plan)}
      discord={formatLgsDiscordMarkdown(view)}
      forum={formatLgsBbCode(view)}
      disableText={!view.baseItem}
      shareHint={!view.baseItem ? 'Select a base item before creating a human-readable export.' : undefined}
      jsonExport={{ filename: LGS_JSON_FILENAME, text: () => formatLgsJsonBuild(plan) }}
      jsonImport={{
        label: 'Paste LGS JSON',
        load: (text) => {
          onImport(validateLgsBuild(parseLgsJsonBuild(text), data))
          return 'LGS build loaded.'
        }
      }}
    />
  )
}

export default SharingTool
