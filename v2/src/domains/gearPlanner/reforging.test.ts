import { describe, expect, it } from 'vitest'
import { gearPlannerAugmentIdentity } from './augments.ts'
import { conflictEligibleEffectSources, collectEquippedEffects } from './effects.ts'
import {
  allGearPlannerSlots,
  type GearPlannerAugment,
  type GearPlannerData,
  type GearPlannerItem,
  type GearPlannerSourceDataset,
  gearPlannerSlots
} from './gearPlanner.types.ts'
import {
  createEmptyGearPlannerSelectionState,
  equipGearPlannerItemInSelection,
  setGearPlannerItemReforgingState,
  setGearPlannerSlottedAugment
} from './planner.ts'
import { restorePersistedGearPlannerState, serializeGearPlannerState } from './plannerStorage.ts'
import {
  createGearPlannerReforgingData,
  getEffectiveGearPlannerAugmentSlots,
  getGearPlannerEffectiveReforgingEffects,
  getGearPlannerEffectiveReforgingTier,
  gearPlannerReforgingRecipesForItem,
  type GearPlannerReforgingData
} from './reforging.ts'
import {
  addGearPlannerSetup,
  createDefaultGearPlannerState,
  equipGearPlannerSetupItem,
  selectGearPlannerSetup,
  setGearPlannerSetupReforgingState
} from './setups.ts'
import type { ReforgingEntry } from '../nearlyFinished/nearlyFinished.types.ts'

const cost = [{ name: 'Thread of Fate', quantity: 1 }]

const recipes: readonly ReforgingEntry[] = [
  { item: 'Toggle Blade', stage: 'Nearly Finished', cost, effectsAdded: [] },
  { item: 'Toggle Blade', stage: 'Almost There', cost, effectsAdded: [] },
  { item: 'Toggle Blade', stage: 'Finishing Touch', cost, effectsAdded: [] },
  {
    item: 'Choice Trinket',
    stage: 'Nearly Finished',
    cost,
    effectsAdded: [],
    choices: [{ name: 'Quality Strength +3' }, { name: 'Quality Dexterity +3' }]
  },
  {
    item: 'Choice Trinket',
    stage: 'Almost There',
    cost,
    effectsAdded: [],
    choices: [{ name: 'Spell DC: Evocation +2' }]
  },
  {
    item: 'Choice Trinket',
    stage: 'Finishing Touch',
    cost,
    effectsAdded: [],
    choices: [{ name: 'Spell DC: Necromancy +2' }]
  },
  { item: 'Nearly Only', stage: 'Nearly Finished', cost, effectsAdded: [] }
]

const sources: readonly GearPlannerSourceDataset[] = [
  {
    fileName: 'dagger.json',
    records: [
      {
        name: 'Toggle Blade',
        pageTitle: 'Toggle Blade',
        minLevel: 10,
        enchantments: [{ name: 'Strength', modifier: '+4', bonus: 'Enhancement' }],
        augments: [{ augmentType: 'Red', name: 'Base red slot' }]
      },
      {
        name: 'Toggle Blade',
        pageTitle: 'Toggle Blade (Nearly Finished Upgraded)',
        minLevel: 10,
        enchantments: [{ name: 'Strength', modifier: '+6', bonus: 'Enhancement' }],
        augments: [{ augmentType: 'Blue', name: 'Upgraded blue slot' }]
      },
      {
        name: 'Toggle Blade',
        pageTitle: 'Toggle Blade (Almost There Upgraded)',
        minLevel: 10,
        enchantments: [{ name: 'Strength', modifier: '+8', bonus: 'Enhancement' }]
      },
      {
        name: 'Toggle Blade',
        pageTitle: 'Toggle Blade (Complete)',
        minLevel: 10,
        enchantments: [{ name: 'Strength', modifier: '+10', bonus: 'Enhancement' }]
      }
    ]
  },
  {
    fileName: 'trinket.json',
    records: [
      {
        name: 'Choice Trinket',
        pageTitle: 'Choice Trinket',
        minLevel: 10,
        enchantments: [{ name: 'Constitution', modifier: '+4', bonus: 'Enhancement' }]
      },
      {
        name: 'Nearly Only',
        pageTitle: 'Nearly Only',
        minLevel: 10,
        upgradeable: '{{Ability|Wisdom|4|Quality}}',
        enchantments: [{ name: 'Dexterity', modifier: '+4', bonus: 'Enhancement' }]
      }
    ]
  }
]

