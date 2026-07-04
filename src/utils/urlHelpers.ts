export interface LocationLike {
  pathname: string
  search: string
}

export const resolveWindow = (win?: Window): Window | undefined => {
  return win ?? globalThis.window
}

export const readQueryParamFromLocation = (
  location: LocationLike,
  queryKey: string,
  win?: Window
): { value: string | null; source: 'search' | 'hash' | null } => {
  try {
    const routerParams = new URLSearchParams(location.search)
    const fromSearch = routerParams.get(queryKey)
    if (fromSearch) return { value: fromSearch, source: 'search' }

    const resolvedWindow = resolveWindow(win)
    if (!resolvedWindow) return { value: null, source: null }

    const hash = resolvedWindow.location.hash
    if (!hash.startsWith('#')) return { value: null, source: null }

    const hashBody = hash.slice(1)
    const queryIndex = hashBody.indexOf('?')
    if (queryIndex < 0) return { value: null, source: null }

    const query = hashBody.slice(queryIndex + 1)
    const hashParams = new URLSearchParams(query)
    const fromHash = hashParams.get(queryKey)
    if (fromHash) return { value: fromHash, source: 'hash' }
  } catch {
    // ignore
  }

  return { value: null, source: null }
}

export const removeQueryParamFromLocation = async (
  navigate: (to: { pathname?: string; search?: string }, opts: { replace: boolean }) => Promise<void> | void,
  location: LocationLike,
  source: 'search' | 'hash' | null,
  queryKey: string,
  win?: Window
): Promise<void> => {
  if (!source) return

  if (source === 'search') {
    await navigate({ pathname: location.pathname, search: '' }, { replace: true })
    return
  }

  const resolvedWindow = resolveWindow(win)
  if (!resolvedWindow || typeof resolvedWindow.history.replaceState !== 'function') return

  const { origin, pathname, hash, search } = resolvedWindow.location
  const hashBody = (hash || '').replace(/^#/, '')
  const [hashPath, hashQuery] = hashBody.split('?')
  const params = new URLSearchParams(hashQuery)

  params.delete(queryKey)

  const newHash = params.toString() ? `#${hashPath}?${params.toString()}` : `#${hashPath}`
  const newUrl = `${origin}${pathname}${search}${newHash}`
  resolvedWindow.history.replaceState({}, '', newUrl)
}

export const buildQueryParamUrl = (
  encoded: string,
  location: LocationLike,
  queryKey: string,
  defaultPath: string,
  win?: Window
): string => {
  const resolvedWindow = resolveWindow(win)
  if (!resolvedWindow) {
    return `${defaultPath}?${queryKey}=${encoded}`
  }

  const { origin, pathname, hash } = resolvedWindow.location
  const currentPath = location.pathname || defaultPath

  if (hash.startsWith('#/')) {
    const params = new URLSearchParams()
    params.set(queryKey, encoded)
    return `${origin}${pathname}#${currentPath}?${params.toString()}`
  }

  const url = new URL(origin + currentPath)
  url.searchParams.set(queryKey, encoded)
  return url.toString()
}
