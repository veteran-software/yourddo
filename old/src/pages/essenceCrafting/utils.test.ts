import { describe, expect, it } from 'vitest'
import { ESSENCE_CRAFTING_TEST_DATA } from './testFixtures.ts'
import type { ItemState } from './types.ts'
import { getAffixOptions, sanitizeAugmentsOnItems } from './utils.ts'

const dataset = ESSENCE_CRAFTING_TEST_DATA

describe('Essence Crafting v2 data', () => {
  it('maps v2 equipment names to page slots', () => {
    expect(getAffixOptions('necklace', 'suffix', dataset)).toContain('False Life')
    expect(getAffixOptions('belt', 'suffix', dataset)).toContain('False Life')
    expect(getAffixOptions('gloves', 'prefix', dataset)).toContain('Wizardry')
    expect(getAffixOptions('ring1', 'prefix', dataset)).toContain('Wizardry')
  })

  it('removes saved affixes that are not valid in the v2 data', () => {
    const savedItem: ItemState = {
      slotKey: 'necklace',
      prefix: 'Legacy Prefix',
      suffix: 'False Life',
      extra: 'Legacy Extra',
      hasCannithMark: true,
      augmentSlots: []
    }

    const sanitized = sanitizeAugmentsOnItems(
      {
        items: { necklace: savedItem },
        activeKeys: ['necklace']
      },
      dataset
    )

    expect(sanitized.necklace.prefix).toBeNull()
    expect(sanitized.necklace.suffix).toBe('False Life')
    expect(sanitized.necklace.extra).toBeNull()
  })
})
