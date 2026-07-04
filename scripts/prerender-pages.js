import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const ssrBundlePath = path.join(rootDir, 'dist-ssr', 'entry-server.js')
const templatePath = path.join(distDir, 'index.html')

const ROUTES_TO_PRERENDER = [
  '/',
  '/gear-planner',
  '/essence-crafting',
  '/saga-tracker',
  '/cauldron-of-cadence',
  '/dinosaur-bone',
  '/green-steel',
  '/incredible-potential',
  '/legendary-green-steel',
  '/monastery-of-the-scorpion',
  '/nearly-finished',
  '/reavers-fate',
  '/the-shadow-crypt',
  '/the-shroud',
  '/total-chaos',
  '/viktranium-experiment'
]

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const escapeRegExp = (value) => {
  const specials = new Set(['\\', '^', '$', '.', '*', '+', '?', '(', ')', '[', ']', '{', '}', '|'])
  let escaped = ''

  for (const char of value) {
    if (specials.has(char)) {
      escaped += `\\${char}`
    } else {
      escaped += char
    }
  }

  return escaped
}

const replaceOrInsert = (html, pattern, replacement) => {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement)
  }

  return html.replace('</head>', `${replacement}\n</head>`)
}

const upsertMetaName = (html, name, content) => {
  const pattern = new RegExp(String.raw`<meta\s+name="${escapeRegExp(name)}"[^>]*>`, 'i')
  const replacement = `<meta name="${name}" content="${escapeHtml(content)}"/>`

  return replaceOrInsert(html, pattern, replacement)
}

const upsertMetaProperty = (html, property, content) => {
  const pattern = new RegExp(String.raw`<meta\s+property="${escapeRegExp(property)}"[^>]*>`, 'i')
  const replacement = `<meta property="${property}" content="${escapeHtml(content)}"/>`

  return replaceOrInsert(html, pattern, replacement)
}

const upsertCanonical = (html, href) => {
  const pattern = /<link\s+rel="canonical"[^>]*>/
  const replacement = `<link rel="canonical" href="${escapeHtml(href)}"/>`

  return replaceOrInsert(html, pattern, replacement)
}

const escapeJsonLd = (value) =>
  JSON.stringify(value)
    .replaceAll('<', String.raw`\u003c`)
    .replaceAll('>', String.raw`\u003e`)
    .replaceAll('&', String.raw`\u0026`)
    .replaceAll('\u2028', String.raw`\u2028`)
    .replaceAll('\u2029', String.raw`\u2029`)

const upsertTitle = (html, title) => html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(title)}</title>`)

const buildHtml = (template, prerender) => {
  let html = template
  html = upsertTitle(html, prerender.title)
  html = upsertMetaName(html, 'description', prerender.description)
  html = upsertMetaName(html, 'robots', prerender.robots)
  html = upsertMetaProperty(html, 'og:site_name', prerender.siteName)
  html = upsertMetaProperty(html, 'og:title', prerender.title)
  html = upsertMetaProperty(html, 'og:description', prerender.description)
  html = upsertMetaProperty(html, 'og:type', 'website')
  html = upsertMetaProperty(html, 'og:url', prerender.canonicalUrl)
  html = upsertMetaProperty(html, 'og:image', prerender.imageUrl)
  html = upsertMetaProperty(html, 'og:image:width', '1200')
  html = upsertMetaProperty(html, 'og:image:height', '630')
  html = upsertMetaProperty(html, 'og:image:alt', prerender.imageAlt)
  html = upsertMetaName(html, 'twitter:card', 'summary_large_image')
  html = upsertMetaName(html, 'twitter:title', prerender.title)
  html = upsertMetaName(html, 'twitter:description', prerender.description)
  html = upsertMetaName(html, 'twitter:image', prerender.imageUrl)
  html = upsertMetaName(html, 'twitter:image:alt', prerender.imageAlt)
  html = upsertCanonical(html, prerender.canonicalUrl)
  html = replaceOrInsert(
    html,
    /<script\s+id="structured-data"\s+type="application\/ld\+json">.*?<\/script>/is,
    `<script id="structured-data" type="application/ld+json">${escapeJsonLd(prerender.structuredData)}</script>`
  )
  html = html.replace(/<main id="root"><\/main>/, `<main id="root">${prerender.html}</main>`)

  return html
}

const writeRouteHtml = async (routePath, html) => {
  const outputPath = routePath === '/' ? path.join(distDir, 'index.html') : path.join(distDir, routePath.slice(1))
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html, 'utf8')
}

const main = async () => {
  const template = await readFile(templatePath, 'utf8')
  const { render } = await import(pathToFileURL(ssrBundlePath).href)
  const origin = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://yourddo.com'

  for (const routePath of ROUTES_TO_PRERENDER) {
    const prerender = render(routePath, origin)
    const html = buildHtml(template, prerender)
    await writeRouteHtml(routePath, html)
  }

  console.log(`Prerendered ${ROUTES_TO_PRERENDER.length} routes`)
}

try {
  await main()
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
