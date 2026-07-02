import { describe, expect, it } from 'vitest'
import { setBonuses } from '../../data/setBonuses'
import type { EssenceEnchantment } from './dataLoader'
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

const richTestItem = {
  id: 'item-rich',
  name: 'Rich Export Mainhand',
  slot: GearSlot.MainHand,
  pageTitle: 'Rich Export Mainhand',
  minLevel: '30',
  setBonus: [{ name: activeSetBonus.name, numPiecesEquipped: 2 }],
  enchantments: [
    { name: 'Visible Bonus', modifier: 2, bonus: 'Enhancement' },
    { name: 'Zhentarim Attuned', modifier: 1, bonus: 'Enhancement' },
    { name: 'Nearly Finished', modifier: 1, bonus: 'Enhancement' },
    { name: 'Sealed in Fire', modifier: 1, bonus: 'Enhancement' },
    { name: 'Lost Purpose', modifier: 1, bonus: 'Enhancement' },
    { name: 'Trace of Madness', modifier: 1, bonus: 'Enhancement' }
  ]
} as unknown as GearItem

const richFiligree = {
  id: 'filigree-1',
  name: 'Filigree One',
  pageTitle: 'Filigree One',
  type: 'Minor Artifact',
  description: '',
  minLevel: '20',
  absoluteMinLevel: undefined,
  restriction: '',
  material: '',
  hardness: '',
  durability: '',
  weight: '',
  dropLocations: null,
  update: '',
  details: '',
  upgradeable: '',
  upgradedFrom: '',
  icon: '',
  image: '',
  enchantments: [{ name: 'Filigree Bonus', modifier: 1, bonus: 'Artifact' }]
} as unknown as GearItem

const richEssenceEnchantments: EssenceEnchantment[] = [
  {
    id: 'essence-1',
    sourceType: 'test',
    effectId: 'effect-1',
    enchantmentName: 'Essence Power',
    bonusType: 'Enhancement',
    slotId: 'prefix',
    affixType: 'prefix',
    group: 'test',
    bonus: 'Enhancement',
    scalingStats: [1, 2, 3],
    enchantments: [{ name: 'Essence Power', bonus: 'Enhancement' }]
  }
]

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

const createRichSetup = (): GearSetup => ({
  ...createTestSetup(),
  slots: {
    [GearSlot.MainHand]: richTestItem
  } as unknown as Record<GearSlot, GearItem | null>,
  slottedFiligrees: {
    [richTestItem.id]: [richFiligree]
  },
  slottedGemSetBonuses: {
    [richTestItem.id]: ['Gem Set Alpha', null]
  },
  slottedEssenceEnchantments: {
    [richTestItem.id]: {
      prefix: 'essence-1'
    }
  },
  itemUpgrades: {
    [richTestItem.id]: {
      fountainOfNecroticMight: true,
      stormreaverUpgrade: true,
      zhentarimAttuned: true,
      nearlyFinished: { name: 'Nearly Finished Bonus' },
      almostThere: { name: '__active__' },
      finishingTouch: { name: '__active__' },
      ritualTable: { name: 'Ritual Bonus', bonus: 'Enhancement' },
      lostPurpose: { name: 'Lost Purpose Bonus', bonus: 'Enhancement' },
      traceOfMadness: { name: 'Trace Bonus', bonus: 'Enhancement' }
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

  it('renders upgrade, crafting, filigree, gem set, and hidden enchantment branches', () => {
    const setup = createRichSetup()
    const bbcode = generateBBCodeExport(setup, richEssenceEnchantments, setup.artificerPet, setup.druidPet)
    const markdown = generateDiscordMarkdownExport(setup, richEssenceEnchantments, setup.artificerPet, setup.druidPet)

    expect(bbcode).toContain('[indent][b][color=cyan]Fountain of Necrotic Might Upgrade[/color][/b][/indent]')
    expect(bbcode).toContain('[indent][b][color=orange]Almost There upgrade applied[/color][/b][/indent]')
    expect(bbcode).toContain('[indent][b][color=cyan]Essence Crafting:[/color][/b][/indent]')
    expect(bbcode).toContain('[indent][b][color=yellow]Filigrees:[/color][/b][/indent]')
    expect(bbcode).toContain('[indent][b][color=green]Gem Set Bonuses:[/color][/b] Gem Set Alpha[/indent]')
    expect(bbcode).toContain('prefix:')
    expect(bbcode).toContain('Essence Power +3 (Enhancement)')
    expect(bbcode).toContain('Filigree One')
    expect(bbcode).toContain('Filigree Bonus +1 (Artifact)')
    expect(bbcode).toContain('Visible Bonus')
    expect(bbcode).not.toContain('Zhentarim Attuned +1 (Enhancement)')
    expect(bbcode).not.toContain('Nearly Finished +1 (Enhancement)')
    expect(bbcode).not.toContain('Sealed in Fire +1 (Enhancement)')
    expect(bbcode).not.toContain('Lost Purpose +1 (Enhancement)')
    expect(bbcode).not.toContain('Trace of Madness +1 (Enhancement)')
    expect(bbcode).toContain('Active Set Bonuses')

    expect(markdown).toContain('- **Fountain of Necrotic Might Upgrade**')
    expect(markdown).toContain('- **Almost There upgrade applied**')
    expect(markdown).toContain('- **Essence Crafting:**')
    expect(markdown).toContain('- **Filigrees:**')
    expect(markdown).toContain('- **Gem Set Bonuses:** Gem Set Alpha')
    expect(markdown).toContain('prefix:')
    expect(markdown).toContain('Essence Power +3 (Enhancement)')
    expect(markdown).toContain('Filigree One')
    expect(markdown).toContain('Filigree Bonus +1 (Artifact)')
    expect(markdown).toContain('Visible Bonus')
    expect(markdown).not.toContain('Zhentarim Attuned +1 (Enhancement)')
    expect(markdown).not.toContain('Nearly Finished +1 (Enhancement)')
    expect(markdown).not.toContain('Sealed in Fire +1 (Enhancement)')
    expect(markdown).not.toContain('Lost Purpose +1 (Enhancement)')
    expect(markdown).not.toContain('Trace of Madness +1 (Enhancement)')
    expect(markdown).toContain('Active Set Bonuses')
  })

  it('adds the Discord length warning when the export exceeds 2000 characters', () => {
    const longItem = {
      ...testItem,
      id: 'item-long',
      name: `${'Long Item Name '.repeat(140)}X`
    }

    const longSetup: GearSetup = {
      ...createTestSetup(),
      slots: {
        [GearSlot.MainHand]: longItem
      } as unknown as Record<GearSlot, GearItem | null>
    }

    const markdown = generateDiscordMarkdownExport(longSetup, [])

    expect(markdown.length).toBeGreaterThan(2000)
    expect(markdown).toContain("exceeds Discord's 2000-character limit")
  })
})
