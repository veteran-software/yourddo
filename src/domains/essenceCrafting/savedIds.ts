const encoder = new TextEncoder()

// Reproduce serialized IDs without loading the retired dataset.
export async function savedEssenceId(kind: string, identity: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(kind + '\0' + identity))
  const prefix = new Uint8Array(digest, 0, 8)
  return kind + '-' + Array.from(prefix, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
