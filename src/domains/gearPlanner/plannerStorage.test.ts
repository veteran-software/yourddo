import rawCurses from './fixtures/deckOfManyCurses.json'
import { emptyGearCraftingData } from './crafting.ts'
import { describe, expect, it, vi } from 'vitest'
import { validateEssenceCraftingDataset } from '../essenceCrafting/data.ts'
import { createEssenceCraftingTestPayload } from '../essenceCrafting/test-fixture.ts'
import { gearPlannerAugmentIdentity, isCompatibleGearPlannerAugment } from './augments.ts'
import { parseGearPlannerCurseDataset, gearPlannerCurseIdentity } from './curses.ts'
import { loadGearPlannerData } from './data.ts'
import { gearPlannerItemId } from './normalize'
import { collectEquippedEffects } from './effects.ts'
import { getEssenceCraftedGearPlannerItems } from './essenceCrafting.ts'
import { loadoutSnapshot, comparisonRows } from './loadoutComparison'
import { normalizeGearPlannerFiligreeName } from './filigrees.ts'
import {
  allGearPlannerSlots,
  type GearPlannerAugment,
  gearPlannerCharacterSlots,
  type GearPlannerCurse,
  type GearPlannerData,
  type GearPlannerFiligree,
  type GearPlannerItem,
  gearPlannerSlots
} from './gearPlanner.types.ts'
import type { GearPlannerCharacterSlot } from './planner.ts'
import {
  createGearPlannerExport,
  GEAR_PLANNER_PERSISTED_VERSION,
  GEAR_PLANNER_STORAGE_KEY,
  type GearPlannerStorage,
  importGearPlannerState,
  loadGearPlannerState,
  parsePersistedGearPlannerState,
  restorePersistedGearPlannerState,
  saveGearPlannerState,
  serializeGearPlannerState
} from './plannerStorage.ts'
import { collectActiveSetEffectSources, resolveGearPlannerSetState } from './sets.ts'
import {
  addGearPlannerSetup,
  createDefaultGearPlannerState,
  equipGearPlannerSetupItem,
  type GearPlannerSetupsState,
  setGearPlannerSetupAugment,
  setGearPlannerSetupCurse,
  setGearPlannerSetupEssenceCraftingConfiguration,
  setGearPlannerSetupFiligree,
  setGearPlannerSetupUnlockedFiligreeSlots
} from './setups.ts'
import { emptyGearPlannerReforgingData } from './reforging.ts'

const item = (id: string, slot: GearPlannerItem['slot'], name = id, augmentType?: string): GearPlannerItem => ({
  id,
  slot,
  sourceFile: 'test.json',
  minimumLevel: 10,
  source: {
    name,
    ...(augmentType === undefined ? {} : { augments: [{ augmentType, name: `${augmentType} slot` }] })
  }
})

const augment = (name = 'Ruby', augmentType = 'Red'): GearPlannerAugment => ({
  name,
  augmentType,
  minLevel: 1,
  effectsAdded: [{ name: 'Strength', modifier: 2 }],
  source: { name, augmentType, minLevel: 1, effectsAdded: [{ name: 'Strength', modifier: 2 }] }
})

const curse = (name: string): GearPlannerCurse => ({
  id: name,
  name,
  type: 'Common',
  enchantments: [{ name: 'Strength', modifier: 1, bonus: 'Fortune' }],
  source: { name, type: 'Common' }
})

const data = (
  items: readonly GearPlannerItem[],
  augments: readonly GearPlannerAugment[] = [],
  filigrees: readonly GearPlannerFiligree[] = [],
  curses: readonly GearPlannerCurse[] = []
): GearPlannerData => ({
  sourceDatasets: [],
  items,
  augments,
  filigrees,
  curses,
  filigreeSetDefinitions: [],
  filigreeSetDefinitionByName: new Map(),
  crafting: emptyGearCraftingData,
  reforging: emptyGearPlannerReforgingData,
  itemsBySlot: Object.fromEntries(
    allGearPlannerSlots.map((slot) => [slot, items.filter((candidate) => candidate.slot === slot)])
  ) as unknown as GearPlannerData['itemsBySlot'],
  rawItemCount: items.length,
  normalizedItemCount: items.length,
  rejectedItemCount: 0
})

const storage = (initial: Record<string, string> = {}): GearPlannerStorage & { values: Map<string, string> } => {
  const values = new Map(Object.entries(initial))
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    }
  }
}

const isCharacterItem = (
  plannerItem: GearPlannerItem
): plannerItem is GearPlannerItem & { slot: GearPlannerCharacterSlot } =>
  gearPlannerCharacterSlots.includes(plannerItem.slot as GearPlannerCharacterSlot)

const configuredState = (): { state: GearPlannerSetupsState; data: GearPlannerData; ruby: GearPlannerAugment } => {
  const firstRing = item('first-ring', gearPlannerSlots.firstFinger, 'Shared Ring', 'Red')
  const secondRing = item('second-ring', gearPlannerSlots.secondFinger, 'Shared Ring')
  const mainHand = item('main-hand', gearPlannerSlots.mainHand, 'Shared Dagger')
  const offHand = item('off-hand', gearPlannerSlots.offHand, 'Shared Dagger')
  const ruby = augment()
  let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.firstFinger, firstRing)
  state = setGearPlannerSetupAugment(state, firstRing.id, 0, ruby)
  state = equipGearPlannerSetupItem(state, gearPlannerSlots.mainHand, mainHand)
  state = addGearPlannerSetup(state, 'setup-two', 'Second setup')
  state = equipGearPlannerSetupItem(state, gearPlannerSlots.secondFinger, secondRing)
  state = equipGearPlannerSetupItem(state, gearPlannerSlots.offHand, offHand)
  return { state, data: data([firstRing, secondRing, mainHand, offHand], [ruby]), ruby }
}

