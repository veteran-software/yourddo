import { afterEach, expect, it, vi } from 'vitest'

const release = { gameVersion: '82.1.0', dataVersion: 1, baseUrl: '/releases/82.1.0/1' }
const file = (path: string) => ({ path: 'alchemical/' + path, domain: 'alchemical', sizeBytes: 1, sha256: 'hash' })
const manifest = (paths: string[]) => ({
  schemaVersion: 2,
  ...release,
  generatedFiles: paths.map(file),
  manualPayloads: []
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

it('keeps the legacy item index usable when a release predates the crafting catalog', async () => {
  const items = [{ name: 'Alchemical item' }]
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(Response.json(release))
    .mockResolvedValueOnce(Response.json(manifest(['items.json'])))
    .mockResolvedValueOnce(Response.json(items))
  vi.stubGlobal('fetch', fetchMock)
  const { loadOptionalAlchemicalData } = await import('./loadAlchemicalData')
  const { loadDatasetFile } = await import('../../shared/data/loadDataset')
  expect(await loadOptionalAlchemicalData()).toBeUndefined()
  expect(await loadDatasetFile('alchemical/items.json')).toEqual(items)
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

it('reports an incomplete published catalog and retries the manifest after a failure', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(Response.json(release))
    .mockResolvedValueOnce(Response.json(manifest(['items.json', 'manifest.json'])))
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockResolvedValueOnce(Response.json({ system: 'alchemical', devices: {}, resources: {} }))
  vi.stubGlobal('fetch', fetchMock)
  const { loadOptionalAlchemicalData } = await import('./loadAlchemicalData')
  await expect(loadOptionalAlchemicalData()).rejects.toThrow('503')
  await expect(loadOptionalAlchemicalData()).rejects.toThrow('Missing Alchemical crafting resource')
})
