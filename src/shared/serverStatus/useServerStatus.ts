import { useEffect, useState } from 'react'

type Feed = '/api' | '/api-lam'
type Availability = 'online' | 'offline' | 'unknown'

interface World {
  name: string
  region?: string
  legacy: boolean
  statusKey: string | null
  order: number
}

export interface WorldStatus extends World {
  status: Availability
}

const billingRoles = [
  'TurbineEmployee',
  'TurbineVIP',
  'StormreachLimited',
  'StormreachStandard',
  'StormreachGuest',
  'StormreachEUPre',
  '2021PlayersCouncil',
  'StreamerPreview'
]

async function fetchXml(path: string, signal: AbortSignal) {
  const response = await fetch(path, { signal, headers: { Accept: 'application/xml, text/xml' }, cache: 'no-store' })
  if (!response.ok) throw new Error('World service unavailable')
  const xml = new DOMParser().parseFromString(await response.text(), 'application/xml')
  if (xml.querySelector('parsererror')) throw new Error('Invalid world service response')
  return xml
}

export function readWorlds(xml: Document): World[] {
  const datacenter = [...xml.querySelectorAll('DatacenterStruct')].find(
    (dc) => dc.querySelector('KeyName')?.textContent.trim().toLowerCase() === 'ddo'
  )
  if (!datacenter?.querySelector('Worlds')) throw new Error('Missing DDO world directory')
  return [...datacenter.querySelectorAll('Worlds > World')]
    .flatMap((world) => {
      const title = world.querySelector('Name')?.textContent.trim()
      if (!title) return []
      const url = URL.parse(world.querySelector('StatusServerUrl')?.textContent.trim() ?? '')
      return [
        {
          name: title
            .split(/\[(?:Old|US|EU)\]/i)
            .map((part) => part.trim())
            .join(' ')
            .trim(),
          legacy: /\[Old\]/i.test(title),
          region: /\[(US|EU)\]/i.exec(title)?.[1].toUpperCase(),
          statusKey: url?.searchParams.get('s') ?? null,
          order: Number(world.querySelector('Order')?.textContent ?? 0)
        }
      ]
    })
    .sort((a, b) => a.order - b.order)
}

export function readAvailability(xml: Document): Availability {
  if (xml.documentElement.localName !== 'Status') return 'unknown'
  const allowed = new Set(
    xml
      .querySelector('allow_billing_role')
      ?.textContent.split(',')
      .map((role) => role.trim())
  )
  // The launcher reports login roles. Legacy considers a world public when three recognized roles are allowed.
  return billingRoles.filter((role) => allowed.has(role)).length >= 3 ? 'online' : 'offline'
}

async function checkWorlds(feed: Feed, worlds: World[], signal: AbortSignal): Promise<WorldStatus[]> {
  return Promise.all(
    worlds.map(async (world) => {
      let status: Availability = 'unknown'
      if (world.statusKey) {
        try {
          status = readAvailability(
            await fetchXml(`${feed}/status?${new URLSearchParams({ s: world.statusKey }).toString()}`, signal)
          )
        } catch {
          // A failed request provides no evidence that the world is offline.
        }
      }
      return { ...world, status }
    })
  )
}

interface Readings {
  worlds: WorldStatus[]
  legacy: World[]
  checkedAt: Date | null
  failed: boolean
}

function useWorldFeed(feed: Feed) {
  const [state, setState] = useState<Readings>({ worlds: [], legacy: [], checkedAt: null, failed: false })
  useEffect(() => {
    const lifetime = new AbortController()
    let timer: number
    let checking = false
    let nextCheck = 0
    async function poll() {
      if (document.hidden || checking || lifetime.signal.aborted) return
      checking = true
      window.clearTimeout(timer)
      const signal = AbortSignal.any([lifetime.signal, AbortSignal.timeout(15000)])
      try {
        const list = readWorlds(await fetchXml(feed + '/dc', signal))
        const worlds = await checkWorlds(
          feed,
          list.filter((world) => !world.legacy),
          signal
        )
        if (!lifetime.signal.aborted)
          setState({ worlds, legacy: list.filter((world) => world.legacy), checkedAt: new Date(), failed: false })
      } catch {
        if (!lifetime.signal.aborted)
          setState((previous) => ({
            ...previous,
            worlds: previous.worlds.map((world) => ({ ...world, status: 'unknown' })),
            failed: true
          }))
      } finally {
        checking = false
        if (!lifetime.signal.aborted) {
          nextCheck = Date.now() + 60000
          timer = window.setTimeout(() => {
            void poll()
          }, 60000)
        }
      }
    }
    function refresh() {
      if (Date.now() >= nextCheck) void poll()
    }
    refresh()
    document.addEventListener('visibilitychange', refresh)
    return () => {
      lifetime.abort()
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [feed])
  return state
}

export function useServerStatus() {
  const live = useWorldFeed('/api')
  const preview = useWorldFeed('/api-lam')
  return { live, preview }
}

export function useLegacyStatus(worlds: World[], open: boolean) {
  const [readings, setReadings] = useState<{ directory: World[]; statuses: WorldStatus[] } | null>(null)
  useEffect(() => {
    if (!open || !worlds.length) return
    const controller = new AbortController()
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000)])
    void checkWorlds('/api', worlds, signal).then((statuses) => {
      if (!controller.signal.aborted) setReadings({ directory: worlds, statuses })
    })
    return () => {
      controller.abort()
    }
  }, [worlds, open])
  return readings?.directory === worlds ? readings.statuses : null
}
