import { describe, expect, it } from 'vitest'
import { validateEssenceCraftingDataset } from './data.ts'
import { createEmptyEssencePlan, type EssencePlanState } from './plannerState.ts'
import {
  ESSENCE_CRAFTING_SESSION_STORAGE_KEY,
  type EssenceCraftingSessionStorage,
  LEGACY_ESSENCE_CRAFTING_SESSION_STORAGE_KEY,
  loadEssenceCraftingPlan,
  saveEssenceCraftingPlan
} from './plannerStorage.ts'
import { transitionEssencePlan } from './plannerTransitions.ts'
import { createEssenceCraftingTestPayload } from './test-fixture.ts'

const createData = () => validateEssenceCraftingDataset(createEssenceCraftingTestPayload())

const createStorage = (
  initial: Record<string, string> = {}
): EssenceCraftingSessionStorage & { values: Map<string, string> } => {
  const values = new Map(Object.entries(initial))
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    }
  }
}

const createConfiguredPlan = (): EssencePlanState => {
  const data = createData()
  let plan = createEmptyEssencePlan(data)
  plan = transitionEssencePlan(data, plan, { type: 'activate-equipment-slot', equipmentSlotId: 'main-hand' })
  plan = transitionEssencePlan(data, plan, { type: 'set-master-minimum-level', minimumLevel: 2 })
  plan = transitionEssencePlan(data, plan, {
    type: 'select-prefix-enhancement',
    equipmentSlotId: 'main-hand',
    enhancementId: 'enhancement-alpha-prefix'
  })
  plan = transitionEssencePlan(data, plan, {
    type: 'select-suffix-enhancement',
    equipmentSlotId: 'main-hand',
    enhancementId: 'enhancement-level-two-suffix'
  })
  plan = transitionEssencePlan(data, plan, {
    type: 'add-augment-slot',
    equipmentSlotId: 'main-hand',
    augmentSlotTypeId: 'red'
  })
  plan = transitionEssencePlan(data, plan, {
    type: 'select-augment',
    equipmentSlotId: 'main-hand',
    augmentSlotId: 'augment-slot:red',
    augmentId: 'augment-red-charisma'
  })
  return plan
}

