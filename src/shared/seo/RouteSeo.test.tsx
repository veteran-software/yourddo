// @vitest-environment jsdom
import { render, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter, Link } from 'react-router-dom'
import { afterEach, expect, it } from 'vitest'
import RouteSeo from './RouteSeo'
import { ROUTE_SEO } from './seoConfig'
import { SITE_ORIGIN } from './siteMeta'

afterEach(cleanup)
it('keeps canonical, social and structured URLs on the published domain across navigation', () => {
  const view = render(
    <MemoryRouter>
      <RouteSeo />
      {ROUTE_SEO.map((route) => (
        <Link key={route.path} to={route.path ?? '/'}>
          {route.title}
        </Link>
      ))}
    </MemoryRouter>
  )
  for (const route of ROUTE_SEO) {
    fireEvent.click(view.getByText(route.title))
    const url = SITE_ORIGIN + (route.path === '/' ? '' : (route.path ?? ''))
    expect(document.title).toBe(route.title)
    expect(document.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(url)
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(url)
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(
      SITE_ORIGIN + '/social-preview.png'
    )
    expect(
      (JSON.parse(document.querySelector('#structured-data')?.textContent ?? '{}') as { '@graph': unknown[] })['@graph']
    ).toContainEqual(expect.objectContaining({ '@type': 'WebPage', url }))
  }
})

it('removes indexable metadata on missing pages and restores it on recovery', () => {
  const view = render(
    <MemoryRouter initialEntries={['/gear-planner']}>
      <RouteSeo />
      {['/missing', '/gear-planner-extra', '/gear-planner/missing', '/Gear-Planner/', '/'].map((path) => (
        <Link key={path} to={path}>
          {path}
        </Link>
      ))}
    </MemoryRouter>
  )
  const meta = (selector: string) => document.head.querySelector(selector)?.getAttribute('content')
  for (const path of ['/missing', '/gear-planner-extra', '/gear-planner/missing']) {
    fireEvent.click(view.getByText(path))
    expect(document.title).toBe('Page not found | YourDDO')
    expect(meta('meta[name="robots"]')).toContain('noindex')
    expect(meta('meta[property="og:title"]')).toBe(document.title)
    expect(meta('meta[name="twitter:title"]')).toBe(document.title)
    expect(document.head.querySelector('link[rel=canonical], meta[property="og:url"], #structured-data')).toBeNull()
  }
  for (const [path, canonical] of [
    ['/Gear-Planner/', '/gear-planner'],
    ['/', '']
  ]) {
    fireEvent.click(view.getByText(path))
    expect(meta('meta[name="robots"]')).toBe('index, follow')
    expect(document.head.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(SITE_ORIGIN + canonical)
    expect(document.head.querySelector('#structured-data')).toBeTruthy()
  }
})
