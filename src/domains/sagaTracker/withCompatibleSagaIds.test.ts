import { describe, expect, it } from 'vitest'
import { withCompatibleSagaIds } from './withCompatibleSagaIds.ts'

const legacyId = 'the-planewalkers-path-epic'
const currentId = '1879197212'

describe('withCompatibleSagaIds', () => {
  it('restores the legacy ID without changing the input or other entries', () => {
    const status = { completed: true, turnedIn: true }
    const entries = { [legacyId]: status, other: { completed: false, turnedIn: false } }
    const compatible = withCompatibleSagaIds(entries)

    expect(compatible).toEqual({ [currentId]: status, other: entries.other })
    expect(entries[legacyId]).toBe(status)
    expect(withCompatibleSagaIds(compatible)).toBe(compatible)
  })

  it('keeps the current value when both IDs exist, including a cleared timestamp', () => {
    expect(withCompatibleSagaIds({ [legacyId]: 100, [currentId]: 0 })).toEqual({ [currentId]: 0 })
    expect(withCompatibleSagaIds({ [currentId]: 0, [legacyId]: 100 })).toEqual({ [currentId]: 0 })
  })

  it('prefers the corrected slug when only legacy IDs exist', () => {
    expect(withCompatibleSagaIds({ [legacyId]: 100, 'the-planeswalkers-path-epic': 50 })).toEqual({
      [currentId]: 50
    })
  })

  it('leaves saves without the legacy ID unchanged', () => {
    const entries = { [currentId]: 100, other: 200 }
    expect(withCompatibleSagaIds(entries)).toBe(entries)
  })
})