describe('Gear Planner setup serialization', () => {
  it('restores renamed focus stats and combines duplicate selections', () => {
    const state = createDefaultGearPlannerState()
    state.setups[0].character.focusStats = ['Doublestrike Chance', 'Strength', 'Doublestrike']
    const restored = restorePersistedGearPlannerState(serializeGearPlannerState(state), {
      ...data([]),
      enchantmentAliases: new Map([['doublestrike chance', 'Doublestrike']])
    })
    expect(restored.state.setups[0].character.focusStats).toEqual(['Doublestrike', 'Strength'])
  })

  it('round-trips multiple setups, slot-specific rings and weapons, and augment indexes using current data objects', () => {
    const configured = configuredState()
    const payload = serializeGearPlannerState(configured.state)
    const restored = restorePersistedGearPlannerState(parsePersistedGearPlannerState(payload), configured.data)

    expect(restored.issues).toEqual([])
    expect(restored.state).toMatchObject({ activeSetupId: 'setup-two' })
    expect(restored.state.setups[0].equipment['First Finger']).toBe(configured.data.items[0])
    expect(restored.state.setups[0].equipment['Main Hand']).toBe(configured.data.items[2])
    expect(restored.state.setups[0].slottedAugments['first-ring']?.[0]).toBe(configured.ruby)
    expect(restored.state.setups[1].equipment['Second Finger']).toBe(configured.data.items[1])
    expect(restored.state.setups[1].equipment['Off Hand']).toBe(configured.data.items[3])
  })

  it('migrates a pre-catalog item and its socket together and preserves the old browser snapshot', () => {
    const ring = item('', 'First Finger', 'Ruby Ring', 'Red')
    ring.source.minLevel = ring.minimumLevel
    ring.id = gearPlannerItemId(ring.sourceFile, ring.source, ring.slot)
    const updated = { ...ring, id: 'item:123:First Finger', source: { ...ring.source, catalogId: 123 } }
    const ruby = augment()
    const equipped = equipGearPlannerSetupItem(createDefaultGearPlannerState(), ring.slot, ring)
    const saved = JSON.stringify(serializeGearPlannerState(setGearPlannerSetupAugment(equipped, ring.id, 0, ruby)))
    const oldKey = 'yourddo:gear-planner:v2'
    const local = storage({ [oldKey]: saved })
    const nativeRuby = { ...ruby, source: { id: 101 } }
    const restored = loadGearPlannerState(data([updated], [nativeRuby]), local)
    expect(restored.issues).toEqual([])
    expect(restored.state.setups[0].equipment[ring.slot]).toBe(updated)
    expect(restored.state.setups[0].slottedAugments[updated.id]?.[0]).toBe(nativeRuby)
    expect(saveGearPlannerState(restored.state, local)).toBe(true)
    expect(local.getItem(oldKey)).toBe(saved)
    expect(local.getItem(GEAR_PLANNER_STORAGE_KEY)).toContain(updated.id)
    const ambiguous = { ...updated, id: 'item:456:First Finger', source: { ...updated.source, catalogId: 456 } }
    const unresolved = importGearPlannerState(saved, data([updated, ambiguous], [ruby]))
    expect(unresolved.state.setups[0].equipment[ring.slot]).toBeNull()
    expect(unresolved.issues.map(({ kind }) => kind)).toContain('missing-item')
  })

  it('restores the main-hand weapon and reports an incompatible saved off-hand item', () => {
    const configured = configuredState()
    const axe = { ...configured.data.items[2], sourceFile: 'greatAxe.json' }
    const payload = serializeGearPlannerState(configured.state)
    payload.setups[1].equipment['Main Hand'] = axe.id
    const restored = restorePersistedGearPlannerState(
      payload,
      data([axe, ...configured.data.items.filter((i) => i.id !== axe.id)], [configured.ruby])
    )
    expect(restored.state.setups[1].equipment['Main Hand']).toBe(axe)
    expect(restored.state.setups[1].equipment['Off Hand']).toBeNull()
    expect(restored.issues.map((issue) => issue.kind)).toEqual(['incompatible-off-hand'])
  })

  it('serializes references only, omitting CDN item and augment objects and transient browser state', () => {
    const configured = configuredState()
    const payload = serializeGearPlannerState(configured.state)
    const text = JSON.stringify(payload)

    expect(payload.setups[0].equipment['First Finger']).toBe('first-ring')
    expect(payload.setups[0].selectedAugments).toEqual([
      { itemId: 'first-ring', slotIndex: 0, augmentId: gearPlannerAugmentIdentity(configured.ruby) }
    ])
    expect(text).not.toContain('sourceFile')
    expect(text).not.toContain('minimumLevel":10')
    expect(text).not.toContain('itemsBySlot')
    expect(text).not.toContain('search')
    expect(text).not.toContain('setName')
  })

  it('drops only unresolved item, unresolved augment, and now-incompatible augment selections', () => {
    const configured = configuredState()
    const payload = serializeGearPlannerState(configured.state)
    const withoutFirstRing = restorePersistedGearPlannerState(
      payload,
      data(
        configured.data.items.filter(({ id }) => id !== 'first-ring'),
        [configured.ruby]
      )
    )
    expect(withoutFirstRing.state.setups[0].equipment['First Finger']).toBeNull()
    expect(withoutFirstRing.state.setups[0].equipment['Main Hand']).toBeDefined()
    expect(withoutFirstRing.issues.map(({ kind }) => kind)).toContain('missing-item')

    const withoutRuby = restorePersistedGearPlannerState(payload, data(configured.data.items))
    expect(withoutRuby.state.setups[0].equipment['First Finger']).toBeDefined()
    expect(withoutRuby.state.setups[0].slottedAugments).toEqual({})
    expect(withoutRuby.issues.map(({ kind }) => kind)).toContain('missing-augment')

    const incompatibleItems = configured.data.items.map((candidate) =>
      candidate.id === 'first-ring'
        ? { ...candidate, source: { ...candidate.source, augments: [{ augmentType: 'Blue', name: 'Blue slot' }] } }
        : candidate
    )
    const incompatible = restorePersistedGearPlannerState(payload, data(incompatibleItems, [configured.ruby]))
    expect(incompatible.state.setups[0].equipment['First Finger']).toBe(incompatibleItems[0])
    expect(incompatible.state.setups[0].slottedAugments).toEqual({})
    expect(incompatible.issues.map(({ kind }) => kind)).toContain('incompatible-augment')
  })

  it('round-trips synthetic Essence Crafted items and compact setup-owned configuration', () => {
    const essenceData = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())
    const crafted = getEssenceCraftedGearPlannerItems(gearPlannerSlots.mainHand, 1)[0]
    expect(crafted).toBeDefined()
    if (!crafted) return

    let state = equipGearPlannerSetupItem(
      createDefaultGearPlannerState(),
      gearPlannerSlots.mainHand,
      crafted,
      essenceData
    )
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      crafted.id,
      { kind: 'minimum-level', minimumLevel: 2 },
      essenceData
    )
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      crafted.id,
      { kind: 'material', material: 'Mithral' },
      essenceData
    )
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      crafted.id,
      {
        kind: 'affix',
        position: 'prefix',
        enhancementId: 'enhancement-split-prefix'
      },
      essenceData
    )
    const payload = serializeGearPlannerState(state)
    const restored = restorePersistedGearPlannerState(payload, data([]), essenceData)
    const saved = payload.setups[0].selectedEssenceCrafting

    expect(payload.setups[0].equipment['Main Hand']).toBe(crafted.id)
    expect(saved).toEqual([
      {
        itemId: crafted.id,
        minimumLevel: 2,
        material: 'Mithral',
        prefixId: 'enhancement-split-prefix',
        suffixId: null,
        extraId: null
      }
    ])
    expect(JSON.stringify(payload)).not.toContain('sourceFile')
    expect(restored.issues).toEqual([])
    expect(restored.state.setups[0].equipment['Main Hand']?.id).toBe(crafted.id)
    expect(restored.state.setups[0].essenceCrafting[crafted.id]).toEqual({
      minimumLevel: 2,
      material: 'Mithral',
      prefixId: 'enhancement-split-prefix',
      suffixId: null,
      extraId: null
    })

    const previousV1 = structuredClone(payload)
    delete previousV1.setups[0].selectedEssenceCrafting
    const restoredPreviousV1 = restorePersistedGearPlannerState(previousV1, data([]), essenceData)
    expect(restoredPreviousV1.issues).toEqual([])
    expect(restoredPreviousV1.state.setups[0].equipment['Main Hand']?.id).toBe(crafted.id)
    expect(restoredPreviousV1.state.setups[0].essenceCrafting).toEqual({})
  })

  it('keeps synthetic hosts and valid affixes when stale Essence selections are skipped on restore', () => {
    const essenceData = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())
    const crafted = getEssenceCraftedGearPlannerItems(gearPlannerSlots.firstFinger, 1)[0]
    expect(crafted).toBeDefined()
    if (!crafted) return

    let state = equipGearPlannerSetupItem(
      createDefaultGearPlannerState(),
      gearPlannerSlots.firstFinger,
      crafted,
      essenceData
    )
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      crafted.id,
      { kind: 'minimum-level', minimumLevel: 2 },
      essenceData
    )
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      crafted.id,
      { kind: 'material', material: 'Mithral' },
      essenceData
    )
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      crafted.id,
      {
        kind: 'affix',
        position: 'suffix',
        enhancementId: 'enhancement-split-prefix'
      },
      essenceData
    )
    const payload = serializeGearPlannerState(state)
    payload.setups[0].selectedEssenceCrafting = [
      {
        itemId: crafted.id,
        minimumLevel: 2,
        material: 'Mithral',
        prefixId: 'enhancement-level-two-suffix',
        suffixId: 'enhancement-split-prefix',
        extraId: 'enhancement-ring-extra'
      }
    ]

    const restored = restorePersistedGearPlannerState(payload, data([]), essenceData)
    expect(restored.state.setups[0].equipment['First Finger']?.id).toBe(crafted.id)
    expect(restored.state.setups[0].essenceCrafting[crafted.id]).toEqual({
      minimumLevel: 2,
      material: 'Mithral',
      prefixId: null,
      suffixId: 'enhancement-split-prefix',
      extraId: null
    })
    expect(restored.issues.map(({ kind }) => kind)).toEqual(['ineligible-essence', 'ineligible-essence'])
  })

  it('keeps Masterworks-scaled Essence effects through JSON export and import', () => {
    const essenceData = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())
    const crafted = getEssenceCraftedGearPlannerItems(gearPlannerSlots.mainHand, 1)[0]
    const minorMasterworks = curse('Curse of Minor Masterworks')
    expect(crafted).toBeDefined()
    if (!crafted) return

    let state = equipGearPlannerSetupItem(
      createDefaultGearPlannerState(),
      gearPlannerSlots.mainHand,
      crafted,
      essenceData
    )
    state = setGearPlannerSetupEssenceCraftingConfiguration(
      state,
      crafted.id,
      {
        kind: 'affix',
        position: 'prefix',
        enhancementId: 'enhancement-split-prefix'
      },
      essenceData
    )
    state = setGearPlannerSetupCurse(state, crafted.id, minorMasterworks.id, [minorMasterworks])
    const restored = importGearPlannerState(
      JSON.stringify(createGearPlannerExport(state)),
      data([], [], [], [minorMasterworks]),
      essenceData
    )
    const setup = restored.state.setups[0]
    const essenceEffect = collectEquippedEffects(
      setup.equipment,
      setup.slottedAugments,
      setup.slottedFiligrees,
      setup.slottedCurses,
      { essenceData, essenceCrafting: setup.essenceCrafting }
    ).find(({ category, effect }) => category === 'essence' && effect.name === 'Light Spell Power')

    expect(restored.issues).toEqual([])
    expect(setup.slottedCurses[crafted.id]).toBe(minorMasterworks)
    expect(essenceEffect?.effect.modifier).toBe('+2')
  })
})

