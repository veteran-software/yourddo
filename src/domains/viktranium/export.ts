import { scopedEffectLabel } from '../../shared/augments/scopedEffectLabel'
import { formatEffect } from './logic.ts'
import type { FinishedViktraniumItem, IngredientCalculation } from './viktranium.types.ts'

export type ExportFormat = 'forum' | 'discord'

const attributionUrl = 'https://yourddo.com/viktranium-experiment'

const plain = (value: string): string => value.replace(/[\r\n]+/g, ' ').trim()
const bb = (value: string): string => plain(value).replaceAll('[', '&#91;').replaceAll(']', '&#93;')
const md = (value: string): string => plain(value).replace(/([\\`*_{}[\]()#+.!|>-])/g, String.raw`\$1`)

const ingredientLines = (ingredients: IngredientCalculation, format: ExportFormat): string[] => {
  const escape = format === 'forum' ? bb : md
  return ingredients.ingredients.length > 0
    ? ingredients.ingredients.map((ingredient) => `- ${escape(ingredient.name)} ×${String(ingredient.quantity)}`)
    : ['- No published material cost']
}

export const formatViktraniumExport = (
  format: ExportFormat,
  finished: FinishedViktraniumItem,
  ingredients: IngredientCalculation
): string => {
  if (!finished.item) return ''
  const item = finished.item
  const escape = format === 'forum' ? bb : md
  const heading = (text: string) => (format === 'forum' ? `[b]${bb(text)}[/b]` : `**${md(text)}**`)
  const lines = [
    heading(item.name),
    `${escape(item.type)} · Minimum level ${String(finished.minimumLevel ?? item.minimumLevel)}`,
    '',
    heading('Base effects'),
    ...(finished.baseEffects.length > 0
      ? finished.baseEffects.map((effect) => `- ${escape(formatEffect(effect))}`)
      : ['- None published']),
    '',
    heading('Augments')
  ]
  finished.slots.forEach(({ slot, augment }) => {
    if (!augment) {
      lines.push(`- ${escape(slot.label)}: Empty`)
      return
    }
    lines.push(`- ${escape(slot.label)}: ${escape(augment.name)}`)
    if (augment.scoped) {
      for (const group of augment.scoped.presentation) {
        lines.push('  - ' + escape(group.name))
        for (const row of group.rows) lines.push('    - ' + escape(scopedEffectLabel(row)))
      }
      if (augment.scoped.fallbackDescription) lines.push('  - ' + escape(augment.scoped.fallbackDescription))
    } else augment.effects.forEach((effect) => lines.push(`  - ${escape(formatEffect(effect))}`))
    augment.recipes.forEach((recipe) => lines.push(`  - ${escape('Crafted at ' + recipe.device)}`))
  })
  lines.push('', heading('Ingredients'), ...ingredientLines(ingredients, format))
  const warnings = [...finished.warnings, ...finished.incompleteRecipeWarnings, ...ingredients.warnings]
  if (warnings.length > 0) lines.push('', heading('Warnings'), ...warnings.map((warning) => `- ${escape(warning)}`))
  lines.push(
    '',
    format === 'forum' ? `[url=${attributionUrl}]Built with YourDDO[/url]` : `Built with [YourDDO](${attributionUrl})`
  )
  return lines.join('\n')
}
