import { describe, expect, it } from 'vitest'
import { decodeStableId, encodeStableId } from './stableId.ts'

describe('stable ID codec', () => {
  it.each([
    [0, '0'],
    [35, 'z'],
    [36, '10'],
    [1879085364, 'v2rbjo'],
    [Number.MAX_SAFE_INTEGER, '2gosa7pa2gv']
  ])('round trips %i as canonical lowercase base36', (id, encoded) => {
    expect(encodeStableId(id)).toBe(encoded)
    expect(decodeStableId(encoded)).toBe(id)
  })

  it.each(['', '-1', '+1', ' 1', '1 ', '01', 'ABC', 'a!', '2gosa7pa2gw'])('rejects malformed IDs', (value) => {
    expect(() => decodeStableId(value)).toThrow()
  })

  it.each([-1, 1.2, Number.MAX_SAFE_INTEGER + 1])('rejects invalid internal IDs', (value) => {
    expect(() => encodeStableId(value)).toThrow()
  })
})
