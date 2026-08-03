import { afterEach, describe, expect, it, vi } from 'vitest'

const latest = {
  gameVersion: '81.0.1',
  dataVersion: 1785745211,
  baseUrl: '/releases/81.0.1/1785745211'
}

const generatedFile = {
  domain: 'nearly-complete',
  path: 'nearly-complete/items.json',
  sizeBytes: 106699,
  sha256: 'items'
}

const manualPayload = {
  name: 'nearlyComplete.recipes',
  path: 'manual/nearlyComplete.recipes.json',
  sizeBytes: 28289,
  sha256: 'recipes'
}

const manifest = {
  schemaVersion: 2,
  gameVersion: latest.gameVersion,
  dataVersion: latest.dataVersion,
  generatedFiles: [generatedFile],
  manualPayloads: [manualPayload]
}

const jsonResponse = (value: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(value), { status: 200, ...init })

const requestFailures: [string, () => Promise<Response>][] = [
  ['network failure', () => Promise.reject(new TypeError('Network error'))],
  ['HTTP failure', () => Promise.resolve(new Response(null, { status: 503, statusText: 'Unavailable' }))]
]

const importLoader = async (development = true) => {
  vi.resetModules()
  vi.stubEnv('DEV', development)
  return import('./loadDataset.ts')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('loadDataset', () => {
  it('resolves the latest release and loads a generated dataset through the development proxy', async () => {
    const payload = [{ name: 'Nearly Complete Item' }]
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(latest))
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse(payload))
    vi.stubGlobal('fetch', fetchMock)
    const { loadDataset } = await importLoader()

    await expect(loadDataset<{ name: string }[]>('nearly-complete')).resolves.toEqual(payload)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/data-cdn/latest.json',
      '/data-cdn/releases/81.0.1/1785745211/manifest.json',
      '/data-cdn/releases/81.0.1/1785745211/nearly-complete/items.json'
    ])
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({ cache: 'no-cache' })
  })

  it('loads a manual payload directly from the production CDN', async () => {
    const payload = [{ name: 'Strength +6' }]
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(latest))
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse(payload))
    vi.stubGlobal('fetch', fetchMock)
    const { loadManualPayload } = await importLoader(false)

    await expect(loadManualPayload<{ name: string }[]>('nearlyComplete.recipes')).resolves.toEqual(payload)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://cdn.yourddo.com/latest.json',
      'https://cdn.yourddo.com/releases/81.0.1/1785745211/manifest.json',
      'https://cdn.yourddo.com/releases/81.0.1/1785745211/manual/nearlyComplete.recipes.json'
    ])
  })

  it('reuses one release lookup across dataset loads', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(latest))
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)
    const { loadDataset, loadManualPayload } = await importLoader()

    await Promise.all([loadDataset('nearly-complete'), loadManualPayload('nearlyComplete.recipes')])

    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(fetchMock.mock.calls.filter(([url]) => url === '/data-cdn/latest.json')).toHaveLength(1)
    expect(
      fetchMock.mock.calls.filter(([url]) => url === '/data-cdn/releases/81.0.1/1785745211/manifest.json')
    ).toHaveLength(1)
  })

  it('retries release discovery after a failed request', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce(jsonResponse(latest))
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Latest release request failed')
    await expect(loadDataset('nearly-complete')).resolves.toEqual([])
  })

  it.each(requestFailures)('rejects a latest release %s', async (_name, createResponse) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockReturnValueOnce(createResponse()))
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Latest release request failed')
  })

  it('rejects invalid latest release JSON', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValueOnce(new Response('{')))
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Invalid latest release response: expected valid JSON')
  })

  it.each([
    ['non-object response', null, 'expected an object'],
    ['missing release metadata', { gameVersion: '81.0.1' }, 'invalid release metadata']
  ])('rejects an invalid latest release: %s', async (_name, value, message) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(value)))
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow(message)
  })

  it.each(requestFailures)('rejects a manifest %s', async (_name, createResponse) => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(latest)).mockReturnValueOnce(createResponse())
    )
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Manifest request failed')
  })

  it('rejects invalid manifest JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(latest)).mockResolvedValueOnce(new Response('{'))
    )
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Invalid data manifest response: expected valid JSON')
  })

  it('reports an unsupported manifest schema with a typed error', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(jsonResponse({ ...manifest, schemaVersion: 3 }))
    )
    const { loadDataset, UnsupportedManifestSchemaError } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toBeInstanceOf(UnsupportedManifestSchemaError)
  })

  it.each([
    ['unsupported schema', { ...manifest, schemaVersion: 3 }, 'expected schemaVersion 2'],
    ['non-object response', null, 'expected an object'],
    [
      'missing release metadata',
      { schemaVersion: 2, generatedFiles: [], manualPayloads: [] },
      'invalid release metadata'
    ],
    ['missing generated files', { ...manifest, generatedFiles: undefined }, 'invalid generatedFiles'],
    [
      'invalid generated file',
      { ...manifest, generatedFiles: [{ domain: 'nearly-complete' }] },
      'invalid generatedFiles'
    ],
    ['missing manual payloads', { ...manifest, manualPayloads: undefined }, 'invalid manualPayloads'],
    [
      'invalid manual payload',
      { ...manifest, manualPayloads: [{ name: 'nearlyComplete.recipes' }] },
      'invalid manualPayloads'
    ]
  ])('rejects an invalid manifest: %s', async (_name, value, message) => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(latest)).mockResolvedValueOnce(jsonResponse(value))
    )
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow(message)
  })

  it('rejects a release identity mismatch', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(jsonResponse({ ...manifest, dataVersion: 1 }))
    )
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Data release mismatch')
  })

  it('rejects an unknown or duplicated domain', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(latest)).mockResolvedValueOnce(jsonResponse(manifest))
    )
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-finished')).rejects.toThrow('Unknown dataset domain: nearly-finished')

    vi.resetModules()
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(
          jsonResponse({
            ...manifest,
            generatedFiles: [generatedFile, { ...generatedFile, path: 'nearly-complete/other.json' }]
          })
        )
    )
    const duplicateLoader = await import('./loadDataset.ts')

    await expect(duplicateLoader.loadDataset('nearly-complete')).rejects.toThrow(
      'Data manifest contains multiple files for domain: nearly-complete'
    )
  })

  it('rejects an unknown or duplicated manual payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(latest)).mockResolvedValueOnce(jsonResponse(manifest))
    )
    const { loadManualPayload } = await importLoader()

    await expect(loadManualPayload('missing')).rejects.toThrow('Unknown manual payload: missing')

    vi.resetModules()
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(
          jsonResponse({
            ...manifest,
            manualPayloads: [manualPayload, { ...manualPayload, path: 'manual/other.json' }]
          })
        )
    )
    const duplicateLoader = await import('./loadDataset.ts')

    await expect(duplicateLoader.loadManualPayload('nearlyComplete.recipes')).rejects.toThrow(
      'Data manifest contains multiple manual payloads: nearlyComplete.recipes'
    )
  })

  it.each([
    ['dataset', 'nearly-complete', 'Dataset request failed'],
    ['manual payload', 'nearlyComplete.recipes', 'Manual payload request failed']
  ])('rejects a %s request failure', async (kind, value, message) => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(jsonResponse(manifest))
        .mockResolvedValueOnce(new Response(null, { status: 503, statusText: 'Unavailable' }))
    )
    const loader = await importLoader()

    const promise = kind === 'dataset' ? loader.loadDataset(value) : loader.loadManualPayload(value)
    await expect(promise).rejects.toThrow(message)
  })

  it.each([
    ['dataset', 'nearly-complete'],
    ['manual payload', 'nearlyComplete.recipes']
  ])('rejects invalid %s JSON', async (kind, value) => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse(latest))
        .mockResolvedValueOnce(jsonResponse(manifest))
        .mockResolvedValueOnce(new Response('{'))
    )
    const loader = await importLoader()

    const promise = kind === 'dataset' ? loader.loadDataset(value) : loader.loadManualPayload(value)
    await expect(promise).rejects.toThrow('Invalid dataset response: expected valid JSON')
  })
})
