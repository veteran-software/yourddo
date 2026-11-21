import { afterEach, describe, expect, it, vi } from 'vitest'

const latest = {
  gameVersion: '81.0.1',
  dataVersion: 1785691335,
  baseUrl: '/releases/81.0.1/1785691335'
}

const manifest = {
  schemaVersion: 2,
  gameVersion: latest.gameVersion,
  dataVersion: latest.dataVersion,
  masterDatasetSha256: 'master',
  releaseFingerprint: 'release',
  manualPayloads: [
    {
      name: 'essenceCrafting.v2',
      path: 'manual/essenceCrafting.v2.json',
      sizeBytes: 1,
      sha256: 'essence'
    }
  ],
  domains: [],
  generatedFiles: [
    { domain: 'gear-planner', path: 'gear-planner/ring.json', sizeBytes: 1, sha256: 'ring' },
    { domain: 'gear-planner', path: 'gear-planner/filigreeSets.json', sizeBytes: 1, sha256: 'sets' }
  ]
}

const jsonResponse = (data: unknown): Response => ({ ok: true, json: () => Promise.resolve(data) }) as Response

const importClient = async () => {
  vi.resetModules()
  vi.stubEnv('VITE_DATA_CDN_BASE_URL', 'https://cdn.yourddo.com')
  return import('./releaseClient')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('releaseClient', () => {
  it('loads latest, manifest, then the requested dataset', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(latest))
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse([{ name: 'Ring' }]))
    vi.stubGlobal('fetch', fetchMock)
    const { loadGearPlannerItems } = await importClient()

    await expect(loadGearPlannerItems('ring.json')).resolves.toEqual([{ name: 'Ring' }])

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://cdn.yourddo.com/latest.json',
      'https://cdn.yourddo.com/releases/81.0.1/1785691335/manifest.json',
      'https://cdn.yourddo.com/releases/81.0.1/1785691335/gear-planner/ring.json'
    ])
    expect(fetchMock.mock.calls[0][1]).toEqual({ cache: 'no-cache' })
    expect(fetchMock.mock.calls[1][1]).toBeUndefined()
    expect(fetchMock.mock.calls[2][1]).toBeUndefined()
  })

  it('reuses one resolved release across dataset loaders', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(latest))
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)
    const { loadEssenceCraftingData, loadGearPlannerItems } = await importClient()

    await loadGearPlannerItems('ring.json')
    await loadEssenceCraftingData()

    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(fetchMock.mock.calls.filter(([url]) => url === 'https://cdn.yourddo.com/latest.json')).toHaveLength(1)
    expect(
      fetchMock.mock.calls.filter(([url]) => url === 'https://cdn.yourddo.com/releases/81.0.1/1785691335/manifest.json')
    ).toHaveLength(1)
    expect(fetchMock.mock.calls[3][0]).toBe(
      'https://cdn.yourddo.com/releases/81.0.1/1785691335/manual/essenceCrafting.v2.json'
    )
  })

  it.each([
    ['gameVersion', { ...manifest, gameVersion: '82.0.0' }],
    ['dataVersion', { ...manifest, dataVersion: 1 }]
  ])('fails clearly when %s does not match latest', async (_field, mismatchedManifest) => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(jsonResponse(mismatchedManifest))
    )
    const { loadGearPlannerItems } = await importClient()

    await expect(loadGearPlannerItems('ring.json')).rejects.toThrow('Production data release mismatch')
  })

  it('fails clearly when a required manifest entry is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(jsonResponse({ ...manifest, generatedFiles: [] }))
    )
    const { loadGearPlannerItems } = await importClient()

    await expect(loadGearPlannerItems('ring.json')).rejects.toThrow(
      'Production data manifest is missing required file: gear-planner/ring.json'
    )
  })
})
