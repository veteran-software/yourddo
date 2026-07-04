export interface SeoConfig {
  title: string
  description: string
  path?: string
  canonicalPath?: string
  noIndex?: boolean
}

export const SITE_NAME = 'YourDDO'

export const DEFAULT_DESCRIPTION =
  'YourDDO is a DDO crafting and planning toolkit for gear, augments, set bonuses, essence crafting, and saga tracking.'

export const ROUTE_SEO: SeoConfig[] = [
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
    }
  ]
})
