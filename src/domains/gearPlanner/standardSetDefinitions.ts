import type { GearPlannerEffect } from './gearPlanner.types.ts'

export interface GearPlannerStandardSetThreshold {
  threshold: number
  effects: readonly GearPlannerEffect[]
  requirement?: string
  requiredItemId?: number
}

export interface GearPlannerStandardSetDefinition {
  name: string
  thresholds: readonly GearPlannerStandardSetThreshold[]
  thresholdMode?: 'highestOnly'
}
