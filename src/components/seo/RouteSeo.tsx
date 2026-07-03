import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { getSubdomain } from '../../utils/utils'
import { normalizeCanonicalPath, resolveSeo, SITE_NAME } from './seoConfig.ts'

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
    const origin = window.location.origin
    const canonicalUrl = `${origin}${normalizeCanonicalPath(seo.canonicalPath)}`

    document.title = seo.title
    setMetaTagByName('description', seo.description)
    setMetaTagByName('robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow')
    setMetaTagByProperty('og:site_name', SITE_NAME)
    setMetaTagByProperty('og:title', seo.title)
    setMetaTagByProperty('og:description', seo.description)
    setMetaTagByProperty('og:type', 'website')
    setMetaTagByProperty('og:url', canonicalUrl)
    setMetaTagByProperty('og:image', `${origin}${logo}`)
    setMetaTagByName('twitter:card', 'summary_large_image')
    setMetaTagByName('twitter:title', seo.title)
    setMetaTagByName('twitter:description', seo.description)
    setMetaTagByName('twitter:image', `${origin}${logo}`)
    setLinkHref('link[rel="canonical"]', canonicalUrl)
  }, [seo])

  return null
}

export default RouteSeo
