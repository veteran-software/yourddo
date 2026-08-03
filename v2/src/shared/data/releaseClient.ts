export interface LatestRelease {
  gameVersion: string
  dataVersion: number
  baseUrl: string
}

export interface ReleaseFile {
  domain: string
  path: string
  sizeBytes: number
  sha256: string
}

export interface ManualPayload {
  name: string
  path: string
  sizeBytes: number
  sha256: string
}

export interface ReleaseDomain {
  domain: string
  fileCount: number
  sizeBytes: number
  sha256: string
}

export interface ReleaseManifest {
  schemaVersion: 2
  gameVersion: string
  dataVersion: number
  masterDatasetSha256: string
  releaseFingerprint: string
  manualPayloads: ManualPayload[]
  domains: ReleaseDomain[]
  generatedFiles: ReleaseFile[]
}

interface ResolvedRelease {
  baseUrl: string
  manifest: ReleaseManifest
}

type ReleaseManifestResponse = Omit<ReleaseManifest, 'schemaVersion'> & { schemaVersion: number }

let releasePromise: Promise<ResolvedRelease> | undefined
const datasetPromises = new Map<string, Promise<unknown>>()

const getCdnBaseUrl = (): string => {
  const value: unknown = import.meta.env.VITE_DATA_CDN_BASE_URL

  if (typeof value !== 'string' || !value) {
    throw new Error('VITE_DATA_CDN_BASE_URL is not configured')
  }

  return value.replace(/\/$/, '')
}

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)

  if (!response.ok) {
    throw new Error(`Failed to load production data (${response.status.toString()} ${response.statusText})`)
  }

  return (await response.json()) as T
}

const resolveRelease = async (): Promise<ResolvedRelease> => {
  const cdnBaseUrl = getCdnBaseUrl()
  const latest = await fetchJson<LatestRelease>(`${cdnBaseUrl}/latest.json`, { cache: 'no-cache' })
  const baseUrl = `${cdnBaseUrl}${latest.baseUrl}`
  const response = await fetchJson<ReleaseManifestResponse>(`${baseUrl}/manifest.json`)

  if (response.schemaVersion !== 2) {
    throw new Error(`Unsupported production data manifest schema: ${String(response.schemaVersion)}`)
  }

  const manifest: ReleaseManifest = { ...response, schemaVersion: response.schemaVersion }

  if (manifest.gameVersion !== latest.gameVersion || manifest.dataVersion !== latest.dataVersion) {
    throw new Error(
      `Production data release mismatch: latest is ${latest.gameVersion}/${latest.dataVersion.toString()}, ` +
        `but manifest is ${manifest.gameVersion}/${manifest.dataVersion.toString()}`
    )
  }

  return { baseUrl, manifest }
}

const getRelease = (): Promise<ResolvedRelease> => {
  releasePromise ??= resolveRelease()
  return releasePromise
}

export const loadGeneratedDataset = async <T>(domain: string, path: string): Promise<T> => {
  const key = `${domain}:${path}`
  const existing = datasetPromises.get(key)
  if (existing) return existing as Promise<T>

  const promise = getRelease().then(({ baseUrl, manifest }) => {
    const file = manifest.generatedFiles.find((entry) => entry.domain === domain && entry.path === path)

    if (!file) {
      throw new Error(`Production data manifest is missing required file: ${path}`)
    }

    return fetchJson<T>(`${baseUrl}/${file.path}`)
  })

  datasetPromises.set(key, promise)
  return promise
}
