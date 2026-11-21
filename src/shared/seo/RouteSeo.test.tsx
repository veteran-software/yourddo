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
