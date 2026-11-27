import { createStore, get, set } from 'idb-keyval'

export interface DatasetFile {
  path: string
  sizeBytes: number
  sha256: string
}

interface CachedDataset {
  sha256: string
  body: Blob
}

let store: ReturnType<typeof createStore> | undefined

async function parseDownloadedJson(read: () => unknown): Promise<unknown> {
  try {
    return await read()
  } catch (cause) {
    throw new Error('Invalid dataset response: expected valid JSON', { cause })
  }
}

export async function readDataset(
  namespace: string,
  file: DatasetFile,
  fetchFile: () => Promise<Response>
): Promise<unknown> {
  const sha256 = file.sha256.toLowerCase()
  const crypto = globalThis.crypto?.subtle
  if (!globalThis.indexedDB || !crypto || !/^[0-9a-f]{64}$/.test(sha256)) {
    const response = await fetchFile()
    return parseDownloadedJson(() => response.json())
  }

  // A single entry per path keeps successive releases from accumulating full catalogs.
  const key = [namespace, file.path]
  try {
    const database = (store ??= createStore('yourddo-cdn-cache', 'datasets'))
    const cached = await get<CachedDataset>(key, database)
    if (cached?.sha256 === sha256 && cached.body instanceof Blob && cached.body.size === file.sizeBytes) {
      return JSON.parse(await cached.body.text()) as unknown
    }
  } catch {
    // A broken entry, denied storage or an unavailable database must not prevent loading.
  }

  const bytes = await (await fetchFile()).arrayBuffer()
  const digest = await crypto.digest('SHA-256', bytes)
  const actual = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  if (bytes.byteLength !== file.sizeBytes || actual !== sha256)
    throw new Error('Dataset integrity check failed: ' + file.path)

  const data = await parseDownloadedJson(() => JSON.parse(new TextDecoder().decode(bytes)) as unknown)
  if (store) {
    try {
      await set(key, { sha256, body: new Blob([bytes]) }, store)
    } catch {
      // The fetched data can still be used when disk space is unavailable.
    }
  }
  return data
}
