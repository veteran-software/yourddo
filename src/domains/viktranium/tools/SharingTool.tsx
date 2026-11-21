import SharingPanel from '../../../shared/layout/SharingPanel'
import { formatViktraniumExport } from '../export'
import type { FinishedViktraniumItem, IngredientCalculation } from '../viktranium.types.ts'

const SharingTool = ({
  finished,
  ingredients
}: {
  finished: FinishedViktraniumItem
  ingredients: IngredientCalculation
}) => {
  return (
    <SharingPanel
      discord={formatViktraniumExport('discord', finished, ingredients)}
      forum={formatViktraniumExport('forum', finished, ingredients)}
      disableText={!finished.item}
      shareHint={!finished.item ? 'Select an item to share the current build.' : undefined}
      preview={Boolean(finished.item)}
    />
  )
}
export default SharingTool
