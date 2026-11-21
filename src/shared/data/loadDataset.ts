interface GeneratedFile {
  domain: string
  path: string
  sizeBytes: number
  sha256: string
}

interface ManualPayload {
  name: string
  path: string
  sizeBytes: number
  sha256: string
}

interface LatestRelease {
  gameVersion: string
  dataVersion: number
  baseUrl: string
}

interface DataManifest {
  schemaVersion: 2
  gameVersion: string
  dataVersion: number
  generatedFiles: GeneratedFile[]
  manualPayloads: ManualPayload[]
}

export class UnsupportedManifestSchemaError extends Error {
  constructor(schemaVersion: unknown) {
    super(`Invalid data manifest response: expected schemaVersion 2, received ${String(schemaVersion)}`)
    this.name = 'UnsupportedManifestSchemaError'
  }
}

const cdnBaseUrl = import.meta.env.DEV ? '/data-cdn' : 'https://cdn.yourddo.com'

const isManifestFile = (value: unknown): value is Omit<GeneratedFile, 'domain'> => {
  if (typeof value !== 'object' || value === null) return false

  const file = value as Record<string, unknown>
  return typeof file.path === 'string' && typeof file.sizeBytes === 'number' && typeof file.sha256 === 'string'
}

const isGeneratedFile = (value: unknown): value is GeneratedFile =>
  isManifestFile(value) && typeof (value as Record<string, unknown>).domain === 'string'

const isManualPayload = (value: unknown): value is ManualPayload =>
  isManifestFile(value) && typeof (value as Record<string, unknown>).name === 'string'

const parseJson = async (response: Response, label: string): Promise<unknown> => {
  try {
    return await response.json()
  } catch (cause) {
    throw new Error(`Invalid ${label} response: expected valid JSON`, { cause })
  }
}

const parseLatestRelease = async (response: Response): Promise<LatestRelease> => {
  const value = await parseJson(response, 'latest release')

  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid latest release response: expected an object')
  }

  const latest = value as Record<string, unknown>

  if (
    typeof latest.gameVersion !== 'string' ||
    typeof latest.dataVersion !== 'number' ||
    typeof latest.baseUrl !== 'string'
  ) {
    throw new Error('Invalid latest release response: invalid release metadata')
  }

  return latest as unknown as LatestRelease
}

const parseManifest = async (response: Response): Promise<DataManifest> => {
  const value = await parseJson(response, 'data manifest')

  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid data manifest response: expected an object')
  }

  const manifest = value as Record<string, unknown>

  if (manifest.schemaVersion !== 2) {
    throw new UnsupportedManifestSchemaError(manifest.schemaVersion)
  }

  if (typeof manifest.gameVersion !== 'string' || typeof manifest.dataVersion !== 'number') {
    throw new Error('Invalid data manifest response: invalid release metadata')
  }

  if (!Array.isArray(manifest.generatedFiles) || !manifest.generatedFiles.every(isGeneratedFile)) {
    throw new Error('Invalid data manifest response: invalid generatedFiles')
  }

  if (!Array.isArray(manifest.manualPayloads) || !manifest.manualPayloads.every(isManualPayload)) {
    throw new Error('Invalid data manifest response: invalid manualPayloads')
  }

  return manifest as unknown as DataManifest
}

const fetchResponse = async (url: string, label: string, init?: RequestInit): Promise<Response> => {
  let response: Response

  try {
    response = await fetch(url, init)
  } catch (cause) {
    throw new Error(`${label} request failed: ${url}`, { cause })
  }

  if (!response.ok) {
    throw new Error(`${label} request failed: ${response.status.toString()} ${response.statusText}`)
  }

  return response
}

const parseDataset = async <T>(response: Response): Promise<T> => {
  try {
    return (await response.json()) as T
  } catch (cause) {
    throw new Error('Invalid dataset response: expected valid JSON', { cause })
  }
}

interface ResolvedRelease {
  manifest: DataManifest
  baseUrl: string
}

let releasePromise: Promise<ResolvedRelease> | undefined

const joinUrl = (baseUrl: string, path: string): string => `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`

const resolveRelease = async (): Promise<ResolvedRelease> => {
  const latestResponse = await fetchResponse(joinUrl(cdnBaseUrl, 'latest.json'), 'Latest release', {
    cache: 'no-cache'
  })
  const latest = await parseLatestRelease(latestResponse)
  const baseUrl = joinUrl(cdnBaseUrl, latest.baseUrl)
  const manifestResponse = await fetchResponse(joinUrl(baseUrl, 'manifest.json'), 'Manifest')
  const manifest = await parseManifest(manifestResponse)

  if (manifest.gameVersion !== latest.gameVersion || manifest.dataVersion !== latest.dataVersion) {
    throw new Error(
      `Data release mismatch: latest is ${latest.gameVersion}/${latest.dataVersion.toString()}, ` +
        `but manifest is ${manifest.gameVersion}/${manifest.dataVersion.toString()}`
    )
  }

  return { manifest, baseUrl }
}

const loadRelease = (): Promise<ResolvedRelease> => {
  releasePromise ??= resolveRelease().catch((cause: unknown) => {
    releasePromise = undefined
    throw cause
  })

  return releasePromise
}

export const loadDataset = async <T>(domain: string): Promise<T> => {
  const { manifest, baseUrl } = await loadRelease()
  const matches = manifest.generatedFiles.filter((file) => file.domain === domain)

  if (matches.length === 0) {
    throw new Error(`Unknown dataset domain: ${domain}`)
  }

  if (matches.length > 1) {
    throw new Error(`Data manifest contains multiple files for domain: ${domain}`)
  }

  const datasetUrl = joinUrl(baseUrl, matches[0].path)
  const datasetResponse = await fetchResponse(datasetUrl, 'Dataset')

  return parseDataset<T>(datasetResponse)
}

export const loadDatasetFile = async <T>(path: string): Promise<T> => {
  const { manifest, baseUrl } = await loadRelease()
  const match = manifest.generatedFiles.find((file) => file.path === path)

  if (!match) {
    throw new Error(`Unknown dataset file: ${path}`)
  }

  const datasetResponse = await fetchResponse(joinUrl(baseUrl, match.path), 'Dataset')

  return parseDataset<T>(datasetResponse)
}

export const loadManualPayload = async <T>(name: string): Promise<T> => {
  const { manifest, baseUrl } = await loadRelease()
  const matches = manifest.manualPayloads.filter((payload) => payload.name === name)

  if (matches.length === 0) {
    throw new Error(`Unknown manual payload: ${name}`)
  }

  if (matches.length > 1) {
    throw new Error(`Data manifest contains multiple manual payloads: ${name}`)
  }

  const payloadUrl = joinUrl(baseUrl, matches[0].path)
  const payloadResponse = await fetchResponse(payloadUrl, 'Manual payload')

  return parseDataset<T>(payloadResponse)
}
