import { describe, expect, it } from 'vitest'
import { setBonuses } from '../../data/setBonuses'
import { generateBBCodeExport, generateDiscordMarkdownExport } from './exportHelpers'
import { initialPetState } from './initialState'
import { type GearItem, type GearSetup, GearSlot } from './types'

const activeSetBonus = setBonuses.find(
  (set: (typeof setBonuses)[number]) => (set.numPiecesEquipped ?? 99) <= 3 && (set.enhancements?.length ?? 0) > 0
)

if (!activeSetBonus) {
  throw new Error('Unable to find a suitable set bonus for export tests')
}

const testItem = {
  id: 'item-main',
  name: 'Test Mainhand',
  slot: GearSlot.MainHand,
  minLevel: '30',
  setBonus: [{ name: activeSetBonus.name, numPiecesEquipped: 2 }],
  enchantments: [{ name: 'Test Power', modifier: 3, bonus: 'Enhancement' }]
} as unknown as GearItem

const petItem = {
  id: 'pet-item',
  name: 'Pet Blade',
  slot: GearSlot.ArtificerPetWeapon,
  minLevel: '15',
  setBonus: [{ name: activeSetBonus.name, numPiecesEquipped: 2 }],
  enchantments: [{ name: 'Pet Power', modifier: 1, bonus: 'Enhancement' }]
} as unknown as GearItem

const druidPetItem = {
  id: 'pet-item-2',
  name: 'Pet Fang',
  slot: GearSlot.DruidPetWeapon,
  minLevel: '15',
  setBonus: [{ name: activeSetBonus.name, numPiecesEquipped: 2 }],
  enchantments: [{ name: 'Pet Power', modifier: 1, bonus: 'Enhancement' }]
} as unknown as GearItem

const createTestSetup = (): GearSetup => ({
  id: 'setup-1',
  name: 'Snapshot Test',
  minLevel: 1,
  maxLevel: 34,
  classes: ['Artificer', 'Druid'],
  weaponFilters: [],
  armorFilters: [],
  shieldFilters: [],
  allowMetalWithDruid: false,
  slots: {
    [GearSlot.MainHand]: testItem
  } as unknown as Record<GearSlot, GearItem | null>,
  slottedAugments: {},
  slottedCurses: {},
  slottedFiligrees: {},
  unlockedFiligreeSlots: {},
  slottedGemSetBonuses: {},
  slottedEssenceEnchantments: {},
  itemUpgrades: {},
  artificerPet: {
    ...initialPetState(),
    slots: {
      [GearSlot.ArtificerPetWeapon]: petItem
    }
  },
  druidPet: {
    ...initialPetState(),
    slots: {
      [GearSlot.DruidPetWeapon]: druidPetItem
    }
  }
})

describe('gear planner exports', () => {
  it('exports both character and pet gear from the shared snapshot', () => {
    const setup = createTestSetup()
    const bbcode = generateBBCodeExport(setup, [], setup.artificerPet, setup.druidPet, 'https://example.test')
    const markdown = generateDiscordMarkdownExport(
      setup,
      [],
      setup.artificerPet,
      setup.druidPet,
      'https://example.test'
    )

    expect(bbcode).toContain('Gear Setup: Snapshot Test')
    expect(bbcode).toContain('Test Mainhand')
    expect(bbcode).toContain('Iron Defender Gear')
    expect(bbcode).toContain('Pet Blade')
    expect(bbcode).toContain('Wolf Companion Gear')
    expect(bbcode).toContain('Pet Fang')
    expect(bbcode).toContain('Active Set Bonuses')

    expect(markdown).toContain('Gear Setup: Snapshot Test')
    expect(markdown).toContain('Test Mainhand')
    expect(markdown).toContain('Iron Defender Gear')
    expect(markdown).toContain('Pet Blade')
    expect(markdown).toContain('Wolf Companion Gear')
    expect(markdown).toContain('Pet Fang')
    expect(markdown).toContain('Active Set Bonuses')
  })
})
