import { afterEach, describe, expect, it, vi } from 'vitest'

const manifestUrl = 'https://cdn.yourddo.com/releases/81.0.1/1785743584/manifest.json'

const generatedFile = {
  domain: 'nearly-complete',
  path: 'nearly-complete/items.json',
  sizeBytes: 106699,
  sha256: '4bbcd24998df309a0cf5c6e75f7fffb0b1f9d6bf6b18a314df6bc5aae894c3a9'
}

const manualPayload = {
  name: 'nearlyComplete.recipes',
  path: 'manual/nearlyComplete.recipes.json',
  sizeBytes: 28289,
  sha256: 'e89c561e5c570c917d860367f72b316478ca75bfb4d061f9028fd9a1ac31e3af'
}

const manifest = {
  schemaVersion: 2,
  generatedFiles: [generatedFile],
  manualPayloads: [manualPayload]
}

const jsonResponse = (value: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(value), { status: 200, ...init })

const requestFailures: [string, () => Promise<Response>][] = [
  ['network failure', () => Promise.reject(new TypeError('Network error'))],
  ['HTTP failure', () => Promise.resolve(new Response(null, { status: 503, statusText: 'Unavailable' }))]
]

const importLoader = async (url = manifestUrl) => {
  vi.resetModules()
  vi.stubEnv('VITE_DATA_MANIFEST_URL', url)
  return import('./loadDataset.ts')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('loadDataset', () => {
  it('loads the single file matching the requested domain', async () => {
    const payload = [{ name: 'Nearly Complete Item' }]
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse(payload))
    vi.stubGlobal('fetch', fetchMock)
    const { loadDataset } = await importLoader()

    await expect(loadDataset<{ name: string }[]>('nearly-complete')).resolves.toEqual(payload)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      manifestUrl,
      'https://cdn.yourddo.com/releases/81.0.1/1785743584/nearly-complete/items.json'
    ])
  })

  it('loads the single manual payload matching the requested name', async () => {
    const payload = [{ name: 'Strength +6' }]
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse(payload))
    vi.stubGlobal('fetch', fetchMock)
    const { loadManualPayload } = await importLoader()

    await expect(loadManualPayload<{ name: string }[]>('nearlyComplete.recipes')).resolves.toEqual(payload)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      manifestUrl,
      'https://cdn.yourddo.com/releases/81.0.1/1785743584/manual/nearlyComplete.recipes.json'
    ])
  })

  it('resolves a root-relative manifest URL against the browser origin', async () => {
    vi.stubGlobal('location', { href: 'https://yourddo.com/nearly-complete' })
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(manifest))
      .mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)
    const { loadDataset } = await importLoader('/data-cdn/releases/81.0.1/1785743584/manifest.json')

    await loadDataset('nearly-complete')

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/data-cdn/releases/81.0.1/1785743584/manifest.json',
      'https://yourddo.com/data-cdn/releases/81.0.1/1785743584/nearly-complete/items.json'
    ])
  })

  it('rejects a missing manifest environment variable', async () => {
    const { loadDataset } = await importLoader('')

    await expect(loadDataset('nearly-complete')).rejects.toThrow('VITE_DATA_MANIFEST_URL is not configured')
  })

  it.each(requestFailures)('rejects a manifest %s', async (_name, createResponse) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockReturnValueOnce(createResponse()))
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Manifest request failed')
  })

  it('rejects invalid manifest JSON', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValueOnce(new Response('{')))
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Invalid data manifest response: expected valid JSON')
  })

  it.each([
    ['unsupported schema', { ...manifest, schemaVersion: 3 }, 'expected schemaVersion 2'],
    ['non-object response', null, 'expected an object'],
    ['missing generated files', { schemaVersion: 2, manualPayloads: [] }, 'invalid generatedFiles'],
    [
      'invalid generated file',
      { schemaVersion: 2, generatedFiles: [{ domain: 'nearly-complete' }], manualPayloads: [] },
      'invalid generatedFiles'
    ],
    ['missing manual payloads', { schemaVersion: 2, generatedFiles: [] }, 'invalid manualPayloads'],
    [
      'invalid manual payload',
      { schemaVersion: 2, generatedFiles: [], manualPayloads: [{ name: 'nearlyComplete.recipes' }] },
      'invalid manualPayloads'
    ]
  ])('rejects an invalid manifest: %s', async (_name, value, message) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(value)))
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow(message)
  })

  it('rejects an unknown domain', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(manifest)))
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-finished')).rejects.toThrow('Unknown dataset domain: nearly-finished')
  })

  it('rejects multiple files for one domain', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(
        jsonResponse({
          ...manifest,
          generatedFiles: [generatedFile, { ...generatedFile, path: 'nearly-complete/other.json' }]
        })
      )
    )
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow(
      'Data manifest contains multiple files for domain: nearly-complete'
    )
  })

  it('rejects an unknown manual payload', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(manifest)))
    const { loadManualPayload } = await importLoader()

    await expect(loadManualPayload('missing')).rejects.toThrow('Unknown manual payload: missing')
  })

  it('rejects multiple manual payloads with one name', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(
        jsonResponse({
          ...manifest,
          manualPayloads: [manualPayload, { ...manualPayload, path: 'manual/other.json' }]
        })
      )
    )
    const { loadManualPayload } = await importLoader()

    await expect(loadManualPayload('nearlyComplete.recipes')).rejects.toThrow(
      'Data manifest contains multiple manual payloads: nearlyComplete.recipes'
    )
  })

  it.each(requestFailures)('rejects a dataset %s', async (_name, createResponse) => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(manifest)).mockReturnValueOnce(createResponse())
    )
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Dataset request failed')
  })

  it.each(requestFailures)('rejects a manual payload %s', async (_name, createResponse) => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(manifest)).mockReturnValueOnce(createResponse())
    )
    const { loadManualPayload } = await importLoader()

    await expect(loadManualPayload('nearlyComplete.recipes')).rejects.toThrow('Manual payload request failed')
  })

  it('rejects invalid dataset JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(manifest)).mockResolvedValueOnce(new Response('{'))
    )
    const { loadDataset } = await importLoader()

    await expect(loadDataset('nearly-complete')).rejects.toThrow('Invalid dataset response: expected valid JSON')
  })

  it('rejects invalid manual payload JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse(manifest)).mockResolvedValueOnce(new Response('{'))
    )
    const { loadManualPayload } = await importLoader()

    await expect(loadManualPayload('nearlyComplete.recipes')).rejects.toThrow(
      'Invalid dataset response: expected valid JSON'
    )
  })
})
