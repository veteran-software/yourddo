import type { CraftingIngredient, SetBonus } from '../types/crafting.ts'

const baseSetAugment: Partial<CraftingIngredient> = {
  image: 'cauldronOfCadenceAugment',
  quantity: 1,
  augmentType: 'Colorless',
  baseValue: { platinum: 500 },
  weight: 0.01,
  minimumLevel: 30,
  craftedIn: 'Cauldron of Cadence',
  binding: {
    type: 'Bound',
    to: 'Account',
    from: 'Acquisition'
  }
}

const createStatEnhancement = (statName: string, modifier = 3) => ({
  name: statName,
  modifier,
  bonus: 'Artifact' as const
})

const createPercentageEnhancement = (name: string, percentage = 15) => ({
  name,
  modifier: `${String(percentage)}%`,
  bonus: 'Artifact' as const
})

/**
 * Represents a constant mapping of various character statistics to their respective
 * enhancement functions. Each statistic is paired with a stat enhancement creator
 * function that generates a bonus effect related to the specific stat.
 *
 * The available statistics and their corresponding enhancement functions are:
 * - strength: Enhancement for the Strength attribute.
 * - dexterity: Enhancement for the Dexterity attribute.
 * - constitution: Enhancement for the Constitution attribute.
 * - intelligence: Enhancement for the Intelligence attribute.
 * - wisdom: Enhancement for the Wisdom attribute.
 * - charisma: Enhancement for the Charisma attribute.
 */
const STAT_BONUS = {
  strength: createStatEnhancement('Strength'),
  dexterity: createStatEnhancement('Dexterity'),
  constitution: createStatEnhancement('Constitution'),
  intelligence: createStatEnhancement('Intelligence'),
  wisdom: createStatEnhancement('Wisdom'),
  charisma: createStatEnhancement('Charisma')
} as const

/**
 * An array containing configuration objects for set augmentations in a game or system.
 * Each object defines a unique set name, its required item, and the enhancement it provides.
 *
 * Fields:
 * - `name` (string): The name of the set augmentation.
 * - `requiredItem` (string): The specific item required to activate the set augmentation.
 * - `enhancement` (object | Array | constant):
 *    - Specifies the enhancement provided by the set augmentation, which can be an object,
 *      an array of objects, or a predefined constant. Enhancements may include statistical or
 *      percentage-based modifiers to specific attributes.
 */
