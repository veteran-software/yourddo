import SharingPanel from '../../../shared/layout/SharingPanel'
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
  const view = tier2 && tier3 ? resolveHgsBuildView(selection, { initial, tier2, tier3 }) : null
  const canImport = Boolean(tier2 && tier3 && combinations)
  return (
    <SharingPanel
      permalink={buildHgsPermalinkUrl(selection)}
      discord={formatHgsDiscordMarkdown(view ?? { altars: [] })}
      forum={formatHgsBbCode(view ?? { altars: [] })}
      disableText={!view?.baseItem}
      shareHint={!view?.baseItem ? 'Select a base item before creating a human-readable export.' : undefined}
      jsonExport={{ filename: HGS_JSON_FILENAME, text: () => formatHgsJsonBuild(selection) }}
      jsonImport={{
        label: 'Paste HGS JSON',
        disabled: !canImport,
        hint: !canImport ? 'Select a base item to load the current HGS catalog for validation.' : undefined,
        load: (text) => {
          if (!tier2 || !tier3 || !combinations) throw new Error('The HGS catalog is still loading.')
          onImport(validateHgsBuild(parseHgsJsonBuild(text), { initial, tier2, tier3, combinations }))
          return 'HGS build loaded.'
        }
      }}
    />
  )
}

export default SharingTool
