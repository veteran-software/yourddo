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

interface DataManifest {
  schemaVersion: 2
  generatedFiles: GeneratedFile[]
  manualPayloads: ManualPayload[]
}

const isManifestFile = (value: unknown): value is Omit<GeneratedFile, 'domain'> => {
  if (typeof value !== 'object' || value === null) return false

  const file = value as Record<string, unknown>
  return typeof file.path === 'string' && typeof file.sizeBytes === 'number' && typeof file.sha256 === 'string'
}

const isGeneratedFile = (value: unknown): value is GeneratedFile =>
  isManifestFile(value) && typeof (value as Record<string, unknown>).domain === 'string'

const isManualPayload = (value: unknown): value is ManualPayload =>
  isManifestFile(value) && typeof (value as Record<string, unknown>).name === 'string'

const parseManifest = async (response: Response): Promise<DataManifest> => {
  let value: unknown

  try {
    value = await response.json()
  } catch (cause) {
    throw new Error('Invalid data manifest response: expected valid JSON', { cause })
  }

  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid data manifest response: expected an object')
  }

  const manifest = value as Record<string, unknown>

  if (manifest.schemaVersion !== 2) {
    throw new Error('Invalid data manifest response: expected schemaVersion 2')
  }

  if (!Array.isArray(manifest.generatedFiles) || !manifest.generatedFiles.every(isGeneratedFile)) {
    throw new Error('Invalid data manifest response: invalid generatedFiles')
  }

  if (!Array.isArray(manifest.manualPayloads) || !manifest.manualPayloads.every(isManualPayload)) {
    throw new Error('Invalid data manifest response: invalid manualPayloads')
  }

  return manifest as unknown as DataManifest
}

const fetchResponse = async (url: string, label: string): Promise<Response> => {
  let response: Response

  try {
    response = await fetch(url)
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

interface ResolvedManifest {
  manifest: DataManifest
  manifestUrl: string
}

const loadManifest = async (): Promise<ResolvedManifest> => {
  const configuredManifestUrl: unknown = import.meta.env.VITE_DATA_MANIFEST_URL

  if (typeof configuredManifestUrl !== 'string' || !configuredManifestUrl.trim()) {
    throw new Error('VITE_DATA_MANIFEST_URL is not configured')
  }

  const manifestUrl = configuredManifestUrl.trim()
  const manifestResponse = await fetchResponse(manifestUrl, 'Manifest')
  const manifest = await parseManifest(manifestResponse)

  return { manifest, manifestUrl }
}

const resolveManifestPath = (manifestUrl: string, path: string): string => {
  const manifestBaseUrl = URL.canParse(manifestUrl)
    ? new URL(manifestUrl)
    : new URL(manifestUrl, globalThis.location.href)

  return new URL(path, manifestBaseUrl).toString()
}

export const loadDataset = async <T>(domain: string): Promise<T> => {
  const { manifest, manifestUrl } = await loadManifest()
  const matches = manifest.generatedFiles.filter((file) => file.domain === domain)

  if (matches.length === 0) {
    throw new Error(`Unknown dataset domain: ${domain}`)
  }

  if (matches.length > 1) {
    throw new Error(`Data manifest contains multiple files for domain: ${domain}`)
  }

  const datasetUrl = resolveManifestPath(manifestUrl, matches[0].path)
  const datasetResponse = await fetchResponse(datasetUrl, 'Dataset')

  return parseDataset<T>(datasetResponse)
}

export const loadManualPayload = async <T>(name: string): Promise<T> => {
  const { manifest, manifestUrl } = await loadManifest()
  const matches = manifest.manualPayloads.filter((payload) => payload.name === name)

  if (matches.length === 0) {
    throw new Error(`Unknown manual payload: ${name}`)
  }

  if (matches.length > 1) {
    throw new Error(`Data manifest contains multiple manual payloads: ${name}`)
  }

  const payloadUrl = resolveManifestPath(manifestUrl, matches[0].path)
  const payloadResponse = await fetchResponse(payloadUrl, 'Manual payload')

  return parseDataset<T>(payloadResponse)
}
