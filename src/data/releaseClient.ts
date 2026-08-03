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
  schemaVersion: number
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
  const manifest = await fetchJson<ReleaseManifest>(`${baseUrl}/manifest.json`)

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

const loadReleaseFile = async <T>(path: string): Promise<T> => {
  const existing = datasetPromises.get(path)
  if (existing) {
    return existing as Promise<T>
  }

  const promise = getRelease().then(({ baseUrl }) => fetchJson<T>(`${baseUrl}/${path}`))
  datasetPromises.set(path, promise)
  return promise
}

const loadGeneratedFile = async <T>(domain: string, path: string): Promise<T> => {
  const release = await getRelease()
  const file = release.manifest.generatedFiles.find((entry) => entry.domain === domain && entry.path === path)

  if (!file) {
    throw new Error(`Production data manifest is missing required file: ${path}`)
  }

  return loadReleaseFile<T>(file.path)
}

export const loadGearPlannerItems = <T>(fileName: string): Promise<T> =>
  loadGeneratedFile<T>('gear-planner', `gear-planner/${fileName}`)

export const loadGearPlannerAugments = <T>(): Promise<T> => loadGearPlannerItems<T>('augment.json')

export const loadGearPlannerFiligreeSets = <T>(): Promise<T> => loadGearPlannerItems<T>('filigreeSets.json')

export const loadGearPlannerSetBonusIndex = <T>(): Promise<T> => loadGearPlannerItems<T>('setBonusIndex.json')

export const loadEssenceCraftingData = async <T>(): Promise<T> => {
  const release = await getRelease()
  const payload = release.manifest.manualPayloads.find((entry) => entry.name === 'essenceCrafting.v2')

  if (!payload) {
    throw new Error('Production data manifest is missing required file: essenceCrafting.v2')
  }

  return loadReleaseFile<T>(payload.path)
}
