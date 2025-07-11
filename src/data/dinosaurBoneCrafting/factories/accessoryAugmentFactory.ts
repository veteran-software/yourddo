import type { Bonus, Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { commonBinding, createRequirements } from './static.ts'

export const attributeScales = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].map(
  (attr) => ({
    name: attr,
    effectName: `${attr} +14`,
    modifier: 14,
    notes: 'Minor Artifact: +15'
  })
)

// Spell crit damage scales data
export const spellCritScales = [
  ['Fire'],
  ['Cold'],
  ['Electric'],
  ['Acid'],
  ['Light and Alignment'],
  ['Negative and Poison'],
  ['Sonic'],
  ['Force and Physical'],
  ['Positive'],
  ['Repair']
].map(([type]) => ({
  name: `${type} Spell Crit Damage`,
  effectName: `${type} Spell Crit Damage +20%`,
  modifier: '20%'
}))

// Special scales
export const specialScales = [
  {
    name: 'False Life',
    effectName: 'Maximum Hit Points +53',
    modifier: 53
  }
]

// Factory function for accessory scales
export const createAccessoryScale = (scaleData: {
  name: string
  effectName: string
  modifier: number | string
  notes?: string
}): CraftingIngredient =>
  ({
    name: `Scale: ${scaleData.name}`,
    image: 'dinosaurBoneScaleAugment',
    minimumLevel: 31,
    quantity: 1,
    binding: commonBinding,
    augmentType: 'Isle of Dread: Scale (Accessory)',
    craftedIn: 'Sharpened Bone [Village of Tanaroa]',
    effectsAdded: [
      {
        name: scaleData.effectName,
        modifier: scaleData.modifier,
        bonus: 'Enhancement',
        ...(scaleData.notes && { notes: scaleData.notes })
      }
    ],
    requirements: createRequirements(25)
  }) as CraftingIngredient

// Factory function for accessory fangs
export const createAccessoryFang = (name: string, effects: Enhancement[]): CraftingIngredient => ({
  name: `Fang: ${name}`,
  image: 'dinosaurBoneFangAugment',
  minimumLevel: 31,
  quantity: 1,
  binding: commonBinding,
  augmentType: 'Isle of Dread: Fang (Accessory)',
  craftedIn: 'Sharpened Bone [Village of Tanaroa]',
  effectsAdded: effects,
  requirements: createRequirements(50) as CraftingIngredient[]
})

// Amplification fangs data
export const amplificationFangs = [
  ['Healing', 56],
  ['Repair', 56],
  ['Negative', 56]
].map(([type, value]) => ({
  name: `${String(type)} Amplification`,
  effects: [
    {
      name: `${String(type)} Amplification +${String(value)}`,
      modifier: value,
      bonus: 'Competence'
    }
  ]
}))

// Combat fangs data
export const combatFangs = [
  ['Accuracy', 'Attack +21', 21],
  ['Damage', 'Damage +11', 11]
].map(([name, effectName, value]) => ({
  name,
  effects: [
    {
      name: effectName,
      modifier: value,
      bonus: 'Competence'
    }
  ]
}))

// Special fangs data
export const specialFangs = [
  {
    name: 'Deception',
    effects: [
      {
        name: 'Sneak Attack +11',
        modifier: 11,
        bonus: 'Enhancement'
      },
      {
        name: 'Sneak Attack Damage +17',
        modifier: 17,
        bonus: 'Enhancement'
      }
    ]
  },
  {
    name: 'Seeker',
    effects: [
      {
        name: 'Critical Confirmation +14',
        modifier: 14,
        bonus: 'Enhancement'
      },
      {
        name: 'Critical Damage +14',
        modifier: 14,
        bonus: 'Enhancement'
      }
    ]
  }
]

// Spell crit damage fangs data
export const spellCritFangs = [
  ['Fire'],
  ['Cold'],
  ['Electric'],
  ['Acid'],
  ['Light and Alignment'],
  ['Negative and Poison'],
  ['Sonic'],
  ['Force and Physical'],
  ['Positive']
].map(([type]) => ({
  name: `${type} Spell Crit Damage`,
  effects: [
    {
      name: `${type} Spell Crit Damage +10%`,
      modifier: '10%',
      bonus: 'Insight'
    }
  ]
}))

