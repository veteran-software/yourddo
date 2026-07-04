import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')

const DEFAULT_SITE_ORIGIN = 'https://yourddo.com'

const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/gear-planner', priority: '0.9', changefreq: 'weekly' },
  { path: '/essence-crafting', priority: '0.9', changefreq: 'weekly' },
  { path: '/saga-tracker', priority: '0.8', changefreq: 'weekly' },
  { path: '/cauldron-of-cadence', priority: '0.8', changefreq: 'monthly' },
  { path: '/dinosaur-bone', priority: '0.8', changefreq: 'monthly' },
  { path: '/green-steel', priority: '0.8', changefreq: 'monthly' },
  { path: '/legendary-green-steel', priority: '0.8', changefreq: 'monthly' },
  { path: '/incredible-potential', priority: '0.8', changefreq: 'monthly' },
  { path: '/nearly-finished', priority: '0.8', changefreq: 'monthly' },
  { path: '/viktranium-experiment', priority: '0.8', changefreq: 'monthly' },
  { path: '/monastery-of-the-scorpion', priority: '0.6', changefreq: 'monthly' },
  { path: '/reavers-fate', priority: '0.6', changefreq: 'monthly' },
  { path: '/the-shadow-crypt', priority: '0.6', changefreq: 'monthly' },
  { path: '/the-shroud', priority: '0.6', changefreq: 'monthly' },
  { path: '/total-chaos', priority: '0.6', changefreq: 'monthly' }
]

const trimTrailingSlashes = (value) => {
  let result = value
  while (result.length > 1 && result.endsWith('/')) {
    result = result.slice(0, -1)
  }
  return result
}

const resolveSiteOrigin = () => {
  const candidate = process.env.SITE_URL || process.env.VITE_SITE_URL || process.env.PUBLIC_URL || DEFAULT_SITE_ORIGIN

  try {
    return trimTrailingSlashes(new URL(candidate).origin)
  } catch {
    return trimTrailingSlashes(candidate)
  }
}

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const buildSitemap = (origin) => {
  const urls = ROUTES.map(({ path: routePath, changefreq, priority }) => {
    const url = `${origin}${routePath === '/' ? '' : routePath}`

    return [
      '  <url>',
      `    <loc>${escapeXml(url)}</loc>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>'
    ].join('\n')
  }).join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    ''
  ].join('\n')
}

const buildRobotsTxt = (origin) => ['User-agent: *', 'Allow: /', '', `Sitemap: ${origin}/sitemap.xml`, ''].join('\n')

const main = async () => {
  const origin = resolveSiteOrigin()

  await mkdir(publicDir, { recursive: true })
  await writeFile(path.join(publicDir, 'sitemap.xml'), buildSitemap(origin), 'utf8')
  await writeFile(path.join(publicDir, 'robots.txt'), buildRobotsTxt(origin), 'utf8')

  console.log(`Generated sitemap and robots for ${origin}`)
}

try {
  await main()
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