export const setAugmentConfigs = [
  {
    name: 'Perfect Silence',
    requiredItem: 'Vestments of Ravenloft',
    enhancement: createStatEnhancement('Sneak Attack Dice')
  },
  {
    name: 'Arcane Barrier',
    requiredItem: 'Mantle of Escher',
    enhancement: {
      name: 'Magical Resistance Rating Cap',
      modifier: 30
    }
  },
  {
    name: 'Paragon Guard',
    requiredItem: 'Platemail of Strahd',
    enhancement: createPercentageEnhancement('Armor Class')
  },
  {
    name: 'Dusk Raider',
    requiredItem: 'Coat of Van Richten',
    enhancement: [createStatEnhancement('Melee Power', 15), createStatEnhancement('Ranged Power', 15)]
  },
  {
    name: 'Piercing Mind',
    requiredItem: 'Staggershockers',
    enhancement: STAT_BONUS.intelligence
  },
  {
    name: 'Touch of Power',
    requiredItem: "Attunement's Gaze",
    enhancement: createStatEnhancement('Universal Spell Power', 25)
  },
  {
    name: 'Alluring Elocution',
    requiredItem: 'Tattered Scrolls of the Broken One',
    enhancement: STAT_BONUS.charisma
  },
  {
    name: 'Arcane Guardian',
    requiredItem: "Citadel's Gaze",
    enhancement: createStatEnhancement('Magical Resistance Rating', 30)
  },
  {
    name: 'Visions of the Beyond',
    requiredItem: 'Crystalline Gauntlets',
    enhancement: STAT_BONUS.wisdom
  },
  {
    name: 'Cruel Cut',
    requiredItem: "The Family's Blessing",
    enhancement: createPercentageEnhancement('Damage vs Helpless')
  },
  {
    name: 'Truthful Blow',
    requiredItem: 'Helm of the Final Watcher',
    enhancement: createPercentageEnhancement('Fortification Bypass')
  },
  {
    name: 'Tough Shields',
    requiredItem: "Dumathoin's Bracers",
    enhancement: createStatEnhancement('Physical Resistance Rating', 30)
  },
  {
    name: 'Esoterica',
    requiredItem: 'Cloak of the Mountain',
    enhancement: createStatEnhancement('Spell DCs')
  },
  {
    name: 'Quickblade',
    requiredItem: 'Guided Sight',
    enhancement: [createPercentageEnhancement('Doublestrike'), createPercentageEnhancement('Doubleshot')]
  },
  {
    name: 'Brutal Blows',
    requiredItem: 'Mail of the Mroranon',
    enhancement: STAT_BONUS.strength
  },
  {
    name: 'Cunning Impact',
    requiredItem: 'Strange Tidings',
    enhancement: STAT_BONUS.dexterity
  },
  {
    name: 'Wild Fortitude',
    requiredItem: 'Quori-Infused Core',
    enhancement: STAT_BONUS.constitution
  },
  {
    name: 'Legendary Bulwark',
    requiredItem: 'The Stablestone',
    enhancement: {
      name: 'Maximum Hit Points',
      modifier: '10%',
      bonus: 'Legendary'
    }
  },
  {
    name: 'Imbued Infusion',
    requiredItem: "Kelas' Volatile Mixture",
    enhancement: createStatEnhancement('Imbue Dice')
  },
  {
    name: 'Bold Tactician',
    requiredItem: 'Page Regalia: Exiled Tactica',
    enhancement: createStatEnhancement('Tactical DCs')
  },
  {
    name: 'Subtle Blade',
    requiredItem: 'Page Regalia: Unsanctioned Arcana',
    enhancement: createStatEnhancement('Assassinate DC')
  }
] as const

/**
 * Creates a crafting ingredient for a Set Augment using the provided configuration.
 *
 * This function generates a Set Augment item, which can override the set bonus of an Augment Slot
 * when equipped. The generated augment includes its name, description, required materials to craft,
 * and associated set bonus enhancements.
 *
 * @param {Object} config - The configuration object for the Set Augment.
 * @param {string} config.name - The name of the set for the augment.
 * @param {string} config.requiredItem - The specific item required to craft this augment.
 * @param {string | string[]} config.enhancement - The enhancements provided by the set bonus when equipped.
 * @returns {CraftingIngredient} The configuration for the created Set Augment item.
 */
const createSetAugment = (config: (typeof setAugmentConfigs)[number]): CraftingIngredient =>
  ({
    ...baseSetAugment,
    name: `Set Augment: ${config.name}`,
    description: `Slotting this Augment in any Augment Slot will override its Set Bonus to the ${config.name} set.`,
    requirements: [
      {
        name: 'Thread of Fate',
        quantity: 50
      },
      {
        name: 'Empty Soul Vessel',
        quantity: 1
      },
      {
        name: config.requiredItem,
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: config.name,
        numPiecesEquipped: 3,
        enhancements: Array.isArray(config.enhancement) ? config.enhancement : [config.enhancement]
      } as SetBonus
    ] as SetBonus[]
  }) as CraftingIngredient

/**
 * Represents an array of crafting ingredients derived from configurations using a mapping function.
 *
 * This variable processes an array of augment configuration objects into crafting ingredients
 * by applying the `createSetAugment` function to each configuration in the `setAugmentConfigs`.
 *
 * @type {CraftingIngredient[]}
 */
export const cauldronOfCadence: CraftingIngredient[] = setAugmentConfigs.map(createSetAugment)