describe('Gear Planner local and JSON persistence', () => {
  it('starts empty without storage, restores valid storage, and survives unavailable browser storage', () => {
    const configured = configuredState()
    expect(loadGearPlannerState(configured.data, storage()).source).toBe('empty')

    const saved = storage()
    expect(saveGearPlannerState(configured.state, saved)).toBe(true)
    expect(loadGearPlannerState(configured.data, saved)).toMatchObject({
      source: 'v2',
      state: { activeSetupId: 'setup-two' }
    })

    vi.stubGlobal('localStorage', undefined)
    expect(loadGearPlannerState(configured.data).source).toBe('empty')
    expect(saveGearPlannerState(configured.state)).toBe(false)
    vi.unstubAllGlobals()
  })

  it('falls back safely for malformed JSON, unsupported versions, and invalid setup shapes without overwriting storage', () => {
    const configured = configuredState()
    for (const saved of [
      '{bad json',
      JSON.stringify({ version: 2, setups: [] }),
      JSON.stringify({ version: 1, setups: [] })
    ]) {
      const local = storage({ [GEAR_PLANNER_STORAGE_KEY]: saved })
      const loaded = loadGearPlannerState(configured.data, local)
      expect(loaded.source).toBe('invalid')
      expect(loaded.state).toEqual(createDefaultGearPlannerState())
      expect(local.getItem(GEAR_PLANNER_STORAGE_KEY)).toBe(saved)
    }
  })

  it('merges legacy browser setups once, preserves conflicting v2 IDs and skips identical setups', () => {
    const { data: catalog, state } = configuredState()
    const saved = storage()
    saveGearPlannerState(state, saved)
    const second = state.setups[1]
    const original = JSON.stringify({
      activeSetupId: 'default',
      characterSetups: [
        { id: 'default', name: 'Legacy tank', slots: {} },
        {
          id: second.id,
          name: second.name,
          slots: { 'Second Finger': { name: 'Shared Ring' }, 'Off Hand': { name: 'Shared Dagger' } }
        },
        { id: 'extra', name: 'Older setup without slots' }
      ]
    })
    saved.setItem('gearPlannerState', original)
    const migrated = loadGearPlannerState(catalog, saved)
    expect(migrated.issues).toEqual([])
    expect(migrated.state.activeSetupId).toBe(second.id)
    expect(migrated.state.setups.map((s) => s.name)).toEqual([
      'Default Setup',
      second.name,
      'Legacy tank (legacy)',
      'Older setup without slots'
    ])
    expect(migrated.state.setups[0].equipment['First Finger']?.id).toBe('first-ring')
    expect(loadGearPlannerState(catalog, saved)).toMatchObject({ source: 'v2', state: migrated.state })
    saveGearPlannerState(state, saved)
    expect(loadGearPlannerState(catalog, saved).state).toEqual(state)
    expect(saved.getItem('gearPlannerState')).toBe(original)
    expect(createGearPlannerExport(migrated.state)).not.toHaveProperty('legacySaveImported')
  })

  it('retries failed writes and keeps both originals when a stored payload is invalid', () => {
    const source = JSON.stringify({ characterSetups: [{ id: 'old', name: 'Legacy', slots: {} }], activeSetupId: 'old' })
    const local = storage({ gearPlannerState: source })
    const original = JSON.stringify(serializeGearPlannerState(createDefaultGearPlannerState()))
    local.setItem(GEAR_PLANNER_STORAGE_KEY, original)
    const full = {
      getItem: local.getItem,
      setItem: () => {
        throw new Error('Quota exceeded')
      }
    }
    expect(loadGearPlannerState(data([]), full)).toMatchObject({
      state: { activeSetupId: 'old' },
      carryover: { kind: 'error' }
    })
    expect(local.getItem(GEAR_PLANNER_STORAGE_KEY)).toBe(original)
    expect(loadGearPlannerState(data([]), local)).toMatchObject({
      source: 'legacy',
      state: { activeSetupId: 'old', setups: [{ name: 'Legacy' }] }
    })
    local.setItem(GEAR_PLANNER_STORAGE_KEY, '{bad')
    expect(loadGearPlannerState(data([]), local).source).toBe('invalid')
    expect(local.getItem(GEAR_PLANNER_STORAGE_KEY)).toBe('{bad')
    expect(local.getItem('gearPlannerState')).toBe(source)
    local.setItem(GEAR_PLANNER_STORAGE_KEY, original)
    local.setItem('gearPlannerState', '{bad')
    expect(loadGearPlannerState(data([]), local)).toMatchObject({
      source: 'invalid',
      state: createDefaultGearPlannerState(),
      carryover: { kind: 'error' }
    })
    expect(local.getItem(GEAR_PLANNER_STORAGE_KEY)).toBe(original)
    expect(local.getItem('gearPlannerState')).toBe('{bad')
  })

  it('writes only serialized meaningful state and exports an explicitly versioned complete collection', () => {
    const configured = configuredState()
    const local = storage()
    expect(saveGearPlannerState(configured.state, local)).toBe(true)
    const saved = JSON.parse(local.getItem(GEAR_PLANNER_STORAGE_KEY) ?? '') as Record<string, unknown>
    expect(saved).toMatchObject({ version: GEAR_PLANNER_PERSISTED_VERSION, activeSetupId: 'setup-two' })
    expect(saved).not.toHaveProperty('workspaceTool')
    expect(saved).not.toHaveProperty('browsingSlot')

    const exported = createGearPlannerExport(configured.state)
    expect(exported).toMatchObject({ version: GEAR_PLANNER_PERSISTED_VERSION, activeSetupId: 'setup-two' })
    expect(exported.exportedAt).toEqual(expect.any(String))
    expect(exported.setups).toHaveLength(2)
  })

  it('imports atomically and rejects malformed, unsupported, or internally invalid payloads', () => {
    const configured = configuredState()
    const before = configured.state
    const valid = JSON.stringify(createGearPlannerExport(configured.state))
    expect(importGearPlannerState(valid, configured.data).state).toMatchObject({ activeSetupId: 'setup-two' })

    for (const invalid of [
      '{bad json',
      JSON.stringify({ version: 2, setups: [] }),
      JSON.stringify({ version: 1, setups: [] })
    ]) {
      expect(() => importGearPlannerState(invalid, configured.data)).toThrow()
      expect(configured.state).toBe(before)
    }
  })
})

