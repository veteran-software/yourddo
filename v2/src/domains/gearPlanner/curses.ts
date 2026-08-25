import rawCurses from '../../../../src/data/deckOfManyCurses.json'
import {
  type GearPlannerCurse,
  type GearPlannerEffect,
  type GearPlannerItem,
  gearPlannerSlots
} from './gearPlanner.types.ts'
import type { GearPlannerEquipment, GearPlannerSlottedCurses } from './planner.ts'

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const requiredString = (value: unknown, path: string): string => {
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`Invalid Gear Planner curse data: ${path} must be a non-empty string`)
  return value
}

const parseEffect = (value: unknown, path: string): GearPlannerEffect => {
  if (!isRecord(value)) throw new Error(`Invalid Gear Planner curse data: ${path} must be an object`)
  const name = requiredString(value.name, `${path}.name`)
  for (const key of ['statModified', 'notes'] as const) {
    if (value[key] !== undefined && typeof value[key] !== 'string') {
      throw new Error(`Invalid Gear Planner curse data: ${path}.${key} must be a string`)
    }
  }
  for (const key of ['modifier', 'bonus'] as const) {
    if (value[key] !== undefined && typeof value[key] !== 'string' && typeof value[key] !== 'number') {
      throw new Error(`Invalid Gear Planner curse data: ${path}.${key} must be a string or number`)
    }
  }
  if (
    value.stats !== undefined &&
    (!Array.isArray(value.stats) ||
      !value.stats.every((entry) => typeof entry === 'string' || typeof entry === 'number'))
  ) {
    throw new Error(`Invalid Gear Planner curse data: ${path}.stats must be a string or number array`)
  }
  return Object.freeze({ ...value, name })
}

// Legacy Deck data has globally unique names, so canonical names are persisted identities.
export const parseGearPlannerCurseDataset = (value: unknown): readonly GearPlannerCurse[] => {
  if (!Array.isArray(value)) throw new Error('Invalid Gear Planner curse data: deckOfManyCurses.json must be an array')
  const names = new Set<string>()
  return Object.freeze(
    value.map((entry, index) => {
      const path = `deckOfManyCurses.json[${String(index)}]`
      if (!isRecord(entry)) throw new Error(`Invalid Gear Planner curse data: ${path} must be an object`)
      const name = requiredString(entry.name, `${path}.name`)
      if (names.has(name)) throw new Error(`Invalid Gear Planner curse data: ${path}.name must be unique`)
      names.add(name)
      const type = requiredString(entry.type, `${path}.type`)
      if (entry.enchantments !== undefined && !Array.isArray(entry.enchantments)) {
        throw new Error(`Invalid Gear Planner curse data: ${path}.enchantments must be an array`)
      }
      const enchantments = Object.freeze(
        (entry.enchantments ?? []).map((effect, effectIndex) =>
          parseEffect(effect, `${path}.enchantments[${String(effectIndex)}]`)
        )
      )
      return Object.freeze({ id: name, name, type, enchantments, source: Object.freeze({ ...entry }) })
    })
  )
}

export const gearPlannerCurseDefinitions = parseGearPlannerCurseDataset(rawCurses)

export const gearPlannerCurseIdentity = (curse: GearPlannerCurse): string => curse.id

export const canApplyGearPlannerCurse = (item: GearPlannerItem): boolean => item.slot !== gearPlannerSlots.quiver

export interface GearPlannerSelectedCurse {
  item: GearPlannerItem
  curse: GearPlannerCurse
}

export const collectSelectedGearPlannerCurses = (
  equipment: GearPlannerEquipment,
  slottedCurses: GearPlannerSlottedCurses
): readonly GearPlannerSelectedCurse[] =>
  Object.values(equipment).flatMap((item) => {
    const curse = item ? slottedCurses[item.id] : undefined
    return item && curse && canApplyGearPlannerCurse(item) ? [{ item, curse }] : []
  })
