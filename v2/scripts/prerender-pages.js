import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const distDir = path.join(rootDir, 'dist')
const ssrBundlePath = path.join(rootDir, 'dist-ssr', 'entry-server.js')
const templatePath = path.join(distDir, 'index.html')

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
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${prerender.html}</div>`)

  return html
}

const writeRouteHtml = async (routePath, html) => {
  const outputPath =
    routePath === '/' ? path.join(distDir, 'index.html') : path.join(distDir, routePath.slice(1), 'index.html')
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html, 'utf8')
}

const main = async () => {
  const template = await readFile(templatePath, 'utf8')
  const { render, ROUTE_SEO } = await import(pathToFileURL(ssrBundlePath).href)
  const origin = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://yourddo.com'

  await Promise.all(
    ROUTE_SEO.map(async ({ path: routePath }) => {
      const prerender = render(routePath, origin)
      const html = buildHtml(template, prerender)
      await writeRouteHtml(routePath, html)
    })
  )

  console.log(`Prerendered ${ROUTE_SEO.length} routes`)
}

try {
  await main()
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