describe('Gear Planner curse persistence', () => {
  it('round-trips identity references through local and JSON persistence without serializing curse objects', () => {
    const head = item('cursed-head', gearPlannerSlots.head, 'Cursed Helm')
    const selected = curse('Curse of Strength')
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.head, head)
    state = setGearPlannerSetupCurse(state, head.id, selected.id, [selected])
    const payload = serializeGearPlannerState(state)
    const text = JSON.stringify(payload)
    const restored = restorePersistedGearPlannerState(payload, data([head], [], [], [selected]))

    expect(payload.setups[0].selectedCurses).toEqual([{ itemId: head.id, curseId: selected.id }])
    expect(text).not.toContain('enchantments')
    expect(restored.issues).toEqual([])
    expect(restored.state.setups[0].slottedCurses[head.id]).toBe(selected)
    expect(
      importGearPlannerState(JSON.stringify(createGearPlannerExport(state)), data([head], [], [], [selected])).state
        .setups[0].slottedCurses[head.id]
    ).toBe(selected)
  })

  it('keeps prior v1 payloads valid and skips only missing, orphaned, or Quiver curse selections', () => {
    const head = item('cursed-head', gearPlannerSlots.head, 'Cursed Helm')
    const quiver = item('quiver', gearPlannerSlots.quiver, 'Cursed Quiver')
    const selected = curse('Curse of Strength')
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.head, head)
    state = setGearPlannerSetupCurse(state, head.id, selected.id, [selected])
    const previousV1 = structuredClone(serializeGearPlannerState(state))
    delete previousV1.setups[0].selectedCurses
    expect(parsePersistedGearPlannerState(previousV1).version).toBe(GEAR_PLANNER_PERSISTED_VERSION)
    expect(restorePersistedGearPlannerState(previousV1, data([head], [], [], [selected])).issues).toEqual([])

    const missing = structuredClone(serializeGearPlannerState(state))
    missing.setups[0].selectedCurses = [{ itemId: head.id, curseId: 'missing' }]
    const missingRestored = restorePersistedGearPlannerState(missing, data([head], [], [], [selected]))
    expect(missingRestored.state.setups[0].equipment.Head).toBe(head)
    expect(missingRestored.state.setups[0].slottedCurses).toEqual({})
    expect(missingRestored.issues.map(({ kind }) => kind)).toContain('missing-curse')

    const orphaned = structuredClone(serializeGearPlannerState(state))
    orphaned.setups[0].selectedCurses = [{ itemId: 'missing-host', curseId: selected.id }]
    expect(
      restorePersistedGearPlannerState(orphaned, data([head], [], [], [selected])).issues.map(({ kind }) => kind)
    ).toContain('orphaned-curse')

    const quiverState = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.quiver, quiver)
    const malformedQuiver = structuredClone(serializeGearPlannerState(quiverState))
    malformedQuiver.setups[0].selectedCurses = [{ itemId: quiver.id, curseId: selected.id }]
    const quiverRestored = restorePersistedGearPlannerState(malformedQuiver, data([quiver], [], [], [selected]))
    expect(quiverRestored.state.setups[0].equipment.Quiver).toBe(quiver)
    expect(quiverRestored.state.setups[0].slottedCurses).toEqual({})
    expect(quiverRestored.issues.map(({ kind }) => kind)).toContain('ineligible-curse')
  })

  it('persists both Masterworks identities unchanged without applying crafting behavior', () => {
    const head = item('masterwork-host', gearPlannerSlots.head, 'Masterwork Helm')
    for (const name of ['Curse of Minor Masterworks', 'Curse of Major Masterworks']) {
      const selected = parseGearPlannerCurseDataset(rawCurses).find((candidate) => candidate.name === name)
      expect(selected).toBeDefined()
      if (!selected) continue
      let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.head, head)
      state = setGearPlannerSetupCurse(state, head.id, gearPlannerCurseIdentity(selected), [selected])
      const restored = restorePersistedGearPlannerState(
        serializeGearPlannerState(state),
        data([head], [], [], [selected])
      )
      expect(restored.state.setups[0].slottedCurses[head.id]?.id).toBe(name)
    }
  })
})

