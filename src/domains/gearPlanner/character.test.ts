import { describe, expect, it } from 'vitest'
import { getEssenceCraftedGearPlannerItems } from './essenceCrafting'
import {
  changeClasses,
  characterAllowsItem,
  defaultCharacter,
  proficiencyGroups,
  proficiencyOptions,
  updateProficiencyGroup
} from './character'
import type { GearPlannerItem } from './gearPlanner.types'
import { normalizeGearPlannerSources } from './normalize'
import { createGearPlannerExport, importGearPlannerState } from './plannerStorage'
import { gearPlannerPermalink, openGearPlannerLink } from './sharing'
import { activeGearPlannerSetup, createDefaultGearPlannerState, updateSetupCharacter } from './setups'

describe('Gear Planner character setup', () => {
  it('groups catalog weapons and changes one group without disturbing the others', () => {
    const weapons = ['Club', 'Handwraps', 'Quarterstaff', 'Long Bow', 'Repeating Heavy Crossbow', 'Dart']
    const groups = proficiencyGroups(weapons)
    expect(groups.map((group) => group.title)).toEqual([
      'One-handed weapons',
      'Two-handed weapons',
      'Off-hand items',
      'Ranged weapons',
      'Throwing weapons',
      'Armor'
    ])
    const ranged = groups[3].types
    expect(ranged).toEqual(['Long Bow', 'Repeating Heavy Crossbow'])
    expect(groups[1].types).toEqual(['Handwraps', 'Quarterstaff'])
    const withoutRanged = updateProficiencyGroup(defaultCharacter(), 'weapons', weapons, ranged, [])
    expect(withoutRanged.weapons).toEqual(['Club', 'Handwraps', 'Quarterstaff', 'Dart'])
    const restored = updateProficiencyGroup(withoutRanged, 'weapons', weapons, ranged, ranged)
    expect(restored).toEqual(defaultCharacter())
  })

  it('round trips an explicitly empty armor filter and restores it with select all', () => {
    const state = createDefaultGearPlannerState()
    const setup = activeGearPlannerSetup(state)
    const armor = proficiencyOptions.armor
    const settings = updateProficiencyGroup(setup.character, 'armor', armor, armor, [])
    const payload = createGearPlannerExport(updateSetupCharacter(state, setup.id, settings))
    const restored = activeGearPlannerSetup(
      importGearPlannerState(JSON.stringify(payload), normalizeGearPlannerSources([], [])).state
    )
    const template = getEssenceCraftedGearPlannerItems('Armor', 1)[0]
    expect(characterAllowsItem(restored.character, template)).toBe(false)
    expect(
      characterAllowsItem(updateProficiencyGroup(restored.character, 'armor', armor, armor, armor), template)
    ).toBe(true)
  })

  it('keeps class grants distinct from the weapon types offered by the catalog', () => {
    const types = ['Club', 'Heavy Mace', 'Light Hammer', 'Handwraps', 'Hand Axe', 'Long Sword']
    const weapons = (name: string, available = types) => changeClasses(defaultCharacter(), [name], available).weapons
    expect(weapons('Wizard')).toEqual(['Club'])
    expect(weapons('Druid')).toEqual(['Club'])
    expect(weapons('Bard')).toContain('Long Sword')
    expect(weapons('Monk')).toEqual(expect.arrayContaining(['Hand Axe', 'Handwraps']))
    for (const name of ['Druid', 'Wizard', 'Monk']) expect(weapons(name, [...types, 'Unarmed'])).toContain('Unarmed')
  })

  it.each([
    [['Club', 'Scepter'], ['Club']],
    [['Scepter'], ['Scepter']],
    [['Unarmed'], ['Unarmed']],
    [
      ['Longsword', 'Long Sword', 'Handaxe'],
      ['Long Sword', 'Hand Axe']
    ]
  ])('restores weapon filters %j through legacy and current exports', (weapons, expected) => {
    const data = normalizeGearPlannerSources([], [])
    const legacy = importGearPlannerState(
      JSON.stringify([{ name: 'Saved setup', slots: {}, weaponFilters: weapons }]),
      data
    )
    const payload = createGearPlannerExport(legacy.state)
    const setup = payload.setups[0]
    const current = importGearPlannerState(
      JSON.stringify({ ...payload, setups: [{ ...setup, character: { ...setup.character, weapons } }] }),
      data
    )
    for (const restored of [legacy, current]) {
      expect(activeGearPlannerSetup(restored.state)).toMatchObject({
        name: 'Saved setup',
        character: { weapons: expected }
      })
    }
  })

  it('combines multiclass proficiencies, removes dropped class grants, and keeps manual extras', () => {
    const start = changeClasses(defaultCharacter(), ['Druid', 'Artificer'])
    expect(start.weapons).toEqual(expect.arrayContaining(['Scimitar', 'Repeating Light Crossbow']))
    const next = changeClasses({ ...start, weapons: [...start.weapons, 'Khopesh'] }, ['Druid'])
    expect(next.weapons).not.toContain('Repeating Light Crossbow')
    expect(next.weapons).toEqual(expect.arrayContaining(['Khopesh', 'Scimitar']))
  })
  it('applies the oath to character armor and shields, independently of proficiencies and companion gear', () => {
    const settings = changeClasses(defaultCharacter(), ['Druid'])
    const allowed = (slot: GearPlannerItem['slot'], type: string, material: string, override = false) =>
      characterAllowsItem(
        { ...settings, allowMetalWithDruid: override },
        { id: 'id', slot, sourceFile: 'test', minimumLevel: 1, source: { name: 'test', type, material } }
      )
    expect(allowed('Armor', 'Medium Armor', 'Steel')).toBe(false)
    expect(allowed('Armor', 'Medium Armor', 'Steel', true)).toBe(true)
    expect(allowed('Armor', 'Heavy Armor', 'Steel', true)).toBe(false)
    expect(allowed('Armor', 'Robe', 'Cloth')).toBe(true)
    expect(allowed('Off Hand', 'Small Shield', 'Iron')).toBe(false)
    expect(allowed('Off Hand', 'Small Shield', 'Wood')).toBe(true)
    expect(allowed('Main Hand', 'Scimitar', 'Steel')).toBe(true)
    expect(allowed('Wolf Companion Armor', 'Docent', 'Steel')).toBe(true)
  })
  it('uses the configured Essence material for armor and shields across class and override changes', () => {
    const druid = changeClasses(defaultCharacter(), ['Fighter', 'Druid'])
    const fighter = changeClasses(defaultCharacter(), ['Fighter'])
    const templates = [
      ...getEssenceCraftedGearPlannerItems('Armor', 1),
      ...getEssenceCraftedGearPlannerItems('Off Hand', 1)
    ]
    for (const template of templates) {
      const covered = template.slot === 'Armor' || template.essenceCrafting?.kind === 'shield'
      expect(characterAllowsItem(druid, template, 'Flametouched Iron')).toBe(!covered)
      expect(characterAllowsItem(druid, template, 'Wood')).toBe(true)
      expect(characterAllowsItem(druid, template)).toBe(true)
      expect(characterAllowsItem({ ...druid, allowMetalWithDruid: true }, template, 'Byeshk')).toBe(true)
      expect(characterAllowsItem(fighter, template, 'Byeshk')).toBe(true)
    }
  })
  it('keeps focus priority order in exported setups and shared links', () => {
    const data = normalizeGearPlannerSources([], [])
    const state = createDefaultGearPlannerState()
    const setup = activeGearPlannerSetup(state)
    const focusStats = [
      'Wisdom',
      'Spell DC: Evocation',
      'Maximum Hit Points',
      'Strength',
      'Dexterity',
      'Constitution',
      'Intelligence',
      'Charisma',
      'Skill: Jump',
      'Armor Class'
    ]
    const focused = updateSetupCharacter(state, setup.id, { ...setup.character, focusStats })
    const exported = createGearPlannerExport(focused)
    const imported = importGearPlannerState(JSON.stringify(exported), data)
    const url = new URL(gearPlannerPermalink(activeGearPlannerSetup(focused), 'https://example.test/gear-planner'))
    const shared = openGearPlannerLink(new URLSearchParams(url.hash.slice(1)).get('gp') ?? '', state, data)
    for (const result of [imported, shared]) {
      expect(activeGearPlannerSetup(result.state).character.focusStats).toEqual(focusStats)
    }
    for (const invalid of [
      ['Wisdom', 'wisdom'],
      [...focusStats, 'Fortification']
    ]) {
      expect(() =>
        importGearPlannerState(
          JSON.stringify({
            ...exported,
            setups: [{ ...exported.setups[0], character: { ...setup.character, focusStats: invalid } }]
          }),
          data
        )
      ).toThrow(/focusStats/)
    }
  })

  it('restores both legacy companions, their separate upgrades and character settings through JSON and permalinks', () => {
    const collar = { name: 'Test Collar', type: 'Collar', minLevel: 12, augments: [{ augmentType: 'Red' }] }
    const rubies = ['Ruby A', 'Ruby B'].map((name) => ({
      name,
      augmentType: 'Red',
      minLevel: 1,
      effectsAdded: [],
      source: {}
    }))
    const data = normalizeGearPlannerSources([{ fileName: 'collar.json', records: [collar] }], rubies)
    const pet = (slot: string, ruby: string) => ({
      slots: { [slot]: { ...collar, id: 'old' } },
      slottedAugments: { old: { 0: { name: ruby } } }
    })
    const raw = {
      name: 'Pets',
      classes: ['Artificer', null, 'Druid'],
      allowMetalWithDruid: true,
      weaponFilters: ['Khopesh'],
      slots: {},
      artificerPet: pet('Iron Defender Weapon', 'Ruby A'),
      druidPet: pet('Wolf Companion Weapon', 'Ruby B')
    }
    const restored = importGearPlannerState(JSON.stringify([raw]), data)
    expect(restored.issues).toEqual([])
    const setup = activeGearPlannerSetup(restored.state)
    expect(setup.character).toMatchObject({
      classes: ['Artificer', 'Druid'],
      weapons: ['Khopesh'],
      allowMetalWithDruid: true
    })
    expect(setup.slottedAugments[data.itemsBySlot['Iron Defender Weapon'][0].id][0]).toBe(rubies[0])
    expect(setup.slottedAugments[data.itemsBySlot['Wolf Companion Weapon'][0].id][0]).toBe(rubies[1])
    const inactive = updateSetupCharacter(restored.state, setup.id, changeClasses(setup.character, []))
    const reopened = importGearPlannerState(JSON.stringify(createGearPlannerExport(inactive)), data)
    expect(reopened.state).toEqual(inactive)
    const url = new URL(gearPlannerPermalink(setup, 'https://example.test/gear-planner'))
    const opened = openGearPlannerLink(
      new URLSearchParams(url.hash.slice(1)).get('gp') ?? '',
      createDefaultGearPlannerState(),
      data
    )
    expect(opened.issues).toEqual([])
    expect(activeGearPlannerSetup(opened.state)).toMatchObject({
      equipment: setup.equipment,
      slottedAugments: setup.slottedAugments,
      character: setup.character
    })
  })
})
