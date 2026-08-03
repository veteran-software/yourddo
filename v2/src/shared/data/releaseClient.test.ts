import { afterEach, describe, expect, it, vi } from 'vitest'

const latest = {
  gameVersion: '81.0.1',
  dataVersion: 1785709673,
  baseUrl: '/releases/81.0.1/1785709673'
}

const manifest = {
  schemaVersion: 2,
  gameVersion: latest.gameVersion,
  dataVersion: latest.dataVersion,
  masterDatasetSha256: 'master',
  releaseFingerprint: 'release',
  manualPayloads: [],
  domains: [],
  generatedFiles: [
    {
      domain: 'nearly-complete',
      path: 'nearly-complete/items.json',
      sizeBytes: 1,
      sha256: 'items'
    }
  ]
}

const jsonResponse = (value: unknown): Response => new Response(JSON.stringify(value), { status: 200 })

const importClient = async () => {
  vi.resetModules()
  vi.stubEnv('VITE_DATA_CDN_BASE_URL', 'https://cdn.yourddo.com')
  return import('./releaseClient.ts')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('releaseClient', () => {
  it('resolves the active release and loads a manifest dataset', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(latest))
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse([{ name: 'Nearly Complete Item' }]))
    vi.stubGlobal('fetch', fetchMock)
    const { loadGeneratedDataset } = await importClient()

    await expect(
      loadGeneratedDataset<{ name: string }[]>('nearly-complete', 'nearly-complete/items.json')
    ).resolves.toEqual([{ name: 'Nearly Complete Item' }])

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://cdn.yourddo.com/latest.json',
      'https://cdn.yourddo.com/releases/81.0.1/1785709673/manifest.json',
      'https://cdn.yourddo.com/releases/81.0.1/1785709673/nearly-complete/items.json'
    ])
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({ cache: 'no-cache' })
  })

  it('rejects an unsupported manifest schema', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(
          jsonResponse({
            ...manifest,
            schemaVersion: 3
          })
        )
    )
    const { loadGeneratedDataset } = await importClient()

    await expect(loadGeneratedDataset('nearly-complete', 'nearly-complete/items.json')).rejects.toThrow(
      'Unsupported production data manifest schema: 3'
    )
  })

  it('rejects a release identity mismatch', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(jsonResponse({ ...manifest, dataVersion: 1 }))
    )
    const { loadGeneratedDataset } = await importClient()

    await expect(loadGeneratedDataset('nearly-complete', 'nearly-complete/items.json')).rejects.toThrow(
      'Production data release mismatch'
    )
  })

  it('rejects a missing manifest entry', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(jsonResponse({ ...manifest, generatedFiles: [] }))
    )
    const { loadGeneratedDataset } = await importClient()

    await expect(loadGeneratedDataset('nearly-complete', 'nearly-complete/items.json')).rejects.toThrow(
      'Production data manifest is missing required file: nearly-complete/items.json'
    )
  })
})