describe('Gear Planner filigree persistence', () => {
  const host = (): GearPlannerItem => ({
    ...item('sentient-host', gearPlannerSlots.mainHand, 'Sentient Host'),
    minimumLevel: 30,
    source: { name: 'Sentient Host', type: 'Dagger' }
  })
  const filigree = (): GearPlannerFiligree => ({
    id: 'filigree-a',
    name: 'Filigree A',
    minimumLevel: 1,
    grouping: 'Test Filigree Set',
    source: { name: 'Filigree A', pageTitle: 'Filigree A', enchantments: [{ name: 'Strength', modifier: 1 }] }
  })

  it('round-trips stable filigree references and unlocked slots while old v1 payloads remain valid', () => {
    const sentient = host()
    const selected = filigree()
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.mainHand, sentient)
    state = setGearPlannerSetupUnlockedFiligreeSlots(state, sentient.id, 2)
    state = setGearPlannerSetupFiligree(state, sentient.id, 1, selected)
    const payload = serializeGearPlannerState(state)
    const restored = restorePersistedGearPlannerState(payload, data([sentient], [], [selected]))

    expect(payload.setups[0].selectedFiligrees).toEqual([
      { itemId: sentient.id, slotIndex: 1, filigreeId: selected.id }
    ])
    expect(payload.setups[0].unlockedFiligreeSlots).toEqual([{ itemId: sentient.id, count: 2 }])
    expect(restored.issues).toEqual([])
    expect(restored.state.setups[0].slottedFiligrees[sentient.id]?.[1]).toBe(selected)
    expect(restored.state.setups[0].unlockedFiligreeSlots[sentient.id]).toBe(2)

    const previousV1 = structuredClone(payload)
    delete previousV1.setups[0].selectedFiligrees
    delete previousV1.setups[0].unlockedFiligreeSlots
    expect(parsePersistedGearPlannerState(previousV1).version).toBe(GEAR_PLANNER_PERSISTED_VERSION)
    expect(restorePersistedGearPlannerState(previousV1, data([sentient], [], [selected])).issues).toEqual([])
  })

  it('compares equipped Prowess pieces after swapping saved weapon configurations', () => {
    const first = host()
    const second = { ...first, id: 'second-weapon' }
    const artifact = {
      ...first,
      id: 'artifact',
      slot: gearPlannerSlots.trinket,
      source: { name: 'Artifact', type: 'Trinket', artifactType: 'Minor' }
    }
    const strength = { ...filigree(), name: 'Prowess: Strength', grouping: 'Prowess' }
    const other = {
      ...strength,
      id: 'other',
      name: 'Prowess: Attack',
      source: { name: 'Prowess: Attack', enchantments: [{ name: 'Attack', modifier: 1 }] }
    }
    const definition = {
      name: 'Prowess',
      source: {},
      thresholds: [
        { threshold: 2, effects: [{ name: 'Physical Resistance Rating', modifier: 5 }] },
        { threshold: 3, effects: [{ name: 'Melee Power', modifier: 5 }] }
      ]
    }
    const catalog = {
      ...data([first, second, artifact], [], [strength, other]),
      filigreeSetDefinitionByName: new Map([['Prowess', definition]])
    }
    const essence = validateEssenceCraftingDataset(createEssenceCraftingTestPayload())
    let state = createDefaultGearPlannerState()
    for (const hostItem of [artifact, second, first]) {
      state = equipGearPlannerSetupItem(state, hostItem.slot, hostItem)
      state = setGearPlannerSetupUnlockedFiligreeSlots(state, hostItem.id, 2)
      state = setGearPlannerSetupFiligree(state, hostItem.id, 0, strength)
    }
    state = setGearPlannerSetupFiligree(state, first.id, 1, other)
    const before = loadoutSnapshot(state.setups[0], 'Character', catalog, essence)
    const restored = restorePersistedGearPlannerState(serializeGearPlannerState(state), catalog)
    expect(restored.issues).toEqual([])
    state = equipGearPlannerSetupItem(restored.state, second.slot, second)
    const after = loadoutSnapshot(state.setups[0], 'Character', catalog, essence)
    expect(after.Stats.get('Strength')?.amount).toBe(2)
    expect(after.Stats.get('Physical Resistance Rating')?.amount).toBe(5)
    expect(comparisonRows(before.Stats, after.Stats)).toContainEqual(
      expect.objectContaining({ label: 'Melee Power', delta: '-5' })
    )
    expect(after.Sets.has('Prowess · 3-piece')).toBe(false)
    expect(after.Sets.has('Prowess · 2-piece')).toBe(true)
    state = equipGearPlannerSetupItem(state, first.slot, first)
    expect(loadoutSnapshot(state.setups[0], 'Character', catalog, essence)).toEqual(before)
  })

  it('reports an imported type 193 conflict and retains the first socket', () => {
    const weapon = host()
    const beacon = { ...filigree(), name: "City's Beacon/Enlightened Step: Strength" }
    const spines = {
      ...filigree(),
      id: 'spines-rare',
      name: 'Spines of the Manticore/The Wreath of Flame: Ranged Power (Rare)'
    }
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), weapon.slot, weapon)
    state = setGearPlannerSetupUnlockedFiligreeSlots(state, weapon.id, 2)
    const saved = serializeGearPlannerState(state)
    saved.setups[0].selectedFiligrees = [beacon, spines].map((f, slotIndex) => ({
      itemId: weapon.id,
      slotIndex,
      filigreeId: f.id
    }))
    const restored = restorePersistedGearPlannerState(saved, data([weapon], [], [beacon, spines]))
    expect(restored.issues).toMatchObject([{ kind: 'invalid-filigree-slot' }])
    expect(restored.state.setups[0].slottedFiligrees[weapon.id]).toEqual({ 0: beacon })
  })

  it('skips only missing filigrees and invalid restored slots', () => {
    const sentient = host()
    const selected = filigree()
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.mainHand, sentient)
    state = setGearPlannerSetupUnlockedFiligreeSlots(state, sentient.id, 2)
    state = setGearPlannerSetupFiligree(state, sentient.id, 1, selected)
    const missing = structuredClone(serializeGearPlannerState(state))
    missing.setups[0].selectedFiligrees = [{ itemId: sentient.id, slotIndex: 1, filigreeId: 'missing' }]
    const missingRestored = restorePersistedGearPlannerState(missing, data([sentient], [], [selected]))
    expect(missingRestored.state.setups[0].equipment['Main Hand']).toBe(sentient)
    expect(missingRestored.state.setups[0].slottedFiligrees).toEqual({})
    expect(missingRestored.issues.map(({ kind }) => kind)).toContain('missing-filigree')

    const invalid = structuredClone(serializeGearPlannerState(state))
    invalid.setups[0].selectedFiligrees = [{ itemId: sentient.id, slotIndex: 10, filigreeId: selected.id }]
    const invalidRestored = restorePersistedGearPlannerState(invalid, data([sentient], [], [selected]))
    expect(invalidRestored.state.setups[0].equipment['Main Hand']).toBe(sentient)
    expect(invalidRestored.state.setups[0].slottedFiligrees).toEqual({})
    expect(invalidRestored.issues.map(({ kind }) => kind)).toContain('invalid-filigree-slot')
  })
})

