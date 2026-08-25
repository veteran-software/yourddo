import { describe, expect, it } from 'vitest'
import {
  getGearPlannerMaxFiligreeSlots,
  isGearPlannerMinorArtifact,
  isGearPlannerSentientWeapon,
  normalizeGearPlannerFiligreeName,
  supportsGearPlannerFiligrees
} from './filigrees.ts'
import type { GearPlannerFiligree, GearPlannerItem } from './gearPlanner.types.ts'
import { gearPlannerSlots } from './gearPlanner.types.ts'
import {
  createEmptyGearPlannerSelectionState,
  equipGearPlannerItemInSelection,
  setGearPlannerSlottedFiligree,
  setGearPlannerUnlockedFiligreeSlots
} from './planner.ts'

const item = (
  id: string,
  slot: GearPlannerItem['slot'],
  type: string,
  minimumLevel: number,
  artifactType?: string
): GearPlannerItem => ({
  id,
  slot,
  sourceFile: 'test.json',
  minimumLevel,
  source: { name: id, type, ...(artifactType === undefined ? {} : { artifactType }) }
})

const filigree = (id: string, name = id, grouping?: string): GearPlannerFiligree => ({
  id,
  name,
  minimumLevel: 1,
  ...(grouping === undefined ? {} : { grouping }),
  source: { name, pageTitle: id, type: 'Common' }
})

describe('Gear Planner filigree capability', () => {
  it('uses legacy type and artifact fields for sentience, artifact detection, and capacity', () => {
    const trinket = item('trinket', gearPlannerSlots.trinket, 'Trinket', 36)
    const dagger = item('dagger', gearPlannerSlots.mainHand, 'Dagger', 20)
    const minor20 = item('minor-20', gearPlannerSlots.trinket, 'Trinket', 20, 'Minor')
    const minor29 = item('minor-29', gearPlannerSlots.trinket, 'Trinket', 29, 'Minor')
    const minor30 = item('minor-30', gearPlannerSlots.trinket, 'Trinket', 30, 'Minor')
    const minor33 = item('minor-33', gearPlannerSlots.trinket, 'Trinket', 33, 'Minor')

    expect(isGearPlannerSentientWeapon(trinket)).toBe(false)
    expect(getGearPlannerMaxFiligreeSlots(trinket)).toBe(0)
    expect(isGearPlannerSentientWeapon(dagger)).toBe(true)
    expect(supportsGearPlannerFiligrees(dagger)).toBe(true)
    expect(getGearPlannerMaxFiligreeSlots(dagger)).toBe(10)
    expect(isGearPlannerMinorArtifact(minor20)).toBe(true)
    expect([minor20, minor29, minor30, minor33].map(getGearPlannerMaxFiligreeSlots)).toEqual([1, 3, 4, 5])
  })
})

