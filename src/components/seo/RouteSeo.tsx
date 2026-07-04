import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getSubdomain } from '../../utils/utils'
import { buildStructuredData, normalizeCanonicalPath, resolveSeo } from './seoConfig.ts'
import { SITE_NAME, SITE_PREVIEW_IMAGE_PATH } from './siteMeta.ts'

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

const setImageMeta = (origin: string) => {
  const imageUrl = `${origin}${SITE_PREVIEW_IMAGE_PATH}`
  setMetaTagByProperty('og:image', imageUrl)
  setMetaTagByProperty('og:image:width', '1200')
  setMetaTagByProperty('og:image:height', '630')
  setMetaTagByProperty('og:image:alt', 'YourDDO homepage preview')
  setMetaTagByName('twitter:image', imageUrl)
  setMetaTagByName('twitter:image:alt', 'YourDDO homepage preview')
}

const setJsonLd = (id: string, data: Record<string, unknown>) => {
  const selector = `script#${id}[type="application/ld+json"]`
  const tag = document.head.querySelector<HTMLScriptElement>(selector) ?? document.createElement('script')

  if (!tag.isConnected) {
    tag.type = 'application/ld+json'
    tag.id = id
    document.head.append(tag)
  }

  tag.textContent = JSON.stringify(data)
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
    const origin = globalThis.window.location.origin
    const canonicalUrl = `${origin}${normalizeCanonicalPath(seo.canonicalPath)}`
    const structuredData = buildStructuredData(origin, seo, canonicalUrl)

    document.title = seo.title
    setMetaTagByName('description', seo.description)
    setMetaTagByName('robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow')
    setMetaTagByProperty('og:site_name', SITE_NAME)
    setMetaTagByProperty('og:title', seo.title)
    setMetaTagByProperty('og:description', seo.description)
    setMetaTagByProperty('og:type', 'website')
    setMetaTagByProperty('og:url', canonicalUrl)
    setMetaTagByName('twitter:card', 'summary_large_image')
    setMetaTagByName('twitter:title', seo.title)
    setMetaTagByName('twitter:description', seo.description)
    setImageMeta(origin)
    setLinkHref('link[rel="canonical"]', canonicalUrl)
    setJsonLd('structured-data', structuredData)
  }, [seo])

  return null
}

export default RouteSeo
