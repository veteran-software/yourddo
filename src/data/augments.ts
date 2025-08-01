import type { AugmentItem } from '../types/augmentItem'
import { update48Augments } from './augments/update48.ts'
import { update50Augments } from './augments/update50.ts'
import { update52Augments } from './augments/update52.ts'
import { update53Augments } from './augments/update53.ts'
import { update55Augments } from './augments/update55.ts'
import { update56Augments } from './augments/update56.ts'
import { update57Augments } from './augments/update57.ts'
import { update61Augments } from './augments/update61.ts'
import { update63Augments } from './augments/update63.ts'
import { update65Augments } from './augments/update65.ts'
import { update69Augments } from './augments/update69.ts'
import { update75Augments } from './augments/update75.ts'

export const augments: AugmentItem[] = [
  ...update48Augments,
  ...update50Augments,
  ...update52Augments,
  ...update53Augments,
  ...update55Augments,
  ...update56Augments,
  ...update57Augments,
  ...update61Augments,
  ...update63Augments,
  ...update65Augments,
  ...update69Augments,
  ...update75Augments,
  {
    name: 'Diamond of Balance +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Balance skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Competence',
        modifier: 5
      }
    ]
  },
  {
    name: 'Diamond of Balance +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Balance skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Competence',
        modifier: 10
      }
    ]
  },
  {
    name: 'Diamond of Balance +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Balance skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Competence',
        modifier: 13
      }
    ]
  },
  {
    name: 'Diamond of Balance +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Balance skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Competence',
        modifier: 15
      }
    ]
  },
  {
    name: 'Diamond of Balance +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Balance skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Competence',
        modifier: 17
      }
    ]
  },
  {
    name: 'Diamond of Balance +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Balance skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Competence',
        modifier: 18
      }
    ]
  },
  {
    name: 'Diamond of Balance +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Balance skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Competence',
        modifier: 19
      }
    ]
  },
  {
    name: 'Diamond of Balance +20',
    description:
      'Drag this augment into a slot to upgrade an item with a +20 Competence Bonus to the Balance skill. This augment can go in any color Augment Slot.',
    minimumLevel: 32,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Balance',
        bonus: 'Competence',
        modifier: 20
      }
    ]
  },
  {
    name: 'Diamond of Bluff +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Bluff skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Bluff',
        bonus: 'Competence',
        modifier: 10
      }
    ]
  },
  {
    name: 'Diamond of Bluff +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Bluff skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Bluff',
        bonus: 'Competence',
        modifier: 13
      }
    ]
  },
  {
    name: 'Diamond of Bluff +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Bluff skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Bluff',
        bonus: 'Competence',
        modifier: 15
      }
    ]
  },
  {
    name: 'Diamond of Bluff +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Bluff skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Bluff',
        bonus: 'Competence',
        modifier: 17
      }
    ]
  },
  {
    name: 'Diamond of Bluff +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Bluff skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Bluff',
        bonus: 'Competence',
        modifier: 18
      }
    ]
  },
  {
    name: 'Diamond of Bluff +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Bluff skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Bluff',
        bonus: 'Competence',
        modifier: 19
      }
    ]
  },
  {
    name: 'Diamond of Bluff +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Bluff skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Bluff',
        bonus: 'Competence',
        modifier: 5
      }
    ]
  },
  {
    name: 'Diamond of Bluff +20',
    description:
      'Drag this augment into a slot to upgrade an item with a +20 Competence Bonus to the Bluff skill. This augment can go in any color Augment Slot.',
    minimumLevel: 32,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Bluff',
        bonus: 'Competence',
        modifier: 20
      }
    ]
  },
  {
    name: 'Diamond of Charisma +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Enhancement Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 1,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 1
      }
    ]
  },
  {
    name: 'Diamond of Charisma +11',
    description:
      'Drag this augment into a slot to upgrade an item with a +11 Enhancement Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 11
      }
    ]
  },
  {
    name: 'Diamond of Charisma +12',
    description:
      'Drag this augment into a slot to upgrade an item with a +12 Enhancement Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 12
      }
    ]
  },
  {
    name: 'Diamond of Charisma +14',
    description:
      'Drag this augment into a slot to upgrade an item with a +14 Enhancement Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 32,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 14
      }
    ]
  },
  {
    name: 'Diamond of Charisma +3',
    description:
      'Drag this augment into a slot to upgrade an item with a +3 Enhancement Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 3
      }
    ]
  },
  {
    name: 'Diamond of Charisma +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Enhancement Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 5
      }
    ]
  },
  {
    name: 'Diamond of Charisma +6',
    description:
      'Drag this augment into a slot to upgrade an item with a +6 Enhancement Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 6
      }
    ]
  },
  {
    name: 'Diamond of Charisma +8',
    description:
      'Drag this augment into a slot to upgrade an item with a +8 Enhancement Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 8
      }
    ]
  },
  {
    name: 'Diamond of Charisma +9',
    description:
      'Drag this augment into a slot to upgrade an item with a +9 Enhancement Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Enhancement',
        modifier: 9
      }
    ]
  },
  {
    name: 'Diamond of Concentration +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Concentration skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Concentration',
        bonus: 'Competence',
        modifier: 5
      }
    ]
  },
  {
    name: 'Diamond of Concentration +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Concentration skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Concentration',
        bonus: 'Competence',
        modifier: 10
      }
    ]
  },
  {
    name: 'Diamond of Concentration +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Concentration skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Concentration',
        bonus: 'Competence',
        modifier: 13
      }
    ]
  },
  {
    name: 'Diamond of Concentration +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Concentration skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Concentration',
        bonus: 'Competence',
        modifier: 15
      }
    ]
  },
  {
    name: 'Diamond of Concentration +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Concentration skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Concentration',
        bonus: 'Competence',
        modifier: 17
      }
    ]
  },
  {
    name: 'Diamond of Concentration +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Concentration skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Concentration',
        bonus: 'Competence',
        modifier: 18
      }
    ]
  },
  {
    name: 'Diamond of Concentration +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Concentration skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Concentration',
        bonus: 'Competence',
        modifier: 19
      }
    ]
  },
  {
    name: 'Diamond of Concentration +20',
    description:
      'Drag this augment into a slot to upgrade an item with a +20 Competence Bonus to the Concentration skill. This augment can go in any color Augment Slot.',
    minimumLevel: 32,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Concentration',
        bonus: 'Competence',
        modifier: 20
      }
    ]
  },
  {
    name: 'Diamond of Constitution +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Enhancement Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 1,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 1
      }
    ]
  },
  {
    name: 'Diamond of Constitution +11',
    description:
      'Drag this augment into a slot to upgrade an item with a +11 Enhancement Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 11
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Constitution +12',
    description:
      'Drag this augment into a slot to upgrade an item with a +12 Enhancement Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 12
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Constitution +3',
    description:
      'Drag this augment into a slot to upgrade an item with a +3 Enhancement Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 3
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Constitution +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Enhancement Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Constitution +6',
    description:
      'Drag this augment into a slot to upgrade an item with a +6 Enhancement Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 6
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Constitution +8',
    description:
      'Drag this augment into a slot to upgrade an item with a +8 Enhancement Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 8
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Constitution +9',
    description:
      'Drag this augment into a slot to upgrade an item with a +9 Enhancement Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Enhancement',
        modifier: 9
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Dexterity +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Enhancement Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 1,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Dexterity +11',
    description:
      'Drag this augment into a slot to upgrade an item with a +11 Enhancement Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 11
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Dexterity +12',
    description:
      'Drag this augment into a slot to upgrade an item with a +12 Enhancement Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 12
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Dexterity +3',
    description:
      'Drag this augment into a slot to upgrade an item with a +3 Enhancement Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 3
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Dexterity +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Enhancement Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Dexterity +6',
    description:
      'Drag this augment into a slot to upgrade an item with a +6 Enhancement Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 6
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Dexterity +8',
    description:
      'Drag this augment into a slot to upgrade an item with a +8 Enhancement Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 8
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Dexterity +9',
    description:
      'Drag this augment into a slot to upgrade an item with a +9 Enhancement Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Enhancement',
        modifier: 9
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Diplomacy +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Diplomacy skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Diplomacy',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Diplomacy +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Diplomacy skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Diplomacy',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Diplomacy +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Diplomacy skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Diplomacy',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Diplomacy +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Diplomacy skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Diplomacy',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Diplomacy +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Diplomacy skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Diplomacy',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Diplomacy +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Diplomacy skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Diplomacy',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Diplomacy +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Diplomacy skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Diplomacy',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Disable Device +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Disable Device skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Disable Device',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Disable Device +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Disable Device skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Disable Device',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Disable Device +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Disable Device skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Disable Device',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Disable Device +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Disable Device skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Disable Device',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Disable Device +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Disable Device skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Disable Device',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Disable Device +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Disable Device skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Disable Device',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Disable Device +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Disable Device skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Disable Device',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Exceptional Charisma +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Exceptional Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Exceptional Constitution +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Exceptional Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Exceptional Dexterity +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Exceptional Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Exceptional Intelligence +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Exceptional Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Exceptional Strength +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Exceptional Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Exceptional Wisdom +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Exceptional Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Festive Charisma +2',
    description: 'Drag this augment into a slot to upgrade an item to provide a +2 Festive bonus to Charisma.',
    minimumLevel: 22,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Festive',
        modifier: 2
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Festive Dexterity +2',
    description: 'Drag this augment into a slot to upgrade an item to provide a +2 Festive bonus to Dexterity.',
    minimumLevel: 22,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Festive',
        modifier: 2
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Festive Intelligence +2',
    description: 'Drag this augment into a slot to upgrade an item to provide a +2 Festive bonus to Intelligence.',
    minimumLevel: 22,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Festive',
        modifier: 2
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Festive Wisdom +2',
    description: 'Drag this augment into a slot to upgrade an item to provide a +2 Festive bonus to Wisdom.',
    minimumLevel: 22,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Festive',
        modifier: 2
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Haggle +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Haggle skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Haggle',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Haggle +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Haggle skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Haggle',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Haggle +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Haggle skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Haggle',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Haggle +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Haggle skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Haggle',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Haggle +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Haggle skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Haggle',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Haggle +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Haggle skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Haggle',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Haggle +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Haggle skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Haggle',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Heal +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Heal skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Heal',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Heal +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Heal skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Heal',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Heal +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Heal skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Heal',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Heal +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Heal skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Heal',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Heal +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Heal skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Heal',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Heal +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Heal skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Heal',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Heal +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Heal skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Heal',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Hide +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Hide skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Hide',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Hide +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Hide skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Hide',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Hide +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Hide skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Hide',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Hide +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Hide skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Hide',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Hide +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Hide skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Hide',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Hide +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Hide skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Hide',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Hide +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Hide skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Hide',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Insightful Charisma +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Insight Bonus to Charisma. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Charisma',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Insightful Constitution +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Insight Bonus to Constitution. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Insightful Dexterity +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Insight Bonus to Dexterity. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Dexterity',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Insightful Intelligence +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Insight Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Insightful Strength +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Insight Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Insightful Wisdom +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Insight Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intelligence +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Enhancement Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 1,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intelligence +11',
    description:
      'Drag this augment into a slot to upgrade an item with a +11 Enhancement Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 11
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intelligence +12',
    description:
      'Drag this augment into a slot to upgrade an item with a +12 Enhancement Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 12
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intelligence +3',
    description:
      'Drag this augment into a slot to upgrade an item with a +3 Enhancement Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 3
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intelligence +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Enhancement Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intelligence +6',
    description:
      'Drag this augment into a slot to upgrade an item with a +6 Enhancement Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 6
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intelligence +8',
    description:
      'Drag this augment into a slot to upgrade an item with a +8 Enhancement Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 8
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intelligence +9',
    description:
      'Drag this augment into a slot to upgrade an item with a +9 Enhancement Bonus to Intelligence. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intelligence',
        bonus: 'Enhancement',
        modifier: 9
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intimidate +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Intimidate skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intimidate',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intimidate +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Intimidate skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intimidate',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intimidate +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Intimidate skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intimidate',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intimidate +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Intimidate skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intimidate',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intimidate +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Intimidate skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intimidate',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intimidate +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Intimidate skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intimidate',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Intimidate +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Intimidate skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Intimidate',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Jump +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Jump skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Jump',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Jump +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Jump skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Jump',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Jump +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Jump skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Jump',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Jump +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Jump skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Jump',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Jump +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Jump skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Jump',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Jump +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Jump skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Jump',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Jump +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Jump skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Jump',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Listen +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Listen skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Listen',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Listen +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Listen skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Listen',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Listen +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Listen skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Listen',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Listen +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Listen skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Listen',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Listen +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Listen skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Listen',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Listen +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Listen skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Listen',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Listen +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Listen skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Listen',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Move Silently +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Move Silently skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Move Silently',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Move Silently +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Move Silently skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Move Silently',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Move Silently +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Move Silently skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Move Silently',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Move Silently +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Move Silently skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Move Silently',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Move Silently +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Move Silently skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Move Silently',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Move Silently +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Move Silently skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Move Silently',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Move Silently +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Move Silently skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Move Silently',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Open Lock +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Open Lock skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Open Lock',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Open Lock +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Open Lock skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Open Lock',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Open Lock +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Open Lock skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Open Lock',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Open Lock +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Open Lock skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Open Lock',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Open Lock +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Open Lock skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Open Lock',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Open Lock +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Open Lock skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Open Lock',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Open Lock +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Open Lock skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Open Lock',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Perform +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Perform skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Perform',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Perform +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Perform skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Perform',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Perform +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Perform skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Perform',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Perform +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Perform skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Perform',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Perform +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Perform skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Perform',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Perform +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Perform skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Perform',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Perform +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Perform skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Perform',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Repair +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Repair skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Repair',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Repair +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Repair skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Repair',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Repair +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Repair skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Repair',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Repair +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Repair skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Repair',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Repair +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Repair skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Repair',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Repair +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Repair skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Repair',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Repair +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Repair skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Repair',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Search +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Search skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Search',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Search +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Search skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Search',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Search +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Search skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Search',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Search +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Search skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Search',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Search +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Search skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Search',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Search +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Search skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Search',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Search +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Search skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Search',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spellcraft +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Spellcraft skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spellcraft',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spellcraft +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Spellcraft skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spellcraft',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spellcraft +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Spellcraft skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spellcraft',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spellcraft +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Spellcraft skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spellcraft',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spellcraft +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Spellcraft skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spellcraft',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spellcraft +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Spellcraft skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spellcraft',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spellcraft +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Spellcraft skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spellcraft',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spot +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Spot skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spot',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spot +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Spot skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spot',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spot +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Spot skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spot',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spot +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Spot skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spot',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spot +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Spot skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spot',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spot +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Spot skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spot',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Spot +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Spot skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Spot',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Strength +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Enhancement Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 1,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Strength +11',
    description:
      'Drag this augment into a slot to upgrade an item with a +11 Enhancement Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 11
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Strength +12',
    description:
      'Drag this augment into a slot to upgrade an item with a +12 Enhancement Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 12
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Strength +3',
    description:
      'Drag this augment into a slot to upgrade an item with a +3 Enhancement Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Strength +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Enhancement Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Strength +6',
    description:
      'Drag this augment into a slot to upgrade an item with a +6 Enhancement Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 6
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Strength +8',
    description:
      'Drag this augment into a slot to upgrade an item with a +8 Enhancement Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 8
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Strength +9',
    description:
      'Drag this augment into a slot to upgrade an item with a +9 Enhancement Bonus to Strength. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Strength',
        bonus: 'Enhancement',
        modifier: 9
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Swim +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Swim skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Swim',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Swim +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Swim skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Swim',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Swim +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Swim skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Swim',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Swim +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Swim skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Swim',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Swim +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Swim skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Swim',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Swim +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Swim skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Swim',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Swim +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Swim skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Swim',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Tumble +10',
    description:
      'Drag this augment into a slot to upgrade an item with a +10 Competence Bonus to the Tumble skill. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Tumble',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Tumble +13',
    description:
      'Drag this augment into a slot to upgrade an item with a +13 Competence Bonus to the Tumble skill. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Tumble',
        bonus: 'Competence',
        modifier: 13
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Tumble +15',
    description:
      'Drag this augment into a slot to upgrade an item with a +15 Competence Bonus to the Tumble skill. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Tumble',
        bonus: 'Competence',
        modifier: 15
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Tumble +17',
    description:
      'Drag this augment into a slot to upgrade an item with a +17 Competence Bonus to the Tumble skill. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Tumble',
        bonus: 'Competence',
        modifier: 17
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Tumble +18',
    description:
      'Drag this augment into a slot to upgrade an item with a +18 Competence Bonus to the Tumble skill. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Tumble',
        bonus: 'Competence',
        modifier: 18
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Tumble +19',
    description:
      'Drag this augment into a slot to upgrade an item with a +19 Competence Bonus to the Tumble skill. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Tumble',
        bonus: 'Competence',
        modifier: 19
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Tumble +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Competence Bonus to the Tumble skill. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Tumble',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Vitality +20',
    description:
      'Drag this augment into a slot to upgrade an item with a +20 Vitality bonus to Hit Points. This augment can go in any color Augment Slot.',
    minimumLevel: 11,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Maximum Hit Points',
        bonus: 'Vitality',
        modifier: 20
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Wisdom +1',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Enhancement Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 1,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 1
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Wisdom +11',
    description:
      'Drag this augment into a slot to upgrade an item with a +11 Enhancement Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 24,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 11
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Wisdom +12',
    description:
      'Drag this augment into a slot to upgrade an item with a +12 Enhancement Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 28,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 12
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Wisdom +3',
    description:
      'Drag this augment into a slot to upgrade an item with a +3 Enhancement Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 4,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 3
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Wisdom +5',
    description:
      'Drag this augment into a slot to upgrade an item with a +5 Enhancement Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 8,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Wisdom +6',
    description:
      'Drag this augment into a slot to upgrade an item with a +6 Enhancement Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 12,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 6
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Wisdom +8',
    description:
      'Drag this augment into a slot to upgrade an item with a +8 Enhancement Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 16,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 8
      }
    ],
    foundIn: []
  },
  {
    name: 'Diamond of Wisdom +9',
    description:
      'Drag this augment into a slot to upgrade an item with a +9 Enhancement Bonus to Wisdom. This augment can go in any color Augment Slot.',
    minimumLevel: 20,
    image: 'colorlessAugmentGreenBorder',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Wisdom',
        bonus: 'Enhancement',
        modifier: 9
      }
    ],
    foundIn: []
  },
  {
    name: 'Draconic Soul Gem',
    description:
      'Drag this augment into a slot to upgrade an item with a +30 Enhancement bonus to Acid, Cold, Electric, and Fire Resistances. This augment can go in a Yellow, Green, or Orange Augment Slot. \\n \\n This gemstone pulses with the stolen lifeforce of several slain dragons.',
    minimumLevel: 25,
    image: 'draconicSoulGem.png',
    augmentType: 'Yellow',
    foundIn: ['The Fall of Truth'],
    effectsAdded: [
      {
        name: 'Elemental Resistance',
        bonus: 'Enhancement',
        modifier: 30
      }
    ]
  },
  {
    name: 'Globe of Imperial Blood',
    description:
      'Drag this augment into a slot to upgrade an item with a +3 Enhancement Bonus to Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma. This augment can go in any color Augment Slot. \\n \\n A fist-sized globule of blood, suspended in a crystalline sphere. It is thought that such globes were used by the giants to prove imperial descent, but the secret of the test is now forgotten.',
    minimumLevel: 14,
    image: 'globeOfImperialBloodLevel14.png',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Ability Scores (all)',
        bonus: 'Enhancement',
        modifier: 3
      }
    ],
    foundIn: ['Gianthold Tor']
  },
  {
    name: 'Globe of True Imperial Blood',
    description:
      'Drag this augment into a slot to upgrade an item with a +1 Exceptional Bonus to Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma. This augment can go in any color Augment Slot. \\n \\n A fist-sized globule of blood, suspended in a crystalline sphere. It is thought that such globes were used by the giants to prove imperial descent, but the secret of the test is now forgotten.',
    minimumLevel: 25,
    image: 'globeOfTrueImperialBlood.png',
    augmentType: 'Colorless',
    effectsAdded: [
      {
        name: 'Ability Scores (all)',
        bonus: 'Exceptional',
        modifier: 1
      }
    ],
    foundIn: ['Return to Gianthold Tor']
  },
  {
    name: "Golem's Heart",
    description:
      'Drag this augment into a slot to upgrade an item to allow a 2% chance on your being hit to heal you for 20 to 120 Hit Points and deal 50 to 300 Electric damage to your surrounding enemies. (Equipping more than one of this Augment provides a separate 2% chance). This effect may only proc once every 30 seconds, regardless of how many you have equipped.  This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'golemsHeart.png',
    augmentType: 'Blue',
    effectsAdded: [
      {
        name: '2% Chance On-Hit : 20-120 HP Heal, 50-300 Electric Damage',
        bonus: 'On-hit'
      }
    ],
    foundIn: ['A Study in Sable']
  },
  {
    name: 'Meridian Fragment',
    description:
      'Drag this augment into a slot to upgrade an item to provide a -6 SP Cost to Maximized Spells. Additionally, once every three seconds when you take physical damage, you get +8 Psionic Bonus to Universal Spell Power. This can stack up to three times and each stack lasts for 20 seconds. This augment can only go in an Orange Augment Slot. \\n \\n This stone glows with strong magical energies.',
    minimumLevel: 28,
    image: 'meridianFragment.png',
    augmentType: 'Orange',
    effectsAdded: [
      {
        name: 'Maximized Spells: -6 SP Cost'
      },
      {
        name: 'Psionic Bonus to Universal Spell Power',
        bonus: 'On-damage : 3 sec',
        modifier: 8
      }
    ],
    foundIn: []
  },
  {
    name: 'Meteoric Star Ruby',
    description:
      'Drag this augment into a slot to upgrade a weapon with a 2% Chance On Hit to cause a falling star to strike your target, dealing 3 to 18 Fire Damage and 1 to 6 Bludgeoning Damage per Minimum Level of the weapon to all nearby enemies, with a chance to also knock them prone. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'meteoricStarRuby.png',
    augmentType: 'Red',
    effectsAdded: [
      {
        name: '2% Chance On-Hit : Falling Star Strike',
        bonus: 'On-hit'
      }
    ],
    foundIn: ['The Haunted Halls of Eveningstar']
  },
  {
    name: 'Ruby Eye of Erosion',
    description:
      'Drag this augment into a slot to upgrade a weapon with a 2% Chance On Hit to cause a blast of acid to corrode your target, dealing 3 to 18 damage per Minimum Level of the weapon to all nearby enemies. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyEyeOfErosion.png',
    foundIn: []
  },
  {
    name: 'Ruby Eye of Force',
    description:
      'Drag this augment into a slot to upgrade a weapon with a 2% Chance On Hit to cause a burst of magical force to strike your target, dealing 3 to 12 damage per Minimum Level of the weapon to all nearby enemies. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyEyeOfForce.png',
    foundIn: []
  },
  {
    name: 'Ruby Eye of Righteousness',
    description:
      'Drag this augment into a slot to upgrade a weapon with a 2% Chance On Hit to cause a blast of holy energy to smite your target, dealing 3 to 12 damage per Minimum Level of the weapon to all nearby enemies. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyEyeOfRighteousness.png',
    foundIn: []
  },
  {
    name: 'Ruby Eye of the Glacier',
    description:
      'Drag this augment into a slot to upgrade a weapon with a 2% Chance On Hit to cause a burst of glacial frost to chill your target, dealing 7 to 14 damage per Minimum Level of the weapon to all nearby enemies. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyEyeOfTheGlacier.png',
    foundIn: []
  },
  {
    name: 'Ruby Eye of the Inferno',
    description:
      'Drag this augment into a slot to upgrade a weapon with a 2% Chance On Hit to cause a blast of flame to scorch your target, dealing 4 to 16 damage per Minimum Level of the weapon to all nearby enemies. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyEyeOfTheInferno.png',
    foundIn: []
  },
  {
    name: 'Ruby Eye of the Tempest',
    description:
      'Drag this augment into a slot to upgrade a weapon with a 2% Chance On Hit to cause a bolt of lightning to strike your target, dealing 1 to 20 damage per Minimum Level of the weapon to all nearby enemies. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyEyeOfTheTempest.png',
    foundIn: []
  },
  {
    name: 'Ruby of Acid (1d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 1d6 Acid damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfAcid1d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Acid (2d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 2d6 Acid damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfAcid2d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Acid (3d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 3d6 Acid damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfAcid3d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Acid (4d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 4d6 Acid damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfAcid4d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Acid (5d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 5d6 Acid damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfAcid5d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Acid (6d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 6d6 Acid damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfAcid6d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Acid (7d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 7d6 Acid damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfAcid7d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Acid (8d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 8d6 Acid damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfAcid8d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Adamantine Arms',
    description:
      'Drag this augment into a slot to upgrade a weapon to have Adamantine as an additional damage type. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfAdamantineArms.png',
    foundIn: []
  },
  {
    name: 'Ruby of Chaos',
    description:
      'Drag this augment into a slot to upgrade a weapon to have Chaotic as an additional damage type. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfChaos.png',
    foundIn: []
  },
  {
    name: 'Ruby of Combustion 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Fire Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfCombustion111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Combustion 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Fire Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfCombustion125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Combustion 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Fire Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfCombustion139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Combustion 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Fire Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfCombustion38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Combustion 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Fire Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfCombustion55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Combustion 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Fire Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfCombustion70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Combustion 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Fire Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfCombustion84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Combustion 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Fire Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfCombustion97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Corrosion 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Acid Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfCorrosion111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Corrosion 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Acid Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfCorrosion125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Corrosion 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Acid Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfCorrosion139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Corrosion 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Acid Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfCorrosion38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Corrosion 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Acid Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfCorrosion55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Corrosion 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Acid Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfCorrosion70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Corrosion 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Acid Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfCorrosion84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Corrosion 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Acid Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfCorrosion97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Devotion 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Positive Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfDevotion111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Devotion 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Positive Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfDevotion125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Devotion 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Positive Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfDevotion139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Devotion 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Positive Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfDevotion38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Devotion 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Positive Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfDevotion55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Devotion 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Positive Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfDevotion70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Devotion 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Positive Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfDevotion84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Devotion 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Positive Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfDevotion97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Evil',
    description:
      'Drag this augment into a slot to upgrade a weapon to have Evil as an additional damage type. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfEvil.png',
    foundIn: []
  },
  {
    name: 'Ruby of Flame (1d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 1d6 Fire damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfFlame1d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Flame (2d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 2d6 Fire damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfFlame2d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Flame (3d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 3d6 Fire damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfFlame3d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Flame (4d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 4d6 Fire damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfFlame4d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Flame (5d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 5d6 Fire damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfFlame5d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Flame (6d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 6d6 Fire damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfFlame6d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Flame (7d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 7d6 Fire damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfFlame7d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Flame (8d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 8d6 Fire damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfFlame8d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Frost (1d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 1d6 Cold damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfFrost1d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Frost (2d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 2d6 Cold damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfFrost2d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Frost (3d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 3d6 Cold damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfFrost3d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Frost (4d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 4d6 Cold damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfFrost4d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Frost (5d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 5d6 Cold damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfFrost5d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Frost (6d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 6d6 Cold damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfFrost6d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Frost (7d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 7d6 Cold damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfFrost7d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Frost (8d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 8d6 Cold damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfFrost8d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Ghostbane',
    description:
      'Drag this augment into a slot to upgrade a weapon with Ghost Touch and an additional 1 to 6 Bane damage on hit vs Undead. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfGhostbane.png',
    foundIn: []
  },
  {
    name: 'Ruby of Glaciation 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Cold Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfGlaciation111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Glaciation 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Cold Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfGlaciation125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Glaciation 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Cold Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfGlaciation139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Glaciation 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Cold Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfGlaciation38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Glaciation 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Cold Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfGlaciation55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Glaciation 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Cold Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfGlaciation70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Glaciation 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Cold Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfGlaciation84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Glaciation 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Cold Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfGlaciation97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Good',
    description:
      'Drag this augment into a slot to upgrade a weapon to have Good as an additional damage type. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfGood.png',
    foundIn: []
  },
  {
    name: 'Ruby of Impulse 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Force Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfImpulse111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Impulse 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Force Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfImpulse125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Impulse 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Force Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfImpulse139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Impulse 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Force Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfImpulse38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Impulse 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Force Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfImpulse55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Impulse 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Force Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfImpulse70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Impulse 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Force Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfImpulse84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Impulse 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Force Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfImpulse97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Iron Blows',
    description:
      'Drag this augment into a slot to upgrade a weapon to have Cold Iron as an additional damage type. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfIronBlows.png',
    foundIn: []
  },
  {
    name: 'Ruby of Magnetism 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Electric Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfMagnetism111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Magnetism 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Electric Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfMagnetism125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Magnetism 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Electric Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfMagnetism139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Magnetism 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Electric Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfMagnetism38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Magnetism 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Electric Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfMagnetism55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Magnetism 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Electric Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfMagnetism70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Magnetism 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Electric Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfMagnetism84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Magnetism 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Electric Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfMagnetism97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Nullification 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Negative Energy Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfNullification111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Nullification 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Negative Energy Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfNullification125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Nullification 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Negative Energy Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfNullification139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Nullification 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Negative Energy and Poison Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfNullification38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Nullification 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Negative Energy Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfNullification55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Nullification 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Negative Energy Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfNullification70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Nullification 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Negative Energy Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfNullification84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Nullification 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Negative Energy Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfNullification97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Order',
    description:
      'Drag this augment into a slot to upgrade a weapon to have Lawful as an additional damage type. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfOrder.png',
    foundIn: []
  },
  {
    name: 'Ruby of Radiance 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Light and Alignment Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfRadiance111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Radiance 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Light and Alignment Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfRadiance125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Radiance 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Light and Alignment Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfRadiance139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Radiance 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Light and Alignment Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfRadiance38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Radiance 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Light and Alignment Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfRadiance55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Radiance 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Light and Alignment Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfRadiance70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Radiance 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Light and Alignment Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfRadiance84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Radiance 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Light and Alignment Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfRadiance97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Reconstruction 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Repair and Rust Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfReconstruction111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Reconstruction 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Repair and Rust Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfReconstruction125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Reconstruction 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Repair and Rust Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfReconstruction139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Reconstruction 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Repair and Rust Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfReconstruction38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Reconstruction 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Repair and Rust Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfReconstruction55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Reconstruction 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Repair and Rust Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfReconstruction70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Reconstruction 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Repair and Rust Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfReconstruction84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Reconstruction 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Repair and Rust Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfReconstruction97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Resonance 111',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +111 Equipment bonus to Sonic Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfResonance111.png',
    foundIn: []
  },
  {
    name: 'Ruby of Resonance 125',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +125 Equipment bonus to Sonic Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfResonance125.png',
    foundIn: []
  },
  {
    name: 'Ruby of Resonance 139',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +139 Equipment bonus to Sonic Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfResonance139.png',
    foundIn: []
  },
  {
    name: 'Ruby of Resonance 38',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +38 Equipment bonus to Sonic Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfResonance38.png',
    foundIn: []
  },
  {
    name: 'Ruby of Resonance 55',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +55 Equipment bonus to Sonic Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfResonance55.png',
    foundIn: []
  },
  {
    name: 'Ruby of Resonance 70',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +70 Equipment bonus to Sonic Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfResonance70.png',
    foundIn: []
  },
  {
    name: 'Ruby of Resonance 84',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +84 Equipment bonus to Sonic Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfResonance84.png',
    foundIn: []
  },
  {
    name: 'Ruby of Resonance 97',
    description:
      'Drag this augment into a slot to upgrade a weapon with a +97 Equipment bonus to Sonic Spell Power. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfResonance97.png',
    foundIn: []
  },
  {
    name: 'Ruby of Shock (1d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 1d6 Electric damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfShock1d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Shock (2d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 2d6 Electric damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'rubyOfShock2d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Shock (3d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 3d6 Electric damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfShock3d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Shock (4d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 4d6 Electric damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'rubyOfShock4d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Shock (5d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 5d6 Electric damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfShock5d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Shock (6d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 6d6 Electric damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfShock6d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Shock (7d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 7d6 Electric damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'rubyOfShock7d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Shock (8d6)',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 8d6 Electric damage on hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'rubyOfShock8d6.png',
    foundIn: []
  },
  {
    name: 'Ruby of Silvered Strikes',
    description:
      'Drag this augment into a slot to upgrade a weapon to have Alchemical Silver as an additional damage type. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'rubyOfSilveredStrikes.png',
    foundIn: []
  },
  {
    name: 'Ruby of the Crushing Wave',
    description:
      'Drag this augment into a slot to upgrade an item to provide Crushing Wave to your weapon attacks. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'rubyOfTheCrushingWave.png',
    foundIn: []
  },
  {
    name: 'Ruby of the Endless Night',
    description:
      'Drag this augment into a slot to upgrade a weapon to inflict a Negative Level on vorpal hits. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfTheEndlessNight.png',
    foundIn: []
  },
  {
    name: 'Ruby of the Gatekeepers',
    description:
      'Drag this augment into a slot to upgrade a weapon to have Byeshk as an additional damage type. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'rubyOfTheGatekeepers.png',
    foundIn: []
  },
  {
    name: 'Ruby of the Iron Hand',
    description:
      'Drag this augment into a slot to upgrade a weapon to add the ability to bypass Cold Iron damage reduction. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'rubyOfTheIronHand.png',
    foundIn: []
  },
  {
    name: 'Ruby of the Snowpeaks',
    description:
      'Drag this augment into a slot to upgrade a weapon with a freezing cold, icy power, that deals 1d8 Cold damage on hit and can occasionally lock targets in frozen ice. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 4,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'rubyOfTheSnowpeaks.png',
    effectsAdded: [
      {
        name: 'Freezing Ice',
        description:
          'While you are wearing this item, your melee, ranged, and unarmed attacks gain the Freezing Ice ability.  (When the weapon is used, an icy power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice.)'
      }
    ],
    foundIn: []
  },
  {
    name: 'Ruby of the Vampire Slayer',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 1 to 4 Light Damage on hit and to have Alchemical Silver as an additional damage type. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'rubyOfTheVampireSlayer.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Accuracy +10',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +10 Enhancement bonus to your attack bonus. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfAccuracy10.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Accuracy +12',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +12 Enhancement bonus to your attack bonus. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'sapphireOfAccuracy12.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Accuracy +15',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +15 Enhancement bonus to your attack bonus. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfAccuracy15.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Accuracy +17',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +17 Enhancement bonus to your attack bonus. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'sapphireOfAccuracy17.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Accuracy +2',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +2 Enhancement bonus to your attack bonus. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfAccuracy2.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Accuracy +20',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +20 Enhancement bonus to your attack bonus. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'sapphireOfAccuracy20.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Accuracy +5',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +5 Enhancement bonus to your attack bonus. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfAccuracy5.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Accuracy +8',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +8 Enhancement bonus to your attack bonus. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfAccuracy8.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Armored Agility +1',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +1 Enhancement bonus to the Max Dex Bonus of your equipped light, medium, or heavy armor. This benefit does not apply to the Max Dex Bonus of a Tower Shield. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfArmoredAgility1.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Armored Agility +2',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +2 Enhancement bonus to the Max Dex Bonus of your equipped light, medium, or heavy armor. This benefit does not apply to the Max Dex Bonus of a Tower Shield. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfArmoredAgility2.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Crushing Wave Guard',
    description:
      'Drag this augment into a slot to upgrade an item to add Crushing Wave Guard to an item. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfCrushingWaveGuard.png',
    augmentType: 'Blue',
    effectsAdded: [
      {
        name: 'Crushing Wave Guard'
      }
    ],
    foundIn: ['Old Tomb, New Tenants']
  },
  {
    name: 'Sapphire of Defense +12',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +12 Enhancement bonus to your Physical Resistance Rating and Magical Resistance Rating. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfDefense12.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Defense +16',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +16 Enhancement bonus to your Physical Resistance Rating and Magical Resistance Rating. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfDefense16.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Defense +20',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +20 Enhancement bonus to your Physical Resistance Rating and Magical Resistance Rating. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'sapphireOfDefense20.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Defense +24',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +24 Enhancement bonus to your Physical Resistance Rating and Magical Resistance Rating. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfDefense24.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Defense +28',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +28 Enhancement bonus to your Physical Resistance Rating and Magical Resistance Rating. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'sapphireOfDefense28.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Defense +3',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +3 Enhancement bonus to your Physical Resistance Rating and Magical Resistance Rating. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfDefense3.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Defense +32',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +32 Enhancement bonus to your Physical Resistance Rating and Magical Resistance Rating. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'sapphireOfDefense32.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Defense +8',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +8 Enhancement bonus to your Physical Resistance Rating and Magical Resistance Rating. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfDefense8.png',
    foundIn: []
  },
  {
    name: 'Sapphire of False Life +12',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +12 Enhancement bonus to your maximum Hit Points. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfFalseLife12.png',
    foundIn: []
  },
  {
    name: 'Sapphire of False Life +18',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +18 Enhancement bonus to your maximum Hit Points. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfFalseLife18.png',
    foundIn: []
  },
  {
    name: 'Sapphire of False Life +24',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +24 Enhancement bonus to your maximum Hit Points. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfFalseLife24.png',
    foundIn: []
  },
  {
    name: 'Sapphire of False Life +30',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +30 Enhancement bonus to your maximum Hit Points. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'sapphireOfFalseLife30.png',
    foundIn: []
  },
  {
    name: 'Sapphire of False Life +36',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +36 Enhancement bonus to your maximum Hit Points. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfFalseLife36.png',
    foundIn: []
  },
  {
    name: 'Sapphire of False Life +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +4 Enhancement bonus to your maximum Hit Points. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfFalseLife4.png',
    foundIn: []
  },
  {
    name: 'Sapphire of False Life +42',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +42 Enhancement bonus to your maximum Hit Points. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'sapphireOfFalseLife42.png',
    foundIn: []
  },
  {
    name: 'Sapphire of False Life +48',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +48 Enhancement bonus to your maximum Hit Points. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'sapphireOfFalseLife48.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Good Luck +1',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +1 Luck bonus to all Saving Throws and Skill Checks. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfGoodLuck1.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Good Luck +2',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +2 Luck bonus to all Saving Throws and Skill Checks. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfGoodLuck2.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Heavy Fortification',
    description:
      'Drag this augment into a slot to upgrade an item to provide a 100% chance to negate sneak attacks and critical hits on the wearer. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfHeavyFortification.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Light Fortification',
    description:
      'Drag this augment into a slot to upgrade an item to provide a 25% chance to negate sneak attacks and critical hits on the wearer. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfLightFortification.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Moderate Fortification',
    description:
      'Drag this augment into a slot to upgrade an item to provide a 75% chance to negate sneak attacks and critical hits on the wearer. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfModerateFortification.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Natural Armor +1',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +1 Natural Armor bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfNaturalArmor1.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Natural Armor +11',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +11 Natural Armor bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'sapphireOfNaturalArmor11.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Natural Armor +12',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +12 Natural Armor bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'sapphireOfNaturalArmor12.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Natural Armor +3',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +3 Natural Armor bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfNaturalArmor3.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Natural Armor +5',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +5 Natural Armor bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfNaturalArmor5.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Natural Armor +6',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +6 Natural Armor bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfNaturalArmor6.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Natural Armor +8',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +8 Natural Armor bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'sapphireOfNaturalArmor8.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Natural Armor +9',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +9 Natural Armor bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfNaturalArmor9.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Protection +1',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +1 Protection bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfProtection1.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Protection +10',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +10 Protection bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'sapphireOfProtection10.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Protection +3',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +3 Protection bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfProtection3.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Protection +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +4 Protection bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfProtection4.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Protection +5',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +5 Protection bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfProtection5.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Protection +6',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +6 Protection bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'sapphireOfProtection6.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Protection +8',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +8 Protection bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfProtection8.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Protection +9',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +9 Protection bonus to your Armor Class. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'sapphireOfProtection9.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Resistance +1',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +1 Resistance bonus to your Saving Throws. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfResistance1.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Resistance +10',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +10 Resistance bonus to your Saving Throws. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'sapphireOfResistance10.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Resistance +3',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +3 Resistance bonus to your Saving Throws. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfResistance3.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Resistance +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +4 Resistance bonus to your Saving Throws. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfResistance4.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Resistance +5',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +5 Resistance bonus to your Saving Throws. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfResistance5.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Resistance +6',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +6 Resistance bonus to your Saving Throws. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'sapphireOfResistance6.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Resistance +8',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +8 Resistance bonus to your Saving Throws. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfResistance8.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Resistance +9',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +9 Resistance bonus to your Saving Throws. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'sapphireOfResistance9.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Shatter +11',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +11 Enhancement bonus to your Sunder DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfShatter11.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Shatter +12',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +12 Enhancement bonus to your Sunder DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'sapphireOfShatter12.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Shatter +14',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +14 Enhancement bonus to your Sunder DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'sapphireOfShatter14.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Shatter +2',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +2 Enhancement bonus to your Sunder DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfShatter2.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Shatter +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +4 Enhancement bonus to your Sunder DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfShatter4.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Shatter +6',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +6 Enhancement bonus to your Sunder DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfShatter6.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Shatter +7',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +7 Enhancement bonus to your Sunder DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfShatter7.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Shatter +9',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +9 Enhancement bonus to your Sunder DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'sapphireOfShatter9.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Stunning +11',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +11 Enhancement bonus to your Stunning DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfStunning11.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Stunning +12',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +12 Enhancement bonus to your Stunning DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'sapphireOfStunning12.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Stunning +14',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +14 Enhancement bonus to your Stunning DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'sapphireOfStunning14.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Stunning +2',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +2 Enhancement bonus to your Stunning DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfStunning2.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Stunning +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +4 Enhancement bonus to your Stunning DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfStunning4.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Stunning +6',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +6 Enhancement bonus to your Stunning DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfStunning6.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Stunning +7',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +7 Enhancement bonus to your Stunning DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfStunning7.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Stunning +9',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +9 Enhancement bonus to your Stunning DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'sapphireOfStunning9.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Vertigo +11',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +11 Enhancement bonus to your Trip DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 20,
    image: 'sapphireOfVertigo11.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Vertigo +12',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +12 Enhancement bonus to your Trip DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 24,
    image: 'sapphireOfVertigo12.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Vertigo +14',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +14 Enhancement bonus to your Trip DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    image: 'sapphireOfVertigo14.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Vertigo +2',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +2 Enhancement bonus to your Trip DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 1,
    image: 'sapphireOfVertigo2.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Vertigo +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +4 Enhancement bonus to your Trip DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 4,
    image: 'sapphireOfVertigo4.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Vertigo +6',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +6 Enhancement bonus to your Trip DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 8,
    image: 'sapphireOfVertigo6.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Vertigo +7',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +7 Enhancement bonus to your Trip DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 12,
    image: 'sapphireOfVertigo7.png',
    foundIn: []
  },
  {
    name: 'Sapphire of Vertigo +9',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +9 Enhancement bonus to your Trip DCs. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 16,
    image: 'sapphireOfVertigo9.png',
    foundIn: []
  },
  {
    name: 'Spark of Dream',
    description:
      'A spark of thought, captured and infused with sentient power. Feed this spark to your Sentient Item to increase the maximum number of filigree slots by one. The slot will not be available until the item is empowered with Sentient XP.',
    minimumLevel: 20,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'sparkOfDream.png',
    foundIn: []
  },
  {
    name: 'Spark of Logic',
    description:
      'A spark of thought, captured and infused with sentient power. Feed this spark to your Sentient Item to increase the maximum number of filigree slots by one. The slot will not be available until the item is empowered with Sentient XP.',
    minimumLevel: 20,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'sparkOfLogic.png',
    foundIn: []
  },
  {
    name: 'Spark of Memory',
    description:
      'A spark of thought, captured and infused with sentient power. Feed this spark to your Sentient Item to increase the maximum number of filigree slots by one. The slot will not be available until the item is empowered with Sentient XP.',
    minimumLevel: 20,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'sparkOfMemory.png',
    foundIn: []
  },
  {
    name: "Storm's Bulwark",
    description:
      'Drag this augment into a slot to upgrade an item to provide a ward against the Knockdowns and Slows of an Air Elemental. This augment can only go in a Green Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'greenAugmentBlueBorder',
    augmentType: 'Green',
    foundIn: ['The Knight Who Cried Windmill'],
    effectsAdded: [
      {
        name: 'Air Elemental Knockdown Ward'
      },
      {
        name: 'Air Elemental Slow Ward'
      }
    ]
  },
  {
    name: "The Master's Gift",
    description:
      'Drag this augment into a slot to upgrade an item with a +5% Enhancement bonus to all earned Experience Points. This augment can go in any color Augment Slot.',
    minimumLevel: 1,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'theMastersGift.png',
    foundIn: []
  },
  {
    name: 'Topaz of Abjuration',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Abjuration spells with a +1 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfAbjuration.png',
    foundIn: []
  },
  {
    name: 'Topaz of Acid Resistance 10',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 10 points of Acid damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfAcidResistance10.png',
    foundIn: []
  },
  {
    name: 'Topaz of Acid Resistance 15',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 15 points of Acid damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfAcidResistance15.png',
    foundIn: []
  },
  {
    name: 'Topaz of Acid Resistance 20',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 20 points of Acid damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfAcidResistance20.png',
    foundIn: []
  },
  {
    name: 'Topaz of Acid Resistance 25',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 25 points of Acid damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfAcidResistance25.png',
    foundIn: []
  },
  {
    name: 'Topaz of Acid Resistance 30',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 30 points of Acid damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfAcidResistance30.png',
    foundIn: []
  },
  {
    name: 'Topaz of Acid Resistance 35',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 35 points of Acid damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfAcidResistance35.png',
    foundIn: []
  },
  {
    name: 'Topaz of Acid Resistance 40',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 40 points of Acid damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 28,
    image: 'topazOfAcidResistance40.png',
    foundIn: []
  },
  {
    name: 'Topaz of Acid Resistance 5',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 5 points of Acid damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 1,
    image: 'topazOfAcidResistance5.png',
    foundIn: []
  },
  {
    name: 'Topaz of Anthem',
    description:
      'Drag this augment into a slot to upgrade an item to add Anthem to an item, which regenerates Bard songs over time. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfAnthem.png',
    foundIn: []
  },
  {
    name: 'Topaz of Blindness Immunity',
    description:
      'Drag this augment into a slot to upgrade an item to provide immunity to blindness. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfBlindnessImmunity.png',
    foundIn: []
  },
  {
    name: 'Topaz of Cold Resistance 10',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 10 points of Cold damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfColdResistance10.png',
    foundIn: []
  },
  {
    name: 'Topaz of Cold Resistance 15',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 15 points of Cold damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfColdResistance15.png',
    foundIn: []
  },
  {
    name: 'Topaz of Cold Resistance 20',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 20 points of Cold damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfColdResistance20.png',
    foundIn: []
  },
  {
    name: 'Topaz of Cold Resistance 25',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 25 points of Cold damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfColdResistance25.png',
    foundIn: []
  },
  {
    name: 'Topaz of Cold Resistance 30',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 30 points of Cold damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfColdResistance30.png',
    foundIn: []
  },
  {
    name: 'Topaz of Cold Resistance 35',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 35 points of Cold damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfColdResistance35.png',
    foundIn: []
  },
  {
    name: 'Topaz of Cold Resistance 40',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 40 points of Cold damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 28,
    image: 'topazOfColdResistance40.png',
    foundIn: []
  },
  {
    name: 'Topaz of Cold Resistance 5',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 5 points of Cold damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 1,
    image: 'topazOfColdResistance5.png',
    foundIn: []
  },
  {
    name: 'Topaz of Conjuration',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Conjuration spells with a +1 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfConjuration.png',
    foundIn: []
  },
  {
    name: 'Topaz of Damage +1',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +1 Competence bonus to your damage. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 1,
    image: 'topazOfDamage1.png',
    foundIn: []
  },
  {
    name: 'Topaz of Damage +10',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +10 Competence bonus to your damage. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 28,
    image: 'topazOfDamage10.png',
    foundIn: []
  },
  {
    name: 'Topaz of Damage +3',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +3 Competence bonus to your damage. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfDamage3.png',
    foundIn: []
  },
  {
    name: 'Topaz of Damage +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +4 Competence bonus to your damage. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfDamage4.png',
    foundIn: []
  },
  {
    name: 'Topaz of Damage +5',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +5 Competence bonus to your damage. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfDamage5.png',
    foundIn: []
  },
  {
    name: 'Topaz of Damage +6',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +6 Comptence bonus to your damage. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfDamage6.png',
    foundIn: []
  },
  {
    name: 'Topaz of Damage +8',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +8 Competence bonus to your damage. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfDamage8.png',
    foundIn: []
  },
  {
    name: 'Topaz of Damage +9',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +9 Competence bonus to your damage. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfDamage9.png',
    foundIn: []
  },
  {
    name: 'Topaz of Deathblock',
    description:
      'Drag this augment into a slot to upgrade an item to provide immunity to instant death spells and effects. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfDeathblock.png',
    foundIn: []
  },
  {
    name: 'Topaz of Electric Resistance 10',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 10 points of Electric damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfElectricResistance10.png',
    foundIn: []
  },
  {
    name: 'Topaz of Electric Resistance 15',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 15 points of Electric damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfElectricResistance15.png',
    foundIn: []
  },
  {
    name: 'Topaz of Electric Resistance 20',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 20 points of Electric damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfElectricResistance20.png',
    foundIn: []
  },
  {
    name: 'Topaz of Electric Resistance 25',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 25 points of Electric damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfElectricResistance25.png',
    foundIn: []
  },
  {
    name: 'Topaz of Electric Resistance 30',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 30 points of Electric damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfElectricResistance30.png',
    foundIn: []
  },
  {
    name: 'Topaz of Electric Resistance 35',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 35 points of Electric damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfElectricResistance35.png',
    foundIn: []
  },
  {
    name: 'Topaz of Electric Resistance 40',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 40 points of Electric damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 28,
    image: 'topazOfElectricResistance40.png',
    foundIn: []
  },
  {
    name: 'Topaz of Electric Resistance 5',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 5 points of Electric damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 1,
    image: 'topazOfElectricResistance5.png',
    foundIn: []
  },
  {
    name: 'Topaz of Enchantment',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Enchantment spells with a +1 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfEnchantment.png',
    foundIn: []
  },
  {
    name: 'Topaz of Evocation',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Evocation spells with a +1 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfEvocation.png',
    foundIn: []
  },
  {
    name: 'Topaz of Fear Immunity',
    description:
      'Drag this augment into a slot to upgrade an item to provide immunity to fear. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfFearImmunity.png',
    foundIn: []
  },
  {
    name: 'Topaz of Feather Falling',
    description:
      'Drag this augment into a slot to upgrade an item to provide feather falling. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfFeatherFalling.png',
    foundIn: []
  },
  {
    name: 'Topaz of Fire Resistance 10',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 10 points of Fire damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfFireResistance10.png',
    foundIn: []
  },
  {
    name: 'Topaz of Fire Resistance 15',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 15 points of Fire damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfFireResistance15.png',
    foundIn: []
  },
  {
    name: 'Topaz of Fire Resistance 20',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 20 points of Fire damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfFireResistance20.png',
    foundIn: []
  },
  {
    name: 'Topaz of Fire Resistance 25',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 25 points of Fire damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfFireResistance25.png',
    foundIn: []
  },
  {
    name: 'Topaz of Fire Resistance 30',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 30 points of Fire damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfFireResistance30.png',
    foundIn: []
  },
  {
    name: 'Topaz of Fire Resistance 35',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 35 points of Fire damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfFireResistance35.png',
    foundIn: []
  },
  {
    name: 'Topaz of Fire Resistance 40',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 40 points of Fire damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 28,
    image: 'topazOfFireResistance40.png',
    foundIn: []
  },
  {
    name: 'Topaz of Fire Resistance 5',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 5 points of Fire damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 1,
    image: 'topazOfFireResistance5.png',
    foundIn: []
  },
  {
    name: 'Topaz of Greater Abjuration',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Abjuration spells with a +2 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfGreaterAbjuration.png',
    foundIn: []
  },
  {
    name: 'Topaz of Greater Conjuration',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Conjuration spells with a +2 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfGreaterConjuration.png',
    foundIn: []
  },
  {
    name: 'Topaz of Greater Enchantment',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Enchantment spells with a +2 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfGreaterEnchantment.png',
    foundIn: []
  },
  {
    name: 'Topaz of Greater Evocation',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Evocation spells with a +2 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfGreaterEvocation.png',
    foundIn: []
  },
  {
    name: 'Topaz of Greater Illusion',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Illusion spells with a +2 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfGreaterIllusion.png',
    foundIn: []
  },
  {
    name: 'Topaz of Greater Necromancy',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Necromancy spells with a +2 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfGreaterNecromancy.png',
    foundIn: []
  },
  {
    name: 'Topaz of Greater Transmutation',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Transmutation spells with a +2 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfGreaterTransmutation.png',
    foundIn: []
  },
  {
    name: 'Topaz of Illusion',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Illusion spells with a +1 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfIllusion.png',
    foundIn: []
  },
  {
    name: 'Topaz of Necromancy',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Necromancy spells with a +1 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfNecromancy.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Disease +10',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against disease. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfProofAgainstDisease10.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Disease +2',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against disease. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfProofAgainstDisease2.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Disease +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against disease. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfProofAgainstDisease4.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Disease +6',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against disease. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfProofAgainstDisease6.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Disease +8',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against disease. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfProofAgainstDisease8.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Poison +10',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against poison. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfProofAgainstPoison10.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Poison +2',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against poison. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfProofAgainstPoison2.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Poison +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against poison. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfProofAgainstPoison4.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Poison +6',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against poison. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfProofAgainstPoison6.png',
    foundIn: []
  },
  {
    name: 'Topaz of Proof Against Poison +8',
    description:
      'Drag this augment into a slot to upgrade an item to provide increased protection against poison. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfProofAgainstPoison8.png',
    foundIn: []
  },
  {
    name: 'Topaz of Sonic Resistance 10',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 10 points of Sonic damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfSonicResistance10.png',
    foundIn: []
  },
  {
    name: 'Topaz of Sonic Resistance 15',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 15 points of Sonic damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfSonicResistance15.png',
    foundIn: []
  },
  {
    name: 'Topaz of Sonic Resistance 20',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 20 points of Sonic damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfSonicResistance20.png',
    foundIn: []
  },
  {
    name: 'Topaz of Sonic Resistance 25',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 25 points of Sonic damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfSonicResistance25.png',
    foundIn: []
  },
  {
    name: 'Topaz of Sonic Resistance 30',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 30 points of Sonic damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfSonicResistance30.png',
    foundIn: []
  },
  {
    name: 'Topaz of Sonic Resistance 35',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 35 points of Sonic damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfSonicResistance35.png',
    foundIn: []
  },
  {
    name: 'Topaz of Sonic Resistance 40',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 40 points of Sonic damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 28,
    image: 'topazOfSonicResistance40.png',
    foundIn: []
  },
  {
    name: 'Topaz of Sonic Resistance 5',
    description:
      'Drag this augment into a slot to upgrade an item to absorb the first 5 points of Sonic damage per attack that the wearer would normally take. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 1,
    image: 'topazOfSonicResistance5.png',
    foundIn: []
  },
  {
    name: 'Topaz of Spell Penetration +1',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +1 Enhancement bonus to your spell penetration. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 1,
    image: 'topazOfSpellPenetration1.png',
    foundIn: []
  },
  {
    name: 'Topaz of Spell Penetration +2',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +2 Enhancement bonus to your spell penetration. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfSpellPenetration2.png',
    foundIn: []
  },
  {
    name: 'Topaz of Spell Penetration +3',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +3 Enhancement bonus to your spell penetration. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfSpellPenetration3.png',
    foundIn: []
  },
  {
    name: 'Topaz of Spell Penetration +4',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +4 Enhancement bonus to your spell penetration. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfSpellPenetration4.png',
    foundIn: []
  },
  {
    name: 'Topaz of Spell Penetration +5',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +5 Enhancement bonus to your spell penetration. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfSpellPenetration5.png',
    foundIn: []
  },
  {
    name: 'Topaz of Transmutation',
    description:
      'Drag this augment into a slot to upgrade an item to provide your Transmutation spells with a +1 Enhancement bonus to the DC of the saving throw to resist them. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfTransmutation.png',
    foundIn: []
  },
  {
    name: 'Topaz of Water Breathing',
    description:
      'Drag this augment into a slot to upgrade an item to provide you with the ability to breathe underwater. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfWaterBreathing.png',
    foundIn: []
  },
  {
    name: 'Topaz of Wizardry +129',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +129 Enhancement bonus to your maximum Spell Points. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 12,
    image: 'topazOfWizardry129.png',
    foundIn: []
  },
  {
    name: 'Topaz of Wizardry +162',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +162 Enhancement bonus to your maximum Spell Points. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 16,
    image: 'topazOfWizardry162.png',
    foundIn: []
  },
  {
    name: 'Topaz of Wizardry +19',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +19 Enhancement bonus to your maximum Spell Points. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 1,
    image: 'topazOfWizardry19.png',
    foundIn: []
  },
  {
    name: 'Topaz of Wizardry +195',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +195 Enhancement bonus to your maximum Spell Points. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 20,
    image: 'topazOfWizardry195.png',
    foundIn: []
  },
  {
    name: 'Topaz of Wizardry +228',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +228 Enhancement bonus to your maximum Spell Points. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 24,
    image: 'topazOfWizardry228.png',
    foundIn: []
  },
  {
    name: 'Topaz of Wizardry +261',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +261 Enhancement bonus to your maximum Spell Points. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 28,
    image: 'topazOfWizardry261.png',
    foundIn: []
  },
  {
    name: 'Topaz of Wizardry +60',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +60 Enhancement bonus to your maximum Spell Points. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 4,
    image: 'topazOfWizardry60.png',
    foundIn: []
  },
  {
    name: 'Topaz of Wizardry +96',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +96 Enhancement bonus to your maximum Spell Points. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 8,
    image: 'topazOfWizardry96.png',
    foundIn: []
  },
  // Update 20
  {
    name: 'Deconstructor',
    augmentType: 'Red',
    minimumLevel: 28,
    description:
      'Drag this augment into a slot to upgrade a weapon to Adamantine as well as to inflict Destruction and 6 to 36 bonus Rust damage on hit vs Contructs. This augment can go in a Red, Orange, or Purple Augment Slot.',
    image: 'deconstructor.png',
    effectsAdded: [
      {
        name: 'Material: Adamantine'
      },
      {
        name: 'Destruction'
      },
      {
        name: 'Rust Damage vs Constructs',
        bonus: 'On-hit',
        modifier: '6d6'
      }
    ]
  }
]