describe('Essence Crafting session persistence', () => {
  it('starts with an empty plan when storage is empty', () => {
    const result = loadEssenceCraftingPlan(createData(), createStorage())

    expect(result.source).toBe('empty')
    expect(result.plan).toEqual(createEmptyEssencePlan(createData()))
  })

  it('hydrates a valid versioned v2 payload and round-trips only stable planner IDs', () => {
    const data = createData()
    const plan = createConfiguredPlan()
    const storage = createStorage()

    expect(saveEssenceCraftingPlan(plan, storage)).toBe(true)
    const stored = JSON.parse(storage.getItem(ESSENCE_CRAFTING_SESSION_STORAGE_KEY) ?? '') as Record<string, unknown>
    expect(stored).toMatchObject({ version: 1, activeSlotIds: ['main-hand'] })
    expect(JSON.stringify(stored)).not.toContain('displayName')
    expect(JSON.stringify(stored)).not.toContain('augment-slot:red')

    const restored = loadEssenceCraftingPlan(data, storage)
    expect(restored.source).toBe('v2')
    expect(restored.plan).toEqual(plan)
  })

  it('ignores an unsupported v2 payload version and falls back to legacy migration', () => {
    const storage = createStorage({
      [ESSENCE_CRAFTING_SESSION_STORAGE_KEY]: JSON.stringify({ version: 999, activeSlotIds: ['main-hand'] }),
      [LEGACY_ESSENCE_CRAFTING_SESSION_STORAGE_KEY]: JSON.stringify({
        items: {
          mainHand: {
            prefix: 'Alpha Prefix',
            suffix: null,
            extra: null,
            hasCannithMark: false,
            minLevelOverride: null,
            augmentSlots: []
          }
        },
        activeKeys: ['mainHand'],
        masterMinLevel: 1,
        collapsedKeys: []
      })
    })

    const result = loadEssenceCraftingPlan(createData(), storage)
    expect(result.source).toBe('legacy')
    expect(result.plan.itemsBySlotId['main-hand']?.prefixEnhancementId).toBe('enhancement-alpha-prefix')
  })

  it('survives malformed JSON without preventing an empty planner', () => {
    const storage = createStorage({ [ESSENCE_CRAFTING_SESSION_STORAGE_KEY]: '{not json' })

    expect(loadEssenceCraftingPlan(createData(), storage).plan).toEqual(createEmptyEssencePlan(createData()))
  })

  it('migrates valid legacy names, slots, levels, Mark, collapse state, and safely mapped filters', () => {
    const legacy = {
      items: {
        mainHand: {
          prefix: 'Alpha Prefix',
          suffix: 'Level Two Suffix',
          extra: null,
          hasCannithMark: false,
          minLevelOverride: 2,
          augmentSlots: [
            {
              id: 'legacy-random-id',
              slotType: 'red',
              selectedAugment: { id: 'stale-published-id', name: 'Ruby of Charisma +1', unwanted: { copied: true } },
              filters: ['Charisma', 'Removed effect'],
              filterMode: 'AND'
            }
          ]
        },
        ring1: {
          prefix: null,
          suffix: null,
          extra: 'Ring Extra',
          hasCannithMark: true,
          minLevelOverride: null,
          augmentSlots: []
        }
      },
      activeKeys: ['ring1', 'mainHand', 'unknown'],
      masterMinLevel: 2,
      collapsedKeys: ['ring1', 'unknown']
    }
    const storage = createStorage({ [LEGACY_ESSENCE_CRAFTING_SESSION_STORAGE_KEY]: JSON.stringify(legacy) })

    const result = loadEssenceCraftingPlan(createData(), storage)

    expect(result.source).toBe('legacy')
    expect(result.plan.activeSlotIds).toEqual(['main-hand', 'ring-1'])
    expect(result.plan.collapsedSlotIds).toEqual(['ring-1'])
    expect(result.plan.masterMinimumLevel).toBe(2)
    expect(result.plan.itemsBySlotId['main-hand']).toMatchObject({
      prefixEnhancementId: 'enhancement-alpha-prefix',
      suffixEnhancementId: 'enhancement-level-two-suffix',
      minimumLevelOverride: 2,
      augmentSlots: [
        {
          id: 'augment-slot:red',
          augmentSlotTypeId: 'red',
          augmentId: 'augment-red-charisma',
          selectedEffectNames: ['Charisma'],
          filterMode: 'and'
        }
      ]
    })
    expect(result.plan.itemsBySlotId['ring-1']).toMatchObject({
      hasCannithMark: true,
      extraEnhancementId: 'enhancement-ring-extra'
    })
    expect(storage.getItem(LEGACY_ESSENCE_CRAFTING_SESSION_STORAGE_KEY)).toBe(JSON.stringify(legacy))
    const migratedSnapshot = storage.getItem(ESSENCE_CRAFTING_SESSION_STORAGE_KEY) ?? ''
    expect(migratedSnapshot).not.toContain('unwanted')
    expect(migratedSnapshot).not.toContain('legacy-random-id')
  })

  it('drops stale legacy enhancements and augments while retaining the active slot', () => {
    const storage = createStorage({
      [LEGACY_ESSENCE_CRAFTING_SESSION_STORAGE_KEY]: JSON.stringify({
        items: {
          mainHand: {
            prefix: 'Removed Prefix',
            suffix: 'Removed Suffix',
            extra: 'Removed Extra',
            hasCannithMark: true,
            minLevelOverride: null,
            augmentSlots: [{ slotType: 'red', selectedAugment: { name: 'Removed Ruby' }, filters: [] }]
          }
        },
        activeKeys: ['mainHand'],
        masterMinLevel: 1,
        collapsedKeys: []
      })
    })

    const item = loadEssenceCraftingPlan(createData(), storage).plan.itemsBySlotId['main-hand']
    expect(item).toMatchObject({
      prefixEnhancementId: null,
      suffixEnhancementId: null,
      extraEnhancementId: null,
      augmentSlots: [{ augmentId: null }]
    })
  })

  it('corrects invalid legacy minimum levels through hydration', () => {
    const storage = createStorage({
      [LEGACY_ESSENCE_CRAFTING_SESSION_STORAGE_KEY]: JSON.stringify({
        items: {
          mainHand: {
            prefix: 'Alpha Prefix',
            suffix: null,
            extra: null,
            hasCannithMark: false,
            minLevelOverride: 0,
            augmentSlots: []
          }
        },
        activeKeys: ['mainHand'],
        masterMinLevel: 99,
        collapsedKeys: []
      })
    })

    const result = loadEssenceCraftingPlan(createData(), storage)
    expect(result.plan.masterMinimumLevel).toBe(1)
    expect(result.plan.itemsBySlotId['main-hand']?.minimumLevelOverride).toBeNull()
  })

  it('keeps the in-memory plan usable when storage writes fail', () => {
    const storage: EssenceCraftingSessionStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('storage disabled')
      }
    }
    const plan = createConfiguredPlan()

    expect(saveEssenceCraftingPlan(plan, storage)).toBe(false)
    expect(loadEssenceCraftingPlan(createData(), storage)).toEqual({
      source: 'empty',
      plan: createEmptyEssencePlan(createData())
    })
    expect(plan.itemsBySlotId['main-hand']?.prefixEnhancementId).toBe('enhancement-alpha-prefix')
  })
})
