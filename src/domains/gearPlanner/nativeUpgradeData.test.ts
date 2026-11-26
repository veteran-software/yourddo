import { expect, it, vi } from 'vitest'
import {
  createGearPlannerReforgingData,
  gearPlannerReforgingChoiceForState,
  getGearPlannerEffectiveReforgingTier
} from './reforging'
import * as cdn from '../../shared/data/loadDataset'
import { gearCraftGroups } from './crafting'
import { loadNativeNearlyComplete } from './nativeUpgradeData'
import { gearPlannerSlots, type GearPlannerItem } from './gearPlanner.types'

it('joins eligible keeper IDs and applies the effect variant for each host', async () => {
  const path = 'nearly-complete/'
  const files: Record<string, unknown> = {
    'manifest.json': {
      system: 'nearly-complete',
      devices: { completion: { name: 'Completion Station' } },
      resources: {
        baseItems: 'base-items.json',
        recipes: 'recipes.json',
        ingredients: 'ingredients.json',
        spells: 'spells.json',
        effects: 'effects.json'
      }
    },
    'base-items.json': [1, 2].map((id) => ({
      id,
      name: 'Test Ring',
      minimumLevel: 11,
      itemType: 'Ring',
      effects: [{ effectId: 10 }]
    })),
    'ingredients.json': [{ id: 7, name: 'Ingredient' }],
    'spells.json': [],
    'effects.json': [
      { id: 10, displayName: 'Nearly Complete: Healing Amplification' },
      {
        id: 11,
        variants: [
          ['default', 24],
          ['strong', 27]
        ].map(([variant, value]) => ({
          variant,
          displayName: 'Healing Amplification',
          enchantments: [{ displayName: 'Healing Amplification: Positive', value }]
        }))
      }
    ],
    'recipes.json': [
      {
        id: 9,
        name: 'Healing Amplification',
        category: 'upgrade',
        device: 'completion',
        ingredients: [{ ingredientId: 7, quantity: 25 }],
        keeper: { itemIds: [1, 2], ingredientType: 'NearlyCompletedHeroic' },
        addEffectIds: [11],
        removeMutationIds: [10],
        effectVariants: { 11: 'default' },
        hostEffectVariants: { 2: { 11: 'strong' } }
      }
    ]
  }
  const read = vi
    .spyOn(cdn, 'loadDatasetFile')
    .mockImplementation((url) => Promise.resolve(files[url.slice(path.length)]))
  try {
    const [first, second] = await Promise.all([loadNativeNearlyComplete(), loadNativeNearlyComplete()])
    expect(first).toBe(second)
    expect(first.recipes[0].requirements).toContainEqual(expect.objectContaining({ name: 'Ingredient', quantity: 25 }))
    const item = (id: number): GearPlannerItem => ({
      id: String(id),
      slot: gearPlannerSlots.firstFinger,
      sourceFile: 'ring.json',
      minimumLevel: 11,
      source: { catalogId: id, name: 'Test Ring' }
    })
    const choices = (id: number) =>
      gearCraftGroups(item(id), { nearlyComplete: first.recipes, upgrades: [] }).find(
        (g) => g.system === 'nearly-complete'
      )?.choices
    expect(choices(1)?.[0].effects?.[0].modifier).toBe(24)
    expect(choices(2)?.[0].effects?.[0].modifier).toBe(27)
    expect(choices(3)).toBeUndefined()
  } finally {
    read.mockRestore()
  }
})

it('restores a saved choice at its current magnitude and applies native set and socket mutations', () => {
  const item: GearPlannerItem = {
    id: 'blade',
    slot: gearPlannerSlots.mainHand,
    sourceFile: 'blade.json',
    minimumLevel: 29,
    source: { catalogId: 21, name: 'Blade' }
  }
  const data = createGearPlannerReforgingData(
    [
      {
        item: 'Blade',
        stage: 'Finishing Touch',
        cost: [{ name: 'Thread of Fate', quantity: 1 }],
        effectsAdded: [],
        native: {
          keeperId: 21,
          base: [{ id: 1, effects: [{ name: 'Old' }] }],
          options: [
            {
              name: 'Abjuration Focus +8',
              added: [{ id: 20, effects: [{ name: 'Spell DC: Abjuration', modifier: 8 }], setName: 'Awakened Set' }],
              removeIds: [1],
              slot: { augmentType: 'Orange' }
            },
            {
              name: 'Evocation Focus +8',
              added: [{ id: 22, effects: [{ name: 'Spell DC: Evocation', modifier: 8 }] }],
              removeIds: [1]
            }
          ]
        }
      }
    ],
    [{ fileName: item.sourceFile, records: [item.source] }]
  )
  const selected = { kind: 'choice' as const, choiceId: 'label:Spell DC: Abjuration +2' }
  expect(gearPlannerReforgingChoiceForState(item, 'finishing-touch', selected, data)?.id).toBe(
    'label:Abjuration Focus +8'
  )
  expect(
    getGearPlannerEffectiveReforgingTier(item, { 'finishing-touch': selected }, data)?.record.source
  ).toMatchObject({
    enchantments: [{ name: 'Spell DC: Abjuration', modifier: 8 }],
    augments: [{ augmentType: 'Orange' }],
    setBonus: [{ name: 'Awakened Set' }]
  })
})
