import { DEFAULT_DESCRIPTION, SITE_NAME } from './siteMeta.ts'

export interface SeoConfig {
  title: string
  description: string
  path?: string
  canonicalPath?: string
  noIndex?: boolean
}

const ROUTE_SEO_DATA = [
  ['/', 'YourDDO | DDO crafting tools and planners', DEFAULT_DESCRIPTION],
  [
    '/gear-planner',
    'DDO Gear Planner | YourDDO',
    'Plan DDO gear setups, augment slots, set bonuses, filigrees, and item conflicts with the YourDDO Gear Planner.'
  ],
  [
    '/essence-crafting',
    'DDO Essence Crafting Planner | YourDDO',
    'Browse and plan Essence Crafting recipes, augment options, and item upgrades with the YourDDO crafting tool.'
  ],
  [
    '/saga-tracker',
    'DDO Saga Tracker | YourDDO',
    'Track DDO saga progress, quests, and turn-ins with the YourDDO Saga Tracker.'
  ],
  [
    '/cauldron-of-cadence',
    'Cauldron of Cadence | YourDDO',
    'Look up Cauldron of Cadence items, effects, and set bonus associations in DDO.'
  ],
  [
    '/dinosaur-bone',
    'Dinosaur Bone Crafting | YourDDO',
    'Explore Dinosaur Bone crafting ingredients, item options, and upgrade paths.'
  ],
  [
    '/green-steel',
    'Heroic Green Steel | YourDDO',
    'Build and compare Heroic Green Steel recipes and ingredient requirements.'
  ],
  [
    '/legendary-green-steel',
    'Legendary Green Steel | YourDDO',
    'Build and compare Legendary Green Steel recipes and ingredient requirements.'
  ],
  [
    '/incredible-potential',
    'Incredible Potential | YourDDO',
    'Plan Incredible Potential item upgrades, materials, and results.'
  ],
  [
    '/nearly-finished',
    'Nearly Finished | YourDDO',
    'Track Nearly Finished crafting choices, upgrade paths, and item outcomes.'
  ],
  [
    '/viktranium-experiment',
    'Viktranium Experiment | YourDDO',
    'Work through the Viktranium Experiment crafting system and item options.'
  ],
  [
    '/monastery-of-the-scorpion',
    'Monastery of the Scorpion | YourDDO',
    'Solve the Monastery of the Scorpion puzzle with a focused DDO helper.'
  ],
  ['/reavers-fate', "Reaver's Fate | YourDDO", "Use the Reaver's Fate puzzle helper for faster DDO puzzle solving."],
  ['/the-shadow-crypt', 'The Shadow Crypt | YourDDO', 'Solve The Shadow Crypt puzzle with the YourDDO helper.'],
  ['/the-shroud', 'The Shroud | YourDDO', 'Solve The Shroud puzzle with the YourDDO helper.'],
  ['/total-chaos', 'Total Chaos | YourDDO', 'Use the Total Chaos puzzle helper for quicker DDO puzzle solving.']
] as const

const toSeoConfig = ([path, title, description]: (typeof ROUTE_SEO_DATA)[number]): SeoConfig => ({
  path,
  title,
  description
})

export const ROUTE_SEO: SeoConfig[] = ROUTE_SEO_DATA.map(toSeoConfig)

export const resolveSeo = (pathname: string): SeoConfig => {
  const exactMatch = ROUTE_SEO.find((route) => route.path === pathname)
  if (exactMatch) return exactMatch

  const prefixMatch = ROUTE_SEO.find(
    (route) => route.path != null && route.path !== '/' && pathname.startsWith(route.path)
  )
  if (prefixMatch) return prefixMatch

  return ROUTE_SEO[0]
}

export const normalizeCanonicalPath = (path: string) => {
  if (path === '/') return ''

  let normalized = path
  while (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}

export const buildStructuredData = (origin: string, seo: SeoConfig, canonicalUrl: string): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${origin}#organization`,
      name: SITE_NAME,
      url: origin,
      logo: `${origin}/web-app-manifest-512x512.png`
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}#website`,
      name: SITE_NAME,
      url: origin,
      description: DEFAULT_DESCRIPTION,
      publisher: {
        '@id': `${origin}#organization`
      }
    },
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: seo.title,
      description: seo.description,
      url: canonicalUrl,
      isPartOf: {
        '@id': `${origin}#website`
      },
      about: {
        '@id': `${origin}#organization`
      }
    },
    {
      '@type': 'WebApplication',
      '@id': `${canonicalUrl}#application`,
      name: SITE_NAME,
      url: canonicalUrl,
      description: seo.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      isPartOf: {
        '@id': `${origin}#website`
      }
    }
  ]
})