describe('Gear Planner production persistence', () => {
  it.runIf(import.meta.env.VITE_GEAR_PLANNER_CDN === '1')(
    'selects a curated multi-effect curse on a production item and round-trips it',
    async () => {
      const currentData = await (async () => {
        const nativeFetch = globalThis.fetch
        vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
          const requestedUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
          return nativeFetch(requestedUrl.replace('/data-cdn/', 'https://cdn.yourddo.com/'), init)
        })
        try {
          return await loadGearPlannerData()
        } finally {
          vi.unstubAllGlobals()
        }
      })()
      const host = currentData.items.find((candidate) => candidate.slot === gearPlannerSlots.head)
      const selected = currentData.curses.find((candidate) => candidate.name === 'Curse of Minor Prowess')
      expect(host).toBeDefined()
      expect(selected).toBeDefined()
      if (!host || !selected) return

      let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), gearPlannerSlots.head, host)
      state = setGearPlannerSetupCurse(state, host.id, gearPlannerCurseIdentity(selected), currentData.curses)
      const restored = restorePersistedGearPlannerState(serializeGearPlannerState(state), currentData)
      const sources = collectEquippedEffects(
        restored.state.setups[0].equipment,
        restored.state.setups[0].slottedAugments,
        restored.state.setups[0].slottedFiligrees,
        restored.state.setups[0].slottedCurses
      )

      expect(restored.issues).toEqual([])
      expect(restored.state.setups[0].slottedCurses[host.id]).toBe(selected)
      expect(sources.filter(({ category }) => category === 'curse')).toHaveLength(selected.enchantments.length)
      console.info(
        JSON.stringify({ item: host.source.name, curse: selected.name, effects: selected.enchantments.length })
      )
    }
  )

  it.runIf(import.meta.env.VITE_GEAR_PLANNER_CDN === '1')(
    'round-trips current CDN items, compatible augments, and an active standard set across two setups',
    async () => {
      const currentData = await (async () => {
        const nativeFetch = globalThis.fetch
        vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
          const requestedUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
          return nativeFetch(requestedUrl.replace('/data-cdn/', 'https://cdn.yourddo.com/'), init)
        })
        try {
          return await loadGearPlannerData()
        } finally {
          vi.unstubAllGlobals()
        }
      })()
      const characterItems = currentData.items.filter(isCharacterItem)
      const socketedCandidates = characterItems.flatMap((plannerItem) =>
        (plannerItem.source.augments ?? []).flatMap((augmentSlot, slotIndex) => {
          const selectedAugment = currentData.augments.find((candidate) =>
            isCompatibleGearPlannerAugment(augmentSlot, candidate)
          )
          return selectedAugment ? [{ item: plannerItem, slotIndex, augment: selectedAugment }] : []
        })
      )

      const sets = currentData.standardSets
      if (!sets) throw new Error('Missing equipment set definitions')
      const activeSet = [...sets.values()].find((definition) => {
        if (definition.name !== 'Echoes of the Waking Ancestors') return false
        const matchingItems = characterItems.filter((plannerItem) =>
          plannerItem.source.setBonus?.some(({ name }) => name === definition.name)
        )
        return new Set(matchingItems.map(({ slot }) => slot)).size >= definition.thresholds[0].threshold
      })
      expect(activeSet).toBeDefined()
      if (!activeSet) return

      const setItemsBySlot = new Map<GearPlannerCharacterSlot, GearPlannerItem & { slot: GearPlannerCharacterSlot }>()
      for (const plannerItem of characterItems) {
        if (
          plannerItem.source.setBonus?.some(({ name }) => name === activeSet.name) &&
          !setItemsBySlot.has(plannerItem.slot)
        ) {
          setItemsBySlot.set(plannerItem.slot, plannerItem)
        }
      }
      const setItems = [...setItemsBySlot.values()].slice(0, activeSet.thresholds[0].threshold)
      expect(setItems).toHaveLength(activeSet.thresholds[0].threshold)
      const socketed = socketedCandidates.find(({ item: socketedItem }) =>
        setItems.every((selected) => selected.slot !== socketedItem.slot || selected.id === socketedItem.id)
      )
      expect(socketed).toBeDefined()
      if (!socketed) return

      let state = createDefaultGearPlannerState()
      for (const plannerItem of setItems) state = equipGearPlannerSetupItem(state, plannerItem.slot, plannerItem)
      if (!setItems.some((plannerItem) => plannerItem.id === socketed.item.id)) {
        state = equipGearPlannerSetupItem(state, socketed.item.slot, socketed.item)
      }
      state = setGearPlannerSetupAugment(state, socketed.item.id, socketed.slotIndex, socketed.augment)
      state = addGearPlannerSetup(state, 'production-b', 'Production B')
      const secondSetupItem = characterItems.find(
        (plannerItem) =>
          !setItems.some((selected) => selected.id === plannerItem.id) && plannerItem.id !== socketed.item.id
      )
      expect(secondSetupItem).toBeDefined()
      if (!secondSetupItem) return
      state = equipGearPlannerSetupItem(state, secondSetupItem.slot, secondSetupItem)

      const restored = restorePersistedGearPlannerState(serializeGearPlannerState(state), currentData)
      const originalSetState = resolveGearPlannerSetState(
        state.setups[0].equipment,
        state.setups[0].slottedAugments,
        sets
      )
      const restoredSetState = resolveGearPlannerSetState(
        restored.state.setups[0].equipment,
        restored.state.setups[0].slottedAugments,
        sets
      )
      const restoredAugment = restored.state.setups[0].slottedAugments[socketed.item.id]?.[socketed.slotIndex]

      expect(restored.issues).toEqual([])
      expect(restored.state.setups[0].equipment[setItems[0].slot]).toBe(setItems[0])
      expect(restoredAugment).toBe(socketed.augment)
      expect(restoredSetState.sets.find(({ name }) => name === activeSet.name)?.thresholds[0].isActive).toBe(true)
      expect(restored.state.setups[1].equipment[secondSetupItem.slot]).toBe(secondSetupItem)
      expect(
        collectEquippedEffects(restored.state.setups[0].equipment, restored.state.setups[0].slottedAugments)
      ).toEqual(collectEquippedEffects(state.setups[0].equipment, state.setups[0].slottedAugments))
      expect(collectActiveSetEffectSources(restoredSetState)).toEqual(collectActiveSetEffectSources(originalSetState))
      console.info(
        JSON.stringify({
          setupA: setItems.map(({ source }) => source.name),
          augment: socketed.augment.name,
          set: activeSet.name,
          setupB: secondSetupItem.source.name
        })
      )
    }
  )

  it.runIf(import.meta.env.VITE_GEAR_PLANNER_CDN === '1')(
    'selects production filigrees, activates a filigree set, persists them, and isolates another setup',
    async () => {
      const currentData = await (async () => {
        const nativeFetch = globalThis.fetch
        vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
          const requestedUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
          return nativeFetch(requestedUrl.replace('/data-cdn/', 'https://cdn.yourddo.com/'), init)
        })
        try {
          return await loadGearPlannerData()
        } finally {
          vi.unstubAllGlobals()
        }
      })()
      const characterItems = currentData.items.filter(isCharacterItem)
      const [sentient, secondHost] = characterItems.filter(
        (candidate) =>
          candidate.slot === 'Main Hand' && candidate.source.acceptsSentience === true && candidate.minimumLevel >= 20
      )
      const filigreeSet = currentData.filigreeSetDefinitions.find((definition) => {
        const uniqueNames = new Set(
          currentData.filigrees
            .filter(({ grouping }) =>
              (grouping ?? '')
                .split('/')
                .map((name) => name.trim())
                .includes(definition.name)
            )
            .map(({ name }) => name)
        )
        return uniqueNames.size >= definition.thresholds[0].threshold
      })
      expect(sentient).toBeDefined()
      expect(secondHost).toBeDefined()
      expect(filigreeSet).toBeDefined()
      if (!sentient || !secondHost || !filigreeSet) return

      const selectedFiligrees = [
        ...new Map(
          currentData.filigrees
            .filter(({ grouping }) =>
              (grouping ?? '')
                .split('/')
                .map((name) => name.trim())
                .includes(filigreeSet.name)
            )
            .map((filigree) => [normalizeGearPlannerFiligreeName(filigree.name), filigree])
        ).values()
      ].slice(0, filigreeSet.thresholds[0].threshold)
      let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), sentient.slot, sentient)
      state = setGearPlannerSetupUnlockedFiligreeSlots(state, sentient.id, selectedFiligrees.length)
      selectedFiligrees.forEach((filigree, slotIndex) => {
        state = setGearPlannerSetupFiligree(state, sentient.id, slotIndex, filigree)
      })
      const activeFiligreeSets = resolveGearPlannerSetState(
        state.setups[0].equipment,
        state.setups[0].slottedAugments,
        undefined,
        state.setups[0].slottedFiligrees,
        currentData.filigreeSetDefinitionByName
      )
      expect(activeFiligreeSets.sets.find(({ name }) => name === filigreeSet.name)?.thresholds[0].isActive).toBe(true)
      expect(
        collectEquippedEffects(
          state.setups[0].equipment,
          state.setups[0].slottedAugments,
          state.setups[0].slottedFiligrees
        )
          .filter(({ category }) => category === 'filigree')
          .map(({ effect }) => effect.name)
      ).toEqual(selectedFiligrees.flatMap(({ source }) => (source.enchantments ?? []).map((effect) => effect.name)))
      state = addGearPlannerSetup(state, 'production-filigree-b', 'Production Filigree B')
      state = equipGearPlannerSetupItem(state, secondHost.slot, secondHost)
      const restored = restorePersistedGearPlannerState(serializeGearPlannerState(state), currentData)

      expect(restored.issues).toEqual([])
      expect(restored.state.setups[0].slottedFiligrees[sentient.id]).toBeDefined()
      expect(restored.state.setups[1].equipment[secondHost.slot]).toBe(secondHost)
      expect(restored.state.setups[1].slottedFiligrees).toEqual({})
      console.info(
        JSON.stringify({
          sentient: sentient.source.name,
          secondHost: secondHost.source.name,
          filigrees: selectedFiligrees.map(({ name }) => name),
          set: filigreeSet.name,
          threshold: filigreeSet.thresholds[0].threshold
        })
      )
    }
  )
})
