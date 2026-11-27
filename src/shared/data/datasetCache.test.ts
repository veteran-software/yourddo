import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const database = vi.hoisted(() => new Map<string, unknown>())
vi.mock('idb-keyval', () => ({
  createStore: vi.fn(() => vi.fn()),
  get: vi.fn((key: string[]) => Promise.resolve(database.get(JSON.stringify(key)))),
  set: vi.fn((key: string[], value: unknown) => {
    database.set(JSON.stringify(key), value)
    return Promise.resolve()
  })
}))

function file(path: string, body: string) {
  return {
    domain: path.split('/')[0],
    path,
    sha256: createHash('sha256').update(body).digest('hex'),
    sizeBytes: Buffer.byteLength(body)
  }
}

beforeEach(() => {
  database.clear()
  vi.stubGlobal('indexedDB', {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('persistent dataset cache', () => {
  it('checks the CDN on a new visit and downloads only files whose hashes changed', async () => {
    const unchanged = 'items/armor.json'
    const updated = 'items/weapons.json'
    async function visit(dataVersion: number, weapon: string) {
      vi.resetModules()
      const latest = { gameVersion: '82.1.0', dataVersion, baseUrl: '/releases/82.1.0/' + String(dataVersion) }
      const armor = '["Shields"]'
      const manifest = {
        ...latest,
        schemaVersion: 2,
        generatedFiles: [file(unchanged, armor), file(updated, weapon)],
        manualPayloads: []
      }
      const payloads = new Map<string, string>([
        ['/latest.json', JSON.stringify(latest)],
        [latest.baseUrl + '/manifest.json', JSON.stringify(manifest)],
        [latest.baseUrl + '/' + unchanged, armor],
        [latest.baseUrl + '/' + updated, weapon]
      ])
      const requests: string[] = []
      vi.stubGlobal('fetch', (url: string) => {
        const path = url.replace('/data-cdn', '')
        requests.push(path)
        return Promise.resolve(new Response(payloads.get(path) ?? null, { status: payloads.has(path) ? 200 : 404 }))
      })
      const { loadDatasetFile } = await import('./loadDataset')
      const result = await Promise.all([loadDatasetFile(unchanged), loadDatasetFile(updated)])
      return { requests, result }
    }

    expect(await visit(1, '["Swords"]')).toEqual({
      requests: [
        '/latest.json',
        '/releases/82.1.0/1/manifest.json',
        '/releases/82.1.0/1/items/armor.json',
        '/releases/82.1.0/1/items/weapons.json'
      ],
      result: [['Shields'], ['Swords']]
    })
    expect(await visit(1, '["Swords"]')).toEqual({
      requests: ['/latest.json', '/releases/82.1.0/1/manifest.json'],
      result: [['Shields'], ['Swords']]
    })
    expect(await visit(2, '["Rapier"]')).toEqual({
      requests: ['/latest.json', '/releases/82.1.0/2/manifest.json', '/releases/82.1.0/2/items/weapons.json'],
      result: [['Shields'], ['Rapier']]
    })
    expect(database.size).toBe(2)
  })

  it('rejects a payload with a mismatched digest and can retry it', async () => {
    const { readDataset } = await import('./datasetCache')
    const descriptor = file('items/swords.json', '["Longsword"]')
    await expect(readDataset('test', descriptor, () => Promise.resolve(new Response('["Greatclub"]')))).rejects.toThrow(
      /integrity check failed/
    )
    expect(database.size).toBe(0)
    await expect(
      readDataset('test', descriptor, () => Promise.resolve(new Response('["Longsword"]')))
    ).resolves.toEqual(['Longsword'])
    expect(database.size).toBe(1)
  })

  it('loads from the network when the browser denies IndexedDB access', async () => {
    const { get, set } = await import('idb-keyval')
    vi.mocked(get).mockRejectedValueOnce(new Error('IndexedDB unavailable'))
    vi.mocked(set).mockRejectedValueOnce(new Error('IndexedDB unavailable'))
    const { readDataset } = await import('./datasetCache')
    const body = '["Quarterstaff"]'
    await expect(
      readDataset('test', file('items/weapons.json', body), () => Promise.resolve(new Response(body)))
    ).resolves.toEqual(['Quarterstaff'])
    expect(database.size).toBe(0)
  })
})
