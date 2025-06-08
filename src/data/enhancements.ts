import type { Enhancement } from '../types/core.ts'

export const enhancements: Enhancement[] = [
  {
    name: 'Acid Burst',
    description:
      'This weapon is sheathed in corrosive acid. The weapon deals an extra 1 to 6 acid damage each hit. In addition, critical hits deal an additional 1 to 10 acid damage for weapons with a x2 critical multiplier, 2 to 20 for a x3 critical multiplier and 3 to 30 for a x4 multiplier.',
    type: 'Prefix',
    basePriceModifier: {
      randomLoot: 1
    },
    minLevelIncrease: {
      noMinimumLevel: 3,
      minimumLevel: 1
    }
  },
  {
    name: 'Flaming Burst',
    description:
      'This weapon is sheathed in fire. The weapon deals an extra 1 to 6 fire damage each hit. In addition, critical hits deal an additional 1 to 10 fire damage for weapons with a x2 critical multiplier, 2 to 20 for a x3 critical multiplier and 3 to 30 for a x4 multiplier.',
    type: 'Prefix',
    basePriceModifier: {
      randomLoot: 1
    },
    minLevelIncrease: {
      noMinimumLevel: 3,
      minimumLevel: 1
    }
  },
  {
    name: 'Icy Burst',
    description:
      'This weapon is sheathed in icy cold. The weapon deals an extra 1 to 6 cold damage each hit. In addition, critical hits deal an additional 1 to 10 cold damage for weapons with a x2 critical multiplier, 2 to 20 for a x3 critical multiplier and 3 to 30 for a x4 multiplier.',
    type: 'Prefix',
    basePriceModifier: {
      randomLoot: 1
    },
    minLevelIncrease: {
      noMinimumLevel: 3,
      minimumLevel: 1
    }
  },
  {
    name: 'Shocking Burst',
    description:
      'This weapon is sheathed in crackling electricity. The weapon deals an extra 1 to 6 electric damage each hit. In addition, critical hits deal an additional 1 to 10 electric damage for weapons with a x2 critical multiplier, 2 to 20 for a x3 critical multiplier and 3 to 30 for a x4 multiplier.',
    type: 'Prefix',
    basePriceModifier: {
      randomLoot: 1
    },
    minLevelIncrease: {
      noMinimumLevel: 3,
      minimumLevel: 1
    }
  },
  {
    name: 'Axiomatic Burst',
    description:
      'An axiomatic weapon is lawfully aligned and infused with the power of law. It makes the weapon law-aligned and thus bypasses the corresponding damage reduction. It deals an extra 2 to 12 points of damage against all of chaotic alignment and an extra 3 to 18 on a critical hit for weapons with a x2 critical multiplier, 4 to 24 for a x3 multiplier and 5 to 30 for a x4 multiplier. Chaotic characters wielding this weapon suffer a negative level.',
    type: 'Prefix',
    basePriceModifier: {
      randomLoot: 3,
      cannithCrafting: 4
    }
  },
  {
    name: 'Anarchic Burst',
    description:
      'An anarchic weapon is chaotically aligned and infused with the power of chaos. It makes the weapon chaos-aligned and thus bypasses the corresponding damage reduction. It deals an extra 2 to 12 points of damage against all of lawful alignment and an extra 3 to 18 on a critical hit for weapons with a x2 critical multiplier, 4 to 24 for a x3 multiplier and 5 to 30 for a x4 multiplier. Lawful characters wielding this weapon suffer a negative level.',
    type: 'Prefix',
    basePriceModifier: {
      randomLoot: 3,
      cannithCrafting: 4
    }
  },
  {
    name: 'Holy Burst',
    description:
      'A holy weapon is imbued with holy power. This power makes the weapon good-aligned and thus bypasses the corresponding damage reduction. It deals an extra 2 to 12 points of damage against all of evil alignment and an extra 3 to 18 on a critical for weapons with a x2 critical multiplier, 4 to 24 for a x3 multiplier, and 5 to 30 for x4 multiplier.',
    type: 'Prefix',
    basePriceModifier: {
      randomLoot: 3,
      cannithCrafting: 4
    },
    minLevelIncrease: {
      noMinimumLevel: 7,
      minimumLevel: 1
    }
  },
  {
    name: 'Unholy Burst',
    description:
      'An unholy weapon is imbued with unholy power. This power makes the weapon evil-aligned and thus bypasses the corresponding damage reduction. It deals an extra 2 to 12 points of damage against all of good alignment and an extra 3 to 18 on a critical for weapons with a x2 critical multiplier, 4 to 24 for a x3 multiplier, and 5 to 30 for x4 multiplier.',
    type: 'Prefix',
    basePriceModifier: {
      randomLoot: 3,
      cannithCrafting: 4
    },
    minLevelIncrease: {
      noMinimumLevel: 7,
      minimumLevel: 1
    }
  },
  {
    name: 'Incredible Potential',
    description:
      "This ring's power has not been fully unleashed. When this ring is combined with 9 Shavarath War Trophies and an Imbued Shard of Great Power in an Alter of Subjugation, its full potential will be revealed."
  },
  {
    name: 'Insightful Constitution + 2',
    description:
      'This item gives the wearer improved health, granting a +2 insight bonus to Constitution.',
    bonus: 'Insight',
    ability: 'Constitution'
  },
  {
    name: 'Insightful Dexterity + 2',
    description:
      'This item makes the wearer more nimble and dexterous, granting a +2 insight bonus to Dexterity.',
    bonus: 'Insight',
    ability: 'Dexterity'
  },
  {
    name: 'Insightful Strength + 2',
    description:
      'This item gives the wearer the power of Ogre Strength, granting a +2 insight bonus to Strength.',
    bonus: 'Insight',
    ability: 'Strength'
  },
  {
    name: 'Acid Absorption - 15%',
    description:
      'This effect absorbs 15% of all acid damage you would have taken, after all other protections have been penetrated.'
  },
  {
    name: 'Cold Absorption - 15%',
    description:
      'This effect absorbs 15% of all cold damage you would have taken, after all other protections have been penetrated.'
  },
  {
    name: 'Electricity Absorption - 15%',
    description:
      'This effect absorbs 15% of all electricity damage you would have taken, after all other protections have been penetrated.'
  },
  {
    name: 'Fire Absorption - 15%',
    description:
      'This effect absorbs 15% of all fire damage you would have taken, after all other protections have been penetrated.'
  },
  {
    name: 'Negative Energy Absorption: +40',
    description:
      'This effect absorbs 15% of all fire damage you would have taken, after all other protections have been penetrated.'
  },
  {
    name: 'Healing Amplification: +40',
    description: '+40 Equipment bonus to Healing Amplification',
    bonus: 'Equipment'
  },
  {
    name: 'Insightful Strength +2',
    description:
      'This item increases the physical power of the wearer, granting a +2 Insight bonus to Strength.',
    bonus: 'Insight'
  },
  {
    name: 'Insightful Dexterity +2',
    description:
      'This item makes the wearer more nimble and dexterous, granting a +2 Insight bonus to Dexterity.',
    bonus: 'Insight'
  },
  {
    name: 'Insightful Constitution +2',
    description:
      'This item gives the wearer improved health, granting a +2 Insight bonus to Constitution.',
    bonus: 'Insight'
  },
  {
    name: 'Insightful Intelligence +2',
    description:
      "This item focuses the power of the wearer's mind, granting a +2 Insight bonus to Intelligence.",
    bonus: 'Insight'
  },
  {
    name: 'Insightful Wisdom +2',
    description:
      'This item makes the wearer more in tune with her surroundings, granting a +2 Insight bonus to Wisdom.',
    bonus: 'Insight'
  },
  {
    name: 'Insightful Charisma +2',
    description:
      'This item makes the wearer have more flair, granting a +2 Insight bonus to Charisma.',
    bonus: 'Insight'
  },
  {
    name: 'Combustion +78',
    description: 'Passive: +78 Equipment Bonus to Fire Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Glaciation +78',
    description: 'Passive: +78 Equipment Bonus to Cold Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Magnetism +78',
    description: 'Passive: +78 Equipment Bonus to Electric Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Corrosion +78',
    description: 'Passive: +78 Equipment Bonus to Acid Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Devotion +78',
    description: 'Passive: +78 Equipment Bonus to Positive Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Nullification +78',
    description:
      'Passive: +78 Equipment Bonus to Negative Energy and Poison Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Heightened Awareness 2',
    description:
      'This item helps you to quickly read situations with sharpness and clarity, allowing you to predict actions before they occur. You gain +2 insight bonus to AC.',
    bonus: 'Insight'
  }
] as const