// Factory function for accessory claws
export const createAccessoryClaw = (
  name: string,
  effectName: string,
  modifier: number | string,
  bonus: Bonus | undefined
): CraftingIngredient => ({
  name: `Claw: ${name}`,
  image: 'dinosaurBoneClawAugment',
  minimumLevel: 31,
  quantity: 1,
  binding: commonBinding,
  augmentType: 'Isle of Dread: Claw (Accessory)',
  craftedIn: 'Sharpened Bone [Village of Tanaroa]',
  effectsAdded: [
    {
      name: effectName,
      modifier,
      bonus
    }
  ],
  requirements: [
    {
      name: 'Fossilized Tyrannosaurus Tooth',
      quantity: 100
    },
    ...createRequirements(25)
  ] as CraftingIngredient[]
})

// Resistance claws data
export const resistanceClaws = [
  ['Physical Resistance Rating', 35, 'Enhancement'],
  ['Magical Resistance Rating', 35, 'Enhancement']
].map(([type, value, bonus]) => ({
  name: type,
  effectName: `${String(type)} +${String(value)}`,
  modifier: value,
  bonus
}))

// DC claws data
export const dcClaws = [
  ['Stunning', 15],
  ['Trip', 15],
  ['Sunder', 15],
  ['Assassinate', 15]
].map(([type, value]) => ({
  name: type,
  effectName: `${String(type)} DC +${String(value)}`,
  modifier: value,
  bonus: 'Enhancement'
}))

// Special claws data
export const specialAccessoryClaws = [
  {
    name: 'Spell Penetration',
    effectName: 'Spell Penetration +9',
    modifier: 9,
    bonus: 'Equipment'
  }
]

// Spell crit damage claws data
export const spellCritClaws = [
  ['Fire'],
  ['Cold'],
  ['Electric'],
  ['Acid'],
  ['Light and Alignment'],
  ['Negative and Poison'],
  ['Sonic'],
  ['Force and Physical'],
  ['Positive']
].map(([type]) => ({
  name: `${type} Spell Crit Damage`,
  effectName: `${type} Spell Crit Damage +5%`,
  modifier: '5%',
  bonus: 'Quality'
}))

// Factory function for accessory horns
export const createAccessoryHorn = (name: string, effects: Enhancement[]): CraftingIngredient => ({
  name: `Horn: ${name}`,
  image: 'dinosaurBoneHornAugment',
  minimumLevel: 31,
  quantity: 1,
  binding: commonBinding,
  augmentType: 'Isle of Dread: Horn (Accessory)',
  craftedIn: 'Sharpened Bone [Village of Tanaroa]',
  effectsAdded: effects,
  requirements: [
    {
      name: 'Black Pearl',
      quantity: 50
    },
    {
      name: 'Fossilized Raptor Claw',
      quantity: 50
    },
    {
      name: 'Fossilized Triceratops Horn',
      quantity: 50
    },
    {
      name: 'Fossilized Pteradon Vertebra',
      quantity: 50
    },
    {
      name: 'Fossilized Ankylosaur Rib',
      quantity: 50
    }
  ]
})

// Horn accessories data
export const hornAccessories = [
  {
    name: 'Resistance',
    effects: [
      {
        name: 'Saving Throws +12',
        modifier: 12,
        bonus: 'Resistance'
      }
    ]
  },
  {
    name: 'Enhanced Ghostly',
    effects: [
      {
        name: 'Enhanced Ghostly'
      }
    ]
  },
  {
    name: 'Relentless Fury',
    effects: [
      {
        name: 'Relentless Fury'
      }
    ]
  },
  {
    name: 'Armor Piercing',
    effects: [
      {
        name: 'Fortification Bypass +21%',
        modifier: '21%',
        bonus: 'Enhancement'
      }
    ]
  },
  {
    name: 'Wizardry',
    effects: [
      {
        name: 'Maximum Spell Points +286',
        modifier: 286,
        bonus: 'Enhancement'
      }
    ]
  },
  {
    name: 'Profane DCs',
    effects: [
      {
        name: 'Spell DCs +2',
        modifier: 2,
        bonus: 'Profane'
      }
    ]
  },
  {
    name: 'Sacred DCs',
    effects: [
      {
        name: 'Spell DCs +2',
        modifier: 2,
        bonus: 'Sacred'
      }
    ]
  }
]
