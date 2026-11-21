import { describe, expect, it } from 'vitest'
import { createDefaultSetup } from './initialState'
import { pickPlannerSetupMetadata, PLANNER_SETUP_METADATA_FIELDS } from './plannerStateFields'

describe('planner state fields', () => {
  it('keeps the exported metadata field list aligned with the picker helper', () => {
    const setup = createDefaultSetup('setup-1', 'Setup 1')
    expect(Object.keys(pickPlannerSetupMetadata(setup))).toEqual([...PLANNER_SETUP_METADATA_FIELDS])
  })
})
