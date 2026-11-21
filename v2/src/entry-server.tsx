import { renderToString } from 'react-dom/server'
import { MantineProvider } from '@mantine/core'
import { MemoryRouter } from 'react-router-dom'
import App from './app/AppRouter'
import { buildStructuredData, normalizeCanonicalPath, resolveSeo } from './shared/seo/seoConfig.ts'
import { SITE_NAME, SITE_ORIGIN, SITE_PREVIEW_IMAGE_PATH } from './shared/seo/siteMeta.ts'
import { theme, cssVariablesResolver } from './app/theme'
export { ROUTE_SEO } from './shared/seo/seoConfig'

export interface PrerenderResult {
  html: string
  title: string
  description: string
  canonicalUrl: string
  robots: string
  siteName: string
  structuredData: Record<string, unknown>
  imageUrl: string
  imageAlt: string
}

// This build-only entry runs in Node, outside React Fast Refresh.
// oxlint-disable-next-line react/only-export-components
export const render = (url: string, origin = SITE_ORIGIN): PrerenderResult => {
  const pathname = new URL(url, origin).pathname
  const seo = resolveSeo(pathname)
  const canonicalPath = seo.canonicalPath ?? seo.path ?? pathname
  const canonicalUrl = `${SITE_ORIGIN}${normalizeCanonicalPath(canonicalPath)}`
  const structuredData = buildStructuredData(SITE_ORIGIN, seo, canonicalUrl)

  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme='auto'>
        <App hostname={new URL(origin).hostname} />
      </MantineProvider>
    </MemoryRouter>
  )

  return {
    html,
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
