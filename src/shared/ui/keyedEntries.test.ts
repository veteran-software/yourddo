import { expect, it } from 'vitest'
import { keyedEntries } from './keyedEntries'

it('keeps equal rows distinct and preserves their keys when other values move', () => {
  const keys = (values: string[]) => keyedEntries(values).map((entry) => entry.key)
  const [first, other, second] = keys(['Fire', 'Cold', 'Fire'])
  expect(first).not.toBe(second)
  expect(keys(['Cold', 'Fire', 'Fire'])).toEqual([other, first, second])
})