const reforging: GearPlannerReforgingData = createGearPlannerReforgingData(recipes, sources)

const item = (name = 'Toggle Blade', slot: GearPlannerItem['slot'] = gearPlannerSlots.mainHand): GearPlannerItem => {
  const source = sources.flatMap(({ records }) => records).find(({ pageTitle }) => pageTitle === name)
  if (!source) throw new Error(`missing ${name}`)
  return {
    id: `${name}-${slot}`,
    slot,
    sourceFile: slot === gearPlannerSlots.mainHand ? 'dagger.json' : 'trinket.json',
    minimumLevel: 10,
    source
  }
}

const ruby: GearPlannerAugment = {
  name: 'Ruby',
  augmentType: 'Red',
  minLevel: 1,
  effectsAdded: [{ name: 'Strength', modifier: '+1', bonus: 'Enhancement' }],
  source: { name: 'Ruby', augmentType: 'Red', minLevel: 1, effectsAdded: [{ name: 'Strength', modifier: '+1' }] }
}

const data = (items: readonly GearPlannerItem[]): GearPlannerData => ({
  sourceDatasets: sources,
  items,
  itemsBySlot: Object.fromEntries(
    allGearPlannerSlots.map((slot) => [slot, items.filter((candidate) => candidate.slot === slot)])
  ) as unknown as GearPlannerData['itemsBySlot'],
  augments: [ruby],
  curses: [],
  filigrees: [],
  filigreeSetDefinitions: [],
  filigreeSetDefinitionByName: new Map(),
  reforging,
  rawItemCount: items.length,
  normalizedItemCount: items.length,
  rejectedItemCount: 0
})

