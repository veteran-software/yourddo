import { describe, expect, it, vi } from 'vitest'
import { gearPlannerAugmentIdentity, isCompatibleGearPlannerAugment } from './augments.ts'
import { loadGearPlannerData } from './data.ts'
import { collectEquippedEffects } from './effects.ts'
import { normalizeGearPlannerFiligreeName } from './filigrees.ts'
import {
  allGearPlannerSlots,
  type GearPlannerAugment,
  gearPlannerCharacterSlots,
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
  setGearPlannerSetupFiligree,
  setGearPlannerSetupUnlockedFiligreeSlots
} from './setups.ts'
import { standardGearPlannerSetDefinitionByName } from './standardSetDefinitions.ts'

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

const data = (
  items: readonly GearPlannerItem[],
  augments: readonly GearPlannerAugment[] = [],
  filigrees: readonly GearPlannerFiligree[] = []
): GearPlannerData => ({
  sourceDatasets: [],
  items,
  augments,
  filigrees,
  filigreeSetDefinitions: [],
  filigreeSetDefinitionByName: new Map(),
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

      const activeSet = [...standardGearPlannerSetDefinitionByName.values()].find((definition) => {
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
      const originalSetState = resolveGearPlannerSetState(state.setups[0].equipment, state.setups[0].slottedAugments)
      const restoredSetState = resolveGearPlannerSetState(
        restored.state.setups[0].equipment,
        restored.state.setups[0].slottedAugments
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
      const sentient = characterItems.find(
        (plannerItem) => plannerItem.source.type === 'Dagger' && plannerItem.minimumLevel >= 20
      )
      const minorArtifact = characterItems.find(
        (plannerItem) => (plannerItem.source.artifactType?.trim().length ?? 0) > 0
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
      expect(minorArtifact).toBeDefined()
      expect(filigreeSet).toBeDefined()
      if (!sentient || !minorArtifact || !filigreeSet) return

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
        ).filter(({ category }) => category === 'filigree').length
      ).toBeGreaterThan(0)
      state = addGearPlannerSetup(state, 'production-filigree-b', 'Production Filigree B')
      state = equipGearPlannerSetupItem(state, minorArtifact.slot, minorArtifact)
      const restored = restorePersistedGearPlannerState(serializeGearPlannerState(state), currentData)

      expect(restored.issues).toEqual([])
      expect(restored.state.setups[0].slottedFiligrees[sentient.id]).toBeDefined()
      expect(restored.state.setups[1].equipment[minorArtifact.slot]).toBe(minorArtifact)
      expect(restored.state.setups[1].slottedFiligrees).toEqual({})
      console.info(
        JSON.stringify({
          sentient: sentient.source.name,
          minorArtifact: minorArtifact.source.name,
          filigrees: selectedFiligrees.map(({ name }) => name),
          set: filigreeSet.name,
          threshold: filigreeSet.thresholds[0].threshold
        })
      )
    }
  )
})
