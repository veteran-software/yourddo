import { describe, expect, it } from 'vitest'
import { getEssenceCraftedGearPlannerItems } from './essenceCrafting'
import { changeClasses, characterAllowsItem, defaultCharacter } from './character'
import type { GearPlannerItem } from './gearPlanner.types'
import { normalizeGearPlannerSources } from './normalize'
import { createGearPlannerExport, importGearPlannerState } from './plannerStorage'
import { gearPlannerPermalink, openGearPlannerLink } from './sharing'
import { activeGearPlannerSetup, createDefaultGearPlannerState, updateSetupCharacter } from './setups'

describe('Gear Planner character setup', () => {
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
