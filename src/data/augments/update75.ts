import type { AugmentItem } from '../../types/augmentItem.ts'

export const update75Augments: AugmentItem[] = [
  // Legendary Augments
  {
    name: 'Melancholic Flames (ML:34)',
    description: 'Slotted Effect: Adds Adamantine material type. On hit: 16d6 Fire Damage',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Adamantine'
      },
      {
        name: 'On hit: 16d6 Fire damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Chill (ML:34)',
    description: 'Slotted Effect: Adds Cold Iron material type. On hit: 16d6 Cold Damage',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Cold Iron'
      },
      {
        name: 'On hit: 16d6 Cold damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Sparks (ML:34)',
    description: 'Slotted Effect: Adds Silver material type. On hit: 16d6 Electric Damage',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Silver'
      },
      {
        name: 'On hit: 16d6 Electric damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Acid (ML:34)',
    description: 'Slotted Effect: Adds Crystal and Byeshk material type. On hit: 16d6 Acid Damage',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Crystal'
      },
      {
        name: 'Material Type: Byeshk'
      },
      {
        name: 'On hit: 16d6 Acid damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Dimlight (ML:34)',
    description:
      'Slotted Effect: +9 Enhancement bonus to Spell Penetration. If this is slotted in a Quarterstaff, also grants a +2 Exceptional bonus to Spell DCs and makes the Quarterstaff an Implement.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Penetration',
        bonus: 'Enhancement',
        modifier: 9
      },
      {
        name: 'Spell DCs',
        bonus: 'Exceptional',
        modifier: 2,
        notes: 'Requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Shadows (ML:34)',
    description:
      'Slotted Effect: +10% Enhancement bonus to Spell Cost Reduction. If this is slotted in a Quarterstaff, also grants a +2 Exceptional bonus to Spell DCs and makes the Quarterstaff an Implement.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Cost Reduction',
        bonus: 'Enhancement',
        modifier: '10%'
      },
      {
        name: 'Spell DCs',
        bonus: 'Exceptional',
        modifier: 2,
        notes: 'Requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Arcana (ML:34)',
    description:
      'Slotted Effect: +111 Equipment bonus to all Spell Powers. If this is slotted in a Quarterstaff, also grants a +2 Exceptional bonus to Spell DCs and makes the Quarterstaff an Implement.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Power (all)',
        bonus: 'Equipment',
        modifier: 111
      },
      {
        name: 'Spell DCs',
        bonus: 'Exceptional',
        modifier: 2,
        notes: 'Requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Flames (ML:34)',
    description:
      'Adds Good alignment bypass. Your attacks and spells have a small chance to deal a large amount of Fire damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Chill (ML:34)',
    description:
      'Adds Chaotic alignment bypass. Your attacks and spells have a chance to inflict ten stacks of Cold damage over time.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Sparks (ML:34)',
    description:
      'Adds Lawful alignment bypass. Your attacks and spells have a small chance to deal a large amount of Electric damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Acid (ML:34)',
    description:
      'Adds Evil alignment bypass. Your attacks and spells have a small chance to deal a large amount of Acid damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Dimlight (ML:34)',
    description: 'Your attacks and offensive spells have a chance to deal Untyped damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Shadows (ML:34)',
    description:
      'Your attacks and offensive spells have a chance to apply a Curse that deals significant Untyped damage over time.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Arcana (ML:34)',
    description:
      'Slotted Effect: +5 Equipment bonus to all Spell DCs. If this is slotted into a Quarterstaff, also grants a +5% Exceptional bonus to Spell Spell Critical Chance and makes the Quarterstaff an Implement.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell DCs (all)',
        bonus: 'Equipment',
        modifier: 5
      },
      {
        name: 'Spell Critical Chance',
        bonus: 'Exceptional',
        modifier: '5%',
        notes: 'This effect requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Flames (ML:34)',
    description: 'Slotted Effect: +2 Exceptional bonus to Strength.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Exceptional',
        modifier: 2
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Chill (ML:34)',
    description: 'Slotted Effect: +2 Exceptional bonus to Wisdom.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Exceptional',
        modifier: 2
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Sparks (ML:34)',
    description: 'Slotted Effect: +2 Exceptional bonus to Charisma.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Exceptional',
        modifier: 2
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Acid (ML:34)',
    description: 'Slotted Effect: +2 Exceptional bonus to Constitution.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Exceptional',
        modifier: 2
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Dimlight (ML:34)',
    description: 'Slotted Effect: +2 Exceptional bonus to Intelligence.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Exceptional',
        modifier: 2
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Shadows (ML:34)',
    description: 'Slotted Effect: +2 Exceptional bonus to Dexterity.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Exceptional',
        modifier: 2
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful Flames (ML:34)',
    description:
      'Slotted Effect: Your attacks and offensive spells have a chance to reduce Magical Resistance Rating and universal Spell Power.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Adamantine'
      },
      {
        name: 'On hit: 16d6 Fire damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful Chill (ML:34)',
    description:
      'Slotted Effect: Your attacks and offensive spells have a chance to freeze your target in a block of ice.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Cold Iron'
      },
      {
        name: 'On hit: 16d6 Cold damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful Sparks (ML:34)',
    description:
      'Slotted Effect: Your attacks and offensive spells have a chance to inflict multiple stacks of Vulnerability.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Silver'
      },
      {
        name: 'On hit: 16d6 Electric damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful Acid (ML:34)',
    description:
      'Slotted Effect: Your attacks and offensive spells have a chance to reduce enemy Physical Resistance Rating and Positive Healing Amplification.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Crystal'
      },
      {
        name: 'Material Type: Byeshk'
      },
      {
        name: 'On hit: 16d6 Acid damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful Dimlight (ML:34)',
    description: 'Slotted Effect: Your attacks and offensive spells have a chance to grant you 1,000 Temporary HP.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Penetration',
        bonus: 'Enhancement',
        modifier: 9
      },
      {
        name: 'Spell DCs',
        bonus: 'Exceptional',
        modifier: 2,
        notes: 'Requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful Shadows (ML:34)',
    description:
      'Slotted Effect: Your attacks and offensive spells have a chance to reduce enemy Physical and Magical Resistance Rating.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Cost Reduction',
        bonus: 'Enhancement',
        modifier: '10%'
      },
      {
        name: 'Spell DCs',
        bonus: 'Exceptional',
        modifier: 2,
        notes: 'Requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Fire (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Fire Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fire Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Cold (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Cold Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Cold Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Electric (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Electric Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Electric Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Acid (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Acid Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Acid Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Light (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Light and Alignment Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Light and Alignment Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Negative (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Negative and Poison Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative and Poison Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Sonic (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Sonic Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sonic Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Force (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Force and Physical Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Force and Physical Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Positive (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Positive Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Repair (ML:34)',
    description: 'Slotted Effect: +159 Equipment bonus to Repair Spellpower.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Spellpower',
        bonus: 'Equipment',
        modifier: 159
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Strength (ML:34)',
    description: 'Slotted Effect: +15 Enhancement bonus to Strength.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 15
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Dexterity (ML:34)',
    description: 'Slotted Effect: +15 Enhancement bonus to Dexterity.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 15
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Constitution (ML:34)',
    description: 'Slotted Effect: +15 Enhancement bonus to Constitution.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 15
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Intelligence (ML:34)',
    description: 'Slotted Effect: +15 Enhancement bonus to Intelligence.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 15
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Wisdom (ML:34)',
    description: 'Slotted Effect: +15 Enhancement bonus to Wisdom.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 15
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Charisma (ML:34)',
    description: 'Slotted Effect: +15 Enhancement bonus to Charisma.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 15
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: False Life (ML:34)',
    description: 'Slotted Effect: +57 Enhancement bonus to Maximum HP.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Maximum Hit Points',
        bonus: 'Enhancement',
        modifier: 57
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Fire Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Fire Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fire Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Cold Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Cold Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Cold Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Electric Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Electric Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Electric Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Acid Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Acid Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Acid Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Light Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Light and Alignment Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Light and Alignment Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Negative Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Negative and Poison Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative and Poison Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Sonic Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Sonic Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sonic Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Force Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Force and Physical Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Force and Physical Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Positive Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Positive Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Repair Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Repair Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Healing Amplification (ML:34)',
    description: 'Slotted Effect: +61 Competence bonus to Positive Healing Amplification.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Healing Amplification',
        bonus: 'Competence',
        modifier: 61
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Repair Amplification (ML:34)',
    description: 'Slotted Effect: +61 Enhancement bonus to Repair Amplification.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Amplification',
        bonus: 'Enhancement',
        modifier: 61
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Negative Amplification (ML:34)',
    description: 'Slotted Effect: +61 Profane bonus to Negative Healing Amplification.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative Healing Amplification',
        bonus: 'Profane',
        modifier: 61
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Accuracy (ML:34)',
    description: 'Slotted Effect: +23 Competence bonus to Attack.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Competence',
        modifier: 23
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Damage (ML:34)',
    description: 'Slotted Effect: +12 Competence bonus to Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Damage',
        bonus: 'Competence',
        modifier: 12
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Deception (ML:34)',
    description:
      'Slotted Effect: +12 Enhancement bonus to Sneak Attacks, +18 Enhancement bonus to Sneak Attack Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sneak Attack',
        bonus: 'Enhancement',
        modifier: 12
      },
      {
        name: 'Sneak Attack Damage',
        bonus: 'Enhancement',
        modifier: 18
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Seeker (ML:34)',
    description: 'Slotted Effect: +15 Enhancement bonus to Critical Confirmation and Critical Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Critical Confirmation',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Critical Damage',
        bonus: 'Enhancement',
        modifier: 15
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Fire Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Fire Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fire Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Cold Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Cold Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Cold Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Electric Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Electric Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Electric Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Acid Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Acid Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Acid Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Light Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Light and Alignment Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Light and Alignment Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Negative Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Negative and Poison Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative and Poison Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Sonic Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Sonic Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sonic Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Force Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Force and Physical Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Force and Physical Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Positive Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Positive Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Repair Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +12% Insight bonus to Repair Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Spell Crit Damage',
        bonus: 'Insight',
        modifier: '12%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Physical Resistance Rating (ML:34)',
    description: 'Slotted Effect: +38 Enhancement bonus to Physical Resistance Rating.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Physical Resistance Rating',
        bonus: 'Enhancement',
        modifier: 38
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Magical Resistance Rating (ML:34)',
    description: 'Slotted Effect: +38 Enhancement bonus to Magical Resistance Rating.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Magical Resistance Rating',
        bonus: 'Enhancement',
        modifier: 38
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Spell Penetration (ML:34)',
    description: 'Slotted Effect: +10 Equipment bonus to Spell Penetration.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Penetration',
        bonus: 'Equipment',
        modifier: 10
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Stunning (ML:34)',
    description: 'Slotted Effect: +17 Enhancement bonus to Stunning DCs.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Stunning DC',
        bonus: 'Enhancement',
        modifier: 17
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Trip (ML:34)',
    description: 'Slotted Effect: +17 Enhancement bonus to Trip DCs.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Trip DC',
        bonus: 'Enhancement',
        modifier: 17
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Sunder (ML:34)',
    description: 'Slotted Effect: +17 Enhancement bonus to Sunder DCs.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sunder DC',
        bonus: 'Enhancement',
        modifier: 17
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Assassinate (ML:34)',
    description: 'Slotted Effect: +17 Enhancement bonus to Assassinate DCs.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Assassinate DC',
        bonus: 'Enhancement',
        modifier: 17
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Fire Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Fire Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fire Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Cold Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Cold Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Cold Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Electric Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Electric Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Electric Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Acid Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Acid Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Acid Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Light Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Light and Alignment Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Light and Alignment Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Negative Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Negative and Poison Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative and Poison Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Sonic Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Sonic Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sonic Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Force Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Force and Physical Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Force and Physical Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Positive Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Positive Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Repair Spell Crit Damage (ML:34)',
    description: 'Slotted Effect: +6% Quality bonus to Repair Spell Crit Damage.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Spell Crit Damage',
        bonus: 'Quality',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Resistance (ML:34)',
    description: 'Slotted Effect: +12 Resistance bonus to all Saving Throws.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Saving Throws (all)',
        bonus: 'Resistance',
        modifier: 12
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Enhanced Ghostly (ML:34)',
    description:
      'Slotted Effect: Enhanced Ghostly. Equipping this item causes you to become partially incorporeal. Your melee and missile attacks do not miss a chance for Incorporeal targets. Enemy attacks has a 15% chance to miss you due to your incorporeality. You receive a +5 Enhancement bonus to your Hide and Move Silently skills.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Enhanced Ghostly'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Relentless Fury (ML:34)',
    description:
      'Slotted Effect: Relentless Fury. While this item is equipped, any killing blows you strike against enemies may drive you into a furious rage, providing a 5% Enhancement damage bonus to your melee, ranged, and unarmed attacks for 30 seconds. Slaying weaker opponents has a reduced chance of producing this effect.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Relentless Fury'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Armor Piercing (ML:34)',
    description: 'Slotted Effect: +23% Enhancement bonus to Fortification Bypass.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fortification Bypass',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Wizardry (ML:34)',
    description: 'Slotted Effect: +310 Enhancement bonus to Maximum SP.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Maximum Spell Points',
        bonus: 'Enhancement',
        modifier: 310
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Profane DCs (ML:34)',
    description: 'Slotted Effect: You have a +2 Profane bonus to Spell DCs.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell DCs',
        bonus: 'Profane',
        modifier: 2
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Sacred DCs (ML:34)',
    description: 'Slotted Effect: You have a +2 Sacred bonus to Spell DCs.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell DCs',
        bonus: 'Sacred',
        modifier: 2
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Plating (ML:34)',
    description: 'Slotted Effect: +160% Enhancement bonus to Fortification.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Armor)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fortification',
        bonus: 'Enhancement',
        modifier: '160%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Converter (ML:34)',
    description:
      'Slotted Effect: +61 Competence bonus to Healing Amplification, +61 Enhancement bonus to Repair Amplification, and +61 Profane bonus to Negative Amplification.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Armor)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Healing Amplification',
        bonus: 'Competence',
        modifier: 61
      },
      {
        name: 'Repair Amplification',
        bonus: 'Enhancement',
        modifier: 61
      },
      {
        name: 'Negative Amplification',
        bonus: 'Profane',
        modifier: 61
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Device (ML:34)',
    description: 'Slotted Effect: You have Deathblock and are Ghostly.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Armor)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Deathblock'
      },
      {
        name: 'Ghostly'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Booster (ML:34)',
    description: 'Slotted Effect: +5% Exceptional bonus to Universal Spell Lore.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Armor)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Universal Spell Lore',
        bonus: 'Exceptional',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous Silencer (ML:34)',
    description: 'Slotted Effect: +2d6 Profane bonus to your Sneak Attack Dice.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Armor)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sneak Attack Dice',
        bonus: 'Profane',
        modifier: '2d6'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous Invigorator (ML:34)',
    description: 'Slotted Effect: +2 Profane bonus to Spell DCs, Tactical DCs, and Assassinate.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Armor)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell DCs',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Tactical DCs',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Assassinate',
        bonus: 'Profane',
        modifier: 2
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous Voidwheel (ML:34)',
    description: 'Slotted Effect: +15 Exceptional bonus to Universal Spell Power.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Armor)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Universal Spell Power',
        bonus: 'Exceptional',
        modifier: 15
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Improved Destruction (ML:34)',
    description:
      'Slotted Effect: Your attacks apply a stack of Armor Destruction. (-1 Penalty to Armor Class, -1% of its Fortification. 20 Second Duration. Stacks up to 15 times.) This effect may trigger once every three seconds.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Maiming (ML:34)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Humanoid Bane (ML:34)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Monstrous Humanoid Bane (ML:34)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Vermin Bane (ML:34)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Undead Bane (ML:34)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Armor-Piercing (ML:34)',
    description: 'Adds Armor-Piercing. +23% Enhancement bonus to Bypass Enemy Fortification.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Bypass Fortification',
        bonus: 'Enhancement',
        modifier: '23%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Doublestrike (ML:34)',
    description: 'Slotted Effect: +17% Enhancement bonus to Doublestrike.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Doublestrike',
        bonus: 'Enhancement',
        modifier: '17%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Doubleshot (ML:34)',
    description: 'Slotted Effect: +9% Enhancement bonus to Doubleshot.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Doubleshot',
        bonus: 'Enhancement',
        modifier: '9%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Strength (ML:34)',
    description: 'Slotted Effect: +3 Quality bonus to Strength.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Quality',
        modifier: 3
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Dexterity (ML:34)',
    description: 'Slotted Effect: +3 Quality bonus to Dexterity.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Quality',
        modifier: 3
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Constitution (ML:34)',
    description: 'Slotted Effect: +3 Quality bonus to Constitution.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Quality',
        modifier: 3
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Intelligence (ML:34)',
    description: 'Slotted Effect: +3 Quality bonus to Intelligence.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Quality',
        modifier: 3
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Wisdom (ML:34)',
    description: 'Slotted Effect: +3 Quality bonus to Wisdom.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Quality',
        modifier: 3
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Charisma (ML:34)',
    description: 'Slotted Effect: +3 Quality bonus to Charisma.',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Quality',
        modifier: 3
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Accuracy (ML:34)',
    description: 'Slotted Effect: ',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Damage (ML:34)',
    description: 'Slotted Effect: ',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Combat Mastery (ML:34)',
    description: 'Slotted Effect: ',
    minimumLevel: 34,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',

    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  // Heroic Augments
  {
    name: 'Melancholic Flames (ML:8)',
    description: 'Slotted Effect: Adds Adamantine material type. On hit: 1d6 Fire Damage',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Adamantine'
      },
      {
        name: 'On hit: 1d6 Fire damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Chill (ML:8)',
    description: 'Slotted Effect: Adds Cold Iron material type. On hit: 1d6 Cold Damage',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Cold Iron'
      },
      {
        name: 'On hit: 1d6 Cold damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Sparks (ML:8)',
    description: 'Slotted Effect: Adds Silver material type. On hit: 1d6 Electric Damage',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Silver'
      },
      {
        name: 'On hit: 1d6 Electric damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Acid (ML:8)',
    description: 'Slotted Effect: Adds Crystal and Byeshk material type. On hit: 1d6 Acid Damage',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Material Type: Crystal'
      },
      {
        name: 'Material Type: Byeshk'
      },
      {
        name: 'On hit: 1d6 Acid damage'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Dimlight (ML:8)',
    description:
      'Slotted Effect: +9 Enhancement bonus to Spell Penetration. If this is slotted in a Quarterstaff, also grants a +1 Exceptional bonus to Spell DCs and makes the Quarterstaff an Implement.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Penetration',
        bonus: 'Enhancement',
        modifier: 9
      },
      {
        name: 'Spell DCs',
        bonus: 'Exceptional',
        modifier: 1,
        notes: 'Requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Shadows (ML:8)',
    description:
      'Slotted Effect: +5% Enhancement bonus to Spell Cost Reduction. If this is slotted in a Quarterstaff, also grants a +1 Exceptional bonus to Spell DCs and makes the Quarterstaff an Implement.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Cost Reduction',
        bonus: 'Enhancement',
        modifier: '5%'
      },
      {
        name: 'Spell DCs',
        bonus: 'Exceptional',
        modifier: 1,
        notes: 'Requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Arcana (ML:8)',
    description:
      'Slotted Effect: +41 Equipment bonus to all Spell Powers. If this is slotted in a Quarterstaff, also grants a +1 Exceptional bonus to Spell DCs and makes the Quarterstaff an Implement.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Power (all)',
        bonus: 'Equipment',
        modifier: 41
      },
      {
        name: 'Spell DCs',
        bonus: 'Exceptional',
        modifier: 1,
        notes: 'Requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Flames (ML:8)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Chill (ML:8)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Sparks (ML:8)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Acid (ML:8)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dreadful Arcana (ML:8)',
    description:
      'Slotted Effect: +2 Equipment bonus to all Spell DCs. If this is slotted into a Quarterstaff, also grants a +2% Exceptional bonus to Spell Spell Critical Chance and makes the Quarterstaff an Implement.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell DCs (all)',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Spell Critical Chance',
        bonus: 'Exceptional',
        modifier: '2%',
        notes: 'This effect requires slotting in a Quarterstaff'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Flames (ML:8)',
    description: 'Slotted Effect: +1 Exceptional bonus to Strength.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Chill (ML:8)',
    description: 'Slotted Effect: +1 Exceptional bonus to Wisdom.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Sparks (ML:8)',
    description: 'Slotted Effect: +1 Exceptional bonus to Charisma.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Acid (ML:8)',
    description: 'Slotted Effect: +1 Exceptional bonus to Constitution.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Dimlight (ML:8)',
    description: 'Slotted Effect: +1 Exceptional bonus to Intelligence.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Shadows (ML:8)',
    description: 'Slotted Effect: +1 Exceptional bonus to Dexterity.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Fire (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Fire Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fire Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Cold (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Cold Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Cold Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Electric (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Electric Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Electric Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Acid (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Acid Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Acid Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Light (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Light and Alignment Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Light and Alignment Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Negative (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Negative and Poison Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative and Poison Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Sonic (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Sonic Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sonic Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Force (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Force and Physical Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Force and Physical Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Positive (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Positive Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Arcana: Repair (ML:8)',
    description: 'Slotted Effect: +70 Equipment bonus to Repair Spellpower.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Spellpower',
        bonus: 'Equipment',
        modifier: 70
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Strength (ML:8)',
    description: 'Slotted Effect: +5 Enhancement bonus to Strength.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Dexterity (ML:8)',
    description: 'Slotted Effect: +5 Enhancement bonus to Dexterity.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Constitution (ML:8)',
    description: 'Slotted Effect: +5 Enhancement bonus to Constitution.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Intelligence (ML:8)',
    description: 'Slotted Effect: +5 Enhancement bonus to Intelligence.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Wisdom (ML:8)',
    description: 'Slotted Effect: +5 Enhancement bonus to Wisdom.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Charisma (ML:8)',
    description: 'Slotted Effect: +5 Enhancement bonus to Charisma.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: False Life (ML:8)',
    description: 'Slotted Effect: +18 Enhancement bonus to Maximum HP.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Maximum Hit Points',
        bonus: 'Enhancement',
        modifier: 18
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Fire Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Fire Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fire Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Cold Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Cold Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Cold Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Electric Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Electric Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Electric Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Acid Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Acid Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Acid Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Light Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Light and Alignment Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Light and Alignment Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Negative Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Negative and Poison Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative and Poison Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Sonic Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Sonic Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sonic Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Force Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Force and Physical Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Force and Physical Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Positive Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Positive Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Repair Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +10% Enhancement bonus to Repair Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Spell Crit Damage',
        bonus: 'Enhancement',
        modifier: '10%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Healing Amplification (ML:8)',
    description: 'Slotted Effect: +19 Competence bonus to Positive Healing Amplification.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Healing Amplification',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Repair Amplification (ML:8)',
    description: 'Slotted Effect: +19 Enhancement bonus to Repair Amplification.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Amplification',
        bonus: 'Enhancement',
        modifier: 19
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Negative Amplification (ML:8)',
    description: 'Slotted Effect: +19 Profane bonus to Negative Healing Amplification.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative Healing Amplification',
        bonus: 'Profane',
        modifier: 19
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Accuracy (ML:8)',
    description: 'Slotted Effect: +8 Competence bonus to Attack.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Competence',
        modifier: 8
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Damage (ML:8)',
    description: 'Slotted Effect: +4 Competence bonus to Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Damage',
        bonus: 'Competence',
        modifier: 4
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Deception (ML:8)',
    description: 'Slotted Effect: +3 Enhancement bonus to Sneak Attacks, +5 Enhancement bonus to Sneak Attack Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sneak Attack',
        bonus: 'Enhancement',
        modifier: 3
      },
      {
        name: 'Sneak Attack Damage',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Seeker (ML:8)',
    description: 'Slotted Effect: +5 Enhancement bonus to Critical Confirmation and Critical Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Critical Confirmation',
        bonus: 'Enhancement',
        modifier: 5
      },
      {
        name: 'Critical Damage',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Fire Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Fire Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fire Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Cold Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Cold Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Cold Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Electric Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Electric Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Electric Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Acid Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Acid Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Acid Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Light Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Light and Alignment Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Light and Alignment Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Negative Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Negative and Poison Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative and Poison Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Sonic Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Sonic Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sonic Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Force Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Force and Physical Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Force and Physical Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Positive Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Positive Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Repair Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +5% Insight bonus to Repair Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Spell Crit Damage',
        bonus: 'Insight',
        modifier: '5%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Physical Resistance Rating (ML:8)',
    description: 'Slotted Effect: +12 Enhancement bonus to Physical Resistance Rating.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Physical Resistance Rating',
        bonus: 'Enhancement',
        modifier: 12
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Magical Resistance Rating (ML:8)',
    description: 'Slotted Effect: +12 Enhancement bonus to Magical Resistance Rating.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Magical Resistance Rating',
        bonus: 'Enhancement',
        modifier: 12
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Spell Penetration (ML:8)',
    description: 'Slotted Effect: +3 Equipment bonus to Spell Penetration.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell Penetration',
        bonus: 'Equipment',
        modifier: 3
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Stunning (ML:8)',
    description: 'Slotted Effect: +6 Enhancement bonus to Stunning DCs.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Stunning DC',
        bonus: 'Enhancement',
        modifier: 6
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Trip (ML:8)',
    description: 'Slotted Effect: +6 Enhancement bonus to Trip DCs.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Trip DC',
        bonus: 'Enhancement',
        modifier: 6
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Sunder (ML:8)',
    description: 'Slotted Effect: +6 Enhancement bonus to Sunder DCs.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sunder DC',
        bonus: 'Enhancement',
        modifier: 6
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Assassinate (ML:8)',
    description: 'Slotted Effect: +6 Enhancement bonus to Assassinate DCs.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Assassinate DC',
        bonus: 'Enhancement',
        modifier: 6
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Fire Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Fire Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fire Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Cold Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Cold Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Cold Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Electric Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Electric Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Electric Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Acid Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Acid Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Acid Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Light Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Light and Alignment Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Light and Alignment Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Negative Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Negative and Poison Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Negative and Poison Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Sonic Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Sonic Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sonic Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Force Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Force and Physical Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Force and Physical Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Positive Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Positive Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Positive Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable: Repair Spell Crit Damage (ML:8)',
    description: 'Slotted Effect: +2% Quality bonus to Repair Spell Crit Damage.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Repair Spell Crit Damage',
        bonus: 'Quality',
        modifier: '2%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Resistance (ML:8)',
    description: 'Slotted Effect: +4 Resistance bonus to all Saving Throws.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Saving Throws (all)',
        bonus: 'Resistance',
        modifier: 4
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Enhanced Ghostly (ML:8)',
    description:
      'Slotted Effect: Enhanced Ghostly. Equipping this item causes you to become partially incorporeal. Your melee and missile attacks do not miss a chance for Incorporeal targets. Enemy attacks has a 15% chance to miss you due to your incorporeality. You receive a +5 Enhancement bonus to your Hide and Move Silently skills.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Enhanced Ghostly'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Relentless Fury (ML:8)',
    description:
      'Slotted Effect: Relentless Fury. While this item is equipped, any killing blows you strike against enemies may drive you into a furious rage, providing a 5% Enhancement damage bonus to your melee, ranged, and unarmed attacks for 30 seconds. Slaying weaker opponents has a reduced chance of producing this effect.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Relentless Fury'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Armor Piercing (ML:8)',
    description: 'Slotted Effect: +8% Enhancement bonus to Fortification Bypass.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fortification Bypass',
        bonus: 'Enhancement',
        modifier: '8%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Wizardry (ML:8)',
    description: 'Slotted Effect: +96 Enhancement bonus to Maximum SP.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Maximum Spell Points',
        bonus: 'Enhancement',
        modifier: 96
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Profane DCs (ML:8)',
    description: 'Slotted Effect: You have a +1 Profane bonus to Spell DCs.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell DCs',
        bonus: 'Profane',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Woeful: Sacred DCs (ML:8)',
    description: 'Slotted Effect: You have a +1 Sacred bonus to Spell DCs.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Woeful (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell DCs',
        bonus: 'Sacred',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Plating (ML:8)',
    description: 'Slotted Effect: +70% Enhancement bonus to Fortification.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Armor)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Fortification',
        bonus: 'Enhancement',
        modifier: '70%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Converter (ML:8)',
    description:
      'Slotted Effect: +19 Competence bonus to Healing Amplification, +19 Enhancement bonus to Repair Amplification, and +19 Profane bonus to Negative Amplification.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Armor)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Healing Amplification',
        bonus: 'Competence',
        modifier: 19
      },
      {
        name: 'Repair Amplification',
        bonus: 'Enhancement',
        modifier: 19
      },
      {
        name: 'Negative Amplification',
        bonus: 'Profane',
        modifier: 19
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Device (ML:8)',
    description: 'Slotted Effect: You have Deathblock and are Ghostly.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Armor)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Deathblock'
      },
      {
        name: 'Ghostly'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic Booster (ML:8)',
    description: 'Slotted Effect: +3% Exceptional bonus to Universal Spell Lore.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Armor)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Universal Spell Lore',
        bonus: 'Exceptional',
        modifier: '3%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous Silencer (ML:8)',
    description: 'Slotted Effect: +1d6 Profane bonus to your Sneak Attack Dice.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Armor)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Sneak Attack Dice',
        bonus: 'Profane',
        modifier: '1d6'
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous Invigorator (ML:8)',
    description: 'Slotted Effect: +1 Profane bonus to Spell DCs, Tactical DCs, and Assassinate.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Armor)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Spell DCs',
        bonus: 'Profane',
        modifier: 1
      },
      {
        name: 'Tactical DCs',
        bonus: 'Profane',
        modifier: 1
      },
      {
        name: 'Assassinate',
        bonus: 'Profane',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous Voidwheel (ML:8)',
    description: 'Slotted Effect: +5 Exceptional bonus to Universal Spell Power.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Armor)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Universal Spell Power',
        bonus: 'Exceptional',
        modifier: 5
      }
    ],
    requirements: [
      {
        name: 'Bleak Transformer',
        quantity: 50
      },
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Destruction (ML:8)',
    description:
      'Slotted Effect: Your attacks apply a stack of Armor Destruction. (-1 Penalty to Armor Class, -1% of its Fortification. 20 Second Duration. Stacks up to 15 times.) This effect may trigger once every three seconds.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Maiming (ML:8)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Humanoid Bane (ML:8)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Monstrous Humanoid Bane (ML:8)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Vermin Bane (ML:8)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Undead Bane (ML:8)',
    description: '<string table error; tableDID [0x25000013] token [0x0A039775]>',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Miserable Armor-Piercing (ML:8)',
    description: 'Adds Armor-Piercing. +8% Enhancement bonus to Bypass Enemy Fortification.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Miserable (Weapon)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Bypass Fortification',
        bonus: 'Enhancement',
        modifier: '8%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Wire',
        quantity: 100
      },
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Doubleshot (ML:8)',
    description: 'Slotted Effect: +3% Enhancement bonus to Doubleshot.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Doubleshot',
        bonus: 'Enhancement',
        modifier: '3%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Melancholic: Doublestrike (ML:8)',
    description: 'Slotted Effect: +6% Enhancement bonus to Doublestrike.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Melancholic (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Doublestrike',
        bonus: 'Enhancement',
        modifier: '6%'
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 25
      },
      {
        name: 'Bleak Resistor',
        quantity: 25
      },
      {
        name: 'Bleak Insulator',
        quantity: 25
      },
      {
        name: 'Bleak Conductor',
        quantity: 25
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Strength (ML:8)',
    description: 'Slotted Effect: +1 Quality bonus to Strength.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Quality',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Dexterity (ML:8)',
    description: 'Slotted Effect: +1 Quality bonus to Dexterity.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Quality',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Constitution (ML:8)',
    description: 'Slotted Effect: +1 Quality bonus to Constitution.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Quality',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Intelligence (ML:8)',
    description: 'Slotted Effect: +1 Quality bonus to Intelligence.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Quality',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Wisdom (ML:8)',
    description: 'Slotted Effect: +1 Quality bonus to Wisdom.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Quality',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Charisma (ML:8)',
    description: 'Slotted Effect: +1 Quality bonus to Charisma.',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Quality',
        modifier: 1
      }
    ],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Accuracy (ML:8)',
    description: 'Slotted Effect: ',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Damage (ML:8)',
    description: 'Slotted Effect: ',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  {
    name: 'Dolorous: Quality Combat Mastery (ML:8)',
    description: 'Slotted Effect: ',
    minimumLevel: 8,
    type: 'Augment',
    augmentType: 'Lamordia: Dolorous (Accessory)',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    update: 75,
    craftedIn: 'Ludendorf Town Hall',
    effectsAdded: [],
    requirements: [
      {
        name: 'Bleak Alternator',
        quantity: 50
      },
      {
        name: 'Bleak Resistor',
        quantity: 50
      },
      {
        name: 'Bleak Insulator',
        quantity: 50
      },
      {
        name: 'Bleak Conductor',
        quantity: 50
      }
    ],
    baseValue: {
      platinum: 500
    },
    weight: 0.01
  },
  // Sun/Moon Augments
  {
    name: 'Lunar Gem of Abjuration (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Abjuration DCs',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Abjuration (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Abjuration DCs',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Lunar Gem of Balance and Tumble (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Tumble',
        bonus: 'Profane',
        modifier: 2
      }
    ]
  },
  {
    name: 'Lunar Gem of Balance and Tumble (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Tumble',
        bonus: 'Profane',
        modifier: 4
      }
    ]
  },
  {
    name: 'Lunar Gem of Blast Dice (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Eldritch Blast Dice',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Blast Dice (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Eldritch Blast Dice',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Lunar Gem of Conjuration (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Conjuration DCs',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Conjuration (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Conjuration DCs',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Lunar Gem of Disable Device and Open Lock (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Disable Device',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Open Lock',
        bonus: 'Profane',
        modifier: 2
      }
    ]
  },
  {
    name: 'Lunar Gem of Disable Device and Open Lock (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Disable Device',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Open Lock',
        bonus: 'Profane',
        modifier: 4
      }
    ]
  },
  {
    name: 'Lunar Gem of Divination (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Divination DCs',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Divination (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Divination DCs',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Lunar Gem of Enchantment (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Enchantment DCs',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Enchantment (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Enchantment DCs',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Lunar Gem of Evocation (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Evocation DCs',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Evocation (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Evocation DCs',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Lunar Gem of Haggle and Perform (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Haggle',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Perform',
        bonus: 'Profane',
        modifier: 2
      }
    ]
  },
  {
    name: 'Lunar Gem of Haggle and Perform (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Haggle',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Perform',
        bonus: 'Profane',
        modifier: 4
      }
    ]
  },
  {
    name: 'Lunar Gem of Heal and Listen (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Heal',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Listen',
        bonus: 'Profane',
        modifier: 2
      }
    ]
  },
  {
    name: 'Lunar Gem of Heal and Listen (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Heal',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Listen',
        bonus: 'Profane',
        modifier: 4
      }
    ]
  },
  {
    name: 'Lunar Gem of Hide and Move Silently (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Hide',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Move Silently',
        bonus: 'Profane',
        modifier: 2
      }
    ]
  },
  {
    name: 'Lunar Gem of Hide and Move Silently (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Hide',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Move Silently',
        bonus: 'Profane',
        modifier: 4
      }
    ]
  },
  {
    name: 'Lunar Gem of Illusion (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Illusion DCs',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Illusion (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Illusion DCs',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Lunar Gem of Jump and Swim (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Jump',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Swim',
        bonus: 'Profane',
        modifier: 2
      }
    ]
  },
  {
    name: 'Lunar Gem of Jump and Swim (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Jump',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Swim',
        bonus: 'Profane',
        modifier: 4
      }
    ]
  },
  {
    name: 'Lunar Gem of Linguistics (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Diplomacy',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Intimidate',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Bluff',
        bonus: 'Profane',
        modifier: 2
      }
    ]
  },
  {
    name: 'Lunar Gem of Linguistics (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Diplomacy',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Intimidate',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Bluff',
        bonus: 'Profane',
        modifier: 4
      }
    ]
  },
  {
    name: 'Lunar Gem of Necromancy (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Necromancy DCs',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Necromancy (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Necromancy DCs',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Lunar Gem of Pact Dice (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Pact Dice',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Pact Dice (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Pact Dice',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Lunar Gem of Repair and Use Magic Device (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Repair',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Use Magic Device',
        bonus: 'Profane',
        modifier: 2
      }
    ]
  },
  {
    name: 'Lunar Gem of Repair and Use Magic Device (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Repair',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Use Magic Device',
        bonus: 'Profane',
        modifier: 4
      }
    ]
  },
  {
    name: 'Lunar Gem of Search and Spot (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Search',
        bonus: 'Profane',
        modifier: 2
      },
      {
        name: 'Spot',
        bonus: 'Profane',
        modifier: 2
      }
    ]
  },
  {
    name: 'Lunar Gem of Search and Spot (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Search',
        bonus: 'Profane',
        modifier: 4
      },
      {
        name: 'Spot',
        bonus: 'Profane',
        modifier: 4
      }
    ]
  },
  {
    name: 'Lunar Gem of Transmutation (Heroic)',
    minimumLevel: 1,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Transmutation DCs',
        bonus: 'Profane',
        modifier: 1
      }
    ]
  },
  {
    name: 'Lunar Gem of Transmutation (Legendary)',
    minimumLevel: 30,
    augmentType: 'Moon',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Transmutation DCs',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Abjuration (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Abjuration DCs',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Abjuration (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Abjuration DCs',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Arcane Endurance (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Maximum Spell Points',
        bonus: 'Legendary',
        modifier: '3%'
      }
    ]
  },
  {
    name: 'Solar Gem of Arcane Endurance (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Maximum Spell Points',
        bonus: 'Legendary',
        modifier: '10%'
      }
    ]
  },
  {
    name: 'Solar Gem of Blast Dice (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Eldritch Blast Dice',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Blast Dice (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Eldritch Blast Dice',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Conjuration (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Conjuration DCs',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Conjuration (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Conjuration DCs',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Divination (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Divination DCs',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Divination (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Divination DCs',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Dodge Cap (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Dodge Cap',
        bonus: 'Legendary',
        modifier: '1%'
      }
    ]
  },
  {
    name: 'Solar Gem of Dodge Cap (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Dodge Cap',
        bonus: 'Legendary',
        modifier: '3%'
      }
    ]
  },
  {
    name: 'Solar Gem of Enchantment (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Enchantment DCs',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Enchantment (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Enchantment DCs',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Evocation (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Evocation DCs',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Evocation (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Evocation DCs',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Force Absorption (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Force Absorption',
        bonus: 'Artifact',
        modifier: '2%'
      }
    ]
  },
  {
    name: 'Solar Gem of Force Absorption (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Force Absorption',
        bonus: 'Artifact',
        modifier: '6%'
      }
    ]
  },
  {
    name: 'Solar Gem of Illusion (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Illusion DCs',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Illusion (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Illusion DCs',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Necromancy (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Necromancy DCs',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Necromancy (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Necromancy DCs',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Pact Dice (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Pact Dice',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Pact Dice (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Pact Dice',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  },
  {
    name: 'Solar Gem of Transmutation (Heroic)',
    minimumLevel: 1,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Transmutation DCs',
        bonus: 'Artifact',
        modifier: 1
      }
    ]
  },
  {
    name: 'Solar Gem of Transmutation (Legendary)',
    minimumLevel: 30,
    augmentType: 'Sun',
    image: 'augmentGreyBookBlueBorder',
    update: 75,
    foundIn: ['Chill of Ravenloft Expansion'],
    effectsAdded: [
      {
        name: 'Transmutation DCs',
        bonus: 'Artifact',
        modifier: 3
      }
    ]
  }
]
