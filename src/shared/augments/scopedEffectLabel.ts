import type { GearPlannerEffect } from '../../domains/gearPlanner/gearPlanner.types'

export function scopedEffectLabel({ name, modifier, bonus }: GearPlannerEffect) {
  const value = String(modifier ?? '')
  const signed = Number.parseFloat(value) > 0 && !value.startsWith('+') ? '+' + value : value
  return name + (signed ? ' ' + signed : '') + (bonus ? ' (' + String(bonus) + ')' : '')
}
