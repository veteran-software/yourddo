export interface LegendaryGreenSteelBonus {
  name: string
  description: string
  lowerFoci: string[]
  tier3Foci: string[]
}

export const legendaryGreenSteelBonus: LegendaryGreenSteelBonus[] = [
  {
    name: 'Legendary Affirmation',
    description:
      'Attacks and offensive spells have a small % chance to grant 1,000 temporary HP on attack. This has a one minute cooldown.',
    lowerFoci: ['Positive Energy', 'Positive Energy'],
    tier3Foci: ['Positive Energy', 'Positive Energy']
  },
  {
    name: 'Legendary Air Strike',
    description: 'Attacks and spells have a small % chance to deal massive electrical damage.',
    lowerFoci: ['Air', 'Air'],
    tier3Foci: ['Air', 'Air']
  },
  {
    name: 'Legendary Ash',
    description:
      'Attacks and offensive spells have a 50% chance to reduce enemy MRR and Universal Spell Power. This penalty stacks.',
    lowerFoci: ['Fire', 'Negative Energy'],
    tier3Foci: ['Fire', 'Negative Energy']
  },
  {
    name: 'Legendary Balance of Land & Sky',
    description: 'Attacks and offensive spells have a moderate chance to deal extra acid and/or electric damage.',
    lowerFoci: ['Fire', 'Water'],
    tier3Foci: ['Water', 'Fire']
  },
  {
    name: 'Legendary Concordant Opposition',
    description:
      '% chance to gain HP and SP when hit. Offensive spells have a % chance to briefly grant 100 temporary spell points (1 min cooldown)',
    lowerFoci: ['Negative Energy', 'Positive Energy'],
    tier3Foci: ['Positive Energy', 'Negative Energy']
  },
  {
    name: 'Legendary Dust',
    description:
      'Attacks and offensive spells have a 50% chance to reduce enemy PRR and Positive Healing Amplification. This penalty stacks.',
    lowerFoci: ['Earth', 'Negative Energy'],
    tier3Foci: ['Earth', 'Negative Energy']
  },
  {
    name: 'Legendary Earth',
    description: 'Attacks and offensive spells deal stacking Acid damage over time.',
    lowerFoci: ['Earth', 'Earth'],
    tier3Foci: ['Earth', 'Earth']
  },
  {
    name: 'Legendary Ice',
    description:
      'Attacks have a small % chance to turn your target into a block of ice. (Freezes target if it fails save and grants them DR 100/Adamantine, does not add helpless condition)',
    lowerFoci: ['Air', 'Water'],
    tier3Foci: ['Air', 'Water']
  },
  {
    name: 'Legendary Incineration',
    description: 'Attacks have a small % chance to deal massive Fire damage.',
    lowerFoci: ['Fire', 'Fire'],
    tier3Foci: ['Fire', 'Fire']
  },
  {
    name: 'Legendary Lightning',
    description:
      'Attacks and offensive spells have a % chance to create Lightning traps. ~160-360 damage, does NOT scale with spell power. Additional 12d6 lightning damage on hit.',
    lowerFoci: ['Air', 'Positive Energy'],
    tier3Foci: ['Air', 'Positive Energy']
  },
  {
    name: 'Legendary Magma',
    description:
      'Attacks and offensive spells deals fire damage over time on hit or spell cast, and slow enemy movement. 1/4 second cooldown.',
    lowerFoci: ['Earth', 'Fire'],
    tier3Foci: ['Fire', 'Earth']
  },
  {
    name: 'Legendary Mineral',
    description:
      'This weapon bypasses Adamantine, Byeshk, Cold Iron, Mithril, and Adamantine DR. This weapon is considerably strengthened, gaining +150 maximum Durability.',
    lowerFoci: ['Earth', 'Positive Energy'],
    tier3Foci: ['Earth', 'Positive Energy']
  },
  {
    name: 'Legendary Negation',
    description:
      'Attacks and offensive spells have a 100% chance to deal 1d3 Negative levels. This has a 30 second cooldown.',
    lowerFoci: ['Negative Energy', 'Negative Energy'],
    tier3Foci: ['Negative Energy', 'Negative Energy']
  },
  {
    name: 'Legendary Ooze',
    description:
      'Attacks and offensive spells reduce enemy PRR and MRR by 10 each. Attacks and offensive spells have a % chance to summon a random type of Legendary Ooze.',
    lowerFoci: ['Earth', 'Water'],
    tier3Foci: ['Water', 'Earth']
  },
  {
    name: 'Legendary Radiance',
    description:
      'Attacks and offensive spells have a % chance to blind enemies with Light damage. Scales with spell power.',
    lowerFoci: ['Fire', 'Positive Energy'],
    tier3Foci: ['Fire', 'Positive Energy']
  },
  {
    name: 'Legendary Salt',
    description:
      'Attacks and offensive spells have a % chance to greatly reduce enemy movement speed and attack speed. This inflicts 8 stacks, which fade overtime.',
    lowerFoci: ['Water', 'Negative Energy'],
    tier3Foci: ['Water', 'Negative Energy']
  },
  {
    name: 'Legendary Smoke',
    description: '27% Blurry (Enhancement)',
    lowerFoci: ['Air', 'Fire'],
    tier3Foci: ['Fire', 'Air']
  },
  {
    name: 'Legendary Steam',
    description: 'Attacks and offensive spells have a % chance to deal untyped damage.',
    lowerFoci: ['Water', 'Positive Energy'],
    tier3Foci: ['Water', 'Positive Energy']
  },
  {
    name: 'Legendary Tempered',
    description: 'Attacks and offensive spells have a moderate chance to deal extra acid and/or electric damage.',
    lowerFoci: ['Air', 'Earth'],
    tier3Foci: ['Earth', 'Air']
  },
  {
    name: 'Legendary Vacuum',
    description: 'Attacks and offensive spells have a % chance chance to inflict multiple stacks of Vulnerable.',
    lowerFoci: ['Air', 'Negative Energy'],
    tier3Foci: ['Air', 'Negative Energy']
  },
  {
    name: 'Legendary Water',
    description: 'Attacks and offensive spells have a % chance chance to inflict multiple stacks of Vulnerable.',
    lowerFoci: ['Water', 'Water'],
    tier3Foci: ['Water', 'Water']
  }
]
