interface GeneratedFile {
  domain: string
  path: string
  sizeBytes: number
  sha256: string
}

interface DataManifest {
  schemaVersion: 2
  generatedFiles: GeneratedFile[]
}

const isGeneratedFile = (value: unknown): value is GeneratedFile => {
  if (typeof value !== 'object' || value === null) return false

  const file = value as Record<string, unknown>
  return (
    typeof file.domain === 'string' &&
    typeof file.path === 'string' &&
    typeof file.sizeBytes === 'number' &&
    typeof file.sha256 === 'string'
  )
}

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

export const loadDataset = async <T>(domain: string): Promise<T> => {
  const configuredManifestUrl: unknown = import.meta.env.VITE_DATA_MANIFEST_URL

  if (typeof configuredManifestUrl !== 'string' || !configuredManifestUrl.trim()) {
    throw new Error('VITE_DATA_MANIFEST_URL is not configured')
  }

  const manifestUrl = configuredManifestUrl.trim()
  const manifestResponse = await fetchResponse(manifestUrl, 'Manifest')
  const manifest = await parseManifest(manifestResponse)
  const matches = manifest.generatedFiles.filter((file) => file.domain === domain)

  if (matches.length === 0) {
    throw new Error(`Unknown dataset domain: ${domain}`)
  }

  if (matches.length > 1) {
    throw new Error(`Data manifest contains multiple files for domain: ${domain}`)
  }

  const manifestBaseUrl = URL.canParse(manifestUrl)
    ? new URL(manifestUrl)
    : new URL(manifestUrl, globalThis.location.href)
  const datasetUrl = new URL(matches[0].path, manifestBaseUrl).toString()
  const datasetResponse = await fetchResponse(datasetUrl, 'Dataset')

  return parseDataset<T>(datasetResponse)
}
