import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import App from './App.tsx'
import { normalizeCanonicalPath, resolveSeo, SITE_NAME } from './components/seo/seoConfig.ts'
import store from './redux/store.ts'

export interface PrerenderResult {
  html: string
  title: string
  description: string
  canonicalUrl: string
  robots: string
  siteName: string
}

const DEFAULT_ORIGIN = 'https://yourddo.com'

export const render = (url: string, origin = DEFAULT_ORIGIN): PrerenderResult => {
  const pathname = new URL(url, origin).pathname
  const seo = resolveSeo(pathname)
  const canonicalPath = seo.canonicalPath ?? seo.path ?? pathname
  const canonicalUrl = `${origin}${normalizeCanonicalPath(canonicalPath)}`

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
    siteName: SITE_NAME
  }
}
