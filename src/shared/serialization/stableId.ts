/** Encodes non-negative safe integer domain IDs in canonical lowercase base36. */
export const encodeStableId = (id: number): string => {
  if (!Number.isSafeInteger(id) || id < 0) throw new RangeError('Stable IDs must be non-negative safe integers')
  return id.toString(36)
}

/** Decodes only canonical lowercase base36; decimal-looking values are still base36. */
export const decodeStableId = (value: string): number => {
  if (!/^(0|[1-9a-z][0-9a-z]*)$/.test(value)) throw new RangeError('Invalid base36 stable ID')
  let decoded = 0
  for (const character of value) {
    const digit = Number.parseInt(character, 36)
    if (decoded > (Number.MAX_SAFE_INTEGER - digit) / 36) throw new RangeError('Stable ID is out of range')
    decoded = decoded * 36 + digit
  }
  if (encodeStableId(decoded) !== value) throw new RangeError('Stable ID is not canonical base36')
  return decoded
}
