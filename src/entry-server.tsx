import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import App from './App.tsx'
import {
  buildStructuredData,
  normalizeCanonicalPath,
  resolveSeo,
  SITE_NAME,
  SITE_PREVIEW_IMAGE_PATH
} from './components/seo/seoConfig.ts'
import store from './redux/store.ts'

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

const DEFAULT_ORIGIN = 'https://yourddo.com'

export const render = (url: string, origin = DEFAULT_ORIGIN): PrerenderResult => {
  const pathname = new URL(url, origin).pathname
  const seo = resolveSeo(pathname)
  const canonicalPath = seo.canonicalPath ?? seo.path ?? pathname
  const canonicalUrl = `${origin}${normalizeCanonicalPath(canonicalPath)}`
  const structuredData = buildStructuredData(origin, seo, canonicalUrl)

  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <Provider store={store}>
        <App />
      </Provider>
    </MemoryRouter>
  )

  return {
    html,
    title: seo.title,
    description: seo.description,
    canonicalUrl,
    robots: seo.noIndex ? 'noindex, nofollow' : 'index, follow',
    siteName: SITE_NAME,
    structuredData,
    imageUrl: `${origin}${SITE_PREVIEW_IMAGE_PATH}`,
    imageAlt: 'YourDDO homepage preview'
  }
}
