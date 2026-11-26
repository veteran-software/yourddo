/** Hidden records still resolve by ID, but do not contribute displayable effects. */
export function isVisibleEffect(record: unknown): boolean {
  if (!record || typeof record !== 'object') return true
  return !('hidden' in record && record.hidden === true)
}
