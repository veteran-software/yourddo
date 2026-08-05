import { Input } from '@mantine/core'
import { describe, expect, it } from 'vitest'
import { validateViktraniumDataset } from './data.ts'
import { formatViktraniumExport } from './export.ts'
import { calculateFinishedItem, calculateIngredients, getSelectedAugments } from './logic.ts'
import { createViktraniumTestPayload } from './test-fixture.ts'
import Error = Input.Error

const required = <T>(value: T | undefined): T => {
  if (value === undefined) throw new Error('Missing test fixture value')
  return value
}

describe('Viktranium export', () => {
  const build = () => {
    const data = validateViktraniumDataset(createViktraniumTestPayload())
    const item = required(data.indexes.itemById.get('item-heroic-crafted'))
    const selected = { 'slot-red': 'augment-red' }
    return {
      finished: calculateFinishedItem(item, selected, data),
      ingredients: calculateIngredients(item, getSelectedAugments(item, selected, data), data)
    }
  }

  it('formats Forum BBCode with slots, effects, ingredients, and attribution', () => {
    const { finished, ingredients } = build()
    const value = formatViktraniumExport('forum', finished, ingredients)
    expect(value).toContain('[b]Cruel Baton[/b]')
    expect(value).toContain('Red: Duplicate Name')
    expect(value).toContain('Bleak B ×6')
    expect(value).toContain('[url=https://yourddo.com/viktranium-experiment]Built with YourDDO[/url]')
  })

  it('formats Discord Markdown and escapes formatting-sensitive content', () => {
    const { finished, ingredients } = build()
    const value = formatViktraniumExport('discord', finished, ingredients)
    expect(value).toContain('**Cruel Baton**')
    expect(value).toContain('Built with [YourDDO](https://yourddo.com/viktranium-experiment)')
    expect(value).not.toContain('<html>')
  })
})
