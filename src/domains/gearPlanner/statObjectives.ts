import type { GearPlannerEffect } from './gearPlanner.types'

const spellFamilies: Readonly<Partial<Record<string, string>>> = {
  'spell critical chance': 'Spell Crit Chance',
  'spell critical damage': 'Spell Crit Damage',
  'spell power': 'Spell Power',
  'spell dc': 'Spell DCs'
}

export function spellObjective(name: string) {
  // The catalog contains both "Cold Spell Power" and "Spell Power: Cold".
  const trimmed = name.trim()
  const match = /(?:^| )(Spell (?:Crit(?:ical)? (?:Damage|Chance)|Power|DCs?))(?=:|$)/i.exec(trimmed)
  if (!match) return null
  const stat = match[1]
  const prefix = trimmed.slice(0, match.index)
  const suffix = trimmed.slice(match.index + match[0].length + 1).trimStart()
  const key = stat.toLowerCase().replace(/crit /, 'critical ').replace(/dcs$/, 'dc')
  const family = spellFamilies[key]
  if (!family) return null
  const subtype = (suffix || prefix || '')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
  const base = family === 'Spell DCs' && subtype ? 'Spell DC' : family.replace('Crit ', 'Critical ')
  return { family, subtype: subtype || 'General', name: subtype ? base + ': ' + subtype : base }
}

const skills = new Set(
  'Balance|Bluff|Concentration|Diplomacy|Disable Device|Haggle|Heal|Hide|Intimidate|Jump|Listen|Move Silently|Open Lock|Perform|Repair|Search|Spellcraft|Spot|Swim|Tumble|Use Magic Device'.split(
    '|'
  )
)

export function skillObjective(name: string) {
  return skills.has(name) ? 'Skill: ' + name : name
}

export function objectiveEffect(effect: GearPlannerEffect): GearPlannerEffect {
  const ranked = stripObjectiveRank(effect)
  const name = spellObjective(ranked.name)?.name ?? skillObjective(ranked.name)
  return name && name !== ranked.name ? { ...ranked, name } : ranked
}

// Keep qualifications such as "(Level 9)" and damage-reduction bypass types intact.
function stripObjectiveRank(effect: GearPlannerEffect): GearPlannerEffect {
  const name = effect.name.trim()
  const words = name.split(/\s+/u)
  if (words.length < 2) return effect
  const token = words.at(-1) ?? ''
  const rank = /^([+-]?\d+(?:\.\d+)?)(%|\[W\])?$/i.exec(token)
  if (!rank) return effect
  const modifier = String(effect.modifier ?? '').trim()
  const amount = /^([+-]?\d+(?:\.\d+)?)(%|\[W\])?$/i.exec(modifier)
  if (
    amount
      ? Number(amount[1]) !== Number(rank[1]) || (amount[2] && rank[2] && amount[2] !== rank[2])
      : modifier || !/^[+-]/.test(rank[1])
  )
    return effect
  return { ...effect, name: name.slice(0, -token.length).trimEnd(), modifier: rank[1] + (rank[2] ?? amount?.[2] ?? '') }
}

export function objectiveCategory(name: string) {
  if (/^(strength|dexterity|constitution|intelligence|wisdom|charisma|ability scores?)$/i.test(name))
    return 'Ability scores'
  if (name.toLowerCase().startsWith('skill:') || /skills? bonus|persuasion/i.test(name)) return 'Skills'
  if (
    /spell resistance|resistance rating|armor class|absorption|resistance|fortification(?! bypass)|dodge|save\b|hit points|damage reduction/i.test(
      name
    )
  )
    return 'Defenses'
  if (/spell|caster|magic points/i.test(name)) return 'Spellcasting'
  if (/attack|damage|critical|melee|ranged|tactical|doubles|offhand|fortification bypass/i.test(name)) return 'Combat'
  return 'Other effects'
}

export function bonusLabel(type: string) {
  return type === 'no type' ? 'Untyped' : type.replace(/\b\w/g, (letter) => letter.toUpperCase())
}
