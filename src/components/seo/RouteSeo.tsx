import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { getSubdomain } from '../../utils/utils'

interface SeoConfig {
  title: string
  description: string
  path?: string
  canonicalPath?: string
  noIndex?: boolean
}

const SITE_NAME = 'YourDDO'
const DEFAULT_DESCRIPTION =
  'YourDDO is a DDO crafting and planning toolkit for gear, augments, set bonuses, essence crafting, and saga tracking.'

const ROUTE_SEO: SeoConfig[] = [
  {
    path: '/',
    title: 'YourDDO | DDO crafting tools and planners',
    description: DEFAULT_DESCRIPTION
  },
  {
    path: '/gear-planner',
    title: 'Gear Planner | YourDDO',
    description:
      'Plan DDO gear setups, augment slots, set bonuses, filigrees, and item conflicts with the YourDDO Gear Planner.'
  },
  {
    path: '/essence-crafting',
    title: 'Essence Crafting | YourDDO',
    description:
      'Browse and plan Essence Crafting recipes, augment options, and item upgrades with the YourDDO crafting tool.'
  },
  {
    path: '/saga-tracker',
    title: 'Saga Tracker | YourDDO',
    description: 'Track DDO saga progress, quests, and turn-ins with the YourDDO Saga Tracker.'
  },
  {
    path: '/cauldron-of-cadence',
    title: 'Cauldron of Cadence | YourDDO',
    description: 'Look up Cauldron of Cadence items, effects, and set bonus associations in DDO.'
  },
  {
    path: '/dinosaur-bone',
    title: 'Dinosaur Bone Crafting | YourDDO',
    description: 'Explore Dinosaur Bone crafting ingredients, item options, and upgrade paths.'
  },
  {
    path: '/green-steel',
    title: 'Heroic Green Steel | YourDDO',
    description: 'Build and compare Heroic Green Steel recipes and ingredient requirements.'
  },
  {
    path: '/legendary-green-steel',
    title: 'Legendary Green Steel | YourDDO',
    description: 'Build and compare Legendary Green Steel recipes and ingredient requirements.'
  },
  {
    path: '/incredible-potential',
    title: 'Incredible Potential | YourDDO',
    description: 'Plan Incredible Potential item upgrades, materials, and results.'
  },
  {
    path: '/nearly-finished',
    title: 'Nearly Finished | YourDDO',
    description: 'Track Nearly Finished crafting choices, upgrade paths, and item outcomes.'
  },
  {
    path: '/viktranium-experiment',
    title: 'Viktranium Experiment | YourDDO',
    description: 'Work through the Viktranium Experiment crafting system and item options.'
  },
  {
    path: '/monastery-of-the-scorpion',
    title: 'Monastery of the Scorpion | YourDDO',
    description: 'Solve the Monastery of the Scorpion puzzle with a focused DDO helper.'
  },
  {
    path: '/reavers-fate',
    title: "Reaver's Fate | YourDDO",
    description: "Use the Reaver's Fate puzzle helper for faster DDO puzzle solving."
  },
  {
    path: '/the-key-to-the-mythal',
    title: 'The Key to the Mythal | YourDDO',
    description: 'Use the Key to the Mythal puzzle helper for faster DDO puzzle solving.'
  },
  {
    path: '/the-shadow-crypt',
    title: 'The Shadow Crypt | YourDDO',
    description: 'Solve The Shadow Crypt puzzle with the YourDDO helper.'
  },
  {
    path: '/the-shroud',
    title: 'The Shroud | YourDDO',
    description: 'Solve The Shroud puzzle with the YourDDO helper.'
  },
  {
    path: '/total-chaos',
    title: 'Total Chaos | YourDDO',
    description: 'Use the Total Chaos puzzle helper for quicker DDO puzzle solving.'
  }
]

const setMetaTagByName = (name: string, value: string) => {
  const selector = `meta[name="${name}"]`
  const tag = document.head.querySelector<HTMLMetaElement>(selector) ?? document.createElement('meta')

  if (!tag.isConnected) {
    tag.setAttribute('name', name)
    document.head.append(tag)
  }

  tag.content = value
}

const setMetaTagByProperty = (property: string, value: string) => {
  const selector = `meta[property="${property}"]`
  const tag = document.head.querySelector<HTMLMetaElement>(selector) ?? document.createElement('meta')

  if (!tag.isConnected) {
    tag.setAttribute('property', property)
    document.head.append(tag)
  }

  tag.content = value
}

const setLinkHref = (selector: string, href: string) => {
  const tag = document.head.querySelector<HTMLLinkElement>(selector) ?? document.createElement('link')

  if (!tag.isConnected) {
    tag.rel = 'canonical'
    document.head.append(tag)
  }

  tag.href = href
}

const resolveSeo = (pathname: string): SeoConfig => {
  const exactMatch = ROUTE_SEO.find((route) => route.path === pathname)
  if (exactMatch) return exactMatch

  const prefixMatch = ROUTE_SEO.find(
    (route) => route.path != null && route.path !== '/' && pathname.startsWith(route.path)
  )
  if (prefixMatch) return prefixMatch

  return ROUTE_SEO[0]
}

const normalizeCanonicalPath = (path: string) => {
  if (path === '/') return ''

  let normalized = path
  while (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}

const RouteSeo = () => {
  const location = useLocation()

  const seo = useMemo(() => {
    const base = resolveSeo(location.pathname)
    const isDevelop = getSubdomain() === 'develop'

    return {
      ...base,
      noIndex: base.noIndex ?? isDevelop,
      canonicalPath: base.canonicalPath ?? base.path ?? location.pathname
    }
  }, [location.pathname])

  useEffect(() => {
    const origin = window.location.origin
    const canonicalUrl = `${origin}${normalizeCanonicalPath(seo.canonicalPath)}`

    document.title = seo.title
    setMetaTagByName('description', seo.description)
    setMetaTagByName('robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow')
    setMetaTagByProperty('og:site_name', SITE_NAME)
    setMetaTagByProperty('og:title', seo.title)
    setMetaTagByProperty('og:description', seo.description)
    setMetaTagByProperty('og:type', 'website')
    setMetaTagByProperty('og:url', canonicalUrl)
    setMetaTagByProperty('og:image', `${origin}${logo}`)
    setMetaTagByName('twitter:card', 'summary_large_image')
    setMetaTagByName('twitter:title', seo.title)
    setMetaTagByName('twitter:description', seo.description)
    setMetaTagByName('twitter:image', `${origin}${logo}`)
    setLinkHref('link[rel="canonical"]', canonicalUrl)
  }, [seo])

  return null
}

export default RouteSeo
