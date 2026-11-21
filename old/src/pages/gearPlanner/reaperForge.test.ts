import { describe, expect, it } from 'vitest'
import reaperForge from '../../data/reaperForge.json'
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

  it('expands Spell Power into the individual spell power types', () => {
    expect(getReaperForgeEnchantments('reaper-necklace-enchantment')).toEqual([
      { name: 'Melee Power', bonus: 'Reaper', modifier: 2 },
      { name: 'Ranged Power', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Acid', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Cold', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Electric', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Fire', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Force', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Piercing', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Slashing', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Bludgeoning', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Light', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Chaos', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Evil', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Good', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Lawful', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Negative Energy', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Poison', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Positive Energy', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Sonic', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Repair', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Rust', bonus: 'Reaper', modifier: 2 },
      { name: 'Spell Power: Universal', bonus: 'Reaper', modifier: 2 },
      { name: 'Physical Resistance Rating', bonus: 'Reaper', modifier: 2 },
      { name: 'Magical Resistance Rating', bonus: 'Reaper', modifier: 2 }
    ])
  })

  it('stores expanded grants directly in the data file', () => {
    const gloves = reaperForge.effects.find((effect) => effect.id === 'reaper-gloves-enchantment')
    const necklace = reaperForge.effects.find((effect) => effect.id === 'reaper-necklace-enchantment')
    const ring1 = reaperForge.effects.find((effect) => effect.id === 'reaper-ring-boost-1')

    expect(gloves?.grants.map((grant) => grant.stat)).toContain('Skill: Use Magic Device')
    expect(necklace?.grants.map((grant) => grant.stat)).toContain('Spell Power: Universal')
    expect(ring1?.grants.map((grant) => grant.stat)).toEqual([
      'Spell DC: Abjuration',
      'Spell DC: Breath Weapon',
      'Spell DC: Conjuration',
      'Spell DC: Divination',
      'Spell DC: Enchantment',
      'Spell DC: Evocation',
      'Spell DC: Illusion',
      'Spell DC: Necromancy',
      'Spell DC: Transmutation',
      'Tactical DC: Trip',
      'Tactical DC: Improved Trip',
      'Tactical DC: Sunder',
      'Tactical DC: Improved Sunder',
      'Tactical DC: Stunning',
      'Assassin Special Ability DC'
    ])
    expect(gloves?.grants).not.toContainEqual({ stat: 'All Skills', modifier: 1 })
    expect(necklace?.grants).not.toContainEqual({ stat: 'Spell Power', modifier: 2 })
    expect(ring1?.grants).not.toContainEqual({ stat: 'Spell DCs', modifier: 1 })
    expect(ring1?.grants).not.toContainEqual({ stat: 'Tactical DCs', modifier: 1 })
  })
})
