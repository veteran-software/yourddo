import { renderToString } from 'react-dom/server'
import { MantineProvider } from '@mantine/core'
import { MemoryRouter } from 'react-router-dom'
import App from './app/AppRouter'
import { prepareRoutePage } from './app/routePages'
import { buildStructuredData, normalizeCanonicalPath, resolveSeo } from './shared/seo/seoConfig.ts'
import { SITE_NAME, SITE_ORIGIN, SITE_PREVIEW_IMAGE_PATH } from './shared/seo/siteMeta.ts'
import { theme, cssVariablesResolver } from './app/theme'
// Build-time route manifest for the static HTML writer.
// oxlint-disable-next-line react/only-export-components
export { ROUTE_SEO, routeAliases } from './shared/seo/seoConfig'

export interface PrerenderResult {
  html: string
  assetEntry?: string
  title: string
  description: string
  canonicalUrl?: string
  robots: string
  siteName: string
  structuredData?: Record<string, unknown>
  imageUrl: string
  imageAlt: string
}

// This build-only entry runs in Node, outside React Fast Refresh.
// oxlint-disable-next-line react/only-export-components
export const render = async (url: string, origin = SITE_ORIGIN): Promise<PrerenderResult> => {
  const pathname = new URL(url, origin).pathname
  const seo = resolveSeo(pathname)
  const canonicalPath = seo.canonicalPath ?? seo.path
  const canonicalUrl = canonicalPath ? SITE_ORIGIN + normalizeCanonicalPath(canonicalPath) : undefined
  const structuredData = canonicalUrl ? buildStructuredData(SITE_ORIGIN, seo, canonicalUrl) : undefined
  const prepared = await prepareRoutePage(pathname)

  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme='auto'>
        <App hostname={new URL(origin).hostname} prepared={prepared} />
      </MantineProvider>
    </MemoryRouter>
  )

  return {
    html,
    assetEntry: prepared?.entry,
    title: seo.title,
    description: seo.description,
    canonicalUrl,
    robots: seo.noIndex || new URL(origin).hostname.startsWith('develop.') ? 'noindex, nofollow' : 'index, follow',
    siteName: SITE_NAME,
    structuredData,
    imageUrl: `${SITE_ORIGIN}${SITE_PREVIEW_IMAGE_PATH}`,
    imageAlt: 'YourDDO homepage preview'
  }
}