describe('Gear Planner filigree transitions', () => {
  it('selects, replaces, clears, bounds unlocked slots, and clears reduced slots', () => {
    const host = item('host', gearPlannerSlots.mainHand, 'Dagger', 30)
    const first = filigree('first', 'First')
    const second = filigree('second', 'Second')
    const replacement = filigree('replacement', 'Replacement')
    let state = equipGearPlannerItemInSelection(createEmptyGearPlannerSelectionState(), gearPlannerSlots.mainHand, host)

    expect(state.unlockedFiligreeSlots[host.id]).toBeUndefined()
    expect(setGearPlannerSlottedFiligree(state, host.id, 0, first)).toBe(state)
    state = setGearPlannerUnlockedFiligreeSlots(state, host.id, 1)
    state = setGearPlannerSlottedFiligree(state, host.id, 0, first)
    expect(state.slottedFiligrees[host.id]?.[0]).toBe(first)
    expect(setGearPlannerSlottedFiligree(state, host.id, 1, second)).toBe(state)
    state = setGearPlannerUnlockedFiligreeSlots(state, host.id, 2)
    state = setGearPlannerSlottedFiligree(state, host.id, 1, second)
    expect(state.slottedFiligrees[host.id]?.[1]).toBe(second)
    state = setGearPlannerSlottedFiligree(state, host.id, 0, replacement)
    expect(state.slottedFiligrees[host.id]?.[0]).toBe(replacement)
    state = setGearPlannerSlottedFiligree(state, host.id, 0, null)
    expect(state.slottedFiligrees[host.id]?.[0]).toBeUndefined()
    state = setGearPlannerUnlockedFiligreeSlots(state, host.id, 0)
    expect(state.slottedFiligrees).toEqual({})
    expect(state.unlockedFiligreeSlots[host.id]).toBe(0)
    expect(setGearPlannerUnlockedFiligreeSlots(state, host.id, -1).unlockedFiligreeSlots[host.id]).toBe(0)
    expect(setGearPlannerUnlockedFiligreeSlots(state, host.id, 99).unlockedFiligreeSlots[host.id]).toBe(10)
  })

  it('cleans replaced and removed host metadata without touching unrelated hosts', () => {
    const head = item('head', gearPlannerSlots.head, 'Trinket', 30, 'Minor')
    const replacement = item('replacement', gearPlannerSlots.head, 'Trinket', 30)
    const mainHand = item('main', gearPlannerSlots.mainHand, 'Dagger', 30)
    const first = filigree('first')
    const second = filigree('second')
    let state = equipGearPlannerItemInSelection(createEmptyGearPlannerSelectionState(), gearPlannerSlots.head, head)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.mainHand, mainHand)
    state = setGearPlannerUnlockedFiligreeSlots(state, head.id, 1)
    state = setGearPlannerUnlockedFiligreeSlots(state, mainHand.id, 2)
    state = setGearPlannerSlottedFiligree(state, head.id, 0, first)
    state = setGearPlannerSlottedFiligree(state, mainHand.id, 0, second)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.head, replacement)

    expect(state.slottedFiligrees).toEqual({ [mainHand.id]: { 0: second } })
    expect(state.unlockedFiligreeSlots).toEqual({ [mainHand.id]: 2 })
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.mainHand, null)
    expect(state.slottedFiligrees).toEqual({})
    expect(state.unlockedFiligreeSlots).toEqual({})
  })

  it('matches legacy duplicate behavior: common/rare names conflict per host, not across hosts', () => {
    const mainHand = item('main', gearPlannerSlots.mainHand, 'Dagger', 30)
    const offHand = item('off', gearPlannerSlots.offHand, 'Dagger', 30)
    const common = filigree('common', 'Strength')
    const rare = filigree('rare', 'Strength (Rare)')
    let state = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.mainHand,
      mainHand
    )
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.offHand, offHand)
    state = setGearPlannerUnlockedFiligreeSlots(state, mainHand.id, 2)
    state = setGearPlannerUnlockedFiligreeSlots(state, offHand.id, 1)
    state = setGearPlannerSlottedFiligree(state, mainHand.id, 0, common)
    expect(setGearPlannerSlottedFiligree(state, mainHand.id, 1, rare)).toBe(state)
    state = setGearPlannerSlottedFiligree(state, offHand.id, 0, rare)

    expect(state.slottedFiligrees).toEqual({ [mainHand.id]: { 0: common }, [offHand.id]: { 0: rare } })
    expect(normalizeGearPlannerFiligreeName(common.name)).toBe(normalizeGearPlannerFiligreeName(rare.name))
  })

  it('enforces one character minor artifact while leaving normal ring selection unchanged', () => {
    const firstArtifact = item('artifact-a', gearPlannerSlots.firstFinger, 'Ring', 30, 'Minor')
    const secondArtifact = item('artifact-b', gearPlannerSlots.secondFinger, 'Ring', 30, 'Minor')
    const normalRing = item('normal-ring', gearPlannerSlots.secondFinger, 'Ring', 30)
    let state = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.firstFinger,
      firstArtifact
    )
    expect(equipGearPlannerItemInSelection(state, gearPlannerSlots.secondFinger, secondArtifact)).toBe(state)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.secondFinger, normalRing)
    expect(state.equipment['First Finger']).toBe(firstArtifact)
    expect(state.equipment['Second Finger']).toBe(normalRing)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.firstFinger, null)
    state = equipGearPlannerItemInSelection(state, gearPlannerSlots.secondFinger, secondArtifact)
    expect(state.equipment['Second Finger']).toBe(secondArtifact)
  })

  it('does not apply augment or build-level filtering to filigree selection', () => {
    const host = item('host', gearPlannerSlots.mainHand, 'Dagger', 20)
    const highLevel = { ...filigree('high-level'), minimumLevel: 36 }
    let state = equipGearPlannerItemInSelection(createEmptyGearPlannerSelectionState(), gearPlannerSlots.mainHand, host)
    state = setGearPlannerUnlockedFiligreeSlots(state, host.id, 1)
    state = setGearPlannerSlottedFiligree(state, host.id, 0, highLevel)
    expect(state.slottedFiligrees[host.id]?.[0]).toBe(highLevel)
  })
})
