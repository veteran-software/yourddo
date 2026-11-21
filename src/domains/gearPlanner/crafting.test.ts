import { describe, expect, it } from 'vitest'
import { emptyGearCraftingData, gearCraftGroups } from './crafting.ts'
import { collectEquippedEffects } from './effects.ts'
import { candidateSetDetails } from './finding'
import { normalizeGearPlannerSources } from './normalize.ts'
import { createGearPlannerExport, importGearPlannerState } from './plannerStorage.ts'
import { collectEquippedItemSetMemberships, resolveGearPlannerSetState } from './sets.ts'
import { formatGearSetup, gearPlannerPermalink, openGearPlannerLink } from './sharing'
import {
  activeGearPlannerSetup,
  createDefaultGearPlannerState,
  equipGearPlannerSetupItem,
  setGearPlannerSetupCraft
} from './setups.ts'

describe('gear planner item crafting', () => {
  it('restores recipe IDs against current data and keeps replacement and additive effects distinct', () => {
    const data = normalizeGearPlannerSources(
      [
        {
          fileName: 'necklace.json',
          records: [
            {
              name: 'Test Amulet',
              type: 'Necklace',
              enchantments: [{ name: 'Old bonus' }, { name: 'Upgradeable Item (Stormreaver)' }]
            }
          ]
        }
      ],
      []
    )
    const [item] = data.items
    data.crafting = {
      ...emptyGearCraftingData,
      upgrades: [
        {
          system: 'stormreaver',
          label: 'Stormreaver Monument',
          marker: 'Upgradeable Item (Stormreaver)',
          items: new Map([['test amulet', [{ name: 'New bonus' }]]])
        }
      ]
    }
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), 'Neck', item)
    const select = (system: string, choice: string | null) => {
      state = setGearPlannerSetupCraft(state, 'Neck', item.id, system, choice, data.crafting)
    }
    select('stormreaver', 'applied')
    select('mythic', '2')
    state = equipGearPlannerSetupItem(state, 'Neck', item)
    const save = createGearPlannerExport(state)
    expect(save.setups[0].selectedCrafts).toHaveLength(2)
    const loaded = importGearPlannerState(JSON.stringify(save), data)
    expect(loaded.issues).toEqual([])
    const bonuses = collectEquippedEffects(loaded.state.setups[0].equipment).map((e) => e.effect.name)
    expect(bonuses).toEqual(['New bonus', 'Physical Resistance Rating', 'Magical Resistance Rating'])
    select('stormreaver', null)
    expect(collectEquippedEffects(state.setups[0].equipment)[0].effect.name).toBe('Old bonus')
    const stale = importGearPlannerState(JSON.stringify(save), { ...data, crafting: emptyGearCraftingData })
    expect(stale.issues.map((i) => i.kind)).toEqual(['invalid-craft'])
    expect(stale.state.setups[0].equipment.Neck?.crafts?.map((c) => c.system)).toEqual(['mythic'])
    state = equipGearPlannerSetupItem(state, 'Neck', null)
    expect(createGearPlannerExport(state).setups[0].selectedCrafts).toEqual([])
  })

  it('counts only rolled Gem sets and resolves the Legendary desert names in the published list', () => {
    const data = normalizeGearPlannerSources(
      [
        {
          fileName: 'trinket.json',
          records: [
            {
              name: 'Legendary Gem of Many Facets',
              type: 'Trinket',
              setBonus: [{ name: 'Legendary Divine Blessing' }, { name: "The Epic Desert's Biting Sands" }]
            }
          ]
        }
      ],
      []
    )
    const [gem] = data.items
    let state = equipGearPlannerSetupItem(createDefaultGearPlannerState(), 'Trinket', gem)
    const memberships = () => collectEquippedItemSetMemberships(state.setups[0].equipment).map((m) => m.setName)
    expect(memberships()).toEqual([])
    for (const [system, set] of [
      ['gem-set-1', 'Legendary Divine Blessing'],
      ['gem-set-2', "The Legendary Desert's Biting Sands"]
    ]) {
      state = setGearPlannerSetupCraft(state, 'Trinket', gem.id, system, set, data.crafting)
    }
    expect(memberships()).toEqual(['Legendary Divine Blessing', "The Legendary Desert's Biting Sands"])
    const invalid = setGearPlannerSetupCraft(
      state,
      'Trinket',
      gem.id,
      'gem-set-1',
      "The Legendary Desert's Biting Sands",
      data.crafting
    )
    expect(invalid).toBe(state)
  })

  it('counts only the selected Slave Lords tier and set through equipment changes, saves and sharing', () => {
    const marker = { name: 'Against the Slave Lords Set Bonus' }
    const data = normalizeGearPlannerSources(
      ['helmet', 'cloak', 'belt', 'bracers', 'necklace', 'boots', 'gloves'].map((type) => ({
        fileName: type + '.json',
        records: [{ name: type, minLevel: type === 'boots' ? 28 : 8, enchantments: type === 'gloves' ? [] : [marker] }]
      })),
      []
    )
    const might = "Slave Lord's Might"
    const sorcery = "Slave Lord's Sorcery"
    const endurance = "Slave's Endurance"
    let state = createDefaultGearPlannerState()
    for (const item of data.items) {
      state = equipGearPlannerSetupItem(state, item.slot, item)
      const { sets: choices } = candidateSetDetails(item)
      if (item.slot === 'Hands') expect(choices).toEqual([])
      else
        expect(choices).toEqual(
          [might, sorcery, endurance].map((name) => (item.slot === 'Feet' ? 'Legendary ' + name : name))
        )
    }
    const equipment = () => activeGearPlannerSetup(state).equipment
    const sets = () => resolveGearPlannerSetState(equipment(), {}).sets
    expect(sets()).toEqual([])
    expect(collectEquippedEffects(equipment())).toEqual([])
    const savedBlank = createGearPlannerExport(state)
    expect(
      importGearPlannerState(JSON.stringify(savedBlank), data).state.setups[0].equipment.Head?.crafts ?? []
    ).toEqual([])

    const select = (item: (typeof data.items)[number], choice: string | null) => {
      state = setGearPlannerSetupCraft(state, item.slot, item.id, 'slave-lords', choice, data.crafting)
    }
    const heroic = data.items.filter((item) => item.slot !== 'Hands' && item.slot !== 'Feet')
    const legendary = data.itemsBySlot.Feet[0]
    select(legendary, might)
    expect(sets()).toEqual([])
    select(legendary, 'Legendary ' + might)
    for (const [index, item] of heroic.entries()) {
      select(item, might)
      const set = sets().find((s) => s.name === might)
      expect(set?.thresholds.map((t) => t.isActive)).toEqual([index >= 2, index >= 4])
    }
    expect(sets().find((s) => s.name === might)?.thresholds[1].effects).toContainEqual({
      name: 'Strength',
      modifier: 1,
      bonus: 'Artifact'
    })
    select(heroic[0], endurance)
    expect(sets().find((s) => s.name === might)?.count).toBe(4)
    expect(sets().find((s) => s.name === endurance)?.count).toBe(1)

    const shareText = formatGearSetup(
      activeGearPlannerSetup(state),
      [],
      { Character: resolveGearPlannerSetState(equipment(), {}) },
      'Discord Markdown',
      ''
    )
    expect(shareText.split(endurance)).toHaveLength(2)
    const saved = importGearPlannerState(JSON.stringify(createGearPlannerExport(state)), data)
    const url = new URL(gearPlannerPermalink(activeGearPlannerSetup(state), 'https://example.test/gear-planner'))
    const shared = openGearPlannerLink(
      new URLSearchParams(url.hash.slice(1)).get('gp') ?? '',
      createDefaultGearPlannerState(),
      data
    )
    for (const restored of [saved, shared]) {
      expect(restored.issues).toEqual([])
      expect(resolveGearPlannerSetState(activeGearPlannerSetup(restored.state).equipment, {}).sets).toEqual(sets())
    }
    select(heroic[0], null)
    state = equipGearPlannerSetupItem(state, legendary.slot, null)
    expect(sets().map((s) => [s.name, s.count])).toEqual([[might, 4]])
  })

  it('restricts recipes by marker and level and includes every grant in a choice', () => {
    const data = normalizeGearPlannerSources(
      [
        {
          fileName: 'trinket.json',
          records: [
            {
              name: 'Test item',
              type: 'Trinket',
              minLevel: 11,
              enchantments: ['Nearly Complete: Skill', 'Trace of Madness', 'Lost Purpose', 'Sealed in Undeath'].map(
                (name) => ({ name })
              )
            }
          ]
        }
      ],
      []
    )
    const [item] = data.items
    const recipes = ['Heroic', 'Legendary'].map((tier) => ({
      name: tier + ' choice',
      requirements: [{ name: tier + ' Item with Nearly Complete: Skill' }],
      effectsAdded: [{ name: 'Skill A' }, { name: 'Skill B' }],
      effectsRemoved: [{ name: 'Nearly Complete: Skill' }]
    }))
    const groups = gearCraftGroups(item, { ...emptyGearCraftingData, nearlyComplete: recipes })
    expect(groups.find((g) => g.system === 'nearly-complete')?.choices.map((c) => c.id)).toEqual(['Heroic choice'])
    expect(groups.find((g) => g.system === 'lost-purpose')?.choices.every((c) => !c.id.startsWith('Legendary'))).toBe(
      true
    )
    expect(
      groups.find((g) => g.system === 'trace-of-madness')?.choices.find((c) => c.id.endsWith('Subtle Ambition'))
        ?.effects
    ).toHaveLength(2)
    expect(groups.find((g) => g.system === 'ritual-table')?.choices.some((c) => c.id === '+3 Quality Charisma')).toBe(
      true
    )
    expect(groups.some((g) => g.system === 'reaper-forge')).toBe(false)
  })
})
