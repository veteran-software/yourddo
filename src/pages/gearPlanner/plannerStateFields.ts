import type { GearSetup } from './types'

export const PLANNER_SETUP_METADATA_FIELDS = [
  'name',
  'minLevel',
  'maxLevel',
  'classes',
  'weaponFilters',
  'armorFilters',
  'shieldFilters',
  'allowMetalWithDruid'
] as const

export type PlannerSetupMetadataField = (typeof PLANNER_SETUP_METADATA_FIELDS)[number]

export const pickPlannerSetupMetadata = (setup: GearSetup): Pick<GearSetup, PlannerSetupMetadataField> => ({
  name: setup.name,
  minLevel: setup.minLevel,
  maxLevel: setup.maxLevel,
  classes: setup.classes,
  weaponFilters: setup.weaponFilters,
  armorFilters: setup.armorFilters,
  shieldFilters: setup.shieldFilters,
  allowMetalWithDruid: setup.allowMetalWithDruid
})
