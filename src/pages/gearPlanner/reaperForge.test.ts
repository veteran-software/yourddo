import { describe, expect, it } from 'vitest'
import { getReaperForgeEffectsForSlot, getReaperForgeEnchantments } from './helpers'
import { GearSlot } from './types'

describe('reaper forge helpers', () => {
  it('returns the ring effects for ring slots', () => {
    expect(getReaperForgeEffectsForSlot(GearSlot.FirstFinger).map((effect) => effect.id)).toEqual([
      'reaper-ring-boost-1',
      'reaper-ring-boost-2',
      'reaper-ring-boost-3',
      'reaper-ring-boost-4'
    ])
  })

  it('converts a selected effect into enchantments', () => {
    expect(getReaperForgeEnchantments('reaper-bracers-enchantment')).toEqual([
      { name: 'Fortitude Saving Throws', bonus: 'Reaper', modifier: 1 },
      { name: 'Reflex Saving Throws', bonus: 'Reaper', modifier: 1 },
      { name: 'Will Saving Throws', bonus: 'Reaper', modifier: 1 },
      { name: 'Magical Resistance Rating', bonus: 'Reaper', modifier: 3 }
    ])
  })

  it('expands All Skills into the full skill list', () => {
    expect(getReaperForgeEnchantments('reaper-gloves-enchantment')).toEqual([
      { name: 'Skill: Balance', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Bluff', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Concentration', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Diplomacy', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Disable Device', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Haggle', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Heal', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Hide', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Intimidate', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Jump', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Listen', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Move Silently', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Open Lock', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Perform', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Repair', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Search', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Spellcraft', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Spot', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Swim', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Tumble', bonus: 'Reaper', modifier: 1 },
      { name: 'Skill: Use Magic Device', bonus: 'Reaper', modifier: 1 },
      { name: 'Physical Resistance Rating', bonus: 'Reaper', modifier: 3 }
    ])
  })
})