describe('Gear Planner reforging domain', () => {
  it('exposes only supported stages in legacy order and keeps toggle and choice recipes distinct', () => {
    expect(gearPlannerReforgingRecipesForItem(item(), reforging).map(({ stage, kind }) => [stage, kind])).toEqual([
      ['nearly-finished', 'toggle'],
      ['almost-there', 'toggle'],
      ['finishing-touch', 'toggle']
    ])
    expect(
      gearPlannerReforgingRecipesForItem(item('Choice Trinket', gearPlannerSlots.trinket), reforging)
    ).toMatchObject([
      {
        stage: 'nearly-finished',
        kind: 'choice',
        choices: [{ id: 'label:Quality Strength +3' }, { id: 'label:Quality Dexterity +3' }]
      },
      { stage: 'almost-there', kind: 'choice', choices: [{ id: 'label:Spell DC: Evocation +2' }] },
      { stage: 'finishing-touch', kind: 'choice', choices: [{ id: 'label:Spell DC: Necromancy +2' }] }
    ])
    expect(gearPlannerReforgingRecipesForItem(item('Nearly Only', gearPlannerSlots.trinket), reforging)).toMatchObject([
      { kind: 'choice', choices: [{ id: 'label:Quality Wisdom +4', effect: { name: 'Wisdom', bonus: 'Quality' } }] }
    ])
  })

  it('replaces toggle effect tiers with highest active toggle stage without requiring earlier stages', () => {
    const blade = item()
    let state = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.mainHand,
      blade
    )
    expect(
      getGearPlannerEffectiveReforgingEffects(blade, state.reforging[blade.id], reforging).enchantments
    ).toMatchObject([{ name: 'Strength', modifier: '+4' }])

    state = setGearPlannerItemReforgingState(state, blade.id, 'almost-there', { kind: 'active' }, reforging)
    expect(getGearPlannerEffectiveReforgingTier(blade, state.reforging[blade.id], reforging)?.tier).toBe('almost-there')
    state = setGearPlannerItemReforgingState(state, blade.id, 'nearly-finished', { kind: 'active' }, reforging)
    state = setGearPlannerItemReforgingState(state, blade.id, 'finishing-touch', { kind: 'active' }, reforging)
    expect(getGearPlannerEffectiveReforgingTier(blade, state.reforging[blade.id], reforging)?.tier).toBe('complete')
    expect(
      getGearPlannerEffectiveReforgingEffects(blade, state.reforging[blade.id], reforging).enchantments
    ).toMatchObject([{ name: 'Strength', modifier: '+10' }])
    state = setGearPlannerItemReforgingState(state, blade.id, 'finishing-touch', null, reforging)
    expect(getGearPlannerEffectiveReforgingTier(blade, state.reforging[blade.id], reforging)?.tier).toBe('almost-there')
    state = setGearPlannerItemReforgingState(state, blade.id, 'almost-there', null, reforging)
    expect(getGearPlannerEffectiveReforgingTier(blade, state.reforging[blade.id], reforging)?.tier).toBe(
      'nearly-finished'
    )
    state = setGearPlannerItemReforgingState(state, blade.id, 'nearly-finished', null, reforging)
    expect(getGearPlannerEffectiveReforgingTier(blade, state.reforging[blade.id], reforging)).toBeNull()
  })

  it('adds selected choice effects with legacy parsing and rejects invalid choices', () => {
    const trinket = item('Choice Trinket', gearPlannerSlots.trinket)
    let state = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.trinket,
      trinket
    )
    state = setGearPlannerItemReforgingState(
      state,
      trinket.id,
      'nearly-finished',
      { kind: 'choice', choiceId: 'label:Quality Strength +3' },
      reforging
    )
    state = setGearPlannerItemReforgingState(
      state,
      trinket.id,
      'almost-there',
      { kind: 'choice', choiceId: 'label:Spell DC: Evocation +2' },
      reforging
    )
    state = setGearPlannerItemReforgingState(
      state,
      trinket.id,
      'finishing-touch',
      { kind: 'choice', choiceId: 'label:Spell DC: Necromancy +2' },
      reforging
    )
    expect(
      getGearPlannerEffectiveReforgingEffects(trinket, state.reforging[trinket.id], reforging).choices
    ).toMatchObject([
      { stage: 'nearly-finished', choice: { effect: { name: 'Strength', bonus: 'Quality', modifier: '3' } } },
      {
        stage: 'almost-there',
        choice: { effect: { name: 'Spell DC: Evocation +2', bonus: 'Enhancement', modifier: '2' } }
      },
      {
        stage: 'finishing-touch',
        choice: { effect: { name: 'Spell DC: Necromancy +2', bonus: 'Enhancement', modifier: '2' } }
      }
    ])
    expect(
      setGearPlannerItemReforgingState(
        state,
        trinket.id,
        'nearly-finished',
        { kind: 'choice', choiceId: 'missing' },
        reforging
      )
    ).toBe(state)
    state = setGearPlannerItemReforgingState(
      state,
      trinket.id,
      'nearly-finished',
      { kind: 'choice', choiceId: 'label:Quality Dexterity +3' },
      reforging
    )
    expect(
      getGearPlannerEffectiveReforgingEffects(trinket, state.reforging[trinket.id], reforging).choices[0]
    ).toMatchObject({ choice: { effect: { name: 'Dexterity', bonus: 'Quality', modifier: '3' } } })
    state = setGearPlannerItemReforgingState(state, trinket.id, 'nearly-finished', null, reforging)
    expect(
      getGearPlannerEffectiveReforgingEffects(trinket, state.reforging[trinket.id], reforging).choices
    ).toHaveLength(2)
  })

  it('uses Nearly Finished tier slots for any active stage and removes now-invalid augment selections', () => {
    const blade = item()
    let state = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.mainHand,
      blade
    )
    state = setGearPlannerSlottedAugment(state, blade.id, 0, ruby)
    expect(getEffectiveGearPlannerAugmentSlots(blade, state.reforging[blade.id], reforging)[0]?.augmentType).toBe('Red')
    state = setGearPlannerItemReforgingState(state, blade.id, 'almost-there', { kind: 'active' }, reforging)
    expect(getEffectiveGearPlannerAugmentSlots(blade, state.reforging[blade.id], reforging)[0]?.augmentType).toBe(
      'Blue'
    )
    expect(state.slottedAugments).toEqual({})
    state = setGearPlannerItemReforgingState(state, blade.id, 'almost-there', null, reforging)
    expect(getEffectiveGearPlannerAugmentSlots(blade, state.reforging[blade.id], reforging)[0]?.augmentType).toBe('Red')
  })

  it('emits tier and choice provenance, but only Nearly Finished choices join legacy conflicts', () => {
    const blade = item()
    const trinket = item('Choice Trinket', gearPlannerSlots.trinket)
    let state = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.mainHand,
      blade
    )
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.trinket, trinket)
    state = setGearPlannerItemReforgingState(state, blade.id, 'nearly-finished', { kind: 'active' }, reforging)
    state = setGearPlannerItemReforgingState(
      state,
      trinket.id,
      'nearly-finished',
      { kind: 'choice', choiceId: 'label:Quality Strength +3' },
      reforging
    )
    state = setGearPlannerItemReforgingState(
      state,
      trinket.id,
      'almost-there',
      { kind: 'choice', choiceId: 'label:Spell DC: Evocation +2' },
      reforging
    )
    const effectSources = collectEquippedEffects(
      state.equipment,
      state.slottedAugments,
      {},
      {},
      undefined,
      {},
      reforging,
      state.reforging
    )
    expect(effectSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: 'reforging-tier', reforgingStage: 'nearly-finished' }),
        expect.objectContaining({ category: 'reforging-choice', reforgingStage: 'nearly-finished' }),
        expect.objectContaining({ category: 'reforging-choice', reforgingStage: 'almost-there' })
      ])
    )
    expect(
      conflictEligibleEffectSources(effectSources).filter(({ category }) => category === 'reforging-choice')
    ).toMatchObject([{ reforgingStage: 'nearly-finished' }])
  })

  it('cleans reforging with replaced items and restores compact valid state before augment validation', () => {
    const blade = item()
    const replacement = {
      ...item('Choice Trinket', gearPlannerSlots.trinket),
      id: 'replacement',
      slot: gearPlannerSlots.mainHand
    }
    let selection = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.mainHand,
      blade
    )
    selection = setGearPlannerItemReforgingState(selection, blade.id, 'nearly-finished', { kind: 'active' }, reforging)
    selection = equipGearPlannerItemInSelection(selection, gearPlannerSlots.mainHand, replacement)
    expect(selection.reforging).toEqual({})

    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.mainHand, blade)
    state = setGearPlannerSetupReforgingState(state, blade.id, 'nearly-finished', { kind: 'active' }, reforging)
    const payload = serializeGearPlannerState(state)
    expect(payload.setups[0].selectedReforging).toEqual([
      { itemId: blade.id, stages: { 'nearly-finished': { kind: 'active' } } }
    ])
    expect(JSON.stringify(payload)).not.toContain('Upgraded blue slot')
    const restored = restorePersistedGearPlannerState(payload, data([blade]))
    expect(restored.issues).toEqual([])
    expect(restored.state.setups[0].reforging[blade.id]).toEqual({ 'nearly-finished': { kind: 'active' } })

    const priorV1 = structuredClone(payload)
    delete priorV1.setups[0].selectedReforging
    expect(restorePersistedGearPlannerState(priorV1, data([blade])).state.setups[0].reforging).toEqual({})

    const invalid = structuredClone(payload)
    invalid.setups[0].selectedReforging = [
      { itemId: blade.id, stages: { 'nearly-finished': { kind: 'choice', choiceId: 'missing' } } }
    ]
    expect(restorePersistedGearPlannerState(invalid, data([blade])).issues.map(({ kind }) => kind)).toContain(
      'invalid-reforging-selection'
    )

    const incompatibleAugment = structuredClone(payload)
    incompatibleAugment.setups[0].selectedAugments = [
      { itemId: blade.id, slotIndex: 0, augmentId: gearPlannerAugmentIdentity(ruby) }
    ]
    expect(
      restorePersistedGearPlannerState(incompatibleAugment, data([blade])).issues.map(({ kind }) => kind)
    ).toContain('incompatible-augment')
  })

  it('keeps reforging state isolated per setup', () => {
    const blade = item()
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.mainHand, blade)
    state = setGearPlannerSetupReforgingState(state, blade.id, 'nearly-finished', { kind: 'active' }, reforging)
    state = addGearPlannerSetup(state, 'two')
    state = equipGearPlannerSetupItem(state, gearPlannerSlots.mainHand, blade)
    state = setGearPlannerSetupReforgingState(state, blade.id, 'almost-there', { kind: 'active' }, reforging)
    state = selectGearPlannerSetup(state, 'default')
    expect(state.setups[0].reforging[blade.id]).toEqual({ 'nearly-finished': { kind: 'active' } })
    expect(state.setups[1].reforging[blade.id]).toEqual({ 'almost-there': { kind: 'active' } })
  })
})
