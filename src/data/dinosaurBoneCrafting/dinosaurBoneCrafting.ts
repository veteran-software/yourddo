import type { Bonus, Enhancement } from '../../types/core.ts'
import type { CraftingIngredient, SetBonus } from '../../types/crafting.ts'
import { meleeWeapons, rangedWeapons, throwingWeapons } from '../basics/weapons.ts'
import {
  amplificationFangs,
  attributeScales,
  combatFangs,
  createAccessoryClaw,
  createAccessoryFang,
  createAccessoryHorn,
  createAccessoryScale,
  dcClaws,
  hornAccessories,
  resistanceClaws,
  specialAccessoryClaws,
  specialFangs,
  specialScales,
  spellCritClaws,
  spellCritFangs,
  spellCritScales
} from './factories/accessoryAugmentFactory.ts'
import { armorItems, createArmorFang, createArmorScale } from './factories/armorAugmentFactory.ts'
import { createSetBonus, setBonuses } from './factories/setBonusFactory.ts'
import { createBaseItem, createRequirements } from './factories/static.ts'
import { baseDinosaurBoneWeapon } from './factories/weaponBlankFactory.ts'
import { createClaw, createFang, createHorn, createIridiscentClaw, createScale } from './factories/weaponFactory.ts'

export const dinosaurBoneCrafting: CraftingIngredient[] = [
  // Scale items
  createScale('Flame', 'Adamantine', 'On hit: 15d6 Fire Damage'),
  createScale('Ice', 'Cold Iron', 'On hit: 15d6 Cold Damage'),
  createScale('Spark', 'Silver', 'On hit: 15d6 Electric Damage'),
  {
    ...createBaseItem('Meltscale', 'Isle of Dread: Scale (Weapon)'),
    effectsAdded: [
      { name: 'Material Type: Crystal' },
      { name: 'Material Type: Byeshk' },
      { name: 'On hit: 15d6 Acid Damage' }
    ],
    requirements: createRequirements(25)
  } as CraftingIngredient,
  {
    ...createBaseItem('Brightscale', 'Isle of Dread: Scale (Weapon)'),
    effectsAdded: [
      {
        name: 'Spell Penetration +9',
        modifier: 9,
        bonus: 'Enhancement'
      },
      {
        name: 'Spell DCs',
        modifier: 2,
        bonus: 'Exceptional',
        notes: 'Quarterstaff only, makes the Quarterstaff an Implement'
      }
    ],
    requirements: createRequirements(25)
  } as CraftingIngredient,
  {
    ...createBaseItem('Shadowscale', 'Isle of Dread: Scale (Weapon)'),
    effectsAdded: [
      {
        name: 'Spell Cost Reduction 10%',
        modifier: '10%',
        bonus: 'Enhancement'
      },
      {
        name: 'Spell DCs',
        modifier: 2,
        bonus: 'Exceptional',
        notes: 'Quarterstaff only, makes the Quarterstaff an Implement'
      }
    ],
    requirements: createRequirements(25)
  } as CraftingIngredient,
  {
    ...createBaseItem('Iridiscent Scale', 'Isle of Dread: Scale (Weapon)'),
    effectsAdded: [
      {
        name: 'All Spell Powers +102',
        modifier: 102,
        bonus: 'Equipment'
      },
      {
        name: 'Spell DCs',
        modifier: 2,
        bonus: 'Exceptional',
        notes: 'Quarterstaff only, makes the Quarterstaff an Implement'
      }
    ],
    requirements: createRequirements(25)
  } as CraftingIngredient,

  // Fang items
  createFang('Flame', 'Good', 'Flaming Blast (?)'),
  createFang('Ice', 'Chaotic', 'Icy Blast (?)'),
  createFang('Spark', 'Lawful', 'Shocking Blast (?)'),
  {
    ...createBaseItem('Meltfang', 'Isle of Dread: Fang (Weapon)'),
    effectsAdded: [
      { name: 'Alignment Bypass: Evil' },
      {
        name: 'Acid Damage over Time',
        notes: 'Attacks & Spells'
      }
    ],
    requirements: createRequirements(50)
  } as CraftingIngredient,
  {
    ...createBaseItem('Brightfang', 'Isle of Dread: Fang (Weapon)'),
    effectsAdded: [
      {
        name: 'Chance to deal Untyped Damage',
        notes: 'Attacks & Spells'
      }
    ],
    requirements: createRequirements(50)
  } as CraftingIngredient,
  {
    ...createBaseItem('Shadowfang', 'Isle of Dread: Fang (Weapon)'),
    effectsAdded: [
      {
        name: 'Chance to Curse (Untyped DoT)',
        notes: 'Attacks & Offensive Spells'
      }
    ],
    requirements: createRequirements(50)
  } as CraftingIngredient,
  {
    ...createBaseItem('Iridiscent Fang', 'Isle of Dread: Fang (Weapon)'),
    effectsAdded: [
      {
        name: 'Spell DCs',
        modifier: 5,
        bonus: 'Equipment'
      },
      {
        name: 'Spell Critical Chance +5%',
        modifier: '5%',
        bonus: 'Exceptional',
        notes: 'Quarterstaff only, makes the Quarterstaff an Implement'
      }
    ],
    requirements: createRequirements(50)
  } as CraftingIngredient,

  // Claw items
  createClaw('Flame', 'Strength'),
  createClaw('Ice', 'Wisdom'),
  createClaw('Spark', 'Charisma'),
  createClaw('Melt', 'Constitution'),
  createClaw('Bright', 'Intelligence'),
  createClaw('Shadow', 'Dexterity'),
  createIridiscentClaw('Fire'),
  createIridiscentClaw('Cold'),
  createIridiscentClaw('Electric'),
  createIridiscentClaw('Acid'),
  createIridiscentClaw('Light'),
  createIridiscentClaw('Negative'),
  createIridiscentClaw('Sonic'),
  createIridiscentClaw('Force'),
  createIridiscentClaw('Positive'),
  createIridiscentClaw('Repair'),

  // Horn items
  createHorn('Flame', [
    {
      name: 'Attack & Offensive Spell: Magical Resistance Rating Reduction',
      modifier: 'Chance'
    },
    {
      name: 'Attack & Offensive Spell: Universal Spell Power Reduction',
      modifier: 'Chance'
    }
  ]),
  createHorn('Ice', [
    {
      name: 'Attack & Offensive Spell: Freeze Target',
      modifier: 'Chance'
    }
  ]),
  createHorn('Spark', [
    {
      name: 'Attack & Offensive Spell: Inflict Vulnerability',
      modifier: 'Chance'
    }
  ]),
  createHorn('Melt', [
    {
      name: 'Attack & Offensive Spell: Physical Resistance Rating Reduction',
      modifier: 'Chance'
    },
    {
      name: 'Attack & Offensive Spell: Positive Healing Reduction',
      modifier: 'Chance'
    }
  ]),
  createHorn('Bright', [
    {
      name: 'Attack & Offensive Spell: Grant 1,000 Temporary Hit Points',
      modifier: 'Chance'
    }
  ]),
  createHorn('Shadow', [
    {
      name: 'Attack & Offensive Spell: Magical Resistance Rating Reduction',
      modifier: 'Chance'
    },
    {
      name: 'Attack & Offensive Spell: Physical Resistance Rating Reduction',
      modifier: 'Chance'
    }
  ])
]

