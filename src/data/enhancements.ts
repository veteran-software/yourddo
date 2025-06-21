import type { Enhancement } from '../types/core.ts'

export const enhancements: Enhancement[] = [
  {
    name: '+5 Enhancement Bonus',
    description:
      'This item has been magically enhanced. Armor with this quality gains a +5 enhancement bonus to AC. Weapons with this quality gain a +5 enhancement bonus to attach and damage.',
    bonus: 'Enhancement'
  },
  {
    name: '+14 Enhancement Bonus',
    description:
      'Weapons and Shields: +14 Enhancement Bonus to Attack and Damage rolls. Armor and Shields: +14 enhancement bonus to Armor Class.',
    bonus: 'Enhancement'
  },
  {
    name: 'Acid',
    description:
      'This weapon is sheathed in corrosive acid. An acid weapon deals an extra 1 to 6 points of acid damage on a successful hit.'
  },
  {
    name: 'Acid Absorption - 10%',
    description:
      'This effect absorbs 10% of all acid damage you would have taken, after all other protections have been penetrated.'
  },
  {
    name: 'Acid Absorption - 15%',
    description:
      'This effect absorbs 15% of all acid damage you would have taken, after all other protections have been penetrated.'
  },
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
    name: 'Cold Absorption - 15%',
    description:
      'This effect absorbs 15% of all cold damage you would have taken, after all other protections have been penetrated.'
  },
  {
    name: 'Combustion +78',
    description: 'Passive: +78 Equipment Bonus to Fire Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Constitution +6',
    description: 'Passive: +6 Enhancement Bonus to Constitution.',
    bonus: 'Enhancement'
  },
  {
    name: 'Corrosion +66',
    description: 'Passive: +66 Equipment Bonus to Acid Spell Power.',
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
    name: 'Earth Affinity',
    description: 'This item has an affinity with Earth.'
  },
  {
    name: 'Electricity Absorption - 15%',
    description:
      'This effect absorbs 15% of all electricity damage you would have taken, after all other protections have been penetrated.'
  },
  {
    name: 'Ethereal Air Dominion',
    description:
      'This shard has been imbued with the energy of Ethereal Air Dominion.'
  },
  {
    name: 'Ethereal Air Escalation',
    description:
      'This shard has been imbued with the energy of Ethereal Air Escalation.'
  },
  {
    name: 'Ethereal Air Opposition',
    description:
      'This shard has been imbued with the energy of Ethereal Air Opposition.'
  },
  {
    name: 'Ethereal Earth Dominion',
    description:
      'This shard has been imbued with the energy of Ethereal Earth Dominion.'
  },
  {
    name: 'Ethereal Earth Escalation',
    description:
      'This shard has been imbued with the energy of Ethereal Earth Escalation.'
  },
  {
    name: 'Ethereal Earth Opposition',
    description:
      'This shard has been imbued with the energy of Ethereal Earth Opposition.'
  },
  {
    name: 'Ethereal Fire Dominion',
    description:
      'This shard has been imbued with the energy of Ethereal Fire Dominion.'
  },
  {
    name: 'Ethereal Fire Escalation',
    description:
      'This shard has been imbued with the energy of Ethereal Fire Escalation.'
  },
  {
    name: 'Ethereal Fire Opposition',
    description:
      'This shard has been imbued with the energy of Ethereal Fire Opposition.'
  },
  {
    name: 'Ethereal Negative Energy Dominion',
    description:
      'This shard has been imbued with the energy of Ethereal Negative Energy Dominion.'
  },
  {
    name: 'Ethereal Negative Energy Escalation',
    description:
      'This shard has been imbued with the energy of Ethereal Negative Energy Escalation.'
  },
  {
    name: 'Ethereal Negative Energy Opposition',
    description:
      'This shard has been imbued with the energy of Ethereal Negative Energy Opposition.'
  },
  {
    name: 'Ethereal Positive Energy Dominion',
    description:
      'This shard has been imbued with the energy of Ethereal Positive Energy Dominion.'
  },
  {
    name: 'Ethereal Positive Energy Escalation',
    description:
      'This shard has been imbued with the energy of Ethereal Positive Energy Escalation.'
  },
  {
    name: 'Ethereal Positive Energy Opposition',
    description:
      'This shard has been imbued with the energy of Ethereal Positive Energy Opposition.'
  },
  {
    name: 'Ethereal Water Dominion',
    description:
      'This shard has been imbued with the energy of Ethereal Water Dominion.'
  },
  {
    name: 'Ethereal Water Escalation',
    description:
      'This shard has been imbued with the energy of Ethereal Water Escalation.'
  },
  {
    name: 'Ethereal Water Opposition',
    description:
      'This shard has been imbued with the energy of Ethereal Water Opposition.'
  },
  {
    name: 'Fire Absorption - 15%',
    description:
      'This effect absorbs 15% of all fire damage you would have taken, after all other protections have been penetrated.'
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
    name: 'Glaciation +78',
    description: 'Passive: +78 Equipment Bonus to Cold Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Green Steel',
    description:
      'This planar alloy has a greasy green-colored sheen and is favored by the Baatezu, the devils of Shavarath. Green steel weapons leave terrible wounds, increasing the damage die typ-e of the weapon, and are treated as evil-aligned for the purpose of bypassing damage reduction.'
  },
  {
    name: 'Healing Amplification: +40',
    description: '+40 Equipment bonus to Healing Amplification',
    bonus: 'Equipment'
  },
  {
    name: 'Heightened Awareness 1',
    description:
      'This item helps you to quickly read situations with sharpness and clarity, allowing you to predict actions before they occur. You gain +1 insight bonus to AC.',
    bonus: 'Insight'
  },
  {
    name: 'Heightened Awareness 2',
    description:
      'This item helps you to quickly read situations with sharpness and clarity, allowing you to predict actions before they occur. You gain +2 insight bonus to AC.',
    bonus: 'Insight'
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
    name: 'Incredible Potential',
    description:
      "This ring's power has not been fully unleashed. When this ring is combined with 9 Shavarath War Trophies and an Imbued Shard of Great Power in an Alter of Subjugation, its full potential will be revealed."
  },
  {
    name: 'Insightful Charisma +2',
    description:
      'This item makes the wearer have more flair, granting a +2 Insight bonus to Charisma.',
    bonus: 'Insight'
  },
  {
    name: 'Insightful Constitution +2',
    description:
      'This item gives the wearer improved health, granting a +2 Insight bonus to Constitution.',
    bonus: 'Insight'
  },
  {
    name: 'Insightful Dexterity +2',
    description:
      'This item makes the wearer more nimble and dexterous, granting a +2 Insight bonus to Dexterity.',
    bonus: 'Insight'
  },
  {
    name: 'Insightful Intelligence +2',
    description:
      "This item focuses the power of the wearer's mind, granting a +2 Insight bonus to Intelligence.",
    bonus: 'Insight'
  },
  {
    name: 'Insightful Strength +2',
    description:
      'This item increases the physical power of the wearer, granting a +2 Insight bonus to Strength.',
    bonus: 'Insight'
  },
  {
    name: 'Insightful Wisdom +2',
    description:
      'This item makes the wearer more in tune with her surroundings, granting a +2 Insight bonus to Wisdom.',
    bonus: 'Insight'
  },
  {
    name: 'Legendary Green Steel',
    description:
      'This planar alloy has a greasy green-colored sheen and is favored by the Baatezu, the devils of Shavarath. Green steel weapons leave terrible wounds and are treated as evil-aligned for the purpose of bypassing damage reduction.'
  },
  {
    name: 'Legendary Taint of Shavarath',
    description:
      'Green Steel items thirst for pain and suffering. While weapons can sate their bloodlust on opponents, accessories and clothing cannot. Wearing multiple items that bear the Legendary Taint of Shavarath creates dangerous imbalances of energy as the items feed more and more upon the wielder. Perhaps there is a way to cleanse this item...',
    type: 'Prefix'
  },
  {
    name: 'Magnetism +78',
    description: 'Passive: +78 Equipment Bonus to Electric Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Material Air Dominion',
    description:
      'This shard has been imbued with the energy of Material Air Dominion.'
  },
  {
    name: 'Material Air Escalation',
    description:
      'This shard has been imbued with the energy of Material Air Escalation.'
  },
  {
    name: 'Material Air Opposition',
    description:
      'This shard has been imbued with the energy of Material Air Opposition.'
  },
  {
    name: 'Material Earth Dominion',
    description:
      'This shard has been imbued with the energy of Material Earth Dominion.'
  },
  {
    name: 'Material Earth Escalation',
    description:
      'This shard has been imbued with the energy of Material Earth Escalation.'
  },
  {
    name: 'Material Earth Opposition',
    description:
      'This shard has been imbued with the energy of Material Earth Opposition.'
  },
  {
    name: 'Material Fire Dominion',
    description:
      'This shard has been imbued with the energy of Material Fire Dominion.'
  },
  {
    name: 'Material Fire Escalation',
    description:
      'This shard has been imbued with the energy of Material Fire Escalation.'
  },
  {
    name: 'Material Fire Opposition',
    description:
      'This shard has been imbued with the energy of Material Fire Opposition.'
  },
  {
    name: 'Material Negative Energy Dominion',
    description:
      'This shard has been imbued with the energy of Material Negative Energy Dominion.'
  },
  {
    name: 'Material Negative Energy Escalation',
    description:
      'This shard has been imbued with the energy of Material Negative Energy Escalation.'
  },
  {
    name: 'Material Negative Energy Opposition',
    description:
      'This shard has been imbued with the energy of Material Negative Energy Opposition.'
  },
  {
    name: 'Material Positive Energy Dominion',
    description:
      'This shard has been imbued with the energy of Material Positive Energy Dominion.'
  },
  {
    name: 'Material Positive Energy Escalation',
    description:
      'This shard has been imbued with the energy of Material Positive Energy Escalation.'
  },
  {
    name: 'Material Positive Energy Opposition',
    description:
      'This shard has been imbued with the energy of Material Positive Energy Opposition.'
  },
  {
    name: 'Material Water Dominion',
    description:
      'This shard has been imbued with the energy of Material Water Dominion.'
  },
  {
    name: 'Material Water Escalation',
    description:
      'This shard has been imbued with the energy of Material Water Escalation.'
  },
  {
    name: 'Material Water Opposition',
    description:
      'This shard has been imbued with the energy of Material Water Opposition.'
  },
  {
    name: 'Negative Energy Absorption: +40',
    description:
      'This effect absorbs 15% of all fire damage you would have taken, after all other protections have been penetrated.'
  },
  {
    name: 'Nullification +78',
    description:
      'Passive: +78 Equipment Bonus to Negative Energy and Poison Spell Power.',
    bonus: 'Equipment'
  },
  {
    name: 'Shock',
    description:
      'This weapon is sheathed in crackling electricity. A shock weapon deals an extra 1 to 6 points of electricity damage on a successful hit.'
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
    name: 'Taint of Shavarath',
    description:
      'Green Steel items thirst for pain and suffering. While weapons can sate their bloodlust on opponents, accessories and clothing cannot. Wearing multiple items that bear the taint of Shavarath creates dangerous imbalances of energy as the items feed upon the wearer. Perhaps there is a way to cleanse this item...',
    type: 'Prefix'
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
    name: 'Wisdom +6',
    description: 'Passive: +6 Enhancement Bonus to Wisdom.',
    bonus: 'Enhancement'
  }
] as const
