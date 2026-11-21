import type { GearPlannerStandardSetDefinition } from './standardSetDefinitions'

export const slaveLordsMarker = 'Against the Slave Lords Set Bonus'

const artifact = (modifier: number, ...names: string[]) => names.map((name) => ({ name, modifier, bonus: 'Artifact' }))

// Fallback for sets missing from the CDN. Values follow the gearplanner_sets catalog.
// https://github.com/eddiefiggie/ddo-loadout-optimizer/blob/main/data/seed/compendium/raw/gearplanner_sets.json
function sets(legendary: boolean): GearPlannerStandardSetDefinition[] {
  const prefix = legendary ? 'Legendary ' : ''
  const low = legendary ? 2 : 1
  const high = legendary ? 4 : 2
  const might = ['Melee Power', 'Ranged Power', 'Damage Rolls']
  const endurance = ['Physical Resistance Rating', 'Magical Resistance Rating', 'Resistance', 'Spell Saves']
  const schools = [
    'Abjuration',
    'Conjuration',
    'Divination',
    'Enchantment',
    'Evocation',
    'Illusion',
    'Necromancy',
    'Transmutation'
  ].map((school) => 'Spell DC: ' + school)
  return [
    {
      name: prefix + "Slave Lord's Might",
      thresholds: [
        { threshold: 3, effects: artifact(low, ...might) },
        { threshold: 5, effects: [...artifact(high, ...might), ...artifact(low, 'Strength', 'Dexterity')] }
      ]
    },
    {
      name: prefix + "Slave Lord's Sorcery",
      thresholds: [
        {
          threshold: 3,
          effects: [...artifact(legendary ? 5 : 2, 'Universal Spell Power'), ...artifact(low, ...schools)]
        },
        {
          threshold: 5,
          effects: [
            ...artifact(legendary ? 10 : 5, 'Universal Spell Power'),
            ...artifact(high, ...schools),
            ...artifact(low, 'Intelligence', 'Wisdom', 'Charisma')
          ]
        }
      ]
    },
    {
      name: prefix + "Slave's Endurance",
      thresholds: [
        { threshold: 3, effects: artifact(low, ...endurance) },
        { threshold: 5, effects: [...artifact(high, ...endurance), ...artifact(low, 'Constitution')] }
      ]
    }
  ]
}

export const heroicSlaveLordsSets = sets(false)
export const legendarySlaveLordsSets = sets(true)