// Accessory
dinosaurBoneCrafting.push(...[...attributeScales, ...spellCritScales, ...specialScales].map(createAccessoryScale))
dinosaurBoneCrafting.push(
  ...[...amplificationFangs, ...combatFangs, ...specialFangs, ...spellCritFangs].map((data) =>
    createAccessoryFang(String(data.name), data.effects as Enhancement[])
  )
)
dinosaurBoneCrafting.push(
  ...[...resistanceClaws, ...dcClaws, ...specialAccessoryClaws, ...spellCritClaws].map((data) =>
    createAccessoryClaw(String(data.name), data.effectName, data.modifier, data.bonus as Bonus | undefined)
  )
)
dinosaurBoneCrafting.push(
  ...hornAccessories.map((data) => createAccessoryHorn(data.name, data.effects as Enhancement[]))
)

// Armor
dinosaurBoneCrafting.push(
  ...armorItems
    .filter((item) => item.type === 'scale')
    .map((item) => createArmorScale(item.name, item.effects as Enhancement[])),
  ...armorItems
    .filter((item) => item.type === 'fang')
    .map((item) => createArmorFang(item.name, item.effects as Enhancement[]))
)
dinosaurBoneCrafting.push(...setBonuses.map((bonusData: SetBonus) => createSetBonus(bonusData)))
dinosaurBoneCrafting.push(...meleeWeapons.map((name: string) => baseDinosaurBoneWeapon(name, 'Melee')))
dinosaurBoneCrafting.push(...rangedWeapons.map((name: string) => baseDinosaurBoneWeapon(name, 'Ranged')))
dinosaurBoneCrafting.push(
  ...throwingWeapons.map((name: string) => baseDinosaurBoneWeapon(name, 'Throwing', { name: 'Returning' }))
)
