import { describe, expect, it } from 'vitest'
import { standardGearPlannerSetDefinitionByName, standardGearPlannerSetDefinitions } from './standardSetDefinitions.ts'

describe('standard Gear Planner set definitions', () => {
  it('keeps the deterministic legacy standard lookup without filigree definitions', () => {
    expect(standardGearPlannerSetDefinitions).toHaveLength(255)
    expect([...standardGearPlannerSetDefinitionByName.keys()]).toEqual(
      standardGearPlannerSetDefinitions.map(({ name }) => name)
    )
    expect(
      standardGearPlannerSetDefinitionByName.get('Arcane Barrier')?.thresholds.map(({ threshold }) => threshold)
    ).toEqual([3])
    expect(standardGearPlannerSetDefinitionByName.has('Filigree Set: Acid Absorption')).toBe(false)
  })

  it('preserves the legacy hardcoded standard overrides and valid threshold/effect shapes', () => {
    expect(
      standardGearPlannerSetDefinitionByName.get("The Legendary Dread Isle's Curse")?.thresholds[0].effects
    ).toContainEqual({ name: 'To-Hit Chance', modifier: 3, bonus: 'Profane' })
    expect(standardGearPlannerSetDefinitionByName.get('Dread Stalker')?.thresholds[0].effects).toContainEqual({
      name: 'Damage vs Helpless',
      modifier: '15%',
      bonus: 'Artifact'
    })
    expect(standardGearPlannerSetDefinitionByName.get('Deacon of the Auricular')).toBeDefined()

    for (const definition of standardGearPlannerSetDefinitions) {
      expect(definition.name.trim()).toBe(definition.name)
      expect(definition.name).not.toBe('')
      for (const threshold of definition.thresholds) {
        expect(Number.isInteger(threshold.threshold)).toBe(true)
        expect(threshold.threshold).toBeGreaterThan(0)
        expect(Array.isArray(threshold.effects)).toBe(true)
        for (const effect of threshold.effects) expect(effect.name.trim()).not.toBe('')
      }
    }
  })
})
