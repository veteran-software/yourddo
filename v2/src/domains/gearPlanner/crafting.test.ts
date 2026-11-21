import { describe, expect, it } from 'vitest'
import { emptyGearCraftingData, gearCraftGroups } from './crafting.ts'
import { collectEquippedEffects } from './effects.ts'
import { normalizeGearPlannerSources } from './normalize.ts'
import { createGearPlannerExport, importGearPlannerState } from './plannerStorage.ts'
import { collectEquippedItemSetMemberships } from './sets.ts'
import { createDefaultGearPlannerState, equipGearPlannerSetupItem, setGearPlannerSetupCraft } from './setups.ts'

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
