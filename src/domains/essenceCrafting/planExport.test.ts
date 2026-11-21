import { describe, expect, it } from 'vitest'
import { validateEssenceCraftingDataset } from './data.ts'
import { calculatePlanMaterials } from './materialCalculations.ts'
import {
  ESSENCE_PLAN_EXPORT_SCHEMA_VERSION,
  formatEssencePlanBbCode,
  formatEssencePlanDiscordMarkdown,
  formatEssencePlanJsonBackup
} from './planExport.ts'
import type { EssencePlanState } from './plannerState.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

const data = () => validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

const createPlan = (): EssencePlanState => ({
  masterMinimumLevel: 2,
  activeSlotIds: ['main-hand', 'ring-1'],
  collapsedSlotIds: ['ring-1'],
  itemsBySlotId: {
    'main-hand': {
      prefixEnhancementId: 'enhancement-alpha-prefix',
      suffixEnhancementId: 'enhancement-level-two-suffix',
      extraEnhancementId: null,
      hasCannithMark: false,
      minimumLevelOverride: null,
      augmentSlots: [
        {
          id: 'augment-slot:red',
          augmentSlotTypeId: 'red',
          augmentId: 'augment-red-charisma',
          selectedEffectNames: ['Charisma'],
          filterMode: 'or'
        }
      ]
    },
    'ring-1': {
      prefixEnhancementId: null,
      suffixEnhancementId: null,
      extraEnhancementId: 'enhancement-ring-extra',
      hasCannithMark: true,
      minimumLevelOverride: null,
      augmentSlots: []
    }
  }
})

const count = (value: string, match: string): number => value.split(match).length - 1

describe('Essence Crafting plan export', () => {
  it('creates a deterministic JSON backup with stable planner IDs and no derived recipe data', () => {
    const fixture = data()
    const plan = createPlan()
    const originalPlan = structuredClone(plan)
    const first = formatEssencePlanJsonBackup(fixture, plan, 'bound')
    const second = formatEssencePlanJsonBackup(fixture, plan, 'bound')
    const backup = JSON.parse(first) as Record<string, unknown>

    expect(first).toBe(second)
    expect(backup.schemaVersion).toBe(ESSENCE_PLAN_EXPORT_SCHEMA_VERSION)
    expect(backup.recipeBinding).toBe('bound')
    expect(first).toContain('enhancement-alpha-prefix')
    expect(first).toContain('augment-red-charisma')
    expect(first).toContain('effect-charisma')
    expect(first).not.toContain('Alpha Prefix')
    expect(first).not.toContain('Charisma')
    expect(first).not.toContain('Magic Item Essence')
    expect(first).not.toContain('recipe-enhancement-bound')
    expect(first).not.toContain('YourDDO')
    expect(plan).toEqual(originalPlan)
  })

  it('formats a bound BBCode plan with selected equipment, recipes, requirements, totals, and backlink', () => {
    const fixture = data()
    const plan = createPlan()
    const originalPlan = structuredClone(plan)
    const output = formatEssencePlanBbCode(fixture, plan, 'bound', calculatePlanMaterials(fixture, plan, 'bound'))

    expect(output).toContain('[b]Essence Crafting Plan[/b]')
    expect(output).toContain('[u]Main Hand — ML 2[/u]')
    expect(output).toContain('[u]Ring 1 — ML 2[/u]')
    expect(output).toContain('[b]Prefix:[/b] Alpha Prefix')
    expect(output).toContain('[b]Suffix:[/b] Level Two Suffix')
    expect(output).toContain('[b]Extra:[/b] Ring Extra')
    expect(output).toContain('[b]Augment (Red):[/b] Ruby of Charisma +1')
    expect(output).toContain('Recipe: Bound, crafting level 100')
    expect(output).toContain('Recipe: Bound, crafting level 20')
    expect(output).toContain('70 × Magic Item Essence')
    expect(output).toContain('1 × Mark of House Cannith')
    expect(count(output, '[list]')).toBe(count(output, '[/list]'))
    expect(output.endsWith('[i]Created with [url=https://yourddo.com]YourDDO[/url][/i]')).toBe(true)
    expect(output).not.toContain('recipe-enhancement-bound')
    expect(output).not.toContain('recipe-minimum-level-bound-02')
    expect(output).not.toContain('augment-slot:red')
    expect(plan).toEqual(originalPlan)
  })

  it('formats an unbound Discord plan without tables and with matching unbound recipes and totals', () => {
    const fixture = data()
    const plan = createPlan()
    const originalPlan = structuredClone(plan)
    const output = formatEssencePlanDiscordMarkdown(
      fixture,
      plan,
      'unbound',
      calculatePlanMaterials(fixture, plan, 'unbound')
    )

    expect(output).toContain('**Recipe variant: Unbound**')
    expect(output).toContain('**Main Hand — ML 2**')
    expect(output).toContain('- Prefix: Alpha Prefix')
    expect(output).toContain('- Suffix: Level Two Suffix')
    expect(output).toContain('**Ring 1 — ML 2**')
    expect(output).toContain('- Extra: Ring Extra')
    expect(output).toContain('- Augment (Red): Ruby of Charisma +1')
    expect(output).toContain('Recipe: Unbound, crafting level 120')
    expect(output).toContain('Recipe: Unbound, crafting level 70')
    expect(output).toContain('- 340 × Magic Item Essence')
    expect(output).toContain('- 1 × Mark of House Cannith')
    expect(output).not.toMatch(/^\s*\|/m)
    expect(output.endsWith('_Created with [YourDDO](https://yourddo.com)_')).toBe(true)
    expect(output).not.toContain('recipe-enhancement-unbound')
    expect(output).not.toContain('recipe-minimum-level-unbound-02')
    expect(output).not.toContain('augment-slot:red')
    expect(plan).toEqual(originalPlan)
  })

  it('updates every format when the plan changes without mutating either plan', () => {
    const fixture = data()
    const before = createPlan()
    const changedPlan = createPlan()
    const mainHand = changedPlan.itemsBySlotId['main-hand']
    if (!mainHand) throw new Error('Expected Main Hand plan')
    const after: EssencePlanState = {
      ...changedPlan,
      itemsBySlotId: {
        ...changedPlan.itemsBySlotId,
        'main-hand': { ...mainHand, prefixEnhancementId: null }
      }
    }
    const beforeSnapshot = structuredClone(before)
    const afterSnapshot = structuredClone(after)

    expect(formatEssencePlanJsonBackup(fixture, before, 'bound')).not.toBe(
      formatEssencePlanJsonBackup(fixture, after, 'bound')
    )
    expect(formatEssencePlanBbCode(fixture, before, 'bound')).not.toBe(formatEssencePlanBbCode(fixture, after, 'bound'))
    expect(formatEssencePlanDiscordMarkdown(fixture, before, 'bound')).not.toBe(
      formatEssencePlanDiscordMarkdown(fixture, after, 'bound')
    )
    expect(before).toEqual(beforeSnapshot)
    expect(after).toEqual(afterSnapshot)
  })
})
