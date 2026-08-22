/** A short, deterministic corruption check for compact client-side payloads; not a security primitive. */
export const createPermalinkChecksum = (payload: string): string => {
  let hash = 0x811c9dc5
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36).padStart(7, '0')
}
