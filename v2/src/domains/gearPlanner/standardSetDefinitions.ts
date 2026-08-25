import itemSetsData from '../../../../src/data/loot/itemSets.json'
import type { GearPlannerEffect } from './gearPlanner.types.ts'

export interface GearPlannerStandardSetThreshold {
  threshold: number
  effects: readonly GearPlannerEffect[]
}

export interface GearPlannerStandardSetDefinition {
  name: string
  thresholds: readonly GearPlannerStandardSetThreshold[]
}

interface LegacyItemSet {
  name: string
  bonuses: readonly {
    threshold: number
    enhancements: readonly GearPlannerEffect[] | null
  }[]
}

const legacyItemSets = itemSetsData as readonly LegacyItemSet[]

const definition = (
  name: string,
  thresholds: readonly GearPlannerStandardSetThreshold[]
): GearPlannerStandardSetDefinition => ({ name, thresholds })

const itemSetDefinitions = legacyItemSets.map(({ name, bonuses }) =>
  definition(
    name,
    bonuses.map(({ threshold, enhancements }) => ({
      threshold,
      effects: (enhancements ?? []).map((effect) => ({ ...effect, name: effect.name || 'Unnamed Enhancement' }))
    }))
  )
)

// These overrides are the non-JSON standard definitions in legacy setBonuses.ts.
// They intentionally exclude filigree sets and all future/customization systems.
const legacyStandardOverrides = [
  definition("The Legendary Dread Isle's Curse", [
    {
      threshold: 5,
      effects: [
        { name: 'Melee Power', modifier: 15, bonus: 'Profane' },
        { name: 'Ranged Power', modifier: 15, bonus: 'Profane' },
        { name: 'Universal Spellpower', modifier: 25, bonus: 'Profane' },
        { name: 'Physical Resistance', modifier: 30, bonus: 'Profane' },
        { name: 'Spell DCs', modifier: 2, bonus: 'Profane' },
        { name: 'Ability Scores', modifier: 2, bonus: 'Profane' },
        { name: 'To-Hit Chance', modifier: 3, bonus: 'Profane' },
        { name: 'Damage', modifier: 3, bonus: 'Profane' }
      ]
    }
  ]),
  definition('Dread Stalker', [
    {
      threshold: 3,
      effects: [
        { name: 'Sneak Attack Dice', modifier: 3, bonus: 'Artifact' },
        { name: 'Melee Power', modifier: 15, bonus: 'Artifact' },
        { name: 'Ranged Power', modifier: 15, bonus: 'Artifact' },
        { name: 'Doublestrike Chance', modifier: '15%', bonus: 'Artifact' },
        { name: 'Doubleshot Chance', modifier: '15%', bonus: 'Artifact' },
        { name: 'Damage vs Helpless', modifier: '15%', bonus: 'Artifact' }
      ]
    }
  ]),
  definition('Defender Of Tanaroa', [
    {
      threshold: 3,
      effects: [
        { name: 'Positive Amplification', modifier: 30, bonus: 'Artifact' },
        { name: 'Negative Amplification', modifier: 30, bonus: 'Artifact' },
        { name: 'Repair Amplification', modifier: 30, bonus: 'Artifact' },
        { name: 'Universal Spell Critical Chance', modifier: '6%', bonus: 'Artifact' },
        { name: 'Universal Spellpower', modifier: 25, bonus: 'Artifact' },
        { name: 'Magical Resistance', modifier: 30, bonus: 'Artifact' }
      ]
    }
  ]),
  definition('Echoes Of The Walking Ancestors', [
    {
      threshold: 3,
      effects: [
        { name: 'Imbue Dice', modifier: 3, bonus: 'Artifact' },
        { name: 'Spell DCs', modifier: 3, bonus: 'Artifact' },
        { name: 'Tactical DCs', modifier: 3, bonus: 'Artifact' },
        { name: 'Assassinate DC', modifier: 3, bonus: 'Artifact' },
        { name: 'Ability Scores', modifier: 3, bonus: 'Artifact' }
      ]
    }
  ]),
  definition('Devastation of the Firemouth', [
    {
      threshold: 3,
      effects: [
        { name: 'Positive Amplification', modifier: 30, bonus: 'Artifact' },
        { name: 'Negative Amplification', modifier: 30, bonus: 'Artifact' },
        { name: 'Repair Amplification', modifier: 30, bonus: 'Artifact' },
        { name: 'Physical Resistance', modifier: 30, bonus: 'Artifact' },
        { name: 'Armor Class', modifier: '15%', bonus: 'Artifact' },
        { name: 'Threat Generation', modifier: '100%', bonus: 'Artifact' }
      ]
    }
  ]),
  definition('Deacon of the Auricular', [
    {
      threshold: 3,
      effects: [
        { name: 'Universal Spell Critical Chance', modifier: '6%', bonus: 'Artifact' },
        { name: 'Universal Spellpower', modifier: 25, bonus: 'Artifact' },
        { name: 'Spell Critical Damage', modifier: '15%', bonus: 'Legendary' },
        { name: 'Magical Resistance Rating Cap', modifier: 30, bonus: 'Artifact' }
      ]
    }
  ])
] as const satisfies readonly GearPlannerStandardSetDefinition[]

const definitionsByName = new Map<string, GearPlannerStandardSetDefinition>()
for (const set of [...itemSetDefinitions, ...legacyStandardOverrides]) definitionsByName.set(set.name, set)

// Array order matches the legacy lookup's first source order; override values retain their existing names.
export const standardGearPlannerSetDefinitions = [...definitionsByName.values()]
export const standardGearPlannerSetDefinitionByName = definitionsByName as ReadonlyMap<
  string,
  GearPlannerStandardSetDefinition
>
